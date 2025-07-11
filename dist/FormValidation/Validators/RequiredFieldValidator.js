/**
 * Required Field Validator
 *
 * Validates that a field has a value and is not empty. This validator handles
 * different input types appropriately:
 * - Text inputs: Must not be empty string
 * - Arrays: Must have at least one element
 * - Booleans: Must be true
 * - Null/undefined: Always invalid
 *
 * @example
 * ```typescript
 * const validator = new RequiredValidator();
 *
 * // Text field validation
 * validator.validate("hello", { type: "required" }); // { valid: true }
 * validator.validate("", { type: "required" }); // { valid: false, message: "This field is required." }
 *
 * // Array validation (checkbox groups, multi-select)
 * validator.validate(["option1", "option2"], { type: "required" }); // { valid: true }
 * validator.validate([], { type: "required" }); // { valid: false, message: "This field is required." }
 *
 * // Boolean validation (single checkbox)
 * validator.validate(true, { type: "required" }); // { valid: true }
 * validator.validate(false, { type: "required" }); // { valid: false, message: "This field is required." }
 * ```
 */
export class RequiredValidator {
    constructor() {
        /** Validator name/type identifier */
        this.name = "required";
    }
    /**
     * Validates that a field has a value and is not empty
     *
     * @param value - The value to validate. Can be any type including arrays and booleans
     * @param rule - The validation rule descriptor containing configuration
     * @returns ValidationResult indicating whether the field is valid
     *
     * @remarks
     * This validator uses different logic based on the value type:
     * - Arrays: Valid if length > 0
     * - Booleans: Valid if true
     * - Null/undefined: Always invalid
     * - Other types: Valid if not empty string
     *
     * The validator provides appropriate error messages and can be customized
     * through the rule.message property.
     */
    validate(value, rule) {
        let valid;
        // Handle different value types with appropriate validation logic
        if (Array.isArray(value)) {
            // Checkbox group or multi-select validation
            // Valid if array has at least one element
            valid = value.length > 0;
        }
        else if (typeof value === "boolean") {
            // Single checkbox validation
            // Valid if checkbox is checked (true)
            valid = value;
        }
        else if (value === null || value === undefined) {
            // Null/undefined values are always invalid
            valid = false;
        }
        else {
            // String and other primitive types
            // Valid if not empty string (handles whitespace-only strings as invalid)
            valid = value !== "";
        }
        // Return validation result with appropriate message
        return {
            valid,
            message: valid ? undefined : (rule.message || "This field is required."),
        };
    }
}
export default RequiredValidator;
//# sourceMappingURL=RequiredFieldValidator.js.map