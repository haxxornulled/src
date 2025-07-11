/**
 * FormValidation Debugging Utility
 * 
 * Helps identify and troubleshoot form validation issues
 */
export class FormDebugger {
  private static instance: FormDebugger;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): FormDebugger {
    if (!FormDebugger.instance) {
      FormDebugger.instance = new FormDebugger();
    }
    return FormDebugger.instance;
  }

  /**
   * Debug form detection and binding
   */
  public debugFormDetection(): void {
    console.log('🔍 [FormDebugger] Starting form detection debug...');
    
    // Check for all forms first
    const allForms = Array.from(document.querySelectorAll<HTMLFormElement>('form'));
    console.log(`📋 [FormDebugger] Total forms found: ${allForms.length}`);
    
    // Check for forms with validate attribute
    const validateForms = Array.from(document.querySelectorAll<HTMLFormElement>('form[validate]'));
    console.log(`📋 [FormDebugger] Found ${validateForms.length} forms with validate attribute:`, validateForms.map(f => ({ id: f.id, name: f.name })));
    
    // Check for forms with data-rule attributes
    const formsWithRules = allForms.filter(form => {
      const fieldsWithRules = Array.from(form.elements).filter(el => 
        el instanceof HTMLElement && 
        Array.from(el.attributes).some(attr => attr.name.startsWith('data-rule-'))
      );
      return fieldsWithRules.length > 0;
    });
    
    console.log(`📋 [FormDebugger] Found ${formsWithRules.length} forms with validation rules:`, formsWithRules.map(f => ({ id: f.id, name: f.name })));
    
    // Debug each form
    allForms.forEach((form, index) => {
      console.log(`\n📝 [FormDebugger] Form ${index + 1}:`, {
        id: form.id,
        name: form.name,
        action: form.action,
        method: form.method,
        hasValidateAttr: form.hasAttribute('validate'),
        validateValue: form.getAttribute('validate'),
        attributes: Array.from(form.attributes).map(attr => `${attr.name}="${attr.value}"`).join(', '),
        fields: this.getFormFieldsInfo(form)
      });
    });
  }

  /**
   * Debug form fields and their validation rules
   */
  public debugFormFields(formId?: string): void {
    const forms = formId 
      ? [document.getElementById(formId) as HTMLFormElement].filter(Boolean)
      : Array.from(document.querySelectorAll<HTMLFormElement>('form'));

    forms.forEach(form => {
      console.log(`\n🔍 [FormDebugger] Debugging form: ${form.id || 'unnamed'}`);
      
      const fields = Array.from(form.elements).filter(
        el => el instanceof HTMLInputElement || 
              el instanceof HTMLSelectElement || 
              el instanceof HTMLTextAreaElement
      ) as (HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)[];

      fields.forEach(field => {
        const rules = this.extractFieldRules(field);
        console.log(`  📄 Field: ${field.name} (${field.type})`, {
          value: field.value,
          rules: rules,
          hasRules: rules.length > 0,
          required: field.hasAttribute('required'),
          disabled: field.disabled,
          hidden: field.type === 'hidden'
        });
      });
    });
  }

  /**
   * Debug validation registry
   */
  public debugValidationRegistry(registry: any): void {
    console.log('🔧 [FormDebugger] Validation Registry Debug:');
    
    if (registry && typeof registry.listValidators === 'function') {
      const validators = registry.listValidators();
      console.log(`  📋 Registered validators: ${validators.join(', ')}`);
      
      validators.forEach((validatorType: string) => {
        const validator = registry.getValidator(validatorType);
        console.log(`  ✅ ${validatorType}:`, {
          name: validator?.name,
          hasValidate: typeof validator?.validate === 'function',
          type: typeof validator
        });
      });
    } else {
      console.log('  ❌ Registry not available or invalid');
    }
  }

  /**
   * Debug message broker
   */
  public debugMessageBroker(broker: any): void {
    console.log('📡 [FormDebugger] Message Broker Debug:');
    
    if (broker && typeof broker.publish === 'function') {
      console.log('  ✅ Message broker is available');
      
      // Test message publishing
      try {
        broker.publish({
          type: 'DebugTest',
          topic: 'debug',
          payload: { test: true },
          _remote: false
        });
        console.log('  ✅ Message publishing works');
      } catch (error) {
        console.log('  ❌ Message publishing failed:', error);
      }
    } else {
      console.log('  ❌ Message broker not available or invalid');
    }
  }

  /**
   * Test form submission manually
   */
  public testFormSubmission(formId: string): void {
    const form = document.getElementById(formId) as HTMLFormElement;
    if (!form) {
      console.log(`❌ [FormDebugger] Form with id "${formId}" not found`);
      return;
    }

    console.log(`🧪 [FormDebugger] Testing form submission for: ${formId}`);
    
    // Create a test submit event
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    
    // Add event listener to capture the event
    const originalAddEventListener = form.addEventListener;
    form.addEventListener = function(type: string, listener: EventListener, options?: boolean | AddEventListenerOptions) {
      if (type === 'submit') {
        console.log('  📡 [FormDebugger] Submit event listener added');
      }
      return originalAddEventListener.call(this, type, listener, options);
    };

    // Dispatch the event
    console.log('  🚀 [FormDebugger] Dispatching submit event...');
    form.dispatchEvent(submitEvent);
    
    // Restore original addEventListener
    form.addEventListener = originalAddEventListener;
  }

  /**
   * Get comprehensive form information
   */
  public getFormInfo(formId: string): any {
    const form = document.getElementById(formId) as HTMLFormElement;
    if (!form) return null;

    return {
      id: form.id,
      name: form.name,
      action: form.action,
      method: form.method,
      hasValidateAttr: form.hasAttribute('validate'),
      validateValue: form.getAttribute('validate'),
      fields: this.getFormFieldsInfo(form),
      eventListeners: this.getEventListenersInfo(form)
    };
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private getFormFieldsInfo(form: HTMLFormElement): any[] {
    const fields = Array.from(form.elements).filter(
      el => el instanceof HTMLInputElement || 
            el instanceof HTMLSelectElement || 
            el instanceof HTMLTextAreaElement
    ) as (HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)[];

    return fields.map(field => ({
      name: field.name,
      type: field.type,
      value: field.value,
      rules: this.extractFieldRules(field),
      required: field.hasAttribute('required'),
      disabled: field.disabled,
      hidden: field.type === 'hidden'
    }));
  }

  private extractFieldRules(field: HTMLElement): any[] {
    const rules: any[] = [];
    
    // Parse data-rule-* attributes
    for (const attr of Array.from(field.attributes)) {
      if (attr.name.startsWith('data-rule-')) {
        const ruleType = attr.name.replace('data-rule-', '');
        rules.push({
          type: ruleType,
          value: attr.value,
          attribute: attr.name
        });
      }
    }
    
    // Check HTML5 attributes
    if (field.hasAttribute('required')) {
      rules.push({ type: 'required', value: true, attribute: 'required' });
    }
    
    if (field.hasAttribute('minlength')) {
      rules.push({ 
        type: 'minlength', 
        value: field.getAttribute('minlength'), 
        attribute: 'minlength' 
      });
    }
    
    if (field.hasAttribute('maxlength')) {
      rules.push({ 
        type: 'maxlength', 
        value: field.getAttribute('maxlength'), 
        attribute: 'maxlength' 
      });
    }
    
    if (field.hasAttribute('pattern')) {
      rules.push({ 
        type: 'pattern', 
        value: field.getAttribute('pattern'), 
        attribute: 'pattern' 
      });
    }
    
    return rules;
  }

  private getEventListenersInfo(form: HTMLFormElement): any {
    // This is a simplified approach - in real browsers, you can't directly access event listeners
    return {
      hasSubmitListener: 'Cannot determine without browser dev tools',
      note: 'Check browser dev tools > Elements > Event Listeners tab'
    };
  }
}

/**
 * Global debugger instance
 */
export const formDebugger = FormDebugger.getInstance();

/**
 * Debug helper functions
 */
export const debugHelpers = {
  /**
   * Quick debug for a specific form
   */
  debugForm: (formId: string) => {
    console.log('🔍 [DebugHelper] Quick form debug:', formId);
    const info = formDebugger.getFormInfo(formId);
    console.log(info);
  },

  /**
   * Test form submission
   */
  testSubmit: (formId: string) => {
    formDebugger.testFormSubmission(formId);
  },

  /**
   * Debug all forms
   */
  debugAll: () => {
    formDebugger.debugFormDetection();
    formDebugger.debugFormFields();
  }
};

// Make debug helpers available globally for console access
if (typeof window !== 'undefined') {
  (window as any).formValidationDebug = debugHelpers;
  console.log('🔧 [FormDebugger] Debug helpers available at window.formValidationDebug');
  console.log('  Usage: formValidationDebug.debugForm("formId")');
  console.log('  Usage: formValidationDebug.testSubmit("formId")');
  console.log('  Usage: formValidationDebug.debugAll()');
} 