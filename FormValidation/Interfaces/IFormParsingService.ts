import { IParsedFormSchema } from "./IParsedFormSchema";


export interface IFormParsingService {
  parse(form: HTMLFormElement): IParsedFormSchema;
}
