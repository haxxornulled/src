import { IRuleDescriptor } from "../Interfaces/IRuleDescriptor";
import { IValidationResult } from "../Interfaces/IValidationResult";
import { IValidator } from "../Interfaces/IValidator";

// Max Length
export class MaxLengthValidator implements IValidator {
    name = "maxlength";
    validate(value: any, rule: IRuleDescriptor): IValidationResult {
        const max = rule.value || 0;
        const valid = typeof value === "string" && value.length <= max;
        return {
            valid,
            message: valid ? undefined : (rule.message || `Maximum length is ${max}.`),
        };
    }
}

export default MaxLengthValidator;