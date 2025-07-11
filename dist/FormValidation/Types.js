/**
 * Core FormValidation System Types
 * Consolidated type definitions for the entire FormValidation system
 */
// ============================================================================
// TYPE GUARDS
// ============================================================================
/** Type guard for validatable elements */
export function isValidatableElement(element) {
    return element instanceof HTMLInputElement ||
        element instanceof HTMLSelectElement ||
        element instanceof HTMLTextAreaElement;
}
/** Type guard for validation rules */
export function isValidValidationRule(rule) {
    return rule &&
        typeof rule === 'object' &&
        typeof rule.type === 'string';
}
/** Type guard for form schemas */
export function isValidFormSchema(schema) {
    return schema &&
        typeof schema === 'object' &&
        typeof schema.formId === 'string' &&
        Array.isArray(schema.fields) &&
        typeof schema.initialValues === 'object';
}
// ============================================================================
// CONSTANTS
// ============================================================================
/** Default configuration values */
export const DEFAULT_CONFIG = {
    validateOnBlur: true,
    validateOnChange: false,
    validateOnSubmit: true,
    debounceDelay: 350,
    showErrorsImmediately: true,
    enableRemoteValidation: true,
};
/** Default debouncer configuration */
export const DEFAULT_DEBOUNCER_CONFIG = {
    delay: 350,
    maxDelay: 1000,
    leading: false,
    trailing: true,
};
/** Built-in validator types */
export const BUILT_IN_VALIDATORS = [
    'required', 'email', 'minlength', 'maxlength', 'pattern',
    'match', 'minchecked', 'maxchecked', 'minselected', 'maxselected', 'remote'
];
/** Remote providers */
export const REMOTE_PROVIDERS = ['WebSocket', 'HTTP', 'REST'];
/** Validation severity levels */
export const VALIDATION_SEVERITIES = ['error', 'warning', 'info', 'success'];
//# sourceMappingURL=Types.js.map