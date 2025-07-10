import { IRuleDescriptor } from "../Interfaces/IRuleDescriptor";
import { IValidationResult } from "../Interfaces/IValidationResult";
import { IValidator } from "../Interfaces/IValidator";

// Pattern
export class PatternValidator implements IValidator {
    name = "pattern";
    validate(value: any, rule: IRuleDescriptor): IValidationResult {
        const pattern = rule.value instanceof RegExp ? rule.value : new RegExp(rule.value);
        const valid = typeof value === "string" && pattern.test(value);
        return {
            valid,
            message: valid ? undefined : (rule.message || "Invalid format."),
        };
    }
}

export default PatternValidator;