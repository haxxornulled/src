var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { inject, injectable, optional } from "inversify";
import ContainerTypes from "../ContainerTypes";
// Generates a UUID (browser crypto or fallback)
function generateComponentId() {
    if (typeof crypto?.randomUUID === "function")
        return crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0, v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
let MessageDrivenComponent = class MessageDrivenComponent {
    /** The subscribers created by this component (read-only for external consumers). */
    get subscribers() {
        return this._subscribers;
    }
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
    constructor(broker, id, filterRegistry, universal = false, filter // Use your type alias
    ) {
        this.broker = broker;
        this.filterRegistry = filterRegistry;
        this._subscribers = [];
        this.universal = universal;
        this.id = id || generateComponentId();
        if (!broker || typeof broker.subscribe !== "function")
            throw new Error("MessageBroker not injected!");
        // ---- Filter Resolution Priority ----
        // 1. Use explicit filter if given
        // 2. Try registry, using the class name as key
        // 3. Accept all (undefined filter)
        let messageFilter = filter;
        if (!messageFilter && filterRegistry) {
            // Use the registry to look up by class name (as convention), or fallback to undefined (accept all)
            const className = this.constructor.name;
            messageFilter = filterRegistry.get?.(className);
            if (messageFilter) {
                console.log(`[${this.id}] Using filter from registry for: ${className}`);
            }
        }
        // Subscribe and store subscriber for management/unsubscription
        const subscriber = broker.subscribe((msg) => this.handleMessage(msg), messageFilter, this // owner, for easy group-unsub
        );
        this._subscribers.push(subscriber);
        // Optional debug logging
        console.log(`[${this.id}] Initialized as a filtered message listener.`);
    }
    /**
     * Unsubscribes all subscribers created by this component.
     * Call in cleanup/destructor logic.
     */
    unsubscribeAll() {
        this._subscribers.forEach(sub => this.broker.unsubscribe(sub));
        this._subscribers = [];
        console.log(`[${this.id}] All subscribers unsubscribed.`);
    }
};
MessageDrivenComponent = __decorate([
    injectable()
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
    ,
    __param(0, inject(ContainerTypes.MessageBroker)),
    __param(2, inject(ContainerTypes.MessageFilterRegistry)),
    __param(2, optional()),
    __param(4, optional()),
    __metadata("design:paramtypes", [Object, String, Object, Boolean, Function])
], MessageDrivenComponent);
export { MessageDrivenComponent };
//# sourceMappingURL=MessageDrivenComponent.js.map