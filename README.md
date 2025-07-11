# FormValidationV1

## 🚀 Overview

A modern, extensible, and "maybe", production-ready form validation system for web applications. Supports local and remote (HTTP) validation, field-level configuration, dependency injection, and easy integration with any backend API.

- **HTTP-only:** All remote validation uses HTTP for maximum compatibility and simplicity.
- **Configurable:** Global and per-field endpoints, headers, and timeouts.
- **Type-safe:** Written in TypeScript with strong interfaces.
- **Extensible:** Add custom validators, middleware, and transports.
- **Easy to use:** Works with plain HTML forms and data attributes.

---

## ⚡ Quick Start

1. **Install dependencies** (if not already):
   ```sh
   npm install
   ```

2. **Configure your form validation** in your app or via script tag:
   ```typescript
   import { initializeFormValidation } from './FormValidation/Startup/startup-with-config';

   const config = {
     http: {
       baseUrl: 'https://api.example.com',
       timeout: 5000,
       headers: { 'Content-Type': 'application/json' }
     },
     fieldOverrides: {
       email: {
         http: {
           baseUrl: 'https://auth.example.com',
           endpoint: '/api/email-validation'
         }
       }
     },
     validateOnBlur: true,
     debounceDelay: 300
   };

   initializeFormValidation(config, { enableDebug: true });
   ```

3. **Add data attributes to your form fields:**
   ```html
   <input type="email" name="email"
          data-rule-required="true"
          data-rule-email="true"
          data-rule-remote="true"
          data-rule-remote-provider="HTTP"
          data-rule-remote-endpoint="/api/email-validation" />
   ```

4. **Deploy your backend** to handle the validation requests.

---

## 🏗️ Architecture

- **FormEventBinder:** Listens to form events and dispatches validation requests.
- **ValidatorDispatcher:** Routes validation requests to the correct validator.
- **RemoteValidator:** Handles HTTP-based remote validation.
- **ConfigurationService:** Manages global and per-field config.
- **HttpTransport:** Sends HTTP requests for remote validation.
- **DI Container:** All services and validators are registered for easy injection and testing.

---

## ⚙️ Configuration

- **Global HTTP settings:**
  ```typescript
  http: {
    baseUrl: 'https://api.example.com',
    timeout: 5000,
    headers: { 'Content-Type': 'application/json' },
    retryAttempts: 3,
    retryDelay: 1000
  }
  ```
- **Field-specific overrides:**
  ```typescript
  fieldOverrides: {
    email: {
      http: {
        baseUrl: 'https://auth.example.com',
        endpoint: '/api/email-validation'
      }
    }
  }
  ```
- **Validation behavior:**
  - `validateOnBlur`, `validateOnChange`, `debounceDelay`, `enableRemoteValidation`

---

## 🧩 Extensibility

- **Add custom validators:** Register your own validator in the DI container.
- **Add middleware:** Use the message broker’s middleware system for logging, analytics, etc.
- **Update config at runtime:** Call `configService.updateConfig(newConfig)`.

---

## 🧪 Examples

See [`FormValidation/Examples/http-only-demo.html`](FormValidation/Examples/http-only-demo.html) for a working demo and usage patterns.

---

## 🛠️ Development

- **TypeScript:** All code is type-safe and documented with JSDoc.
- **Testing:** Use the demo HTML or your own test harness.
- **Build:**
  ```sh
  npx tsc
  ```

---

## ❓ FAQ

**Q: Can I use WebSocket or other transports?**  
A: This version is HTTP-only for simplicity and reliability. You can extend the transport system if needed.

**Q: How do I add a custom validator?**  
A: Implement the `IValidator` interface and register it in the DI container.

**Q: How do I debug validation?**  
A: Use the built-in debug mode (`enableDebug: true`) and browser dev tools.

---

## 📄 License

MIT 
