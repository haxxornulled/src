import { IValidationResult } from "./IValidationResult";


export interface IAsyncValidator {
  name: string;
  validate(value: any, context?: any): Promise<boolean | IValidationResult>;
}