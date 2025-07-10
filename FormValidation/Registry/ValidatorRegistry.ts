import { injectable } from "inversify";

import { IValidator } from "../Interfaces/IValidator";
import { IAsyncValidator } from "../Interfaces/IAsyncValidator";
import { IValidatorRegistry } from "../Interfaces/IValidatorRegistry";


@injectable()
export class ValidatorRegistry implements IValidatorRegistry {
  private validators = new Map<string, IValidator | IAsyncValidator>();

  register(type: string, validator: IValidator | IAsyncValidator): void {
    this.validators.set(type, validator);
  }

  getValidator(type: string): IValidator | IAsyncValidator | undefined {
    const validator = this.validators.get(type);
    console.log(`[ValidatorRegistry] getValidator('${type}') =>`, validator ? 'FOUND' : 'NOT FOUND');
    return validator;
  }

  unregister(type: string): void {
    this.validators.delete(type);
  }

  listValidators(): string[] {
    return Array.from(this.validators.keys());
  }

  clear(): void {
    this.validators.clear();
  }
}
