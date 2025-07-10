import { IMessage } from "../../MessageBroker/Interfaces/IMessage";
import { IParsedFormSchema } from "./IParsedFormSchema";
import { IRuleDescriptor } from "./IRuleDescriptor";
import { IValidationResult } from "./IValidationResult";

export interface IValidatorDispatcher {
  /** Attach a parsed form schema for this dispatcher to use */
  setSchema(schema: IParsedFormSchema): void;

  /** Main message handler for broker subscription */
  handleMessage(msg: IMessage): void | Promise<void>;

  /** Run local (sync/async) validation for a field/value */
  runLocalValidation(
    name: string,
    value: any,
    fieldType: string,
    formId: string
  ): Promise<IValidationResult>;

  /** Run remote/async validation (optionally overridable) */
  runRemoteValidation?(
    remoteType: string,
    value: any,
    rule: IRuleDescriptor
  ): Promise<IValidationResult>;

  validateAllFields(formId: string, values: Record<string, any>, formEl?: HTMLFormElement): Promise<{ name: string, result: IValidationResult }[]>;
}