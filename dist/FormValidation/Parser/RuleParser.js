var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { injectable } from "inversify";
let RuleParser = class RuleParser {
    parseForm(form) {
        const fields = [];
        const elements = Array.from(form.elements);
        const processed = new Set();
        // Group by name for checkboxes/radios
        const grouped = {};
        elements.forEach(el => {
            if (!el.name)
                return;
            if (!grouped[el.name])
                grouped[el.name] = [];
            grouped[el.name].push(el);
        });
        for (const [name, group] of Object.entries(grouped)) {
            if (processed.has(name))
                continue;
            const el = group[0];
            let rules = [];
            if (el instanceof HTMLInputElement && (el.type === "checkbox" || el.type === "radio")) {
                // Aggregate rules for group
                group.forEach(input => {
                    rules = rules.concat(this.parseField(input));
                });
                // Remove duplicates by type
                const seen = new Set();
                rules = rules.filter(r => {
                    if (seen.has(r.type))
                        return false;
                    seen.add(r.type);
                    return true;
                });
            }
            else {
                rules = this.parseField(el);
            }
            console.log(`[RuleParser] Field: ${name}, Rules:`, rules);
            if (rules.length > 0)
                fields.push({ field: name, rules });
            processed.add(name);
        }
        return fields;
    }
    parseField(el) {
        const rules = [];
        const input = el;
        // ---- HTML5 rules ----
        if ('required' in input && input.required) {
            const msg = el.getAttribute('data-msg-required');
            rules.push({ type: "required", message: msg || undefined });
        }
        if ('minLength' in input && input.minLength > 0) {
            const msg = el.getAttribute('data-msg-minlength');
            rules.push({ type: "minLength", value: input.minLength, message: msg || undefined });
        }
        if ('maxLength' in input && input.maxLength > 0) {
            const msg = el.getAttribute('data-msg-maxlength');
            rules.push({ type: "maxLength", value: input.maxLength, message: msg || undefined });
        }
        if ('pattern' in input && input.pattern) {
            const msg = el.getAttribute('data-msg-pattern');
            rules.push({ type: "pattern", value: input.pattern, message: msg || undefined });
        }
        if ('type' in input && input.type === "email") {
            const msg = el.getAttribute('data-msg-email');
            rules.push({ type: "email", message: msg || undefined });
        }
        // ---- Data attribute rules ----
        Array.from(el.attributes).forEach(attr => {
            if (!attr.name.startsWith("data-rule-"))
                return;
            const ruleKey = attr.name.slice("data-rule-".length).toLowerCase();
            // Skip remote (handled below)
            if (["remote", "remote-provider", "remote-endpoint"].includes(ruleKey))
                return;
            const msgAttr = `data-msg-${ruleKey}`;
            const msg = el.getAttribute(msgAttr);
            if (ruleKey === "minchecked")
                rules.push({ type: "minChecked", value: +attr.value, message: msg || undefined });
            else if (ruleKey === "minselected")
                rules.push({ type: "minSelected", value: +attr.value, message: msg || undefined });
            else if (ruleKey === "match") {
                // Support data-match-field as a secondary way to specify the field to match
                const matchField = el.getAttribute("data-match-field");
                rules.push({
                    type: "match",
                    value: attr.value,
                    ...(matchField ? { matchField } : {}),
                    message: msg || undefined
                });
            }
            // Catch-all for anything else
            else
                rules.push({ type: ruleKey, value: attr.value, message: msg || undefined });
        });
        // ---- Remote validation rule ----
        const remoteType = el.getAttribute("data-rule-remote");
        const provider = el.getAttribute("data-rule-remote-provider");
        const endpoint = el.getAttribute("data-rule-remote-endpoint");
        if (remoteType && (provider || endpoint)) {
            const msg = el.getAttribute('data-msg-remote');
            rules.push({
                type: "remote",
                remoteType,
                provider: provider || undefined,
                endpoint: endpoint || undefined,
                message: msg || undefined
            });
        }
        return rules;
    }
};
RuleParser = __decorate([
    injectable()
], RuleParser);
export { RuleParser };
//# sourceMappingURL=RuleParser.js.map