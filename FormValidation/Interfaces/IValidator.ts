import { IRuleDescriptor } from "./IRuleDescriptor";
import { IValidationResult } from "./IValidationResult";

export interface IValidator {
  name: string;
  validate(value: any, rule: IRuleDescriptor, allValues?: Record<string, any>): IValidationResult | Promise<IValidationResult>;
}
