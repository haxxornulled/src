# Custom Validators in FormValidationV1

You can extend FormValidationV1 by creating your own custom validators. There are two main interfaces:
- `IValidator` for synchronous validation
- `IAsyncValidator` for asynchronous (e.g., remote) validation

## 1. Synchronous Custom Validator (`IValidator`)

Implement the `IValidator` interface:

```typescript
import { IValidator, IFieldValidationResultPayload } from '../FormValidation/Interfaces/IValidator';

class MyCustomValidator implements IValidator {
  name = 'myCustom';

  validate(value: any, fieldName: string, ruleValue: any, formData: Record<string, any>): IFieldValidationResultPayload {
    if (value === 'special') {
      return { valid: true };
    }
    return { valid: false, message: 'Value must be "special".' };
  }
}
```

## 2. Asynchronous Custom Validator (`IAsyncValidator`)

Implement the `IAsyncValidator` interface for async operations:

```typescript
import { IAsyncValidator, IFieldValidationResultPayload } from '../FormValidation/Interfaces/IAsyncValidator';

class MyAsyncValidator implements IAsyncValidator {
  name = 'myAsync';

  async validate(value: any, fieldName: string, ruleValue: any, formData: Record<string, any>): Promise<IFieldValidationResultPayload> {
    // Simulate async check
    const isValid = await someAsyncCheck(value);
    return isValid
      ? { valid: true }
      : { valid: false, message: 'Async check failed.' };
  }
}
```

## 3. Registering Your Validator

After creating your validator, register it with the system:

```typescript
import { validatorRegistry } from '../FormValidation/Registry/ValidatorRegistry';

validatorRegistry.register('myCustom', new MyCustomValidator());
// or for async:
validatorRegistry.register('myAsync', new MyAsyncValidator());
```

## 4. Using Your Validator in HTML

Add a data attribute to your input:

```html
<input name="myField" data-rule-myCustom="true" />
<input name="myAsyncField" data-rule-myAsync="true" />
```

## 5. Notes
- Custom validators can access the full form data for cross-field validation.
- Async validators should return a Promise.
- See the TypeScript interfaces for more advanced options.

For more, see the comprehensive demo or the TypeScript interfaces in the codebase. 