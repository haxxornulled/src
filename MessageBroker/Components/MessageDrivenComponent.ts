import { inject, injectable, optional } from "inversify";

import { Subscriber } from "../Subscriber";
import { IMessage } from "../Interfaces/IMessage";
import { IMessageBroker } from "../Interfaces/IMessageBroker";
import ContainerTypes from "../ContainerTypes";
import { MessageFilter } from "../Types";
import { IMessageFilterRegistry } from "../Interfaces/IMessageFilterRegistry";



// Generates a UUID (browser crypto or fallback)
function generateComponentId(): string {
  if (typeof crypto?.randomUUID === "function") return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

@injectable()
/**
 * Abstract base class for components that listen to messages via a message broker.
 * 
 * `MessageDrivenComponent` manages the subscription lifecycle, filter resolution, and provides
 * a contract for handling messages. Subclasses must implement the `handleMessage` method to
 * define custom message processing logic.
 * 
 * ### Filter Resolution Priority
 * 1. Uses an explicit filter if provided in the constructor.
 * 2. Attempts to resolve a filter from the `IMessageFilterRegistry` using the class name.
 * 3. Defaults to accepting all messages if no filter is found.
 * 
 * ### Usage
 * - Extend this class to create a message-driven component.
 * - Implement the abstract `handleMessage` method to process incoming messages.
 * - Call `unsubscribeAll()` during cleanup to remove all subscriptions.
 * 
 * @abstract
 * @template Subscriber - The type representing a message subscriber.
 * @template IMessage - The type representing a message.
 * @template IMessageBroker - The interface for the message broker.
 * @template IMessageFilterRegistry - The interface for the filter registry.
 * @template MessageFilter - The type alias for a message filter.
 * 
 * @property {readonly Subscriber[]} subscribers - The subscribers created by this component (read-only).
 * @property {boolean} universal - Indicates if this component is "universal" (domain-specific meaning).
 * @property {string} id - Unique identifier for this component instance.
 * 
 * @constructor
 * @param {IMessageBroker} broker - The injected message broker instance.
 * @param {string} [id] - Optional unique identifier for the component.
 * @param {IMessageFilterRegistry} [filterRegistry] - Optional registry for message filters.
 * @param {boolean} [universal=false] - Whether the component is universal.
 * @param {MessageFilter} [filter] - Optional explicit message filter.
 * 
 * @method unsubscribeAll - Unsubscribes all subscribers created by this component.
 * @method handleMessage - Abstract method to handle incoming messages.
 */
export abstract class MessageDrivenComponent {
  private _subscribers: Subscriber[] = [];

  /** The subscribers created by this component (read-only for external consumers). */
  public get subscribers(): readonly Subscriber[] {
    return this._subscribers;
  }

  /** If true, this component is "universal" (see usage in your domain). */
  public readonly universal: boolean;

  /** Unique identifier for this component instance. */
  public readonly id: string;

  /**
   * Constructs a new instance of the MessageDrivenComponent.
   *
   * @param broker - The injected message broker instance used for subscribing to messages.
   * @param id - Optional unique identifier for the component. If not provided, a new ID is generated.
   * @param filterRegistry - (Optional) The injected registry for message filters, used to resolve filters by class name.
   * @param universal - Indicates whether the component should act as a universal listener. Defaults to `false`.
   * @param filter - (Optional) An explicit message filter to apply. If not provided, the filter is resolved from the registry or defaults to accepting all messages.
   *
   * @throws Error if the message broker is not injected or does not implement the required interface.
   *
   * The constructor determines the message filter to use based on the following priority:
   * 1. Uses the explicit filter if provided.
   * 2. Attempts to resolve a filter from the registry using the class name.
   * 3. Defaults to accepting all messages if no filter is found.
   * 
   * Subscribes the component to the message broker using the resolved filter and manages the subscription for later unsubscription.
   */
  constructor(
    @inject(ContainerTypes.MessageBroker)
    protected readonly broker: IMessageBroker,
    id?: string,
    @inject(ContainerTypes.MessageFilterRegistry)
    @optional()
    protected readonly filterRegistry?: IMessageFilterRegistry,
    universal: boolean = false,
    @optional() filter?: MessageFilter // Use your type alias
  ) {
    this.universal = universal;
    this.id = id || generateComponentId();

    if (!broker || typeof broker.subscribe !== "function")
      throw new Error("MessageBroker not injected!");

    // ---- Filter Resolution Priority ----
    // 1. Use explicit filter if given
    // 2. Try registry, using the class name as key
    // 3. Accept all (undefined filter)
    let messageFilter: MessageFilter | undefined = filter;

    if (!messageFilter && filterRegistry) {
      // Use the registry to look up by class name (as convention), or fallback to undefined (accept all)
      const className = this.constructor.name;
      messageFilter = filterRegistry.get?.(className);
      if (messageFilter) {
        console.log(`[${this.id}] Using filter from registry for: ${className}`);
      }
    }

    // Subscribe and store subscriber for management/unsubscription
    const subscriber = broker.subscribe(
      (msg: IMessage) => this.handleMessage(msg),
      messageFilter,
      this // owner, for easy group-unsub
    );
    this._subscribers.push(subscriber);

    // Optional debug logging
    console.log(`[${this.id}] Initialized as a filtered message listener.`);
  }

  /**
   * Unsubscribes all subscribers created by this component.
   * Call in cleanup/destructor logic.
   */
  public unsubscribeAll(): void {
    this._subscribers.forEach(sub => this.broker.unsubscribe(sub));
    this._subscribers = [];
    console.log(`[${this.id}] All subscribers unsubscribed.`);
  }

  /** 
   * Your subclass must implement this. Called for every matching message.
   */
  abstract handleMessage(msg: IMessage): void | Promise<void>;
}