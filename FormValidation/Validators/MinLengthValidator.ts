import { IRuleDescriptor } from "../Interfaces/IRuleDescriptor";
import { IValidationResult } from "../Interfaces/IValidationResult";
import { IValidator } from "../Interfaces/IValidator";

// Min Length
export class MinLengthValidator implements IValidator {
    name = "minlength";
    validate(value: any, rule: IRuleDescriptor): IValidationResult {
        const min = rule.value || 0;
        const valid = typeof value === "string" && value.length >= min;
        return {
            valid,
            message: valid ? undefined : (rule.message || `Minimum length is ${min}.`),
        };
    }
}


export default MinLengthValidator;