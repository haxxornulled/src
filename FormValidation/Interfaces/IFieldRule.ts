export interface IFieldRule {
  type: string;                // e.g., "required", "email", "minlength", "match"
  value?: any;                 // optional, e.g., minlength value, match field name, etc.
  message?: string;            // optional custom error message
  stopOnFail?: boolean;        // fail fast? (default true)
  [key: string]: any;          // allow extra fields (e.g., matchField, provider, etc.)
}
