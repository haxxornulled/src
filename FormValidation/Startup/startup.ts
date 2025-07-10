import "reflect-metadata";
import { container } from "../DI/container-config";
import ContainerTypes from "../DI/ContainerTypes";
import { IMessageBroker } from "../../MessageBroker/Interfaces/IMessageBroker";
import { TransportProviderRegistry } from "../../MessageBroker/Registries/TransportProviderRegistry";
import { MessageBroker } from "../../MessageBroker/MessageBroker";
import { MessageFilterRegistry } from "../../MessageBroker/Registries/MessageFilterRegistry";
import { NotificationComponent } from "../../MessageBroker/Components/NotificationComponent";
import { InMemoryTransport } from "../../MessageBroker/Transports/InMemoryTransport";
import { ITransportProviderRegistry } from "../../MessageBroker/Interfaces/ITransportProviderRegistry";
import { WebSocketTransport } from "../../MessageBroker/Transports/WebSocketTransport";
import { HttpTransport } from "../../MessageBroker/Transports/HttpTransport";
import { logLiveSubscribersMiddleware } from "../../MessageBroker/Middleware/logLiveSubscribersMiddleware";
import { FormValidationMiddleware } from "../Middleware/FormValidationMiddleware";
import { UIBinder } from "../Binders/UIBinder";
import { IValidatorRegistry } from "../Interfaces/IValidatorRegistry";
import RequiredValidator from "../Validators/RequiredFieldValidator";
import { EmailValidator } from "../Validators/EmailValidator";
import MinLengthValidator from "../Validators/MinLengthValidator";
import { MaxLengthValidator } from "../Validators/MaxLengthValidator";
import MatchValidator from "../Validators/MatchValidator";
import { RemoteValidator } from "../Validators/RemoteValidator";
import { IHttpClientFactory } from "../../MessageBroker/Interfaces/IHttpClientFactory";
import { HttpClientFactory } from "../../MessageBroker/Factory/HttpClientFactory";
import { formDebugger } from "../Utils/FormDebugger";

// ---- Initialization and Registry Setup ---- //
const broker = container.get<MessageBroker>(ContainerTypes.MessageBroker);
const transportRegistry = container.get<TransportProviderRegistry>(ContainerTypes.TransportProviderRegistry);
const formValidationMiddleware = container.get<FormValidationMiddleware>(ContainerTypes.FormValidationMiddleware);
const filterRegistry = container.get<MessageFilterRegistry>(ContainerTypes.MessageFilterRegistry);
const validatorRegistry = container.get<IValidatorRegistry>(ContainerTypes.ValidatorRegistry);

// --- Transports ---
transportRegistry.register("memory", new InMemoryTransport());
// transportRegistry.register("ws", new WebSocketTransport("wss://api.example.com/ws"));
// transportRegistry.register("http", new HttpTransport("https://api.example.com"));
broker.setProvider(transportRegistry.get("memory")!);

// --- Message Filters (example for notifications) ---
filterRegistry.register("NotificationComponent", (msg) => msg.type === "notification");

// --- Validators (register only once, keep types lower-case/consistent!) ---
validatorRegistry.register("required", new RequiredValidator());
validatorRegistry.register("email", new EmailValidator());
validatorRegistry.register("minlength", new MinLengthValidator()); // keep type lower-case for consistency
validatorRegistry.register("maxlength", new MaxLengthValidator());
validatorRegistry.register("match", new MatchValidator());
validatorRegistry.register(
  "remote",
  new RemoteValidator(
    container.get<IHttpClientFactory>(ContainerTypes.HttpClientFactory),
    container.get<WebSocketTransport>(ContainerTypes.WebSocketTransportProvider)
  )
);

// --- Broker middleware (logging etc) ---
broker.use(logLiveSubscribersMiddleware(broker, "Form Events"));
broker.use(formValidationMiddleware.middleware());

// --- UI/validation binding ---
formValidationMiddleware.attachToForms(); // Bind forms and handlers
new UIBinder(broker); // Listen for validation/status messages

// --- Debug and diagnostics ---
console.log('🔧 [FormValidation] System initialized successfully');
formDebugger.debugFormDetection();
formDebugger.debugValidationRegistry(validatorRegistry);
formDebugger.debugMessageBroker(broker);

// --- Optional: Test Notification ---
// broker.publish({ _remote: false, type: "notification", payload: { message: "Hello World" } });
