// Email
export class EmailValidator {
    constructor() {
        this.name = "email";
        this.emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    }
    validate(value, rule) {
        const valid = typeof value === "string" && this.emailRegex.test(value);
        return {
            valid,
            message: valid ? undefined : (rule.message || "Invalid email address."),
        };
    }
}
export default EmailValidator;
//# sourceMappingURL=EmailValidator.js.map