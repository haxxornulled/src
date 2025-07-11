// Min Length
export class MinLengthValidator {
    constructor() {
        this.name = "minlength";
    }
    validate(value, rule) {
        const min = rule.value || 0;
        const valid = typeof value === "string" && value.length >= min;
        return {
            valid,
            message: valid ? undefined : (rule.message || `Minimum length is ${min}.`),
        };
    }
}
export default MinLengthValidator;
//# sourceMappingURL=MinLengthValidator.js.map