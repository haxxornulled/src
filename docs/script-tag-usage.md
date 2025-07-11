# Using FormValidationV1 via <script> Tag

You can use FormValidationV1 in any HTML page by including the global IIFE bundle and initializing it with your configuration.

## 1. Include the Bundle

```html
<script src="/dist/global/form-validation.iife.js"></script>
```

> Adjust the path as needed for your deployment.

## 2. Initialize the System

```html
<script>
document.addEventListener('DOMContentLoaded', function() {
  if (!window.FormValidation) {
    console.error('FormValidation not loaded!');
    return;
  }
  const config = {
    http: {
      baseUrl: 'https://api.example.com',
      timeout: 5000,
      headers: { 'Content-Type': 'application/json' }
    },
    fieldOverrides: {
      email: { http: { baseUrl: 'https://auth.example.com', endpoint: '/api/email-validation' } }
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
  window.FormValidation.initializeFormValidation(config, {
    enableDebug: true,
    autoAttachToForms: true
  });
});
</script>
```

## 3. Add Validation Attributes to Your Form Fields

```html
<input type="email" name="email" data-rule-required="true" data-rule-email="true" />
```

See the comprehensive demo for more advanced usage. 

## Example: Password Confirmation with Match Validator

```html
<input type="password" id="password" name="password" data-rule-required="true" />
<input type="password" id="confirmPassword" name="confirmPassword" data-rule-required="true" data-rule-match="password" />
```

- The `data-rule-match="password"` attribute ensures the value matches the field with name or id `password`. 