import { inject, injectable } from "inversify";
import ContainerTypes from "../DI/ContainerTypes";


import { IValidationResult } from "../Interfaces/IValidationResult";
import { IValidatorDispatcher } from "../Interfaces/IValidatorDispatcher";
import { IParsedFormSchema } from "../Interfaces/IParsedFormSchema";
import { IRuleDescriptor } from "../Interfaces/IRuleDescriptor";
import { IMessageBroker } from "../../MessageBroker/Interfaces/IMessageBroker";
import { IMessage } from "../../MessageBroker/Interfaces/IMessage";
import { IValidatorRegistry } from "../Interfaces/IValidatorRegistry";
import { IFieldRule } from '../Interfaces/IFieldRule';



@injectable()
export class ValidatorDispatcher implements IValidatorDispatcher {
  private parsedSchema: IParsedFormSchema | null = null;

  constructor(
    @inject(ContainerTypes.MessageBroker) private broker: IMessageBroker,
    @inject(ContainerTypes.ValidatorRegistry) private validatorRegistry: IValidatorRegistry
  ) {
    this.broker.subscribe(
      this.handleMessage,
      (msg) =>
        msg.topic === "form" &&
        (
          msg.type === "FieldChanged" ||
          msg.type === "FieldBlurred" || // <-- Added!
          msg.type === "FieldRemoteValidate"
        )
    );
  }

  setSchema(schema: IParsedFormSchema): void {
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

 handleMessage = async (msg: IMessage): Promise<void> => {
    const { name, value, fieldType, remoteType, provider, endpoint, formId, allValues } = msg.payload || {};
    let result: IValidationResult | null = null;

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
        const formEl = formId ? document.getElementById(formId) as HTMLFormElement : undefined;
        result = await this.runLocalValidation(name, value, fieldType, formId, allValues, formEl);
      } else {
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
    } catch (err: any) {
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

  runLocalValidation = async (
    name: string,
    value: any,
    fieldType: string,
    formId: string,
    allValues?: Record<string, any>,
    formEl?: HTMLFormElement
  ): Promise<IValidationResult> => {
    // Try schema-based first, fallback to DOM-based rules
    let rules: IFieldRule[] | null = null;

    if (this.parsedSchema?.fields) {
      const fieldSchema = this.parsedSchema.fields.find((f) => f.field === name);
      if (fieldSchema && fieldSchema.rules) {
        rules = fieldSchema.rules;
      }
    }
    // Fallback: parse rules from DOM (if field not in schema)
    if (!rules && formEl) {
      const fieldEl = formEl.querySelector(`[name="${name}"]`) as HTMLElement;
      if (fieldEl) {
        rules = this.parseRulesFromDOM(fieldEl);
      }
    }
    if (!rules) return { valid: true };

    const errors: string[] = [];
    for (const rule of rules) {
      const validator = this.validatorRegistry.getValidator(rule.type);
      if (validator) {
        try {
          const res = await Promise.resolve(validator.validate(value, rule, allValues));
          if (res && typeof res === "object" && res.valid === false) {
            if (rule.stopOnFail !== false) return res;
            else errors.push(res.message || "Validation failed");
          }
        } catch (err: any) {
          errors.push(err?.message || `Error in ${rule.type} validator`);
        }
      }
    }
    if (errors.length) return { valid: false, message: errors.join("; ") };
    return { valid: true };
  };

  // Enhanced DOM rule parsing for fallback validation
  private parseRulesFromDOM(fieldEl: HTMLElement): IFieldRule[] {
    const rules: IFieldRule[] = [];
    
    // Parse data-rule-* attributes
    for (const attr of Array.from(fieldEl.attributes)) {
      if (attr.name.startsWith("data-rule-")) {
        const ruleType = attr.name.replace("data-rule-", "");
        let param: any = attr.value;
        
        // Convert string values to appropriate types
        if (param === "true") param = true;
        if (param === "false") param = false;
        if (!isNaN(Number(param)) && param !== "") param = Number(param);
        
        // Handle special cases
        if (ruleType === "remote") {
          const provider = fieldEl.getAttribute("data-rule-remote-provider");
          const endpoint = fieldEl.getAttribute("data-rule-remote-endpoint");
          const remoteType = fieldEl.getAttribute("data-rule-remote-type");
          
          rules.push({
            type: ruleType,
            param,
            provider,
            endpoint,
            remoteType,
            message: fieldEl.getAttribute("data-rule-message") || undefined,
          });
        } else {
          rules.push({
            type: ruleType,
            param,
            message: fieldEl.getAttribute("data-rule-message") || undefined,
          });
        }
      }
    }
    
    // Also check for HTML5 validation attributes
    if (fieldEl.hasAttribute("required")) {
      rules.push({
        type: "required",
        param: true,
        message: fieldEl.getAttribute("data-rule-message") || "This field is required.",
      });
    }
    
    if (fieldEl.hasAttribute("minlength")) {
      const minLength = fieldEl.getAttribute("minlength");
      if (minLength) {
        rules.push({
          type: "minlength",
          param: parseInt(minLength),
          message: fieldEl.getAttribute("data-rule-message") || `Minimum length is ${minLength} characters.`,
        });
      }
    }
    
    if (fieldEl.hasAttribute("maxlength")) {
      const maxLength = fieldEl.getAttribute("maxlength");
      if (maxLength) {
        rules.push({
          type: "maxlength",
          param: parseInt(maxLength),
          message: fieldEl.getAttribute("data-rule-message") || `Maximum length is ${maxLength} characters.`,
        });
      }
    }
    
    if (fieldEl.hasAttribute("pattern")) {
      const pattern = fieldEl.getAttribute("pattern");
      if (pattern) {
        rules.push({
          type: "pattern",
          param: pattern,
          message: fieldEl.getAttribute("data-rule-message") || "Value does not match required pattern.",
        });
      }
    }
    
    // Handle email type
    if (fieldEl instanceof HTMLInputElement && fieldEl.type === "email") {
      rules.push({
        type: "email",
        param: true,
        message: fieldEl.getAttribute("data-rule-message") || "Please enter a valid email address.",
      });
    }
    
    console.log(`[ValidatorDispatcher] Parsed rules for field ${fieldEl.getAttribute('name')}:`, rules);
    return rules;
  }

  // --- (rest unchanged) ---

  runRemoteValidation = async (
    remoteType: string,
    value: any,
    rule: IRuleDescriptor
  ): Promise<IValidationResult> => {
    let validator = this.validatorRegistry.getValidator("remote") || this.validatorRegistry.getValidator("Remote");
    if (!validator) {
      return { valid: false, message: "Remote validation not available" };
    }
    const context = {
      endpoint: rule.endpoint,
      provider: rule.provider,
      remoteType,
      ...rule,
    };
    try {
      const res = await validator.validate(value, context);
      if (typeof res === "boolean") return { valid: res };
      return res;
    } catch (err: any) {
      return { valid: false, message: err?.message || "Remote validation error" };
    }
  };

  async validateAllFields(formId: string, values: Record<string, any>, formEl?: HTMLFormElement): Promise<{ name: string, result: IValidationResult }[]> {
    const results: { name: string, result: IValidationResult }[] = [];

    // If we have a parsed schema, use it
    if (this.parsedSchema?.fields) {
      for (const fieldSchema of this.parsedSchema.fields) {
        const name = fieldSchema.field;
        let fieldResult: IValidationResult = { valid: true };
        for (const rule of fieldSchema.rules) {
          const validator = this.validatorRegistry.getValidator(rule.type);
          if (validator) {
            let res: IValidationResult;
            if ('validate' in validator) {
              const validationResult = await Promise.resolve(validator.validate(values[name], rule, values));
              res = typeof validationResult === "boolean" ? { valid: validationResult } : validationResult;
            } else {
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
      
      const fields = Array.from(formEl.elements).filter(
        element => element instanceof HTMLInputElement || 
                   element instanceof HTMLSelectElement || 
                   element instanceof HTMLTextAreaElement
      ) as (HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)[];

      for (const field of fields) {
        if (!field.name) continue;
        
        const fieldRules = this.parseRulesFromDOM(field);
        if (fieldRules.length === 0) continue;

        let fieldResult: IValidationResult = { valid: true };
        
        for (const rule of fieldRules) {
          const validator = this.validatorRegistry.getValidator(rule.type);
          if (validator) {
            try {
              const validationResult = await Promise.resolve(validator.validate(values[field.name], rule, values));
              const res = typeof validationResult === "boolean" ? { valid: validationResult } : validationResult;
              
              if (res && typeof res === "object" && res.valid === false) {
                fieldResult = res;
                break; // Stop on first validation failure
              }
            } catch (err: any) {
              console.error(`[ValidatorDispatcher] Error validating field ${field.name}:`, err);
              fieldResult = { 
                valid: false, 
                message: err?.message || `Error in ${rule.type} validator` 
              };
              break;
            }
          } else {
            console.warn(`[ValidatorDispatcher] Validator not found for type: ${rule.type}`);
          }
        }
        
        results.push({ name: field.name, result: fieldResult });
      }
    } else {
      console.warn(`[ValidatorDispatcher] No schema or form element provided for validation`);
    }

    console.log(`[ValidatorDispatcher] Validation results for form ${formId}:`, results);
    return results;
  }
}
