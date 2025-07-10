import { IRuleDescriptor } from "./IRuleDescriptor";

export interface IFieldValidationSchema {
  /** Name/key for the field */
  field: string;

  /** Validation rules for this field */
  rules: IRuleDescriptor[];
}
