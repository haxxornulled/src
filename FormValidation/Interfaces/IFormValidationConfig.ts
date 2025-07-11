export interface IFormValidationConfig {
  // Global validation settings
  validateOnBlur?: boolean;
  validateOnChange?: boolean;
  validateOnSubmit?: boolean;
  debounceDelay?: number;
  showErrorsImmediately?: boolean;
  enableRemoteValidation?: boolean;

  // HTTP configuration
  http?: {
    baseUrl?: string;
    timeout?: number;
    headers?: Record<string, string>;
    retryAttempts?: number;
    retryDelay?: number;
  };

  // UI configuration
  ui?: {
    errorClass?: string;
    successClass?: string;
    errorContainerClass?: string;
    showValidationIcons?: boolean;
  };

  // Custom validators
  customValidators?: Record<string, any>;

  // Field-specific overrides (can override global settings per field)
  fieldOverrides?: Record<string, {
    http?: {
      baseUrl?: string;
      endpoint?: string;
      timeout?: number;
      headers?: Record<string, string>;
    };
    validation?: {
      debounceDelay?: number;
      validateOnChange?: boolean;
    };
  }>;
}

// Default configuration
export const DEFAULT_FORM_VALIDATION_CONFIG: IFormValidationConfig = {
  validateOnBlur: true,
  validateOnChange: false,
  validateOnSubmit: true,
  debounceDelay: 350,
  showErrorsImmediately: true,
  enableRemoteValidation: true,
  
  http: {
    baseUrl: '',
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json'
    }
  },
  
  ui: {
    errorClass: 'validation-error',
    successClass: 'validation-success',
    errorContainerClass: 'validation-error-container',
    showValidationIcons: true
  },
  
  fieldOverrides: {}
}; 