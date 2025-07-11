// Max Selected (for <select multiple>)
export class MaxSelectedValidator {
    constructor() {
        this.name = "maxselected";
    }
    validate(value, rule) {
        const max = rule.value || 0;
        let selectedCount = 0;
        if (Array.isArray(value)) {
            selectedCount = value.length;
        }
        else if (value !== null && value !== undefined && value !== "") {
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
//# sourceMappingURL=MaxSelectedValidator.js.map