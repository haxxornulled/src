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
import { injectable, unmanaged } from "inversify";
let HttpTransport = class HttpTransport {
    constructor(endpoint) {
        this.name = "HttpTransport";
        this.readyState = 1; // Always "open" for HTTP
        // Can be set via constructor, or provided per-request
        this.endpoint = endpoint || "/api/message"; // Default fallback, change as needed
    }
    // --- ITransportProvider Methods ---
    /**
     * Broadcast a message (typically posts to an endpoint)
     */
    async sendBroadcast(msg) {
        await this.send(this.endpoint, msg);
    }
    /**
     * Send to a specific endpoint (if provided) or the default
     */
    async send(endpointOrMsg, payloadMaybe) {
        let url;
        let payload;
        if (typeof endpointOrMsg === "string") {
            url = endpointOrMsg || this.endpoint;
            payload = payloadMaybe;
        }
        else {
            url = this.endpoint;
            payload = endpointOrMsg;
        }
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (!response.ok)
            throw new Error(`HTTP error: ${response.status}`);
        // Attempt to parse JSON, else return undefined
        try {
            return await response.json();
        }
        catch {
            return undefined;
        }
    }
    /**
     * Request/reply pattern using HTTP POST (optionally with a timeout)
     */
    async sendRequest(msg, timeout = 8000) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);
        try {
            const response = await fetch(this.endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(msg),
                signal: controller.signal,
            });
            clearTimeout(timer);
            if (!response.ok)
                throw new Error(`HTTP error: ${response.status}`);
            return await response.json();
        }
        catch (e) {
            clearTimeout(timer);
            throw e;
        }
    }
    /**
     * No-op: HTTP is stateless, but for compatibility
     */
    async connect() { }
    async disconnect() { }
    // onMessage is not meaningful for HTTP, but provide for interface compliance
    onMessage(cb) {
        // Not supported in HTTP (stateless/polling model)
        // Optionally, throw or ignore
    }
};
HttpTransport = __decorate([
    injectable(),
    __param(0, unmanaged()),
    __metadata("design:paramtypes", [String])
], HttpTransport);
export { HttpTransport };
//# sourceMappingURL=HttpTransport.js.map