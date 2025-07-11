// Pattern
export class PatternValidator {
    constructor() {
        this.name = "pattern";
    }
    validate(value, rule) {
        const pattern = rule.value instanceof RegExp ? rule.value : new RegExp(rule.value);
        const valid = typeof value === "string" && pattern.test(value);
        return {
            valid,
            message: valid ? undefined : (rule.message || "Invalid format."),
        };
    }
}
export default PatternValidator;
//# sourceMappingURL=PatternValidator.js.map