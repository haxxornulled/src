# FormValidation System

A comprehensive, enterprise-grade form validation system built with TypeScript that provides both client-side and remote validation capabilities.

## 🚀 Features

### Core Features
- **Type-safe validation** with full TypeScript support
- **Extensible validator architecture** with plugin system
- **Real-time validation** with debounced remote calls
- **Event-driven architecture** using message broker pattern
- **Memory-efficient** with proper cleanup and WeakMap usage
- **Dynamic form support** with MutationObserver integration

### Advanced Features
- **Remote validation** via WebSocket and HTTP
- **JSON Schema support** for declarative validation rules
- **Comprehensive error handling** with recovery strategies
- **Performance monitoring** and metrics collection
- **Extensive test coverage** with custom test framework

## 📁 Project Structure

```
FormValidation/
├── Interfaces/           # Type definitions and contracts
├── Validators/          # Built-in validation rules
├── Services/            # Core services (parsing, etc.)
├── Registry/            # Dynamic validator registration
├── Dispatchers/         # Validation orchestration
├── Middleware/          # Cross-cutting concerns
├── Utils/              # Utility functions and helpers
├── Parser/             # Rule parsing and schema conversion
├── DI/                 # Dependency injection configuration
├── Startup/            # System initialization
├── Tests/              # Comprehensive test suite
├── Types.ts            # Consolidated type definitions
└── README.md           # This file
```

## 🛠️ Installation & Setup

### Prerequisites
- TypeScript 4.0+
- InversifyJS for dependency injection
- Modern browser with ES6+ support

### Quick Start

1. **Include the validation system in your project:**
```html
<script src="path/to/FormValidation/Startup/startup.js"></script>
```

2. **Mark forms for validation:**
```html
<form validate="true" id="userForm">
  <input name="email" 
         data-rule-required="true"
         data-rule-email="true" />
  <input name="password" 
         data-rule-required="true"
         data-rule-minlength="8" />
</form>
```

3. **The system automatically:**
   - Detects forms with `validate="true"`
   - Binds event handlers
   - Performs real-time validation
   - Shows validation results

## 📋 Usage Examples

### HTML Attribute-Based Validation

```html
<form validate="true" id="registrationForm">
  <!-- Required email field -->
  <input name="email" 
         type="email"
         data-rule-required="true"
         data-rule-email="true"
         data-rule-remote="true"
         data-rule-remote-provider="WebSocket"
         data-rule-remote-endpoint="/api/validate/email" />
  
  <!-- Password with length requirements -->
  <input name="password" 
         type="password"
         data-rule-required="true"
         data-rule-minlength="8"
         data-rule-pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)" />
  
  <!-- Confirm password -->
  <input name="confirmPassword" 
         type="password"
         data-rule-required="true"
         data-rule-match="password" />
</form>
```

### JSON Schema-Based Validation

```typescript
import { jsonSchemaParser } from './Services/JsonSchemaParser';

const jsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  properties: {
    email: {
      type: 'string',
      format: 'email',
      minLength: 5
    },
    password: {
      type: 'string',
      minLength: 8,
      pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)'
    },
    age: {
      type: 'number',
      minimum: 18,
      maximum: 120
    }
  },
  required: ['email', 'password']
};

// Convert to internal schema
const formSchema = jsonSchemaParser.parseJsonSchema(jsonSchema, 'userForm');
```

### Programmatic Validation

```typescript
import { ValidatorRegistry } from './Registry/ValidatorRegistry';
import RequiredValidator from './Validators/RequiredFieldValidator';

// Register custom validator
const registry = new ValidatorRegistry();
registry.register('required', new RequiredValidator());

// Validate programmatically
const validator = registry.getValidator('required');
const result = validator.validate('', { type: 'required' });
console.log(result.valid); // false
```

## 🔧 Configuration

### Form Configuration Options

```typescript
interface FormValidationConfig {
  validateOnBlur?: boolean;        // Default: true
  validateOnChange?: boolean;       // Default: false
  validateOnSubmit?: boolean;       // Default: true
  debounceDelay?: number;          // Default: 350ms
  showErrorsImmediately?: boolean; // Default: true
  enableRemoteValidation?: boolean; // Default: true
  customValidators?: Record<string, any>;
}
```

### Remote Validation Configuration

```typescript
// WebSocket remote validation
{
  type: 'remote',
  provider: 'WebSocket',
  endpoint: '/api/validate/email',
  remoteType: 'email'
}

// HTTP remote validation
{
  type: 'remote',
  provider: 'HTTP',
  endpoint: '/api/validate/username'
}
```

## 🧪 Testing

The system includes a comprehensive test suite that can be run in both browser and Node.js environments.

### Running Tests

```typescript
// Import and run tests
import { testRunner } from './Tests/ValidatorTests';

// Tests run automatically, or manually:
testRunner.runAllTests();
```

### Test Coverage

- ✅ Validator functionality
- ✅ Error handling and recovery
- ✅ JSON Schema parsing
- ✅ Type guards and utilities
- ✅ Integration scenarios

## 🚨 Error Handling

The system provides robust error handling with structured error types and recovery strategies:

### Error Types

```typescript
type ValidationErrorType = 
  | 'VALIDATION_FAILED'
  | 'REMOTE_ERROR'
  | 'NETWORK_ERROR'
  | 'PARSER_ERROR'
  | 'REGISTRY_ERROR'
  | 'DISPATCHER_ERROR'
  | 'UNKNOWN_ERROR';
```

### Error Recovery

```typescript
import { validationErrorHandler } from './Utils/ErrorHandler';

// Handle validation errors with automatic recovery
const result = validationErrorHandler.handleValidationError(
  error,
  'fieldName',
  'validatorType'
);

if (result.handled && result.fallbackResult) {
  // Use fallback validation result
  console.log(result.fallbackResult);
}
```

## 📊 Performance Monitoring

The system includes built-in performance monitoring:

```typescript
// Get validation metrics
const metrics = {
  validationCount: 0,
  averageValidationTime: 0,
  remoteValidationCount: 0,
  errorCount: 0,
  lastValidationTime: Date.now()
};
```

## 🔌 Extending the System

### Creating Custom Validators

```typescript
import { IValidator } from './Interfaces/IValidator';
import { IRuleDescriptor } from './Interfaces/IRuleDescriptor';
import { IValidationResult } from './Interfaces/IValidationResult';

export class CustomValidator implements IValidator {
  name = 'custom';
  
  validate(value: any, rule: IRuleDescriptor): IValidationResult {
    // Your validation logic here
    const isValid = /* your validation logic */;
    
    return {
      valid: isValid,
      message: isValid ? undefined : (rule.message || 'Custom validation failed')
    };
  }
}

// Register the validator
registry.register('custom', new CustomValidator());
```

### Adding Custom Error Handlers

```typescript
import { ValidationErrorHandler } from './Utils/ErrorHandler';

class CustomErrorHandler extends ValidationErrorHandler {
  protected getLogMethod(errorType: ValidationErrorType) {
    // Custom logging logic
    return console.error;
  }
}
```

## 🏗️ Architecture

### Core Components

1. **ValidatorRegistry**: Manages validator registration and discovery
2. **ValidatorDispatcher**: Orchestrates validation execution
3. **FormEventBinder**: Handles DOM event binding and form detection
4. **JsonSchemaParser**: Converts between JSON Schema and internal formats
5. **ValidationErrorHandler**: Provides structured error handling and recovery

### Message Flow

```
Form Event → FormEventBinder → MessageBroker → ValidatorDispatcher → Validator → Result
```

### Dependency Injection

The system uses InversifyJS for dependency injection:

```typescript
// Container configuration
container.bind<IValidatorRegistry>(ContainerTypes.ValidatorRegistry)
  .to(ValidatorRegistry).inSingletonScope();

container.bind<IValidatorDispatcher>(ContainerTypes.ValidatorDispatcher)
  .to(ValidatorDispatcher).inSingletonScope();
```

## 🔒 Security Considerations

- **Input sanitization**: All user inputs are validated before processing
- **Remote validation**: Supports secure WebSocket and HTTP endpoints
- **Error handling**: Prevents information leakage through structured errors
- **Memory management**: Proper cleanup prevents memory leaks

## 📈 Performance Optimizations

- **Debounced validation**: Reduces unnecessary validation calls
- **WeakMap usage**: Prevents memory leaks with DOM references
- **Lazy loading**: Validators are loaded only when needed
- **Caching**: Validation results are cached where appropriate

## 🤝 Contributing

1. Follow TypeScript best practices
2. Add comprehensive tests for new features
3. Update documentation for API changes
4. Ensure error handling is robust
5. Maintain backward compatibility

## 📄 License

This project is part of the DFW application suite.

## 🆘 Support

For issues and questions:
1. Check the test suite for usage examples
2. Review the error handling documentation
3. Examine the TypeScript interfaces for API details
4. Run the test suite to verify functionality

---

**FormValidation System** - Enterprise-grade form validation with TypeScript 