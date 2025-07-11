var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { injectable } from "inversify";
import { Subscriber } from "./Subscriber";
let MessageBroker = class MessageBroker {
    constructor() {
        this.subscribers = new Set();
        this.handlerTimeoutMs = 8000;
        // Middleware and replay support
        this.middlewares = [];
        this.lastMessages = new Map();
        this.metrics = {
            published: 0,
            delivered: 0,
            errors: 0,
            lastError: null,
            lastPublishTime: 0,
        };
    }
    getSubscribersByType(type) {
        return Array.from(this.subscribers).filter((sub) => {
            // If a filter exists, test it against a mock message with the given type
            if (typeof sub.filter === "function") {
                try {
                    return sub.filter({ type });
                }
                catch {
                    return false;
                }
            }
            // If no filter, assume accepts all
            return true;
        });
    }
    getSubscribersByTopic(topic) {
        return Array.from(this.subscribers).filter((sub) => {
            if (typeof sub.filter === "function") {
                try {
                    return sub.filter({ topic });
                }
                catch {
                    return false;
                }
            }
            return true;
        });
    }
    get connectionId() {
        return this.provider && "connectionId" in this.provider
            ? this.provider.connectionId
            : undefined;
    }
    setProvider(provider) {
        this.provider = provider;
    }
    async start() {
        if (!this.provider) {
            console.warn("[BROKER] No transport provider set. Broker will only dispatch locally.");
            return;
        }
        await this.provider.connect?.();
        this.provider.onMessage?.(this.handleTransportMessage.bind(this));
        console.log(`[BROKER] Started with transport '${this.provider.name}' at '${this.provider.endpoint}'`);
    }
    async stop() {
        this.unsubscribeAll();
        if (this.provider?.disconnect) {
            await this.provider.disconnect();
        }
        console.log("[BROKER] Shutdown complete.");
    }
    async request(msg, timeout = 8000) {
        if (!this.provider || typeof this.provider.sendRequest !== "function") {
            throw new Error("Transport provider does not support request/reply");
        }
        return await this.provider.sendRequest(msg, timeout);
    }
    setErrorHandler(handler) {
        this.errorHandler = handler;
    }
    // logLiveSubscribers(label = ""): void {
    //   console.log(label, "Live subscribers:", this.subscribers.size);
    //   let i = 1;
    //   for (const sub of this.subscribers) {
    //     console.log(`${i++}.`, sub);
    //   }
    // }
    /**
     * Returns a read-only array of all current subscribers.
     * Useful for introspection, diagnostics, or middleware.
     */
    getSubscribers() {
        // Convert Set to Array for safe external usage
        return Array.from(this.subscribers);
    }
    // Defensive duplicate detection
    subscribe(handler, filter, owner) {
        for (const sub of this.subscribers) {
            if (sub.handler === handler &&
                sub.filter === filter &&
                sub.owner === owner) {
                console.warn("[BROKER] Duplicate subscription prevented.", {
                    handler,
                    filter,
                    owner,
                });
                return sub;
            }
        }
        if (!handler || typeof handler !== "function") {
            console.warn("[BROKER] Tried to subscribe with missing handler");
            throw new Error("Handler is required for subscription");
        }
        const subscriber = new Subscriber(handler, filter, owner);
        this.subscribers.add(subscriber);
        console.log("[BROKER] Subscribed:", { handler, filter, owner });
        return subscriber;
    }
    unsubscribe(subscriber) {
        if (this.subscribers.delete(subscriber)) {
            console.log("[BROKER] Unsubscribed:", subscriber);
        }
    }
    unsubscribeByOwner(owner) {
        for (const sub of Array.from(this.subscribers)) {
            if (sub.owner === owner) {
                this.subscribers.delete(sub);
                console.log("[BROKER] Unsubscribed by owner:", owner);
            }
        }
    }
    unsubscribeAll() {
        this.subscribers.clear();
        console.log("[BROKER] All subscribers cleared");
    }
    use(middleware) {
        this.middlewares.push(middleware);
    }
    subscribeOnce(handler, filter, owner) {
        let sub;
        const onceHandler = (msg) => {
            handler(msg);
            this.unsubscribe(sub);
        };
        sub = this.subscribe(onceHandler, filter, owner);
        return sub;
    }
    replayLast(topic, handler) {
        const msg = this.lastMessages.get(topic);
        if (msg)
            handler(msg);
        else
            console.log(`[BROKER] No message found for topic '${topic}' to replay.`);
    }
    // --- Timeout utility ---
    timeoutPromise(p, ms, errMsg) {
        return Promise.race([
            p,
            new Promise((_, reject) => setTimeout(() => reject(new Error(errMsg)), ms)),
        ]);
    }
    /**
     * Publish a message to all subscribers and send to transport if set.
     * Returns a Promise that resolves after all local handlers (but does not wait for remote).
     */
    async publish(msg) {
        if (!msg)
            throw new Error("Cannot publish undefined/null message!");
        this.metrics.published++;
        this.metrics.lastPublishTime = Date.now();
        if (msg.type)
            this.lastMessages.set(msg.type, msg);
        let idx = 0;
        const run = (m) => {
            if (idx < this.middlewares.length) {
                const mw = this.middlewares[idx++];
                try {
                    mw(m, run);
                }
                catch (err) {
                    console.error("[BROKER] Middleware error:", err);
                    // Continue to next middleware
                    run(m);
                }
            }
            else {
                this._publishCore(m);
            }
        };
        run(msg);
    }
    // ---- MAIN DELIVERY LOGIC ----
    async _publishCore(msg) {
        if (!msg.from) {
            msg.from = this.connectionId || this.clientId;
        }
        let delivered = 0;
        const promises = [];
        // --- Local delivery ---
        for (const sub of this.subscribers) {
            let matches = true;
            if (typeof sub.filter === "function") {
                try {
                    matches = await this.timeoutPromise(Promise.resolve(sub.filter(msg)), this.handlerTimeoutMs, "Filter timed out");
                }
                catch (err) {
                    matches = false;
                    this.metrics.errors++;
                    this.metrics.lastError = err;
                    console.error("[BROKER] Filter error for subscriber:", sub, err);
                }
            }
            if (matches) {
                try {
                    const p = this.timeoutPromise(Promise.resolve(sub.handler(msg)), this.handlerTimeoutMs, "Handler timed out").catch((e) => {
                        this.metrics.errors++;
                        this.metrics.lastError = e;
                        console.error("[BROKER] Handler error:", e, sub);
                        try {
                            if (this.errorHandler)
                                this.errorHandler(e, msg, sub);
                        }
                        catch (handlerErr) {
                            console.error("[BROKER] Error handler threw:", handlerErr);
                        }
                    });
                    promises.push(p);
                    delivered++;
                }
                catch (err) {
                    this.metrics.errors++;
                    this.metrics.lastError = err;
                    console.error("[BROKER] Handler threw:", err, sub);
                    try {
                        if (this.errorHandler)
                            this.errorHandler(err, msg, sub);
                    }
                    catch (handlerErr) {
                        console.error("[BROKER] Error handler threw:", handlerErr);
                    }
                }
            }
        }
        this.metrics.delivered += delivered;
        // --- Remote delivery ---
        if (this.provider) {
            try {
                // Defensive: Only send if provider is open (1=OPEN for WebSocket/standard transports)
                if (typeof this.provider.readyState === "number" &&
                    this.provider.readyState !== 1) {
                    console.warn("[BROKER] Transport not open, not sending:", this.provider.name);
                    return;
                }
                if (typeof this.provider.sendBroadcast === "function") {
                    await this.provider.sendBroadcast(msg);
                }
                else if (typeof this.provider.send === "function") {
                    await this.provider.send(msg.type, msg);
                }
                else {
                    console.warn("[BROKER] Transport provider missing send method");
                }
            }
            catch (e) {
                this.metrics.errors++;
                this.metrics.lastError = e;
                console.error("[BROKER] Transport send error:", e);
                try {
                    if (this.errorHandler)
                        this.errorHandler(e, msg, undefined);
                }
                catch (handlerErr) {
                    console.error("[BROKER] Error handler threw:", handlerErr);
                }
            }
        }
        await Promise.all(promises);
        console.log(`[BROKER] Delivered to ${delivered} local subscriber(s)`);
    }
    /**
     * Handle incoming messages from the transport layer.
     * If the message has a "from" field equal to this broker, ignore (prevents echo).
     */
    handleTransportMessage(raw) {
        let msg;
        try {
            if (typeof raw === "string") {
                msg = JSON.parse(raw);
            }
            else {
                msg = raw;
            }
            // Prevent echo if this broker sent it
            if (msg.from &&
                (msg.from === this.connectionId || msg.from === this.clientId))
                return;
            // Do not re-send to transport, just fire to subscribers
            this.fireToSubscribers(msg);
        }
        catch (e) {
            console.error("[BROKER] Failed to handle transport message:", raw, e);
        }
    }
    /**
     * Fires message to all local subscribers, no transport involved.
     */
    fireToSubscribers(msg) {
        for (const sub of this.subscribers) {
            let matches = true;
            if (typeof sub.filter === "function") {
                try {
                    matches = sub.filter(msg);
                }
                catch (err) {
                    matches = false;
                    console.error("[BROKER] Filter error for subscriber:", sub, err);
                }
            }
            if (matches) {
                try {
                    Promise.resolve(sub.handler(msg)).catch((e) => {
                        if (this.errorHandler) {
                            try {
                                this.errorHandler(e, msg, sub);
                            }
                            catch (handlerErr) {
                                console.error("[BROKER] Error handler threw:", handlerErr);
                            }
                        }
                        else {
                            console.error("[BROKER] Handler error:", e, sub);
                        }
                    });
                }
                catch (err) {
                    if (this.errorHandler) {
                        try {
                            this.errorHandler(err, msg, sub);
                        }
                        catch (handlerErr) {
                            console.error("[BROKER] Error handler threw:", handlerErr);
                        }
                    }
                    else {
                        console.error("[BROKER] Handler threw:", err, sub);
                    }
                }
            }
        }
    }
    get endpoint() {
        return this.provider?.endpoint;
    }
    get transportName() {
        return this.provider?.name;
    }
};
MessageBroker = __decorate([
    injectable(),
    __metadata("design:paramtypes", [])
], MessageBroker);
export { MessageBroker };
//# sourceMappingURL=MessageBroker.js.map