// Default configuration
export const DEFAULT_FORM_VALIDATION_CONFIG = {
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
//# sourceMappingURL=IFormValidationConfig.js.map