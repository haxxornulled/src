 export interface IValidationResult {
  /** Is the value valid? */
  valid: boolean;
  /** Optional error code or rule name (e.g. "required", "minLength") */
  code?: string;
  /** Human-readable error message for display */
  message?: string;
  /** The offending value (optional, for diagnostics) */
  value?: any;
  /** Arbitrary context or extra details */
  [key: string]: any;
}