# FormValidationV1 Configuration Options

Below are all available configuration options for initializing FormValidationV1.

## Top-Level Options

| Option                | Type      | Description |
|-----------------------|-----------|-------------|
| http                  | object    | Global HTTP settings for remote validation |
| fieldOverrides        | object    | Per-field overrides for HTTP/validation |
| validateOnBlur        | boolean   | Validate fields on blur event |
| validateOnChange      | boolean   | Validate fields on change event |
| debounceDelay         | number    | Debounce delay (ms) for validation |
| enableRemoteValidation| boolean   | Enable/disable remote (HTTP) validation |
| ui                    | object    | UI customization options |

## http
```
http: {
  baseUrl: 'https://api.example.com',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ...'
  },
  retryAttempts: 3,
  retryDelay: 1000
}
```

## fieldOverrides
```
fieldOverrides: {
  email: {
    http: {
      baseUrl: 'https://auth.example.com',
      endpoint: '/api/email-validation'
    }
  },
  username: {
    http: {
      baseUrl: 'https://user.example.com',
      endpoint: '/api/username-check'
    }
  }
}
```

## ui
```
ui: {
  errorClass: 'validation-error',
  successClass: 'validation-success',
  errorContainerClass: 'error-message',
  showValidationIcons: true
}
```

## Example Full Configuration
```
const config = {
  http: {
    baseUrl: 'https://api.example.com',
    timeout: 5000,
    headers: { 'Content-Type': 'application/json' },
    retryAttempts: 3,
    retryDelay: 1000
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
  validateOnChange: false,
  debounceDelay: 300,
  enableRemoteValidation: true,
  ui: {
    errorClass: 'validation-error',
    successClass: 'validation-success',
    errorContainerClass: 'error-message',
    showValidationIcons: true
  }
};
```

For more, see the comprehensive demo or the TypeScript interfaces in the codebase. 

## Built-in Validation Rules

- `required`: Field must not be empty
- `email`: Must be a valid email address
- `minlength`: Minimum length
- `maxlength`: Maximum length
- `pattern`: Must match a regex
- `match`: Must match the value of another field (e.g., for password confirmation)
- ...and more

**Example:**
```html
<input name="confirmPassword" data-rule-match="password" />
``` 