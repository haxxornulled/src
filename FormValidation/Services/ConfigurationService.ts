/**
 * ConfigurationService
 *
 * Manages global and per-field configuration for form validation.
 * Supports runtime updates and deep merging of config objects.
 *
 * Usage: Injected as a singleton service.
 */
import { injectable, unmanaged } from 'inversify';
import { IFormValidationConfig, DEFAULT_FORM_VALIDATION_CONFIG } from '../Interfaces/IFormValidationConfig';

@injectable()
export class ConfigurationService {
  private config: IFormValidationConfig;

  /**
   * @param initialConfig - Optional initial configuration
   */
  constructor(@unmanaged() initialConfig?: Partial<IFormValidationConfig>) {
    this.config = this.mergeConfig(DEFAULT_FORM_VALIDATION_CONFIG, initialConfig || {});
  }

  /**
   * Update the configuration (merges with existing config)
   * @param newConfig - Partial config to merge in
   */
  updateConfig(newConfig: Partial<IFormValidationConfig>): void {
    this.config = this.mergeConfig(this.config, newConfig);
  }

  /**
   * Get the full configuration
   * @returns IFormValidationConfig
   */
  getConfig(): IFormValidationConfig {
    return { ...this.config };
  }

  /**
   * Get HTTP configuration for a specific field (or global if not specified)
   * @param fieldName - Field name (optional)
   * @returns HTTP config object
   */
  getHttpConfig(fieldName?: string): IFormValidationConfig['http'] {
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
  getValidationConfig(fieldName?: string): {
    debounceDelay: number;
    validateOnChange: boolean;
    validateOnBlur: boolean;
    validateOnSubmit: boolean;
  } {
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
  getUIConfig(): IFormValidationConfig['ui'] {
    return this.config.ui || {};
  }

  /**
   * Build a complete HTTP URL for a field
   * @param fieldName - Field name
   * @param endpoint - Endpoint path (optional)
   * @returns Full HTTP URL as string
   */
  buildHttpUrl(fieldName: string, endpoint?: string): string {
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
  isRemoteValidationEnabled(): boolean {
    return this.config.enableRemoteValidation !== false;
  }

  /**
   * Get retry configuration for HTTP requests
   * @returns { attempts: number, delay: number }
   */
  getRetryConfig(): { attempts: number; delay: number } {
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
  private mergeConfig(target: any, source: any): any {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.mergeConfig(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }
} 