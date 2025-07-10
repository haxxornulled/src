import { IRuleDescriptor } from "../Interfaces/IRuleDescriptor";
import { IValidationResult } from "../Interfaces/IValidationResult";
import { IValidator } from "../Interfaces/IValidator";

// Match (e.g. confirmPassword)
export class MatchValidator implements IValidator {
    name = "match";
    validate(value: any, rule: IRuleDescriptor, allValues?: Record<string, any>): IValidationResult {
        // Prefer matchField, then value
        const otherField = (rule as any).matchField || rule.value;
        console.log("MatchValidator allValues:", allValues, "otherField:", otherField, "allValues[otherField]:", allValues ? allValues[otherField] : undefined);
        if (!otherField) {
            return {
                valid: false,
                message: rule.message || "No field to match specified."
            };
        }
        if (!allValues || !(otherField in allValues)) {
            return {
                valid: false,
                message: rule.message || `Field to match (${otherField}) not found.`
            };
        }
        const valid = value === allValues[otherField];
        return {
            valid,
            message: valid ? undefined : (rule.message || "Values do not match."),
        };
    }
}
export default MatchValidator;