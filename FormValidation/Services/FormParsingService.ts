import { inject, injectable } from "inversify";
import ContainerTypes from "../DI/ContainerTypes";
import { IFormParsingService } from "../Interfaces/IFormParsingService";
import { IParsedFormSchema } from "../Interfaces/IParsedFormSchema";
import { IFieldValidationSchema } from "../Interfaces/IFieldValidationSchema";
import { IRuleParser } from "../../FormValidation/Interfaces/IRuleParser";


@injectable()
export class FormParsingService implements IFormParsingService {
  constructor(
    @inject(ContainerTypes.RuleParser)
    private ruleParser: IRuleParser
  ) {}

  parse(form: HTMLFormElement): IParsedFormSchema {
    const fields: IFieldValidationSchema[] = this.ruleParser.parseForm(form);
    const formName = form.getAttribute("name") || form.getAttribute("id") || "";

    // Gather initial field values
    const initialValues: Record<string, any> = {};
    for (const el of Array.from(form.elements) as HTMLInputElement[]) {
      if (!el.name) continue;
      if (el.type === "checkbox") {
        initialValues[el.name] = el.checked;
      } else if (el.type === "radio") {
        if (el.checked) initialValues[el.name] = el.value;
      } else {
        initialValues[el.name] = el.value;
      }
    }

    return { formName, fields, initialValues };
  }
}