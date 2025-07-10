import { IFieldValidationSchema } from "./IFieldValidationSchema";

export interface IParsedFormSchema {
  formName: string;
  fields: IFieldValidationSchema[];
  initialValues: Record<string, any>;
}
