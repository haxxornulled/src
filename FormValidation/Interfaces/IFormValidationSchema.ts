import { IFieldValidationSchema } from "./IFieldValidationSchema";

export interface IFormValidationSchema {
  /** Optional: Name/id of the form */
  formName?: string;

  /** All fields and their validation rules */
  fields: IFieldValidationSchema[];

  /** Initial/default values for each field */
  initialValues: Record<string, any>;
}