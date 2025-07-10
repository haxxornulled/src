import { IRuleDescriptor } from "./IRuleDescriptor";
import { IFieldValidationSchema } from './IFieldValidationSchema';


export interface IRuleParser {
  parseForm(form: HTMLFormElement): IFieldValidationSchema[];
  parseField(el: HTMLElement): IRuleDescriptor[];
}

