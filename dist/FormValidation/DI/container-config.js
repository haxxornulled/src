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
export const container = new Container();
// ---- MessageBroker Bindings ----
container.bind(ContainerTypes.MessageBroker)
    .to(MessageBroker).inSingletonScope();
container.bind(ContainerTypes.Subscriber)
    .to(Subscriber).inSingletonScope();
container.bind(ContainerTypes.MessageFilterRegistry)
    .to(MessageFilterRegistry).inSingletonScope();
container.bind(ContainerTypes.TransportProviderRegistry)
    .to(TransportProviderRegistry).inSingletonScope();
// ---- Transport Bindings ----
container.bind(ContainerTypes.HttpTransportProvider)
    .to(HttpTransport).inSingletonScope();
container.bind(ContainerTypes.InMemoryTransportProvider)
    .to(InMemoryTransport).inSingletonScope();
// HTTP Client Factory (for direct HTTP operations outside MessageBroker)
container.bind(ContainerTypes.HttpClientFactory)
    .to(HttpClientFactory).inSingletonScope();
// ---- FormValidation Bindings ----
container.bind(ContainerTypes.ValidatorRegistry)
    .to(ValidatorRegistry).inSingletonScope();
container.bind(ContainerTypes.ValidatorDispatcher)
    .to(ValidatorDispatcher).inSingletonScope();
container.bind(ContainerTypes.FormValidationMiddleware)
    .to(FormValidationMiddleware).inSingletonScope();
container.bind(ContainerTypes.FormEventBinder)
    .to(FormEventBinder).inSingletonScope();
container.bind(ContainerTypes.UIBinder)
    .to(UIBinder).inSingletonScope();
container.bind(ContainerTypes.FormParsingService)
    .to(FormParsingService).inSingletonScope();
container.bind(ContainerTypes.ConfigurationService)
    .to(ConfigurationService).inSingletonScope();
container.bind(ContainerTypes.RuleParser)
    .to(RuleParser).inSingletonScope();
// ---- Validator Bindings ----
container.bind(ContainerTypes.RequiredValidator)
    .to(RequiredValidator).inSingletonScope();
container.bind(ContainerTypes.EmailValidator)
    .to(EmailValidator).inSingletonScope();
container.bind(ContainerTypes.MinLengthValidator)
    .to(MinLengthValidator).inSingletonScope();
container.bind(ContainerTypes.MaxLengthValidator)
    .to(MaxLengthValidator).inSingletonScope();
container.bind(ContainerTypes.PatternValidator)
    .to(PatternValidator).inSingletonScope();
container.bind(ContainerTypes.MatchValidator)
    .to(MatchValidator).inSingletonScope();
container.bind(ContainerTypes.MinCheckedValidator)
    .to(MinCheckedValidator).inSingletonScope();
container.bind(ContainerTypes.MaxCheckedValidator)
    .to(MaxCheckedValidator).inSingletonScope();
container.bind(ContainerTypes.MinSelectedValidator)
    .to(MinSelectedValidator).inSingletonScope();
container.bind(ContainerTypes.MaxSelectedValidator)
    .to(MaxSelectedValidator).inSingletonScope();
container.bind(ContainerTypes.RemoteValidator)
    .to(RemoteValidator).inSingletonScope();
export default container;
//# sourceMappingURL=container-config.js.map