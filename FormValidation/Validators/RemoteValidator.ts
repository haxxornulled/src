/**
 * RemoteValidator
 *
 * Performs remote (HTTP) validation for a field using the configured HTTP transport.
 * Looks up the correct endpoint and settings from the ConfigurationService.
 *
 * Usage: Registered as "remote" validator in the DI container.
 */
import { inject, injectable } from "inversify";
import { IAsyncValidator } from "../Interfaces/IAsyncValidator";
import { IValidationResult } from "../Interfaces/IValidationResult";
import ContainerTypes from "../DI/ContainerTypes";
import { IRuleDescriptor } from "../Interfaces/IRuleDescriptor";
import { v4 as uuidv4 } from 'uuid';
import { ITransportProvider } from "../../MessageBroker/Interfaces/ITransportProvider";
import { IMessage } from "../../MessageBroker/Interfaces/IMessage";
import { ConfigurationService } from "../Services/ConfigurationService";

@injectable()
export class RemoteValidator implements IAsyncValidator {
  /** Validator name (used for registration) */
  name = "remote";

  /**
   * @param httpTransportProvider - The HTTP transport provider (injected)
   * @param configService - The configuration service (injected)
   */
  constructor(
    @inject(ContainerTypes.HttpTransportProvider)
    private httpTransportProvider: ITransportProvider,

    @inject(ContainerTypes.ConfigurationService)
    private configService: ConfigurationService
  ) {}

  /**
   * Perform remote validation for a field.
   * @param value - The value to validate
   * @param rule - The rule descriptor (should include fieldName and endpoint)
   * @param allValues - (Optional) All form values
   * @returns Promise<IValidationResult>
   */
  async validate(
    value: any,
    rule: IRuleDescriptor,
    allValues?: Record<string, any>
  ): Promise<IValidationResult> {
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
    const msg: IMessage = {
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
      const response = await this.httpTransportProvider.sendRequest<{ 
        valid: boolean; 
        message?: string;
        errors?: string[];
      }>(msg);

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

    } catch (error: any) {
      console.error('Remote validation error:', error);
      
      return {
        valid: false,
        isValid: false,
        errorMessage: error?.message || "HTTP error during remote validation.",
      };
    }
  }
}



