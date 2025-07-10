import { Container } from 'inversify';
import { MessageBroker } from '../../MessageBroker/MessageBroker';
import { IMessageBroker } from '../../MessageBroker/Interfaces/IMessageBroker';
import { ContainerTypes } from './ContainerTypes';
import { ITransportProviderRegistry } from '../../MessageBroker/Interfaces/ITransportProviderRegistry';
import { TransportProviderRegistry } from '../../MessageBroker/Registries/TransportProviderRegistry';
import { IMessageFilterRegistry } from '../../MessageBroker/Interfaces/IMessageFilterRegistry';
import { MessageFilterRegistry } from '../../MessageBroker/Registries/MessageFilterRegistry';
import { FormValidationMiddleware } from '../Middleware/FormValidationMiddleware';
import { IRuleParser } from '../Interfaces/IRuleParser';
import { RuleParser } from '../Parser/RuleParser';
import { IFormValidationMiddleware } from '../Interfaces/IFormValidationMiddleware';
import { IFormEventBinder } from '../Interfaces/IFormEventBinder';
import { FormEventBinder } from '../Binders/FormEventBinder';
import { IValidatorDispatcher } from '../Interfaces/IValidatorDispatcher';
import { ValidatorDispatcher } from '../Dispatchers/ValidatorDispatcher';
import { IValidatorRegistry } from '../Interfaces/IValidatorRegistry';
import { ValidatorRegistry } from '../Registry/ValidatorRegistry';
import { IHttpClientFactory } from '../../MessageBroker/Interfaces/IHttpClientFactory';
import { HttpClientFactory } from '../../MessageBroker/Factory/HttpClientFactory';
import { IWebSocketTransport } from '../../MessageBroker/Interfaces/IWebSocketTransport';
import { WebSocketTransport } from '../../MessageBroker/Transports/WebSocketTransport';


const container = new Container();

// --- Core Messaging/Transport ---
container.bind<IMessageBroker>(ContainerTypes.MessageBroker)
  .to(MessageBroker).inSingletonScope();
container.bind<ITransportProviderRegistry>(ContainerTypes.TransportProviderRegistry)
  .to(TransportProviderRegistry).inSingletonScope();
container.bind<IMessageFilterRegistry>(ContainerTypes.MessageFilterRegistry)
  .to(MessageFilterRegistry).inSingletonScope();

  container.bind<IWebSocketTransport>(ContainerTypes.WebSocketTransportProvider)
  .to(WebSocketTransport).inSingletonScope(); // Example WebSocket transport

// --- Validation/Parsing ---
container.bind<IRuleParser>(ContainerTypes.RuleParser)
  .to(RuleParser).inSingletonScope();
//container.bind<IFormEventBinder>(ContainerTypes.FormEventBinder)
 // .to(FormEventBinder).inSingletonScope();
container.bind<IValidatorDispatcher>(ContainerTypes.ValidatorDispatcher)
  .to(ValidatorDispatcher).inSingletonScope();
container.bind<IValidatorRegistry>(ContainerTypes.ValidatorRegistry)
  .to(ValidatorRegistry).inSingletonScope();

// --- HTTP/Remote ---
container.bind<IHttpClientFactory>(ContainerTypes.HttpClientFactory)
  .to(HttpClientFactory).inSingletonScope();


const formEventBinder = new FormEventBinder(
  container.get<IMessageBroker>(ContainerTypes.MessageBroker),
  container.get<IValidatorDispatcher>(ContainerTypes.ValidatorDispatcher)
);


// --- FormEventBinder (let DI inject everything) ---
container.bind<IFormEventBinder>(ContainerTypes.FormEventBinder).toConstantValue(formEventBinder);

// --- FormValidationMiddleware (let DI inject everything) ---
//container.bind<IFormValidationMiddleware>(ContainerTypes.FormValidationMiddleware)
  //.to(FormValidationMiddleware).inSingletonScope();


container.bind<FormValidationMiddleware>(ContainerTypes.FormValidationMiddleware)
  .toConstantValue(new FormValidationMiddleware(
    container.get<IFormEventBinder>(ContainerTypes.FormEventBinder)
  ));

// --- Export for use elsewhere ---
export { container, ContainerTypes };


