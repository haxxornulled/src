import { container } from "../DI/container-config";
import ContainerTypes from "../DI/ContainerTypes";
import { UIBinder } from "../Binders/UIBinder";
import { FormDebugger } from "../Utils/FormDebugger";
import { logLiveSubscribersMiddleware } from "../../MessageBroker/Middleware/logLiveSubscribersMiddleware";
import { RemoteValidator } from "../Validators/RemoteValidator";
export const initializeFormValidation = (config, options) => {
    console.log('🚀 Initializing FormValidation system...');
    // Get core services from container
    const broker = container.get(ContainerTypes.MessageBroker);
    const configService = container.get(ContainerTypes.ConfigurationService);
    const transportRegistry = container.get(ContainerTypes.TransportProviderRegistry);
    const formValidationMiddleware = container.get(ContainerTypes.FormValidationMiddleware);
    const filterRegistry = container.get(ContainerTypes.MessageFilterRegistry);
    const validatorRegistry = container.get(ContainerTypes.ValidatorRegistry);
    const formDebugger = FormDebugger.getInstance();
    // Apply configuration
    if (config) {
        configService.updateConfig(config);
        console.log('✅ Configuration applied');
    }
    // --- Transport Setup ---
    // Register HTTP transport
    const httpTransport = container.get(ContainerTypes.HttpTransportProvider);
    transportRegistry.register("HTTP", httpTransport);
    console.log('✅ HTTP transport registered');
    // --- Validator Registration ---
    // Register all validators
    const validators = [
        container.get(ContainerTypes.RequiredValidator),
        container.get(ContainerTypes.EmailValidator),
        container.get(ContainerTypes.MinLengthValidator),
        container.get(ContainerTypes.MaxLengthValidator),
        container.get(ContainerTypes.PatternValidator),
        container.get(ContainerTypes.MatchValidator),
        container.get(ContainerTypes.MinCheckedValidator),
        container.get(ContainerTypes.MaxCheckedValidator),
        container.get(ContainerTypes.MinSelectedValidator),
        container.get(ContainerTypes.MaxSelectedValidator)
    ];
    validators.forEach(validator => {
        validatorRegistry.register(validator.name, validator);
    });
    // Register RemoteValidator with HTTP transport
    validatorRegistry.register("remote", new RemoteValidator(container.get(ContainerTypes.HttpTransportProvider), container.get(ContainerTypes.ConfigurationService)));
    console.log('✅ Validators registered');
    // Set up middleware
    broker.use(logLiveSubscribersMiddleware(broker, "Form Events"));
    broker.use(formValidationMiddleware.middleware());
    console.log('✅ Middleware configured');
    // Auto-attach to forms if enabled
    if (options?.autoAttachToForms !== false) {
        formValidationMiddleware.attachToForms();
        new UIBinder(broker);
        console.log('✅ Auto-attached to forms');
    }
    // Debug output if enabled
    if (options?.enableDebug) {
        console.log('🔍 Debug mode enabled');
        formDebugger.debugFormDetection();
        formDebugger.debugValidationRegistry(validatorRegistry);
        formDebugger.debugMessageBroker(broker);
        // Show configuration summary
        const currentConfig = configService.getConfig();
        console.log('📋 Configuration Summary:');
        console.log('  Global HTTP:', currentConfig.http?.baseUrl);
        console.log('  Field overrides:', Object.keys(currentConfig.fieldOverrides || {}));
        console.log('  Validation settings:', {
            validateOnBlur: currentConfig.validateOnBlur,
            validateOnChange: currentConfig.validateOnChange,
            debounceDelay: currentConfig.debounceDelay,
            enableRemoteValidation: currentConfig.enableRemoteValidation
        });
    }
    console.log('🎉 FormValidation system initialized successfully!');
    return {
        broker,
        configService,
        validatorRegistry,
        formValidationMiddleware
    };
};
// Convenience function for quick setup with debug enabled
export const setupFormValidationWithDebug = (config) => initializeFormValidation(config, { enableDebug: true });
// Example usage:
/*
// Basic setup
initializeFormValidation();

// Setup with custom HTTP configuration
initializeFormValidation({
  http: {
    baseUrl: "https://api.example.com",
    timeout: 5000
  },
  fieldOverrides: {
    email: {
      http: {
        baseUrl: "https://auth.example.com",
        endpoint: "/api/email-validation"
      }
    }
  }
});

// Setup with debug enabled
setupFormValidationWithDebug({
  fieldOverrides: {
    email: {
      http: {
        baseUrl: "https://auth.example.com",
        endpoint: "/api/email-validation"
      }
    }
  }
});
*/ 
//# sourceMappingURL=startup-with-config.js.map