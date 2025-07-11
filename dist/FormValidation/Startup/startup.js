import { container } from "../DI/container-config";
import ContainerTypes from "../DI/ContainerTypes";
import { UIBinder } from "../Binders/UIBinder";
import { FormDebugger } from "../Utils/FormDebugger";
import { logLiveSubscribersMiddleware } from "../../MessageBroker/Middleware/logLiveSubscribersMiddleware";
import { RemoteValidator } from "../Validators/RemoteValidator";
// ---- Initialization and Registry Setup ---- //
const broker = container.get(ContainerTypes.MessageBroker);
const configService = container.get(ContainerTypes.ConfigurationService);
const transportRegistry = container.get(ContainerTypes.TransportProviderRegistry);
const formValidationMiddleware = container.get(ContainerTypes.FormValidationMiddleware);
const filterRegistry = container.get(ContainerTypes.MessageFilterRegistry);
const validatorRegistry = container.get(ContainerTypes.ValidatorRegistry);
// --- Configuration Setup ---
// Configure the system with your desired settings
const formValidationConfig = {
    // Global defaults
    http: {
        baseUrl: "https://api.example.com",
        timeout: 5000,
        headers: {
            'Content-Type': 'application/json'
        },
        retryAttempts: 3,
        retryDelay: 1000
    },
    // Field-specific overrides (add your custom base addresses here)
    fieldOverrides: {
        // Example: Email validation goes to auth service
        email: {
            http: {
                baseUrl: "https://auth.example.com",
                endpoint: "/api/email-validation"
            }
        },
        // Example: Username validation goes to user service
        username: {
            http: {
                baseUrl: "https://user.example.com",
                endpoint: "/api/username-check"
            }
        }
        // Add more field-specific configurations as needed
    },
    // Validation behavior
    validateOnBlur: true,
    validateOnChange: false,
    debounceDelay: 350,
    enableRemoteValidation: true
};
// Apply the configuration
configService.updateConfig(formValidationConfig);
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
// --- Middleware Setup ---
broker.use(logLiveSubscribersMiddleware(broker, "Form Events"));
broker.use(formValidationMiddleware.middleware());
console.log('✅ Middleware configured');
// --- Form Event Binding ---
const formEventBinder = container.get(ContainerTypes.FormEventBinder);
const uiBinder = new UIBinder(broker);
console.log('✅ Event binders configured');
// --- Auto-attach to forms ---
formValidationMiddleware.attachToForms();
console.log('✅ Auto-attached to forms');
// --- Debug Output ---
const formDebugger = FormDebugger.getInstance();
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
console.log('🎉 FormValidation system initialized successfully!');
//# sourceMappingURL=startup.js.map