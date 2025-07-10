import { IMessage } from "../../MessageBroker/Interfaces/IMessage";
import { IMessageBroker } from "../../MessageBroker/Interfaces/IMessageBroker";
import { IFormValidationMiddleware } from "../Interfaces/IFormValidationMiddleware";
import { injectable, inject } from 'inversify';
import { IRuleParser } from "../Interfaces/IRuleParser";
import { IFieldValidationSchema } from "../Interfaces/IFieldValidationSchema";
import ContainerTypes from "../DI/ContainerTypes";
import { IFormEventBinder } from "../Interfaces/IFormEventBinder";

@injectable()
export class FormValidationMiddleware implements IFormValidationMiddleware {
  private label: string = "FormValidation";
  
  constructor(
    @inject("IFormEventBinder") private formEventBinder: IFormEventBinder
  ) {}

  /** Scan and bind all forms marked for validation */
  attachToForms(): void {
    const forms = Array.from(document.querySelectorAll<HTMLFormElement>('form[validate="true"]'));
    console.log(`[${this.label}] Attaching to ${forms.length} forms for validation.`);
    if (forms.length === 0) {
      console.warn(`[${this.label}] No forms found with 'validate="true"'.`);
      return;
    }
    forms.forEach(form => this.formEventBinder.bind(form));
  }

  /* Middleware for broker: logs validation-related messages */
  middleware() {
    return (msg: IMessage, next: (msg: IMessage) => void) => {
      if (
        [
          "FormSubmit", 
          "FieldChanged", 
          "FieldBlurred", 
          "FieldRemoteValidate",
          "FormSubmitted", 
          "FieldValidationResult"
        ].includes(msg.type)
      ) {
        console.log(`[${this.label} Middleware] Intercepted:`, msg);
      }
      next(msg);
    };
  }
}