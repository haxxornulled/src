// Max Checked (for checkbox groups)
export class MaxCheckedValidator {
    constructor() {
        this.name = "maxchecked";
    }
    validate(value, rule) {
        const max = rule.value || 0;
        let checkedCount = 0;
        if (Array.isArray(value)) {
            checkedCount = value.length;
        }
        else if (typeof value === "boolean") {
            checkedCount = value ? 1 : 0;
        }
        const valid = checkedCount <= max;
        return {
            valid,
            message: valid ? undefined : (rule.message || `Select no more than ${max}.`),
        };
    }
}
export default MaxCheckedValidator;
//# sourceMappingURL=MaxCheckedValidator.js.map