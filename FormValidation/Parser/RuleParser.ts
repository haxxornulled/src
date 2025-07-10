import { injectable } from "inversify";
import { IFieldValidationSchema } from "../Interfaces/IFieldValidationSchema";
import { IRuleDescriptor } from "../Interfaces/IRuleDescriptor";
import { IRuleParser } from "../Interfaces/IRuleParser";


@injectable()
export class RuleParser implements IRuleParser {
  parseForm(form: HTMLFormElement): IFieldValidationSchema[] {
    const fields: IFieldValidationSchema[] = [];
    const elements = Array.from(form.elements) as (HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)[];
    const processed = new Set<string>();
    // Group by name for checkboxes/radios
    const grouped: Record<string, (HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)[]> = {};
    elements.forEach(el => {
      if (!el.name) return;
      if (!grouped[el.name]) grouped[el.name] = [];
      grouped[el.name].push(el);
    });
    for (const [name, group] of Object.entries(grouped)) {
      if (processed.has(name)) continue;
      const el = group[0];
      let rules: IRuleDescriptor[] = [];
      if (el instanceof HTMLInputElement && (el.type === "checkbox" || el.type === "radio")) {
        // Aggregate rules for group
        group.forEach(input => {
          rules = rules.concat(this.parseField(input));
        });
        // Remove duplicates by type
        const seen = new Set();
        rules = rules.filter(r => {
          if (seen.has(r.type)) return false;
          seen.add(r.type);
          return true;
        });
      } else {
        rules = this.parseField(el);
      }
      console.log(`[RuleParser] Field: ${name}, Rules:`, rules);
      if (rules.length > 0) fields.push({ field: name, rules });
      processed.add(name);
    }
    return fields;
  }

  parseField(el: HTMLElement): IRuleDescriptor[] {
    const rules: IRuleDescriptor[] = [];
    const input = el as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

    // ---- HTML5 rules ----
    if ('required' in input && input.required) rules.push({ type: "required" });
    if ('minLength' in input && input.minLength > 0) rules.push({ type: "minLength", value: input.minLength });
    if ('maxLength' in input && input.maxLength > 0) rules.push({ type: "maxLength", value: input.maxLength });
    if ('pattern' in input && input.pattern) rules.push({ type: "pattern", value: input.pattern });
    if ('type' in input && input.type === "email") rules.push({ type: "email" });

    // ---- Data attribute rules ----
    Array.from(el.attributes).forEach(attr => {
      if (!attr.name.startsWith("data-rule-")) return;

      const ruleKey = attr.name.slice("data-rule-".length).toLowerCase();
      // Skip remote (handled below)
      if (["remote", "remote-provider", "remote-endpoint"].includes(ruleKey)) return;

      if (ruleKey === "minchecked") rules.push({ type: "minChecked", value: +attr.value });
      else if (ruleKey === "minselected") rules.push({ type: "minSelected", value: +attr.value });
      else if (ruleKey === "match") {
        // Support data-match-field as a secondary way to specify the field to match
        const matchField = el.getAttribute("data-match-field");
        rules.push({
          type: "match",
          value: attr.value,
          ...(matchField ? { matchField } : {})
        });
      }
      // Catch-all for anything else
      else rules.push({ type: ruleKey, value: attr.value });
    });

    // ---- Remote validation rule ----
    const remoteType = el.getAttribute("data-rule-remote");
    const provider = el.getAttribute("data-rule-remote-provider");
    const endpoint = el.getAttribute("data-rule-remote-endpoint");
    if (remoteType && (provider || endpoint)) {
      rules.push({
        type: "remote",
        remoteType,
        provider: provider || undefined,
        endpoint: endpoint || undefined
      });
    }

    return rules;
  }
}
