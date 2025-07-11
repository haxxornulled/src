import "reflect-metadata";
import { Container } from "inversify";
import ContainerTypes from "./ContainerTypes";

// MessageBroker imports
import { MessageBroker } from "../../MessageBroker/MessageBroker";
import { Subscriber } from "../../MessageBroker/Subscriber";
import { MessageFilterRegistry } from "../../MessageBroker/Registries/MessageFilterRegistry";
import { TransportProviderRegistry } from "../../MessageBroker/Registries/TransportProviderRegistry";
import { HttpTransport } from "../../MessageBroker/Transports/HttpTransport";
import { InMemoryTransport } from "../../MessageBroker/Transports/InMemoryTransport";
import { HttpClientFactory } from "../../MessageBroker/Factory/HttpClientFactory";

// FormValidation imports
import { ValidatorRegistry } from "../Registry/ValidatorRegistry";
import { ValidatorDispatcher } from "../Dispatchers/ValidatorDispatcher";
import { FormValidationMiddleware } from "../Middleware/FormValidationMiddleware";
import { FormEventBinder } from "../Binders/FormEventBinder";
import { UIBinder } from "../Binders/UIBinder";
import { FormParsingService } from "../Services/FormParsingService";
import { ConfigurationService } from "../Services/ConfigurationService";
import { RuleParser } from "../Parser/RuleParser";

// Validators
import { RequiredValidator } from "../Validators/RequiredFieldValidator";
import { EmailValidator } from "../Validators/EmailValidator";
import { MinLengthValidator } from "../Validators/MinLengthValidator";
import { MaxLengthValidator } from "../Validators/MaxLengthValidator";
import { PatternValidator } from "../Validators/PatternValidator";
import { MatchValidator } from "../Validators/MatchValidator";
import { MinCheckedValidator } from "../Validators/MinCheckedValidator";
import { MaxCheckedValidator } from "../Validators/MaxCheckedValidator";
import { MinSelectedValidator } from "../Validators/MinSelectedValidator";
import { MaxSelectedValidator } from "../Validators/MaxSelectedValidator";
import { RemoteValidator } from "../Validators/RemoteValidator";

// Middleware
import { logLiveSubscribersMiddleware } from "../../MessageBroker/Middleware/logLiveSubscribersMiddleware";

export const container = new Container();

// ---- MessageBroker Bindings ----
container.bind<MessageBroker>(ContainerTypes.MessageBroker)
  .to(MessageBroker).inSingletonScope();

container.bind<Subscriber>(ContainerTypes.Subscriber)
  .to(Subscriber).inSingletonScope();

container.bind<MessageFilterRegistry>(ContainerTypes.MessageFilterRegistry)
  .to(MessageFilterRegistry).inSingletonScope();

container.bind<TransportProviderRegistry>(ContainerTypes.TransportProviderRegistry)
  .to(TransportProviderRegistry).inSingletonScope();

// ---- Transport Bindings ----
container.bind<HttpTransport>(ContainerTypes.HttpTransportProvider)
  .to(HttpTransport).inSingletonScope();

container.bind<InMemoryTransport>(ContainerTypes.InMemoryTransportProvider)
  .to(InMemoryTransport).inSingletonScope();

// HTTP Client Factory (for direct HTTP operations outside MessageBroker)
container.bind<HttpClientFactory>(ContainerTypes.HttpClientFactory)
  .to(HttpClientFactory).inSingletonScope();

// ---- FormValidation Bindings ----
container.bind<ValidatorRegistry>(ContainerTypes.ValidatorRegistry)
  .to(ValidatorRegistry).inSingletonScope();

container.bind<ValidatorDispatcher>(ContainerTypes.ValidatorDispatcher)
  .to(ValidatorDispatcher).inSingletonScope();

container.bind<FormValidationMiddleware>(ContainerTypes.FormValidationMiddleware)
  .to(FormValidationMiddleware).inSingletonScope();

container.bind<FormEventBinder>(ContainerTypes.FormEventBinder)
  .to(FormEventBinder).inSingletonScope();

container.bind<UIBinder>(ContainerTypes.UIBinder)
  .to(UIBinder).inSingletonScope();

container.bind<FormParsingService>(ContainerTypes.FormParsingService)
  .to(FormParsingService).inSingletonScope();

container.bind<ConfigurationService>(ContainerTypes.ConfigurationService)
  .to(ConfigurationService).inSingletonScope();

container.bind<RuleParser>(ContainerTypes.RuleParser)
  .to(RuleParser).inSingletonScope();

// ---- Validator Bindings ----
container.bind<RequiredValidator>(ContainerTypes.RequiredValidator)
  .to(RequiredValidator).inSingletonScope();

container.bind<EmailValidator>(ContainerTypes.EmailValidator)
  .to(EmailValidator).inSingletonScope();

container.bind<MinLengthValidator>(ContainerTypes.MinLengthValidator)
  .to(MinLengthValidator).inSingletonScope();

container.bind<MaxLengthValidator>(ContainerTypes.MaxLengthValidator)
  .to(MaxLengthValidator).inSingletonScope();

container.bind<PatternValidator>(ContainerTypes.PatternValidator)
  .to(PatternValidator).inSingletonScope();

container.bind<MatchValidator>(ContainerTypes.MatchValidator)
  .to(MatchValidator).inSingletonScope();

container.bind<MinCheckedValidator>(ContainerTypes.MinCheckedValidator)
  .to(MinCheckedValidator).inSingletonScope();

container.bind<MaxCheckedValidator>(ContainerTypes.MaxCheckedValidator)
  .to(MaxCheckedValidator).inSingletonScope();

container.bind<MinSelectedValidator>(ContainerTypes.MinSelectedValidator)
  .to(MinSelectedValidator).inSingletonScope();

container.bind<MaxSelectedValidator>(ContainerTypes.MaxSelectedValidator)
  .to(MaxSelectedValidator).inSingletonScope();

container.bind<RemoteValidator>(ContainerTypes.RemoteValidator)
  .to(RemoteValidator).inSingletonScope();

export default container;


