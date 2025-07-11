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
 * ConfigurationService
 *
 * Manages global and per-field configuration for form validation.
 * Supports runtime updates and deep merging of config objects.
 *
 * Usage: Injected as a singleton service.
 */
import { injectable, unmanaged } from 'inversify';
import { DEFAULT_FORM_VALIDATION_CONFIG } from '../Interfaces/IFormValidationConfig';
let ConfigurationService = class ConfigurationService {
    /**
     * @param initialConfig - Optional initial configuration
     */
    constructor(initialConfig) {
        this.config = this.mergeConfig(DEFAULT_FORM_VALIDATION_CONFIG, initialConfig || {});
    }
    /**
     * Update the configuration (merges with existing config)
     * @param newConfig - Partial config to merge in
     */
    updateConfig(newConfig) {
        this.config = this.mergeConfig(this.config, newConfig);
    }
    /**
     * Get the full configuration
     * @returns IFormValidationConfig
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Get HTTP configuration for a specific field (or global if not specified)
     * @param fieldName - Field name (optional)
     * @returns HTTP config object
     */
    getHttpConfig(fieldName) {
        const globalConfig = this.config.http || {};
        if (!fieldName) {
            return globalConfig;
        }
        const fieldOverride = this.config.fieldOverrides?.[fieldName]?.http;
        if (!fieldOverride) {
            return globalConfig;
        }
        return {
            ...globalConfig,
            ...fieldOverride
        };
    }
    /**
     * Get validation settings for a specific field (or global if not specified)
     * @param fieldName - Field name (optional)
     * @returns Validation config object
     */
    getValidationConfig(fieldName) {
        const globalConfig = {
            debounceDelay: this.config.debounceDelay || 350,
            validateOnChange: this.config.validateOnChange || false,
            validateOnBlur: this.config.validateOnBlur || true,
            validateOnSubmit: this.config.validateOnSubmit || true
        };
        if (!fieldName) {
            return globalConfig;
        }
        const fieldOverride = this.config.fieldOverrides?.[fieldName]?.validation;
        if (!fieldOverride) {
            return globalConfig;
        }
        return {
            ...globalConfig,
            ...fieldOverride
        };
    }
    /**
     * Get UI configuration
     * @returns UI config object
     */
    getUIConfig() {
        return this.config.ui || {};
    }
    /**
     * Build a complete HTTP URL for a field
     * @param fieldName - Field name
     * @param endpoint - Endpoint path (optional)
     * @returns Full HTTP URL as string
     */
    buildHttpUrl(fieldName, endpoint) {
        const httpConfig = this.getHttpConfig(fieldName);
        const baseUrl = httpConfig?.baseUrl || '';
        const finalEndpoint = endpoint || '';
        if (!baseUrl) {
            console.warn(`No HTTP base URL configured for field: ${fieldName}`);
            return '';
        }
        // Ensure proper URL construction
        const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        const endpointPath = finalEndpoint.startsWith('/') ? finalEndpoint : `/${finalEndpoint}`;
        return `${base}${endpointPath}`;
    }
    /**
     * Check if remote validation is enabled
     * @returns boolean
     */
    isRemoteValidationEnabled() {
        return this.config.enableRemoteValidation !== false;
    }
    /**
     * Get retry configuration for HTTP requests
     * @returns { attempts: number, delay: number }
     */
    getRetryConfig() {
        const httpConfig = this.config.http || {};
        return {
            attempts: httpConfig.retryAttempts || 3,
            delay: httpConfig.retryDelay || 1000
        };
    }
    /**
     * Deep merge configuration objects
     * @private
     */
    mergeConfig(target, source) {
        const result = { ...target };
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.mergeConfig(target[key] || {}, source[key]);
            }
            else {
                result[key] = source[key];
            }
        }
        return result;
    }
};
ConfigurationService = __decorate([
    injectable(),
    __param(0, unmanaged()),
    __metadata("design:paramtypes", [Object])
], ConfigurationService);
export { ConfigurationService };
//# sourceMappingURL=ConfigurationService.js.map