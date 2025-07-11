var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { v4 as uuidv4 } from "uuid";
import { injectable } from 'inversify';
let WebSocketTransport = class WebSocketTransport {
    get readyState() { return this.ws?.readyState ?? WebSocket.CLOSED; }
    constructor() {
        this.name = "WebSocketTransport";
        this.endpoint = "";
        this.id = uuidv4();
        this.isOpen = false;
        // Internal
        this.clientId = uuidv4();
        this.ws = null;
        this._connectionId = null;
        this.isConnecting = false;
        this.handlers = new Set();
        this.topicHandlers = new Map();
        this.pending = new Map();
        this.autoReconnect = true;
        this.reconnectDelay = 1000;
        this.maxReconnectDelay = 30000;
        this.reconnectAttempts = 0;
        this.reconnectTimer = null;
        this.logger = null;
        this.resetOpenPromise();
        // No auto-connect! User must call setEndpoint()
        if (typeof window !== "undefined") {
            window.addEventListener("beforeunload", () => this.disconnect());
        }
    }
    /** Set (or change) the WebSocket endpoint and (re)connect */
    setEndpoint(endpoint) {
        if (this.endpoint !== endpoint) {
            this.endpoint = endpoint;
            this.connect();
        }
    }
    // Required by interface (async for future compatibility)
    async connect() {
        if (!this.endpoint) {
            throw new Error("WebSocket endpoint not set. Use setEndpoint() first.");
        }
        if (this.isOpen || this.isConnecting)
            return;
        this.isConnecting = true;
        if (this.ws) {
            this.log("[WS] Closing old socket before reconnect");
            this.ws.close();
        }
        this.ws = new WebSocket(this.endpoint);
        this.ws.onopen = () => {
            this.isConnecting = false;
            this.openResolve();
            this.onOpen?.(this);
            this.resetOpenPromise();
            this.log("[WS] Connected");
            this.reconnectAttempts = 0;
            if (this.reconnectTimer) {
                clearTimeout(this.reconnectTimer);
                this.reconnectTimer = null;
            }
        };
        this.ws.onclose = (evt) => {
            this._connectionId = null;
            this.onClose?.(evt, this);
            this.log("[WS] Disconnected");
            this.rejectAllPending("WebSocket closed");
            if (this.autoReconnect && this.endpoint)
                this.scheduleReconnect();
        };
        this.ws.onerror = (evt) => {
            const error = new Error("WebSocket error");
            error.event = evt;
            this.onError?.(error, this, evt);
            this.log(`[WS] Error: ${error}`);
            this.rejectAllPending("WebSocket error");
            if (this.autoReconnect && this.endpoint)
                this.scheduleReconnect();
        };
        this.ws.onmessage = (evt) => {
            this.onRawMessage?.(evt.data, this);
            this.handleIncomingMessage(evt.data);
        };
    }
    async disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
            this.rejectAllPending("WebSocket disconnected");
        }
    }
    async sendBroadcast(msg) {
        await this.send(msg.type, msg);
    }
    async send(endpoint, payload) {
        await this.openPromise;
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            throw new Error("WebSocket not open");
        }
        const msg = typeof payload === "object" ? { ...payload } : { type: String(payload) };
        msg.id ?? (msg.id = uuidv4());
        msg.from ?? (msg.from = this.connectionId ?? this.clientId);
        msg.timestamp ?? (msg.timestamp = new Date().toISOString());
        if (this.connectionId)
            msg.connectionId = this.connectionId;
        this.ws.send(JSON.stringify(msg));
        this.log(`[WS] Sent: ${msg.type} ${msg.topic ?? ""} ${msg.id}`);
        return undefined;
    }
    async sendRequest(msg, timeout = 8000) {
        return this.request(msg, timeout);
    }
    onMessage(cb) {
        this.onAny(cb);
    }
    subscribe(topicOrType, handler) {
        if (!this.topicHandlers.has(topicOrType)) {
            this.topicHandlers.set(topicOrType, new Set());
        }
        this.topicHandlers.get(topicOrType).add(handler);
    }
    unsubscribe(topicOrType, handler) {
        if (this.topicHandlers.has(topicOrType)) {
            this.topicHandlers.get(topicOrType).delete(handler);
            if (this.topicHandlers.get(topicOrType).size === 0) {
                this.topicHandlers.delete(topicOrType);
            }
        }
    }
    onAny(handler) {
        this.handlers.add(handler);
    }
    async ping() {
        const start = Date.now();
        await this.request({ type: "Ping", _remote: false });
        return Date.now() - start;
    }
    async sendUserMessage(text) {
        await this.send("UserMessage", {
            type: "UserMessage",
            payload: text,
            _remote: false,
        }).catch((err) => {
            this.log("Failed to send user message: " + err);
        });
    }
    async sendMsgInternal(msg) {
        await this.openPromise;
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            throw new Error("WebSocket not open");
        }
        this.ws.send(JSON.stringify(msg));
        this.log(`[WS] Sent: ${msg.type} ${msg.topic ?? ""} ${msg.id}`);
    }
    async request(msg, timeout = 8000) {
        await this.openPromise;
        msg.id ?? (msg.id = uuidv4());
        msg.from ?? (msg.from = this.connectionId ?? this.clientId);
        msg.timestamp ?? (msg.timestamp = new Date().toISOString());
        if (this.connectionId)
            msg.connectionId = this.connectionId;
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            throw new Error("WebSocket not open");
        }
        this.ws.send(JSON.stringify(msg));
        this.log(`[WS] Sent: ${msg.type} ${msg.topic ?? ""} ${msg.id}`);
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                this.pending.delete(msg.id);
                this.log(`[WS][TIMEOUT] Request timed out for msg.id=${msg.id} type=${msg.type} 
          from=${msg.from} connId=${this.connectionId ?? this.clientId} endpoint=${this.endpoint}`);
                reject(new Error(`Request timed out (id=${msg.id}, type=${msg.type}, from=${msg.from}, connId=${this.connectionId ?? this.clientId}, endpoint=${this.endpoint})`));
            }, timeout);
            this.pending.set(msg.id, (reply) => {
                clearTimeout(timer);
                this.pending.delete(msg.id);
                resolve(reply);
            });
        });
    }
    handleIncomingMessage(data) {
        let msg;
        try {
            msg = JSON.parse(data);
        }
        catch {
            this.log("Malformed message: " + data);
            return;
        }
        if (msg.type === "ConnectionId" && msg.id) {
            this._connectionId = msg.id;
            this.onConnectionIdAssigned?.(msg.id);
            this.log(`[WS] Assigned connectionId: ${this._connectionId}`);
        }
        if (msg.id && this.pending.has(msg.id)) {
            this.pending.get(msg.id)(msg);
        }
        if (msg.topic && this.topicHandlers.has(msg.topic)) {
            this.topicHandlers.get(msg.topic).forEach((handler) => handler(msg));
        }
        this.handlers.forEach((handler) => handler(msg));
        this.log(`[WS] Received: ${msg.type} ${msg.topic ?? ""} ${msg.id ?? ""}`);
    }
    rejectAllPending(reason) {
        for (const [id, cb] of this.pending.entries()) {
            cb({ type: "Error", error: reason, id });
        }
        this.pending.clear();
    }
    resetOpenPromise() {
        this.openPromise = new Promise((res) => (this.openResolve = res));
    }
    log(msg) {
        if (this.logger) {
            this.logger(msg);
        }
        else if (typeof window !== "undefined" &&
            window.console) {
            console.log(`%c${msg}`);
        }
        else {
            console.log(msg);
        }
    }
    scheduleReconnect() {
        this.reconnectAttempts++;
        const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), this.maxReconnectDelay);
        this.log(`[WS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
        this.reconnectTimer = setTimeout(() => {
            this.connect();
        }, delay);
    }
    get connectionId() {
        return this._connectionId;
    }
};
WebSocketTransport = __decorate([
    injectable(),
    __metadata("design:paramtypes", [])
], WebSocketTransport);
export { WebSocketTransport };
//# sourceMappingURL=WebSocketTransport.js.map