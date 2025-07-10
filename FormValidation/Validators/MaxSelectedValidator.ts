import { IRuleDescriptor } from "../Interfaces/IRuleDescriptor";
import { IValidationResult } from "../Interfaces/IValidationResult";
import { IValidator } from "../Interfaces/IValidator";

// Max Selected (for <select multiple>)
export class MaxSelectedValidator implements IValidator {
    name = "maxselected";
    validate(value: any, rule: IRuleDescriptor): IValidationResult {
        const max = rule.value || 0;
        let selectedCount = 0;
        if (Array.isArray(value)) {
            selectedCount = value.length;
        } else if (value !== null && value !== undefined && value !== "") {
            selectedCount = 1;
        }
        const valid = selectedCount <= max;
        return {
            valid,
            message: valid ? undefined : (rule.message || `Select no more than ${max} options.`),
        };
    }
}

export default MaxSelectedValidator; 