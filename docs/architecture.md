# Architecture Overview

## System Diagram

```mermaid
graph TD;
  A[Form (HTML)] -->|Events| B(FormEventBinder)
  B -->|Dispatch| C(ValidatorDispatcher)
  C -->|Local/Remote| D[Validators]
  D -->|Remote| E(RemoteValidator)
  E -->|HTTP| F(HttpTransport)
  F -->|Request| G[Backend API]
  C -->|Result| H[UIBinder]
  H -->|Update| A
  C -->|Config Lookup| I(ConfigurationService)
```

## Component Roles

- **FormEventBinder**: Listens to form events (change, blur, submit) and dispatches validation requests.
- **ValidatorDispatcher**: Determines which validator to use (local or remote) and routes the request.
- **Validators**: Implement validation logic (required, email, minLength, etc.).
- **RemoteValidator**: Handles remote (HTTP) validation by sending requests to the backend API.
- **HttpTransport**: Sends HTTP requests and returns responses.
- **ConfigurationService**: Provides global and per-field configuration (endpoints, headers, timeouts).
- **UIBinder**: Updates the UI with validation results (error/success messages, styling).

## Flow Summary
1. User interacts with a form field.
2. FormEventBinder captures the event and sends a validation request.
3. ValidatorDispatcher decides which validator to use.
4. If remote validation is needed, RemoteValidator sends an HTTP request via HttpTransport.
5. The backend API responds with validation results.
6. UIBinder updates the form UI accordingly.
7. ConfigurationService is consulted for all config lookups.

## Extensibility
- Add new validators by implementing the `IValidator` interface.
- Add middleware to the message broker for logging, analytics, etc.
- Update configuration at runtime for dynamic behavior. 