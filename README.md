# FormValidation Library

A comprehensive TypeScript form validation library with real-time feedback, WebSocket integration, and dependency injection support.

## Features

- 🚀 **Real-time Validation** - Instant feedback as users type
- 🔌 **WebSocket Integration** - Server-side validation support
- 🏗️ **Dependency Injection** - Built with Inversify for modular architecture
- 📝 **Multiple Validators** - Required, Email, Length, Match, Remote validation
- 🎨 **Customizable UI** - Flexible error display and styling
- 🔧 **Extensible** - Easy to add custom validators
- 🧪 **Tested** - Comprehensive test suite included

## Installation

```bash
npm install inversify reflect-metadata
```

### Prerequisites

1. **Import reflect-metadata** at the top of your entry file:
```typescript
import "reflect-metadata";
```

2. **Enable decorators** in your `tsconfig.json`:
```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

## Basic Usage

### 1. Import and Initialize

```typescript
import "reflect-metadata";
import { container } from "./FormValidation/DI/container-config";
import ContainerTypes from "./FormValidation/DI/ContainerTypes";
import { MessageBroker } from "./MessageBroker/MessageBroker";
import { TransportProviderRegistry } from "./MessageBroker/Registries/TransportProviderRegistry";
import { FormValidationMiddleware } from "./FormValidation/Middleware/FormValidationMiddleware";
import { UIBinder } from "./FormValidation/Binders/UIBinder";
import { InMemoryTransport } from "./MessageBroker/Transports/InMemoryTransport";

// Get core services from container
const broker = container.get<MessageBroker>(ContainerTypes.MessageBroker);
const transportRegistry = container.get<TransportProviderRegistry>(ContainerTypes.TransportProviderRegistry);
const formValidationMiddleware = container.get<FormValidationMiddleware>(ContainerTypes.FormValidationMiddleware);

// Set up transport (memory, WebSocket, or HTTP)
transportRegistry.register("memory", new InMemoryTransport());
broker.setProvider(transportRegistry.get("memory")!);

// Initialize form validation
formValidationMiddleware.attachToForms();
new UIBinder(broker);
```

### 2. Register Validators

```typescript
import { IValidatorRegistry } from "./FormValidation/Interfaces/IValidatorRegistry";
import RequiredValidator from "./FormValidation/Validators/RequiredFieldValidator";
import { EmailValidator } from "./FormValidation/Validators/EmailValidator";
import MinLengthValidator from "./FormValidation/Validators/MinLengthValidator";
import { MaxLengthValidator } from "./FormValidation/Validators/MaxLengthValidator";
import MatchValidator from "./FormValidation/Validators/MatchValidator";

const validatorRegistry = container.get<IValidatorRegistry>(ContainerTypes.ValidatorRegistry);

// Register validators (use lowercase types for consistency)
validatorRegistry.register("required", new RequiredValidator());
validatorRegistry.register("email", new EmailValidator());
validatorRegistry.register("minlength", new MinLengthValidator());
validatorRegistry.register("maxlength", new MaxLengthValidator());
validatorRegistry.register("match", new MatchValidator());
```

### 3. HTML Form Setup

```html
<form data-validation="true">
  <input type="email" 
         name="email" 
         data-validators='["required", "email"]'
         data-error-message="Please enter a valid email address">
  
  <input type="password" 
         name="password" 
         data-validators='["required", "minlength:8"]'
         data-error-message="Password must be at least 8 characters">
  
  <button type="submit">Submit</button>
</form>
```

## WebSocket Integration

### Server-Side (ASP.NET Core)

```csharp
// WebSocket handler for real-time validation
app.Map("/ws", async context =>
{
    if (context.WebSockets.IsWebSocketRequest)
    {
        using var webSocket = await context.WebSockets.AcceptWebSocketAsync();
        var handler = new WebSocketHandler();
        await handler.HandleWebSocketAsync(webSocket);
    }
    else
    {
        context.Response.StatusCode = StatusCodes.Status400BadRequest;
    }
});
```

### Client-Side Configuration

```typescript
import { WebSocketTransport } from "./MessageBroker/Transports/WebSocketTransport";

// Register WebSocket transport
transportRegistry.register("ws", new WebSocketTransport("wss://api.example.com/ws"));
broker.setProvider(transportRegistry.get("ws")!);
```

## Available Validators

### Built-in Validators

- **required** - Field must not be empty
- **email** - Valid email format
- **minlength:X** - Minimum character length
- **maxlength:X** - Maximum character length
- **match:fieldName** - Must match another field value
- **remote** - Server-side validation via WebSocket

### Custom Validators

```typescript
import { IValidator } from "./FormValidation/Interfaces/IValidator";

class CustomValidator implements IValidator {
    validate(value: string, options?: any): ValidationResult {
        // Your validation logic here
        return { isValid: true, message: "" };
    }
}

// Register custom validator
validatorRegistry.register("custom", new CustomValidator());
```

## Configuration

### JSON Schema Configuration

```typescript
const config = {
    validators: {
        "required": { enabled: true },
        "email": { enabled: true },
        "minlength": { enabled: true, min: 8 }
    },
    ui: {
        errorClass: "error",
        successClass: "success"
    }
};
```

## Error Handling

```typescript
// Subscribe to validation events
broker.subscribe("validation", (message) => {
    if (message.payload.isValid) {
        console.log("Validation passed");
    } else {
        console.log("Validation failed:", message.payload.message);
    }
});
```

## Testing

Run the test suite:

```bash
npm test
```

The library includes comprehensive tests for all validators and core functionality.

## Debugging

Enable debug mode to see detailed validation information:

```typescript
import { formDebugger } from "./FormValidation/Utils/FormDebugger";

// Debug form detection
formDebugger.debugFormDetection();

// Debug validation registry
formDebugger.debugValidationRegistry(validatorRegistry);

// Debug message broker
formDebugger.debugMessageBroker(broker);
```

## API Reference

### Core Classes

- `MessageBroker` - Central message handling
- `FormValidationMiddleware` - Form validation processing
- `UIBinder` - UI event binding
- `TransportProviderRegistry` - Transport management

### Interfaces

- `IValidator` - Validator interface
- `IValidatorRegistry` - Validator registration
- `IMessageBroker` - Message broker interface
- `ITransportProvider` - Transport interface

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under both:
- **BSD-3-Clause License** - For code and technical components
- **Creative Commons Attribution 4.0 International License** - For documentation and creative content

## Troubleshooting

### Common Issues

1. **Decorators not working** - Ensure `reflect-metadata` is imported first
2. **WebSocket connection fails** - Check server endpoint and CORS settings
3. **Validators not registering** - Verify validator types are lowercase

### Support

For issues and questions:
- Check the test suite for usage examples
- Review the debug utilities for troubleshooting
- Examine the startup.ts file for complete setup example

## Architecture

The library follows a modular architecture with dependency injection:

```
FormValidation/
├── DI/                 # Dependency injection setup
├── Interfaces/         # Core interfaces
├── Validators/         # Validation implementations
├── Middleware/         # Form processing middleware
├── Binders/           # UI event binding
├── Utils/             # Debug and utility functions
└── Startup/           # Initialization and configuration
```

The system uses a message broker pattern for loose coupling between components, making it easy to extend and customize. 