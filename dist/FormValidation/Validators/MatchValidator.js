// Match (e.g. confirmPassword)
export class MatchValidator {
    constructor() {
        this.name = "match";
    }
    validate(value, rule, allValues) {
        // Prefer matchField, then value
        let otherField = rule.matchField || rule.value;
        if (typeof otherField === 'string' && otherField.trim() === '') {
            otherField = undefined;
        }
        if (!otherField) {
            console.warn('[MatchValidator] No field to match specified in rule:', rule);
            return {
                valid: false,
                message: rule.message || "No field to match specified."
            };
        }
        if (!allValues || !(otherField in allValues)) {
            console.warn(`[MatchValidator] Field to match (${otherField}) not found in allValues:`, allValues);
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
//# sourceMappingURL=MatchValidator.js.map