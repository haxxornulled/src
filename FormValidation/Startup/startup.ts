import { container } from "../DI/container-config";
import ContainerTypes from "../DI/ContainerTypes";
import { MessageBroker } from "../../MessageBroker/MessageBroker";
import { TransportProviderRegistry } from "../../MessageBroker/Registries/TransportProviderRegistry";
import { FormValidationMiddleware } from "../Middleware/FormValidationMiddleware";
import { MessageFilterRegistry } from "../../MessageBroker/Registries/MessageFilterRegistry";
import { IValidatorRegistry } from "../Interfaces/IValidatorRegistry";
import { ValidatorRegistry } from "../Registry/ValidatorRegistry";
import { ValidatorDispatcher } from "../Dispatchers/ValidatorDispatcher";
import { FormEventBinder } from "../Binders/FormEventBinder";
import { UIBinder } from "../Binders/UIBinder";
import { FormDebugger } from "../Utils/FormDebugger";
import { logLiveSubscribersMiddleware } from "../../MessageBroker/Middleware/logLiveSubscribersMiddleware";
import { RemoteValidator } from "../Validators/RemoteValidator";
import { HttpTransport } from "../../MessageBroker/Transports/HttpTransport";
import { ITransportProvider } from "../../MessageBroker/Interfaces/ITransportProvider";
import { ConfigurationService } from "../Services/ConfigurationService";
import { IValidator } from "../Interfaces/IValidator";

// ---- Initialization and Registry Setup ---- //
const broker = container.get<MessageBroker>(ContainerTypes.MessageBroker);
const configService = container.get<ConfigurationService>(ContainerTypes.ConfigurationService);
const transportRegistry = container.get<TransportProviderRegistry>(ContainerTypes.TransportProviderRegistry);
const formValidationMiddleware = container.get<FormValidationMiddleware>(ContainerTypes.FormValidationMiddleware);
const filterRegistry = container.get<MessageFilterRegistry>(ContainerTypes.MessageFilterRegistry);
const validatorRegistry = container.get<IValidatorRegistry>(ContainerTypes.ValidatorRegistry);

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
const httpTransport = container.get<HttpTransport>(ContainerTypes.HttpTransportProvider);
transportRegistry.register("HTTP", httpTransport);
console.log('✅ HTTP transport registered');

// --- Validator Registration ---
// Register all validators
const validators: IValidator[] = [
  container.get<IValidator>(ContainerTypes.RequiredValidator),
  container.get<IValidator>(ContainerTypes.EmailValidator),
  container.get<IValidator>(ContainerTypes.MinLengthValidator),
  container.get<IValidator>(ContainerTypes.MaxLengthValidator),
  container.get<IValidator>(ContainerTypes.PatternValidator),
  container.get<IValidator>(ContainerTypes.MatchValidator),
  container.get<IValidator>(ContainerTypes.MinCheckedValidator),
  container.get<IValidator>(ContainerTypes.MaxCheckedValidator),
  container.get<IValidator>(ContainerTypes.MinSelectedValidator),
  container.get<IValidator>(ContainerTypes.MaxSelectedValidator)
];

validators.forEach(validator => {
  validatorRegistry.register(validator.name, validator);
});

// Register RemoteValidator with HTTP transport
validatorRegistry.register(
  "remote",
  new RemoteValidator(
    container.get<ITransportProvider>(ContainerTypes.HttpTransportProvider),
    container.get<ConfigurationService>(ContainerTypes.ConfigurationService)
  )
);

console.log('✅ Validators registered');

// --- Middleware Setup ---
broker.use(logLiveSubscribersMiddleware(broker, "Form Events"));
broker.use(formValidationMiddleware.middleware());
console.log('✅ Middleware configured');

// --- Form Event Binding ---
const formEventBinder = container.get<FormEventBinder>(ContainerTypes.FormEventBinder);
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
