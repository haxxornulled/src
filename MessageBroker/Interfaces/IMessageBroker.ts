import { MessageFilter, MessageHandler } from "../../TYPES";
import { Subscriber } from "../Subscriber";
import { BrokerErrorHandler } from "../Types";
import { IMessage } from "./IMessage";
import { ITransportProvider } from "./ITransportProvider";

/**
 * The contract for any MessageBroker implementation,
 * including introspection, middleware, and diagnostics methods.
 */
export interface IMessageBroker {
  /** Set the transport provider for outbound/remote messages */
  setProvider(provider: ITransportProvider): void;

  /** Start the broker (connect transport, attach listeners, etc.) */
  start(): Promise<void>;

  /** Stop the broker, unsubscribe all, disconnect transport */
  stop(): Promise<void>;

  /** Set a custom error handler for subscriber/transport errors */
  setErrorHandler(handler: BrokerErrorHandler): void;

  /** Subscribe a handler to all (or filtered) messages. Returns a Subscriber. */
  subscribe(
    handler: MessageHandler,
    filter?: MessageFilter,
    owner?: any
  ): Subscriber;

  /** Subscribe a handler to the next matching message only */
  subscribeOnce(
    handler: MessageHandler,
    filter?: MessageFilter,
    owner?: any
  ): Subscriber;

  /** Unsubscribe a previously registered subscriber */
  unsubscribe(subscriber: Subscriber): void;

  /** Unsubscribe all subscribers with the given owner */
  unsubscribeByOwner(owner: any): void;

  /** Unsubscribe all subscribers */
  unsubscribeAll(): void;

  /** Publish a message to all matching subscribers and the transport */
  publish(msg: IMessage): Promise<void>;

  /** Request/reply pattern for point-to-point calls (if supported by transport) */
  request<TResponse = any>(msg: IMessage, timeout?: number): Promise<TResponse>;

  /** Register a middleware for all outgoing messages */
  use(middleware: (msg: IMessage, next: (msg: IMessage) => void) => void): void;

  /** Get all current subscribers (for introspection, middleware, etc.) */
  getSubscribers(): readonly Subscriber[];

  /** Get all subscribers whose filter matches the given message type */
  getSubscribersByType(type: string): readonly Subscriber[];

  /** Get all subscribers whose filter matches the given topic */
  getSubscribersByTopic(topic: string): readonly Subscriber[];

  /** Replay the last message for a topic/type to a handler */
  replayLast(topic: string, handler: MessageHandler): void;

  /** Metrics for diagnostics/monitoring */
  readonly metrics: {
    published: number;
    delivered: number;
    errors: number;
    lastError: any;
    lastPublishTime: number;
  };

  /** The connectionId if set by transport */
  readonly connectionId?: string;
  /** The clientId for this broker (if any) */
  readonly clientId?: string;
  /** The endpoint string for the transport (if any) */
  readonly endpoint?: string;
  /** The name of the transport in use (if any) */
  readonly transportName?: string;
}