/**
 * Core FormValidation System Types
 * Consolidated type definitions for the entire FormValidation system
 */

// ============================================================================
// FIELD TYPES
// ============================================================================

/** Supported HTML input types for validation */
export type ValidatableFieldType = 
  | 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  | 'checkbox' | 'radio' | 'select-one' | 'select-multiple'
  | 'textarea' | 'date' | 'datetime-local' | 'time'
  | 'file' | 'hidden';

/** HTML elements that can be validated */
export type ValidatableElement = 
  | HTMLInputElement 
  | HTMLSelectElement 
  | HTMLTextAreaElement;

// ============================================================================
// VALIDATION RULE TYPES
// ============================================================================

/** Built-in validator types */
export type BuiltInValidatorType = 
  | 'required' | 'email' | 'minlength' | 'maxlength' | 'pattern'
  | 'match' | 'minchecked' | 'maxchecked' | 'minselected' | 'maxselected'
  | 'remote';

/** Remote validation providers */
export type RemoteProviderType = 'WebSocket' | 'HTTP' | 'REST';

/** Validation rule configuration */
export interface ValidationRule {
  type: BuiltInValidatorType | string;
  value?: any;
  message?: string;
  remoteType?: string;
  provider?: RemoteProviderType;
  endpoint?: string;
  [key: string]: any;
}

// ============================================================================
// VALIDATION RESULT TYPES
// ============================================================================

/** Validation severity levels */
export type ValidationSeverity = 'error' | 'warning' | 'info' | 'success';

/** Extended validation result with severity and metadata */
export interface ExtendedValidationResult {
  valid: boolean;
  severity?: ValidationSeverity;
  code?: string;
  message?: string;
  value?: any;
  fieldName?: string;
  ruleType?: string;
  timestamp?: number;
  metadata?: Record<string, any>;
}

// ============================================================================
// FORM SCHEMA TYPES
// ============================================================================

/** Form configuration options */
export interface FormValidationConfig {
  validateOnBlur?: boolean;
  validateOnChange?: boolean;
  validateOnSubmit?: boolean;
  debounceDelay?: number;
  showErrorsImmediately?: boolean;
  enableRemoteValidation?: boolean;
  customValidators?: Record<string, any>;
  formName?: string;
}

/** Complete form validation schema */
export interface FormSchema {
  formId: string;
  formName?: string;
  config?: FormValidationConfig;
  fields: FieldSchema[];
  initialValues: Record<string, any>;
  dependencies?: Record<string, string[]>;
}

/** Individual field schema */
export interface FieldSchema {
  name: string;
  type: ValidatableFieldType;
  label?: string;
  placeholder?: string;
  rules: ValidationRule[];
  dependencies?: string[];
  conditional?: (values: Record<string, any>) => boolean;
}

// ============================================================================
// ERROR HANDLING TYPES
// ============================================================================

/** Validation error types */
export type ValidationErrorType = 
  | 'VALIDATION_FAILED'
  | 'REMOTE_ERROR'
  | 'NETWORK_ERROR'
  | 'PARSER_ERROR'
  | 'REGISTRY_ERROR'
  | 'DISPATCHER_ERROR'
  | 'UNKNOWN_ERROR';

/** Structured error information */
export interface ValidationError {
  type: ValidationErrorType;
  code: string;
  message: string;
  fieldName?: string;
  ruleType?: string;
  originalError?: Error;
  context?: Record<string, any>;
  timestamp: number;
}

/** Error handling result */
export interface ErrorHandlingResult {
  handled: boolean;
  error?: ValidationError;
  fallbackResult?: ExtendedValidationResult;
}

// ============================================================================
// EVENT TYPES
// ============================================================================

/** Form validation events */
export type FormValidationEventType = 
  | 'FormAttached'
  | 'FormDetached'
  | 'FieldValidated'
  | 'FieldValidationFailed'
  | 'FormValidated'
  | 'FormValidationFailed'
  | 'RemoteValidationStarted'
  | 'RemoteValidationCompleted'
  | 'RemoteValidationFailed';

/** Event payload structure */
export interface ValidationEventPayload {
  formId: string;
  fieldName?: string;
  value?: any;
  result?: ExtendedValidationResult;
  error?: ValidationError;
  timestamp: number;
}

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

/** JSON Schema validation rule */
export interface JsonSchemaRule {
  type: string;
  properties?: Record<string, any>;
  required?: string[];
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  minItems?: number;
  maxItems?: number;
  format?: string;
  enum?: any[];
  custom?: Record<string, any>;
}

/** JSON Schema for form validation */
export interface JsonFormSchema {
  $schema?: string;
  type: 'object';
  properties: Record<string, JsonSchemaRule>;
  required?: string[];
  dependencies?: Record<string, any>;
  formConfig?: FormValidationConfig;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/** Debouncer configuration */
export interface DebouncerConfig {
  delay: number;
  maxDelay?: number;
  leading?: boolean;
  trailing?: boolean;
}

/** Logger configuration */
export interface LoggerConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  enableConsole?: boolean;
  enableRemote?: boolean;
  remoteEndpoint?: string;
}

/** Performance metrics */
export interface ValidationMetrics {
  validationCount: number;
  averageValidationTime: number;
  remoteValidationCount: number;
  errorCount: number;
  lastValidationTime?: number;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/** Type guard for validatable elements */
export function isValidatableElement(element: Element): element is ValidatableElement {
  return element instanceof HTMLInputElement ||
         element instanceof HTMLSelectElement ||
         element instanceof HTMLTextAreaElement;
}

/** Type guard for validation rules */
export function isValidValidationRule(rule: any): rule is ValidationRule {
  return rule && 
         typeof rule === 'object' && 
         typeof rule.type === 'string';
}

/** Type guard for form schemas */
export function isValidFormSchema(schema: any): schema is FormSchema {
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
export const DEFAULT_CONFIG: FormValidationConfig = {
  validateOnBlur: true,
  validateOnChange: false,
  validateOnSubmit: true,
  debounceDelay: 350,
  showErrorsImmediately: true,
  enableRemoteValidation: true,
};

/** Default debouncer configuration */
export const DEFAULT_DEBOUNCER_CONFIG: DebouncerConfig = {
  delay: 350,
  maxDelay: 1000,
  leading: false,
  trailing: true,
};

/** Built-in validator types */
export const BUILT_IN_VALIDATORS: BuiltInValidatorType[] = [
  'required', 'email', 'minlength', 'maxlength', 'pattern',
  'match', 'minchecked', 'maxchecked', 'minselected', 'maxselected', 'remote'
];

/** Remote providers */
export const REMOTE_PROVIDERS: RemoteProviderType[] = ['WebSocket', 'HTTP', 'REST'];

/** Validation severity levels */
export const VALIDATION_SEVERITIES: ValidationSeverity[] = ['error', 'warning', 'info', 'success'];
