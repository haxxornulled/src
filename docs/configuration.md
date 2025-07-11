# FormValidationV1 Configuration Guide

FormValidationV1 provides extensive configuration options for customizing validation behavior, HTTP settings, and UI presentation.

## Quick Start

```javascript
const config = {
  http: {
    baseUrl: 'https://api.example.com',
    timeout: 5000
  },
  validateOnBlur: true,
  debounceDelay: 300
};

window.FormValidation.initializeFormValidation(config, {
  enableDebug: true,
  autoAttachToForms: true
});
```

## Configuration Options

### Top-Level Options

| Option                | Type      | Default | Description |
|-----------------------|-----------|---------|-------------|
| `http`                | object    | -       | Global HTTP settings for remote validation |
| `fieldOverrides`      | object    | {}      | Per-field overrides for HTTP/validation |
| `validateOnBlur`      | boolean   | true    | Validate fields on blur event |
| `validateOnChange`    | boolean   | false   | Validate fields on change event |
| `debounceDelay`       | number    | 300     | Debounce delay (ms) for validation |
| `enableRemoteValidation` | boolean | true | Enable/disable remote (HTTP) validation |
| `ui`                  | object    | -       | UI customization options |

### HTTP Configuration

```javascript
http: {
  baseUrl: 'https://api.example.com',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-token'
  },
  retryAttempts: 3,
  retryDelay: 1000,
  credentials: 'include' // for cookies
}
```

### Field-Specific Overrides

```javascript
fieldOverrides: {
  email: {
    http: {
      baseUrl: 'https://auth.example.com',
      endpoint: '/api/email-validation',
      timeout: 3000
    }
  },
  username: {
    http: {
      baseUrl: 'https://user.example.com',
      endpoint: '/api/username-check'
    }
  },
  phone: {
    http: {
      baseUrl: 'https://sms.example.com',
      endpoint: '/api/phone-verify'
    }
  }
}
```

### UI Configuration

```javascript
ui: {
  errorClass: 'validation-error',
  successClass: 'validation-success',
  errorContainerClass: 'error-message',
  successContainerClass: 'success-message',
  showValidationIcons: true
}
```

## HTML Validation Rules

### Basic Rules

```html
<!-- Required field -->
<input name="email" data-rule-required="true" />

<!-- Email validation -->
<input type="email" name="email" data-rule-email="true" />

<!-- Length constraints -->
<input name="username" data-rule-minlength="3" data-rule-maxlength="20" />

<!-- Pattern matching -->
<input name="phone" data-rule-pattern="^\\+?[\\d\\s\\-\\(\\)]+$" />

<!-- Cross-field matching -->
<input type="password" name="confirmPassword" data-rule-match="password" />
```

### Custom Error Messages

Use `data-msg-<rule>` attributes for custom error messages:

```html
<input type="email" name="email" 
       data-rule-required="true" 
       data-rule-email="true"
       data-msg-required="Please enter your email address."
       data-msg-email="That doesn't look like a valid email!" />
```

### Remote Validation

```html
<input name="email" 
       data-rule-remote="true"
       data-rule-remote-provider="HTTP"
       data-rule-remote-endpoint="/api/email-validation"
       data-msg-remote="This email is already registered." />
```

### Checkbox/Radio Groups

```html
<!-- Min/Max checked checkboxes -->
<div class="checkbox-group">
  <input type="checkbox" name="notifications" value="email" data-rule-minchecked="1" />
  <input type="checkbox" name="notifications" value="sms" />
  <input type="checkbox" name="notifications" value="push" data-rule-maxchecked="2" />
</div>
```

### Select Dropdowns

```html
<select name="industry" data-rule-required="true" data-rule-minselected="1">
  <option value="">Select Industry</option>
  <option value="tech">Technology</option>
  <option value="health">Healthcare</option>
</select>
```

## Complete Configuration Example

```javascript
const config = {
  // Global HTTP settings
  http: {
    baseUrl: 'https://api.example.com',
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer demo-token'
    },
    retryAttempts: 3,
    retryDelay: 1000
  },
  
  // Field-specific overrides
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
  },
  
  // Validation behavior
  validateOnBlur: true,
  validateOnChange: false,
  debounceDelay: 300,
  enableRemoteValidation: true,
  
  // UI configuration
  ui: {
    errorClass: 'validation-error',
    successClass: 'validation-success',
    errorContainerClass: 'error-message',
    successContainerClass: 'success-message',
    showValidationIcons: true
  }
};

// Initialize with options
window.FormValidation.initializeFormValidation(config, {
  enableDebug: true,
  autoAttachToForms: true
});
```

## Built-in Validators

| Validator | Rule | Description |
|-----------|------|-------------|
| `RequiredFieldValidator` | `required` | Field must not be empty |
| `EmailValidator` | `email` | Valid email format |
| `MinLengthValidator` | `minlength` | Minimum character length |
| `MaxLengthValidator` | `maxlength` | Maximum character length |
| `PatternValidator` | `pattern` | Regex pattern matching |
| `MatchValidator` | `match` | Match another field's value |
| `MinCheckedValidator` | `minchecked` | Minimum checkboxes selected |
| `MaxCheckedValidator` | `maxchecked` | Maximum checkboxes selected |
| `MinSelectedValidator` | `minselected` | Minimum select options |
| `MaxSelectedValidator` | `maxselected` | Maximum select options |
| `RemoteValidator` | `remote` | HTTP-based remote validation |

## Runtime Configuration Updates

```javascript
// Get the validation service
const validationService = window.FormValidation.initializeFormValidation(config);

// Update configuration at runtime
validationService.configService.updateConfig({
  http: {
    baseUrl: 'https://new-api.example.com',
    timeout: 3000
  }
});
```

## License

This documentation is licensed under the **Creative Commons Attribution 4.0 International License**.

The FormValidationV1 software is licensed under the **BSD 3-Clause License**.

See the [LICENSE](../LICENSE) file for full details. 