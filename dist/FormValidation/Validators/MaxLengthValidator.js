// Max Length
export class MaxLengthValidator {
    constructor() {
        this.name = "maxlength";
    }
    validate(value, rule) {
        const max = rule.value || 0;
        const valid = typeof value === "string" && value.length <= max;
        return {
            valid,
            message: valid ? undefined : (rule.message || `Maximum length is ${max}.`),
        };
    }
}
export default MaxLengthValidator;
//# sourceMappingURL=MaxLengthValidator.js.map