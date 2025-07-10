import { IRuleDescriptor } from "../Interfaces/IRuleDescriptor";
import { IValidationResult } from "../Interfaces/IValidationResult";
import { IValidator } from "../Interfaces/IValidator";

// Email
export class EmailValidator implements IValidator {
    name = "email";
    private emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    validate(value: any, rule: IRuleDescriptor): IValidationResult {
        const valid = typeof value === "string" && this.emailRegex.test(value);
        return {
            valid,
            message: valid ? undefined : (rule.message || "Invalid email address."),
        };
    }
}
export default EmailValidator;