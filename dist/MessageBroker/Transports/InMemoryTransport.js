// Simple UUID (or use your preferred method)
function uuidv4() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0, v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
/**
 * Enhanced in-memory pub/sub transport with request/reply support.
 */
export class InMemoryTransport {
    constructor() {
        this.name = "InMemoryTransport";
        this.endpoint = "local";
        this.readyState = 1;
    }
    onMessage(cb) {
        this.onMessageHandler = cb;
        InMemoryTransport.globalListeners.add(cb);
    }
    async disconnect() {
        if (this.onMessageHandler) {
            InMemoryTransport.globalListeners.delete(this.onMessageHandler);
            this.onMessageHandler = undefined;
        }
    }
    async connect() {
        // no-op for in-memory
    }
    async sendBroadcast(msg) {
        // Broadcast to all listeners
        InMemoryTransport.globalListeners.forEach(cb => {
            try {
                cb(msg);
            }
            catch (err) {
                // Handle/log errors as needed
            }
        });
    }
    async send(endpoint, payload) {
        await this.sendBroadcast(payload);
        return undefined;
    }
    /** Request/reply with correlationId */
    async sendRequest(msg, timeout = 8000) {
        if (!msg.id)
            msg.id = uuidv4();
        msg._isRequest = true;
        // Set up a promise that will be resolved by the reply
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                InMemoryTransport.pendingReplies.delete(msg.id);
                reject(new Error("Request timed out: " + msg.id));
            }, timeout);
            InMemoryTransport.pendingReplies.set(msg.id, (reply) => {
                clearTimeout(timer);
                InMemoryTransport.pendingReplies.delete(msg.id);
                resolve(reply);
            });
            // Send the message to all listeners (including self, for testing)
            this.sendBroadcast(msg);
        });
    }
    // How a consumer should reply to a request (for demo purposes)
    static replyToRequest(requestMsg, replyPayload) {
        // Form a reply message, keeping the same ID (correlation)
        const reply = {
            ...replyPayload,
            id: requestMsg.id,
            _isReply: true
        };
        // Synchronously resolve any awaiting promise
        const pending = InMemoryTransport.pendingReplies.get(requestMsg.id);
        if (pending) {
            pending(reply);
        }
    }
}
// static event bus for all instances in same JS runtime
InMemoryTransport.globalListeners = new Set();
// --- Request/Reply support ---
InMemoryTransport.pendingReplies = new Map();
//# sourceMappingURL=InMemoryTransport.js.map