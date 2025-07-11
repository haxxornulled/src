# Using FormValidationV1 via Script Tag

FormValidationV1 can be easily integrated into any HTML page using the global IIFE bundle, providing comprehensive form validation with minimal setup.

## Quick Setup

### 1. Include the Bundle

```html
<script src="/dist/global/form-validation.iife.js"></script>
```

> **Note**: Adjust the path according to your deployment structure. The bundle is built using Vite/Rollup and includes all dependencies.

### 2. Initialize the System

```html
<script>
document.addEventListener('DOMContentLoaded', function() {
  // Check if FormValidation is loaded
  if (!window.FormValidation) {
    console.error('❌ FormValidation not loaded. Check the script path.');
    return;
  }
  
  // Basic configuration
  const config = {
    http: {
      baseUrl: 'https://api.example.com',
      timeout: 5000,
      headers: { 'Content-Type': 'application/json' }
    },
    validateOnBlur: true,
    debounceDelay: 300,
    enableRemoteValidation: true
  };
  
  // Initialize with debug enabled
  const validationService = window.FormValidation.initializeFormValidation(config, {
    enableDebug: true,
    autoAttachToForms: true
  });
  
  console.log('✅ FormValidation initialized successfully');
});
</script>
```

## Advanced Configuration

### Complete Setup Example

```html
<script>
document.addEventListener('DOMContentLoaded', function() {
  if (!window.FormValidation) {
    console.error('FormValidation not loaded!');
    return;
  }
  
  const config = {
    // Global HTTP settings
    http: {
      baseUrl: 'https://api.example.com',
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer your-token'
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
  
  const validationService = window.FormValidation.initializeFormValidation(config, {
    enableDebug: true,
    autoAttachToForms: true
  });
  
  // Make service available globally for testing
  window.validationService = validationService;
});
</script>
```

## HTML Form Setup

### Basic Validation Rules

```html
<form id="myForm" validate="true">
  <!-- Required field -->
  <input type="email" name="email" data-rule-required="true" data-rule-email="true" />
  
  <!-- Length constraints -->
  <input type="text" name="username" 
         data-rule-required="true"
         data-rule-minlength="3" 
         data-rule-maxlength="20" />
  
  <!-- Pattern matching -->
  <input type="tel" name="phone" 
         data-rule-pattern="^\\+?[\\d\\s\\-\\(\\)]+$" />
  
  <!-- Cross-field matching -->
  <input type="password" name="password" data-rule-required="true" />
  <input type="password" name="confirmPassword" 
         data-rule-required="true" 
         data-rule-match="password" />
</form>
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
<input type="email" name="email" 
       data-rule-required="true" 
       data-rule-email="true"
       data-rule-remote="true"
       data-rule-remote-provider="HTTP"
       data-rule-remote-endpoint="/api/email-validation"
       data-msg-required="Please enter your email address."
       data-msg-email="That doesn't look like a valid email!"
       data-msg-remote="This email is already registered. Try another." />
```

### Checkbox Groups

```html
<div class="checkbox-group">
  <label>
    <input type="checkbox" name="notifications" value="email" data-rule-minchecked="1" />
    Email Notifications
  </label>
  <label>
    <input type="checkbox" name="notifications" value="sms" />
    SMS Notifications
  </label>
  <label>
    <input type="checkbox" name="notifications" value="push" />
    Push Notifications
  </label>
</div>
```

### Select Dropdowns

```html
<select name="industry" data-rule-required="true">
  <option value="">Select Industry</option>
  <option value="technology">Technology</option>
  <option value="healthcare">Healthcare</option>
  <option value="finance">Finance</option>
</select>
```

## Runtime Configuration Updates

```javascript
// Update configuration at runtime
validationService.configService.updateConfig({
  http: {
    baseUrl: 'https://new-api.example.com',
    timeout: 3000
  }
});

// Get current configuration
const currentConfig = validationService.configService.getConfig();
console.log('Current config:', currentConfig);
```

## Testing and Debugging

### Enable Debug Mode

```javascript
const validationService = window.FormValidation.initializeFormValidation(config, {
  enableDebug: true,
  autoAttachToForms: true
});
```

### Manual Validation Testing

```javascript
// Test specific field validation
const emailField = document.querySelector('input[name="email"]');
emailField.value = 'test@example.com';
emailField.dispatchEvent(new Event('blur'));

// Test all fields
document.querySelectorAll('input, select, textarea').forEach(field => {
  if (field.name) {
    field.dispatchEvent(new Event('blur'));
  }
});
```

## CSS Styling

### Basic Error/Success Styles

```css
.validation-error {
  border-color: #e74c3c !important;
  background-color: #fff5f5 !important;
}

.validation-success {
  border-color: #27ae60 !important;
  background-color: #f8fff9 !important;
}

.error-message {
  color: #e74c3c;
  font-size: 12px;
  margin-top: 5px;
  display: none;
  font-weight: 500;
}

.success-message {
  color: #27ae60;
  font-size: 12px;
  margin-top: 5px;
  display: none;
  font-weight: 500;
}
```

## Complete Example

See the [comprehensive demo](../FormValidation/Examples/comprehensive-demo.html) for a complete working example with all features.

## License

This documentation is licensed under the **Creative Commons Attribution 4.0 International License**.

The FormValidationV1 software is licensed under the **BSD 3-Clause License**.

See the [LICENSE](../LICENSE) file for full details. 