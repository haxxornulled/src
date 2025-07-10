import { IRuleDescriptor } from "../Interfaces/IRuleDescriptor";
import { IValidationResult } from "../Interfaces/IValidationResult";
import { IValidator } from "../Interfaces/IValidator";

// Min Selected (for <select multiple>)
export class MinSelectedValidator implements IValidator {
    name = "minselected";
    validate(value: any, rule: IRuleDescriptor): IValidationResult {
        const min = rule.value || 0;
        let selectedCount = 0;
        if (Array.isArray(value)) {
            selectedCount = value.length;
        } else if (value !== null && value !== undefined && value !== "") {
            selectedCount = 1;
        }
        const valid = selectedCount >= min;
        return {
            valid,
            message: valid ? undefined : (rule.message || `Select at least ${min} options.`),
        };
    }
}

export default MinSelectedValidator;