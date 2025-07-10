import { IMessage } from "../../MessageBroker/Interfaces/IMessage";

export function formValidationLoggerMiddleware(label: string = "FormValidation") {
  return (msg: IMessage, next: (msg: IMessage) => void) => {
    if (["FormSubmit", "FieldChanged", "FieldBlurred", "FieldValidationResult", "FormSubmitted"].includes(msg.type)) {
      console.log(`[${label} Middleware] Intercepted:`, msg);
    }
    next(msg);
  };
}
