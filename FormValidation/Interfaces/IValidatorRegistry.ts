import { IAsyncValidator } from "./IAsyncValidator";
import { IValidator } from "./IValidator";

export interface IValidatorRegistry {
  /** Register a validator for a rule type (e.g., "required", "email", etc.) */
  register(type: string, validator: IValidator): void;

  /** Get a validator for a rule type. */
  getValidator(type: string): IValidator | IAsyncValidator | undefined;

  /** Remove a validator by rule type. */
  unregister(type: string): void;

  /** List all registered validator types. */
  listValidators(): string[];
}