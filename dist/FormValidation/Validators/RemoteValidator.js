var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
/**
 * RemoteValidator
 *
 * Performs remote (HTTP) validation for a field using the configured HTTP transport.
 * Looks up the correct endpoint and settings from the ConfigurationService.
 *
 * Usage: Registered as "remote" validator in the DI container.
 */
import { inject, injectable } from "inversify";
import ContainerTypes from "../DI/ContainerTypes";
import { v4 as uuidv4 } from 'uuid';
import { ConfigurationService } from "../Services/ConfigurationService";
let RemoteValidator = class RemoteValidator {
    /**
     * @param httpTransportProvider - The HTTP transport provider (injected)
     * @param configService - The configuration service (injected)
     */
    constructor(httpTransportProvider, configService) {
        this.httpTransportProvider = httpTransportProvider;
        this.configService = configService;
        /** Validator name (used for registration) */
        this.name = "remote";
    }
    /**
     * Perform remote validation for a field.
     * @param value - The value to validate
     * @param rule - The rule descriptor (should include fieldName and endpoint)
     * @param allValues - (Optional) All form values
     * @returns Promise<IValidationResult>
     */
    async validate(value, rule, allValues) {
        // Get field name from rule context
        const fieldName = rule.fieldName || '';
        // Build the complete HTTP URL using configuration
        const httpUrl = this.configService.buildHttpUrl(fieldName, rule.endpoint);
        if (!httpUrl) {
            return {
                valid: false,
                isValid: false,
                errorMessage: "No HTTP endpoint configured for remote validation."
            };
        }
        // Validate HTTP transport provider
        if (!this.httpTransportProvider || typeof this.httpTransportProvider.sendRequest !== 'function') {
            return {
                valid: false,
                isValid: false,
                errorMessage: "HTTP transport provider not available."
            };
        }
        // Create validation request message
        const msg = {
            type: "RemoteValidationRequest",
            id: uuidv4(),
            payload: {
                endpoint: httpUrl,
                data: {
                    value,
                    fieldName,
                    allValues,
                    rule: {
                        type: rule.type,
                        provider: rule.provider,
                        endpoint: rule.endpoint
                    }
                },
            },
            _remote: false
        };
        try {
            // Send validation request through HTTP transport
            const response = await this.httpTransportProvider.sendRequest(msg);
            // Handle response validation
            if (!response || typeof response.valid !== "boolean") {
                return {
                    valid: false,
                    isValid: false,
                    errorMessage: "Invalid response from remote validator.",
                };
            }
            // Return validation result
            return {
                valid: !!response.valid,
                isValid: !!response.valid,
                errorMessage: response.message || (response.valid ? "" : "Remote validation failed."),
            };
        }
        catch (error) {
            console.error('Remote validation error:', error);
            return {
                valid: false,
                isValid: false,
                errorMessage: error?.message || "HTTP error during remote validation.",
            };
        }
    }
};
RemoteValidator = __decorate([
    injectable(),
    __param(0, inject(ContainerTypes.HttpTransportProvider)),
    __param(1, inject(ContainerTypes.ConfigurationService)),
    __metadata("design:paramtypes", [Object, ConfigurationService])
], RemoteValidator);
export { RemoteValidator };
//# sourceMappingURL=RemoteValidator.js.map