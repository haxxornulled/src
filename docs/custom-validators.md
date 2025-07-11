# Custom Validators in FormValidationV1

FormValidationV1 provides a robust extensibility system for creating custom validation rules. You can implement both synchronous and asynchronous validators to meet your specific validation requirements.

## Overview

The system supports two types of custom validators:
- **`IValidator`** for synchronous validation
- **`IAsyncValidator`** for asynchronous validation (e.g., remote API calls)

## 1. Synchronous Custom Validator

Implement the `IValidator` interface for simple, fast validation logic:

```typescript
import { IValidator, IFieldValidationResultPayload } from '../FormValidation/Interfaces/IValidator';

class MyCustomValidator implements IValidator {
  name = 'myCustom';

  validate(
    value: any, 
    fieldName: string, 
    ruleValue: any, 
    formData: Record<string, any>
  ): IFieldValidationResultPayload {
    // Your validation logic here
    if (value === 'special') {
      return { valid: true };
    }
    
    return { 
      valid: false, 
      message: 'Value must be "special".' 
    };
  }
}
```

### Advanced Synchronous Validator Example

```typescript
class PasswordStrengthValidator implements IValidator {
  name = 'passwordStrength';

  validate(
    value: any, 
    fieldName: string, 
    ruleValue: any, 
    formData: Record<string, any>
  ): IFieldValidationResultPayload {
    if (!value) {
      return { valid: false, message: 'Password is required.' };
    }

    const minLength = ruleValue?.minLength || 8;
    const requireUppercase = ruleValue?.requireUppercase !== false;
    const requireLowercase = ruleValue?.requireLowercase !== false;
    const requireNumbers = ruleValue?.requireNumbers !== false;
    const requireSpecial = ruleValue?.requireSpecial !== false;

    const errors: string[] = [];

    if (value.length < minLength) {
      errors.push(`Password must be at least ${minLength} characters`);
    }
    if (requireUppercase && !/[A-Z]/.test(value)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (requireLowercase && !/[a-z]/.test(value)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (requireNumbers && !/\d/.test(value)) {
      errors.push('Password must contain at least one number');
    }
    if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      valid: errors.length === 0,
      message: errors.join('. ')
    };
  }
}
```

## 2. Asynchronous Custom Validator

Implement the `IAsyncValidator` interface for validation that requires external API calls or database queries:

```typescript
import { IAsyncValidator, IFieldValidationResultPayload } from '../FormValidation/Interfaces/IAsyncValidator';

class MyAsyncValidator implements IAsyncValidator {
  name = 'myAsync';

  async validate(
    value: any, 
    fieldName: string, 
    ruleValue: any, 
    formData: Record<string, any>
  ): Promise<IFieldValidationResultPayload> {
    try {
      // Simulate async check
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value, fieldName, formData })
      });

      const result = await response.json();
      
      return result.isValid
        ? { valid: true }
        : { valid: false, message: result.message || 'Validation failed.' };
    } catch (error) {
      return { 
        valid: false, 
        message: 'Validation service unavailable.' 
      };
    }
  }
}
```

### Advanced Asynchronous Validator Example

```typescript
class DomainAvailabilityValidator implements IAsyncValidator {
  name = 'domainAvailable';

  async validate(
    value: any, 
    fieldName: string, 
    ruleValue: any, 
    formData: Record<string, any>
  ): Promise<IFieldValidationResultPayload> {
    if (!value) {
      return { valid: false, message: 'Domain is required.' };
    }

    try {
      const response = await fetch(`/api/domain-check?domain=${encodeURIComponent(value)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      
      return {
        valid: result.available,
        message: result.available 
          ? undefined 
          : `Domain "${value}" is not available.`
      };
    } catch (error) {
      console.error('Domain validation error:', error);
      return { 
        valid: false, 
        message: 'Unable to check domain availability.' 
      };
    }
  }
}
```

## 3. Registering Your Validator

### Method 1: Direct Registration

```typescript
import { ValidatorRegistry } from '../FormValidation/Registry/ValidatorRegistry';

// Get the validator registry
const validatorRegistry = container.get<IValidatorRegistry>(ContainerTypes.ValidatorRegistry);

// Register your validators
validatorRegistry.register('myCustom', new MyCustomValidator());
validatorRegistry.register('passwordStrength', new PasswordStrengthValidator());
validatorRegistry.register('domainAvailable', new DomainAvailabilityValidator());
```

### Method 2: During System Initialization

```typescript
// In your initialization code
const validationService = window.FormValidation.initializeFormValidation(config, {
  enableDebug: true,
  autoAttachToForms: true
});

// Register custom validators after initialization
const validatorRegistry = validationService.validatorRegistry;
validatorRegistry.register('myCustom', new MyCustomValidator());
```

## 4. Using Your Validator in HTML

### Basic Usage

```html
<!-- Simple custom validator -->
<input name="myField" data-rule-myCustom="true" />

<!-- Password strength validator -->
<input type="password" name="password" 
       data-rule-passwordStrength='{"minLength": 10, "requireSpecial": true}' />

<!-- Domain availability validator -->
<input name="domain" 
       data-rule-domainAvailable="true"
       data-msg-domainAvailable="This domain is not available." />
```

### With Custom Error Messages

```html
<input name="myField" 
       data-rule-myCustom="true"
       data-msg-myCustom="Custom error message for my validator." />
```

### Complex Rule Values

```html
<input type="password" name="password" 
       data-rule-passwordStrength='{
         "minLength": 12,
         "requireUppercase": true,
         "requireLowercase": true,
         "requireNumbers": true,
         "requireSpecial": true
       }' />
```

## 5. Best Practices

### Error Handling

```typescript
class RobustValidator implements IValidator {
  name = 'robust';

  validate(value: any, fieldName: string, ruleValue: any, formData: Record<string, any>): IFieldValidationResultPayload {
    try {
      // Your validation logic
      if (this.isValid(value, ruleValue)) {
        return { valid: true };
      }
      
      return { 
        valid: false, 
        message: this.getErrorMessage(value, ruleValue) 
      };
    } catch (error) {
      console.error(`Validation error in ${fieldName}:`, error);
      return { 
        valid: false, 
        message: 'Validation failed due to an error.' 
      };
    }
  }

  private isValid(value: any, ruleValue: any): boolean {
    // Implementation
    return true;
  }

  private getErrorMessage(value: any, ruleValue: any): string {
    // Implementation
    return 'Invalid value.';
  }
}
```

### Cross-Field Validation

```typescript
class CrossFieldValidator implements IValidator {
  name = 'crossField';

  validate(value: any, fieldName: string, ruleValue: any, formData: Record<string, any>): IFieldValidationResultPayload {
    const targetField = ruleValue?.field;
    const targetValue = formData[targetField];
    
    if (!targetValue) {
      return { valid: false, message: `Field "${targetField}" is required.` };
    }
    
    if (value !== targetValue) {
      return { valid: false, message: `Must match ${targetField}.` };
    }
    
    return { valid: true };
  }
}
```

### Configuration-Driven Validators

```typescript
class ConfigurableValidator implements IValidator {
  name = 'configurable';

  validate(value: any, fieldName: string, ruleValue: any, formData: Record<string, any>): IFieldValidationResultPayload {
    const config = {
      minLength: ruleValue?.minLength || 1,
      maxLength: ruleValue?.maxLength || 100,
      pattern: ruleValue?.pattern || null,
      ...ruleValue
    };

    if (value.length < config.minLength) {
      return { valid: false, message: `Minimum length is ${config.minLength}.` };
    }

    if (value.length > config.maxLength) {
      return { valid: false, message: `Maximum length is ${config.maxLength}.` };
    }

    if (config.pattern && !new RegExp(config.pattern).test(value)) {
      return { valid: false, message: config.message || 'Invalid format.' };
    }

    return { valid: true };
  }
}
```

## 6. Testing Your Validators

```typescript
// Unit test example
describe('MyCustomValidator', () => {
  let validator: MyCustomValidator;

  beforeEach(() => {
    validator = new MyCustomValidator();
  });

  it('should validate special value', () => {
    const result = validator.validate('special', 'testField', null, {});
    expect(result.valid).toBe(true);
  });

  it('should reject non-special value', () => {
    const result = validator.validate('other', 'testField', null, {});
    expect(result.valid).toBe(false);
    expect(result.message).toBe('Value must be "special".');
  });
});
```

## 7. Integration with Dependency Injection

For advanced usage, you can register validators through the DI container:

```typescript
// In your container configuration
container.bind<IValidator>(ContainerTypes.CustomValidator).to(MyCustomValidator);

// Then register with the registry
const validator = container.get<IValidator>(ContainerTypes.CustomValidator);
validatorRegistry.register('myCustom', validator);
```

## License

This documentation is licensed under the **Creative Commons Attribution 4.0 International License**.

The FormValidationV1 software is licensed under the **BSD 3-Clause License**.

See the [LICENSE](../LICENSE) file for full details. 