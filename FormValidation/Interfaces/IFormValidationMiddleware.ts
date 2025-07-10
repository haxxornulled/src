import { IMessage } from "../../MessageBroker/Interfaces/IMessage";


/**
 * Interface for FormValidationMiddleware.
 * Defines the contract for middleware that binds to forms and emits validation messages.
 */
export interface IFormValidationMiddleware {
  /**
   * Scan the DOM for forms and attach validation event listeners.
   */
  attachToForms(): void;

  /**
   * Returns a middleware function to use with the message broker.
   */
  middleware(): (msg: IMessage, next: (msg: IMessage) => void) => void;
}
