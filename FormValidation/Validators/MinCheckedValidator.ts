import { IRuleDescriptor } from "../Interfaces/IRuleDescriptor";
import { IValidationResult } from "../Interfaces/IValidationResult";
import { IValidator } from "../Interfaces/IValidator";

// Min Checked (for checkbox groups)
export class MinCheckedValidator implements IValidator {
    name = "minchecked";
    validate(value: any, rule: IRuleDescriptor): IValidationResult {
        const min = rule.value || 0;
        let checkedCount = 0;
        if (Array.isArray(value)) {
            checkedCount = value.length;
        } else if (typeof value === "boolean") {
            checkedCount = value ? 1 : 0;
        }
        const valid = checkedCount >= min;
        return {
            valid,
            message: valid ? undefined : (rule.message || `Select at least ${min}.`),
        };
    }
}

export default MinCheckedValidator;