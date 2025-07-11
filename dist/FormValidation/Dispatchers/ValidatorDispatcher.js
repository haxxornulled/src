var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { inject, injectable } from "inversify";
import ContainerTypes from "../DI/ContainerTypes";
let ValidatorDispatcher = class ValidatorDispatcher {
    constructor(broker, validatorRegistry) {
        this.broker = broker;
        this.validatorRegistry = validatorRegistry;
        this.parsedSchema = null;
        this.handleMessage = async (msg) => {
            const { name, value, fieldType, remoteType, provider, endpoint, formId, allValues } = msg.payload || {};
            let result = null;
            try {
                if (msg.type === "FieldRemoteValidate") {
                    result = this.runRemoteValidation
                        ? await this.runRemoteValidation(remoteType, value, {
                            type: remoteType,
                            provider,
                            endpoint,
                            fieldType,
                            formId,
                            value,
                            allValues,
                        })
                        : null;
                }
                // Handle both FieldChanged and FieldBlurred here:
                else if (msg.type === "FieldChanged" || msg.type === "FieldBlurred") {
                    // Try to get the form element if possible
                    const formEl = formId ? document.getElementById(formId) : undefined;
                    result = await this.runLocalValidation(name, value, fieldType, formId, allValues, formEl);
                }
                else {
                    return;
                }
                if (result) {
                    this.broker.publish({
                        _remote: false,
                        type: "FieldValidationResult",
                        topic: "form",
                        from: "ValidatorDispatcher",
                        payload: { formId, name, result },
                        timestamp: new Date().toISOString(),
                    });
                }
            }
            catch (err) {
                this.broker.publish({
                    _remote: false,
                    type: "FieldValidationResult",
                    topic: "form",
                    from: "ValidatorDispatcher",
                    payload: {
                        formId,
                        name,
                        result: { valid: false, message: err?.message || "Validation error" }
                    },
                    timestamp: new Date().toISOString(),
                });
            }
        };
        this.runLocalValidation = async (name, value, fieldType, formId, allValues, formEl) => {
            // Try schema-based first, fallback to DOM-based rules
            let rules = null;
            if (this.parsedSchema?.fields) {
                const fieldSchema = this.parsedSchema.fields.find((f) => f.field === name);
                if (fieldSchema && fieldSchema.rules) {
                    rules = fieldSchema.rules;
                }
            }
            // Fallback: parse rules from DOM (if field not in schema)
            if (!rules && formEl) {
                const fieldEl = formEl.querySelector(`[name="${name}"]`);
                if (fieldEl) {
                    rules = this.parseRulesFromDOM(fieldEl);
                }
            }
            if (!rules)
                return { valid: true };
            const errors = [];
            for (const rule of rules) {
                const validator = this.validatorRegistry.getValidator(rule.type);
                if (validator) {
                    try {
                        const res = await Promise.resolve(validator.validate(value, rule, allValues));
                        if (res && typeof res === "object" && res.valid === false) {
                            if (rule.stopOnFail !== false)
                                return res;
                            else
                                errors.push(res.message || "Validation failed");
                        }
                    }
                    catch (err) {
                        errors.push(err?.message || `Error in ${rule.type} validator`);
                    }
                }
            }
            if (errors.length)
                return { valid: false, message: errors.join("; ") };
            return { valid: true };
        };
        // --- (rest unchanged) ---
        this.runRemoteValidation = async (remoteType, value, rule) => {
            let validator = this.validatorRegistry.getValidator("remote") || this.validatorRegistry.getValidator("Remote");
            if (!validator) {
                return { valid: false, message: "Remote validation not available" };
            }
            const context = {
                endpoint: rule.endpoint,
                provider: rule.provider,
                remoteType,
                fieldName: rule.fieldName, // Pass field name for configuration lookup
                ...rule,
            };
            try {
                const res = await validator.validate(value, context);
                if (typeof res === "boolean")
                    return { valid: res };
                return res;
            }
            catch (err) {
                return { valid: false, message: err?.message || "Remote validation error" };
            }
        };
        this.broker.subscribe(this.handleMessage, (msg) => msg.topic === "form" &&
            (msg.type === "FieldChanged" ||
                msg.type === "FieldBlurred" || // <-- Added!
                msg.type === "FieldRemoteValidate"));
    }
    setSchema(schema) {
        this.parsedSchema = schema;
        if (this.broker && schema && schema.formName) {
            this.broker.publish({
                type: 'ValidationReady',
                topic: 'form',
                from: "ValidatorDispatcher",
                payload: { formId: schema.formName },
                _remote: false,
            });
        }
    }
    // Enhanced DOM rule parsing for fallback validation
    parseRulesFromDOM(fieldEl) {
        const rules = [];
        // Parse data-rule-* attributes
        for (const attr of Array.from(fieldEl.attributes)) {
            if (attr.name.startsWith("data-rule-")) {
                const ruleType = attr.name.replace("data-rule-", "");
                let value = attr.value;
                // Convert string values to appropriate types
                if (value === "true")
                    value = true;
                if (value === "false")
                    value = false;
                if (!isNaN(Number(value)) && value !== "")
                    value = Number(value);
                // Look for per-rule custom message
                const msgAttr = `data-msg-${ruleType.toLowerCase()}`;
                const msg = fieldEl.getAttribute(msgAttr) || undefined;
                // Handle special cases
                if (ruleType === "remote") {
                    const provider = fieldEl.getAttribute("data-rule-remote-provider");
                    const endpoint = fieldEl.getAttribute("data-rule-remote-endpoint");
                    const remoteType = fieldEl.getAttribute("data-rule-remote-type");
                    rules.push({
                        type: ruleType,
                        value,
                        provider,
                        endpoint,
                        remoteType,
                        fieldName: fieldEl.getAttribute("name") || undefined,
                        message: msg
                    });
                }
                else {
                    rules.push({
                        type: ruleType,
                        value,
                        fieldName: fieldEl.getAttribute("name") || undefined,
                        message: msg
                    });
                }
            }
        }
        // Also check for HTML5 validation attributes
        if (fieldEl.hasAttribute("required")) {
            const msg = fieldEl.getAttribute("data-msg-required") || "This field is required.";
            rules.push({
                type: "required",
                value: true,
                message: msg,
            });
        }
        if (fieldEl.hasAttribute("minlength")) {
            const minLength = fieldEl.getAttribute("minlength");
            if (minLength) {
                const msg = fieldEl.getAttribute("data-msg-minlength") || `Minimum length is ${minLength} characters.`;
                rules.push({
                    type: "minlength",
                    value: parseInt(minLength),
                    message: msg,
                });
            }
        }
        if (fieldEl.hasAttribute("maxlength")) {
            const maxLength = fieldEl.getAttribute("maxlength");
            if (maxLength) {
                const msg = fieldEl.getAttribute("data-msg-maxlength") || `Maximum length is ${maxLength} characters.`;
                rules.push({
                    type: "maxlength",
                    value: parseInt(maxLength),
                    message: msg,
                });
            }
        }
        if (fieldEl.hasAttribute("pattern")) {
            const pattern = fieldEl.getAttribute("pattern");
            if (pattern) {
                const msg = fieldEl.getAttribute("data-msg-pattern") || "Value does not match required pattern.";
                rules.push({
                    type: "pattern",
                    value: pattern,
                    message: msg,
                });
            }
        }
        // Handle email type
        if (fieldEl instanceof HTMLInputElement && fieldEl.type === "email") {
            const msg = fieldEl.getAttribute("data-msg-email") || "Please enter a valid email address.";
            rules.push({
                type: "email",
                value: true,
                message: msg,
            });
        }
        console.log(`[ValidatorDispatcher] Parsed rules for field ${fieldEl.getAttribute('name')}:`, rules);
        return rules;
    }
    async validateAllFields(formId, values, formEl) {
        const results = [];
        // If we have a parsed schema, use it
        if (this.parsedSchema?.fields) {
            for (const fieldSchema of this.parsedSchema.fields) {
                const name = fieldSchema.field;
                let fieldResult = { valid: true };
                for (const rule of fieldSchema.rules) {
                    const validator = this.validatorRegistry.getValidator(rule.type);
                    if (validator) {
                        let res;
                        if ('validate' in validator) {
                            const validationResult = await Promise.resolve(validator.validate(values[name], rule, values));
                            res = typeof validationResult === "boolean" ? { valid: validationResult } : validationResult;
                        }
                        else {
                            continue;
                        }
                        if (res && typeof res === "object" && res.valid === false) {
                            fieldResult = res;
                            break;
                        }
                    }
                }
                results.push({ name, result: fieldResult });
            }
        }
        // Fallback: Parse rules from DOM if no schema is available
        else if (formEl) {
            console.log(`[ValidatorDispatcher] No schema found, parsing rules from DOM for form: ${formId}`);
            const fields = Array.from(formEl.elements).filter(element => element instanceof HTMLInputElement ||
                element instanceof HTMLSelectElement ||
                element instanceof HTMLTextAreaElement);
            for (const field of fields) {
                if (!field.name)
                    continue;
                const fieldRules = this.parseRulesFromDOM(field);
                if (fieldRules.length === 0)
                    continue;
                let fieldResult = { valid: true };
                for (const rule of fieldRules) {
                    const validator = this.validatorRegistry.getValidator(rule.type);
                    if (validator) {
                        try {
                            // Ensure the rule has the field name for configuration lookup
                            const ruleWithFieldName = {
                                ...rule,
                                fieldName: field.name
                            };
                            const validationResult = await Promise.resolve(validator.validate(values[field.name], ruleWithFieldName, values));
                            const res = typeof validationResult === "boolean" ? { valid: validationResult } : validationResult;
                            if (res && typeof res === "object" && res.valid === false) {
                                fieldResult = res;
                                break; // Stop on first validation failure
                            }
                        }
                        catch (err) {
                            console.error(`[ValidatorDispatcher] Error validating field ${field.name}:`, err);
                            fieldResult = {
                                valid: false,
                                message: err?.message || `Error in ${rule.type} validator`
                            };
                            break;
                        }
                    }
                    else {
                        console.warn(`[ValidatorDispatcher] Validator not found for type: ${rule.type}`);
                    }
                }
                results.push({ name: field.name, result: fieldResult });
            }
        }
        else {
            console.warn(`[ValidatorDispatcher] No schema or form element provided for validation`);
        }
        console.log(`[ValidatorDispatcher] Validation results for form ${formId}:`, results);
        return results;
    }
};
ValidatorDispatcher = __decorate([
    injectable(),
    __param(0, inject(ContainerTypes.MessageBroker)),
    __param(1, inject(ContainerTypes.ValidatorRegistry)),
    __metadata("design:paramtypes", [Object, Object])
], ValidatorDispatcher);
export { ValidatorDispatcher };
//# sourceMappingURL=ValidatorDispatcher.js.map