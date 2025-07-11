/**
 * Comprehensive error handling system for FormValidation
 * Provides structured error handling, logging, and recovery mechanisms
 */
export class ValidationErrorHandler {
    constructor() {
        this.errorCount = 0;
        this.errorLog = [];
        this.maxErrorLogSize = 100;
    }
    /**
     * Get singleton instance of the error handler
     */
    static getInstance() {
        if (!ValidationErrorHandler.instance) {
            ValidationErrorHandler.instance = new ValidationErrorHandler();
        }
        return ValidationErrorHandler.instance;
    }
    /**
     * Create a structured validation error
     */
    createError(type, code, message, context, originalError) {
        const error = {
            type,
            code,
            message,
            originalError,
            context,
            timestamp: Date.now()
        };
        this.logError(error);
        return error;
    }
    /**
     * Handle validation errors with recovery strategies
     */
    handleValidationError(error, fieldName, ruleType) {
        const validationError = this.normalizeError(error, fieldName, ruleType);
        // Log the error
        this.logError(validationError);
        // Apply recovery strategies based on error type
        const fallbackResult = this.getFallbackResult(validationError);
        return {
            handled: true,
            error: validationError,
            fallbackResult
        };
    }
    /**
     * Handle remote validation errors with retry logic
     */
    async handleRemoteError(error, endpoint, retryCount = 0) {
        const maxRetries = 3;
        const retryDelay = Math.pow(2, retryCount) * 1000; // Exponential backoff
        if (retryCount < maxRetries) {
            console.warn(`[ValidationErrorHandler] Remote validation failed, retrying in ${retryDelay}ms (attempt ${retryCount + 1}/${maxRetries})`);
            await this.delay(retryDelay);
            // Return a retry indicator
            return {
                handled: false,
                error: this.createError('REMOTE_ERROR', 'RETRY_ATTEMPT', `Retry attempt ${retryCount + 1} of ${maxRetries}`, { endpoint, retryCount, maxRetries })
            };
        }
        // Max retries exceeded
        const validationError = this.createError('REMOTE_ERROR', 'MAX_RETRIES_EXCEEDED', 'Remote validation failed after maximum retry attempts', { endpoint, retryCount, maxRetries, originalError: error.message }, error);
        return {
            handled: true,
            error: validationError,
            fallbackResult: {
                valid: false,
                severity: 'error',
                code: 'REMOTE_VALIDATION_FAILED',
                message: 'Remote validation is temporarily unavailable. Please try again later.',
                timestamp: Date.now()
            }
        };
    }
    /**
     * Handle parser errors with fallback strategies
     */
    handleParserError(error, schema, fieldName) {
        const validationError = this.createError('PARSER_ERROR', 'SCHEMA_PARSE_FAILED', 'Failed to parse validation schema', { schema, fieldName, originalError: error.message }, error);
        // Try to provide a basic fallback validation
        const fallbackResult = this.getBasicFallbackValidation(fieldName);
        return {
            handled: true,
            error: validationError,
            fallbackResult
        };
    }
    /**
     * Handle registry errors with recovery
     */
    handleRegistryError(error, validatorType) {
        const validationError = this.createError('REGISTRY_ERROR', 'VALIDATOR_NOT_FOUND', `Validator '${validatorType}' not found in registry`, { validatorType, originalError: error.message }, error);
        return {
            handled: true,
            error: validationError,
            fallbackResult: {
                valid: false,
                severity: 'error',
                code: 'VALIDATOR_UNAVAILABLE',
                message: `Validation rule '${validatorType}' is not available. Please contact support.`,
                timestamp: Date.now()
            }
        };
    }
    /**
     * Get error statistics
     */
    getErrorStats() {
        const errorTypes = this.errorLog.reduce((acc, error) => {
            acc[error.type] = (acc[error.type] || 0) + 1;
            return acc;
        }, {});
        return {
            totalErrors: this.errorCount,
            errorTypes,
            recentErrors: this.errorLog.slice(-10) // Last 10 errors
        };
    }
    /**
     * Clear error log
     */
    clearErrorLog() {
        this.errorLog = [];
        this.errorCount = 0;
    }
    /**
     * Export error log for debugging
     */
    exportErrorLog() {
        return [...this.errorLog];
    }
    // ============================================================================
    // PRIVATE METHODS
    // ============================================================================
    /**
     * Normalize different error types to ValidationError
     */
    normalizeError(error, fieldName, ruleType) {
        if (this.isValidationError(error)) {
            return {
                ...error,
                fieldName: fieldName || error.fieldName,
                ruleType: ruleType || error.ruleType
            };
        }
        return this.createError('UNKNOWN_ERROR', 'UNKNOWN_ERROR', error.message || 'An unknown error occurred', { fieldName, ruleType }, error);
    }
    /**
     * Type guard for ValidationError
     */
    isValidationError(error) {
        return error &&
            typeof error === 'object' &&
            typeof error.type === 'string' &&
            typeof error.code === 'string' &&
            typeof error.message === 'string' &&
            typeof error.timestamp === 'number';
    }
    /**
     * Log error to internal log
     */
    logError(error) {
        this.errorCount++;
        this.errorLog.push(error);
        // Maintain log size
        if (this.errorLog.length > this.maxErrorLogSize) {
            this.errorLog.shift();
        }
        // Console logging based on error type
        const logMethod = this.getLogMethod(error.type);
        logMethod(`[ValidationErrorHandler] ${error.type}: ${error.message}`, {
            code: error.code,
            fieldName: error.fieldName,
            ruleType: error.ruleType,
            context: error.context
        });
    }
    /**
     * Get appropriate console log method based on error type
     */
    getLogMethod(errorType) {
        switch (errorType) {
            case 'VALIDATION_FAILED':
                return console.warn;
            case 'REMOTE_ERROR':
            case 'NETWORK_ERROR':
                return console.error;
            case 'PARSER_ERROR':
            case 'REGISTRY_ERROR':
            case 'DISPATCHER_ERROR':
                return console.error;
            case 'UNKNOWN_ERROR':
            default:
                return console.error;
        }
    }
    /**
     * Get fallback validation result based on error type
     */
    getFallbackResult(error) {
        switch (error.type) {
            case 'VALIDATION_FAILED':
                return {
                    valid: false,
                    severity: 'error',
                    code: error.code,
                    message: error.message,
                    fieldName: error.fieldName,
                    ruleType: error.ruleType,
                    timestamp: Date.now()
                };
            case 'REMOTE_ERROR':
            case 'NETWORK_ERROR':
                return {
                    valid: true, // Allow submission when remote validation fails
                    severity: 'warning',
                    code: 'REMOTE_VALIDATION_UNAVAILABLE',
                    message: 'Remote validation is unavailable. Proceeding with local validation only.',
                    fieldName: error.fieldName,
                    ruleType: error.ruleType,
                    timestamp: Date.now()
                };
            case 'PARSER_ERROR':
                return {
                    valid: false,
                    severity: 'error',
                    code: 'SCHEMA_ERROR',
                    message: 'Form validation configuration is invalid.',
                    fieldName: error.fieldName,
                    timestamp: Date.now()
                };
            case 'REGISTRY_ERROR':
                return {
                    valid: false,
                    severity: 'error',
                    code: 'VALIDATOR_UNAVAILABLE',
                    message: 'Required validation rule is not available.',
                    fieldName: error.fieldName,
                    ruleType: error.ruleType,
                    timestamp: Date.now()
                };
            default:
                return {
                    valid: false,
                    severity: 'error',
                    code: 'UNKNOWN_ERROR',
                    message: 'An unexpected error occurred during validation.',
                    fieldName: error.fieldName,
                    timestamp: Date.now()
                };
        }
    }
    /**
     * Get basic fallback validation when schema parsing fails
     */
    getBasicFallbackValidation(fieldName) {
        return {
            valid: true, // Default to valid when we can't determine rules
            severity: 'warning',
            code: 'FALLBACK_VALIDATION',
            message: 'Using fallback validation due to configuration error.',
            fieldName,
            timestamp: Date.now()
        };
    }
    /**
     * Utility method for delays
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
/**
 * Global error handler instance
 */
export const validationErrorHandler = ValidationErrorHandler.getInstance();
/**
 * Error handling decorator for async methods
 */
export function withErrorHandling(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args) {
        try {
            return await originalMethod.apply(this, args);
        }
        catch (error) {
            const errorResult = validationErrorHandler.handleValidationError(error, undefined, propertyKey);
            // Re-throw if not handled
            if (!errorResult.handled) {
                throw error;
            }
            // Return fallback result if available
            if (errorResult.fallbackResult) {
                return errorResult.fallbackResult;
            }
            throw error;
        }
    };
    return descriptor;
}
//# sourceMappingURL=ErrorHandler.js.map