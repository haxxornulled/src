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
let HttpClient = class HttpClient {
    constructor(config = {}) {
        this.config = config;
    }
    async applyInterceptors(input, init = {}) {
        let req = [input, init];
        if (this.config.interceptors) {
            for (const interceptor of this.config.interceptors) {
                req = await interceptor(req[0], req[1]);
            }
        }
        return req;
    }
    async handleResponse(response) {
        let res = response;
        if (this.config.responseInterceptors) {
            for (const interceptor of this.config.responseInterceptors) {
                res = await interceptor(res);
            }
        }
        return res;
    }
    async request(method, url, data, options) {
        let finalUrl = url;
        let headers = { ...this.config.defaultHeaders, ...(options?.headers || {}) };
        let init = { method, ...options, headers };
        if (this.config.baseUrl && !/^https?:\/\//.test(url)) {
            finalUrl = this.config.baseUrl.replace(/\/+$/, "") + "/" + url.replace(/^\/+/, "");
        }
        if (data !== undefined && method !== "GET" && method !== "HEAD") {
            init.body = typeof data === "string" ? data : JSON.stringify(data);
            if (!headers["Content-Type"]) {
                headers["Content-Type"] = "application/json";
            }
        }
        const [interceptedRequestInfo, interceptedInit] = await this.applyInterceptors(finalUrl, init);
        let response;
        if (typeof interceptedRequestInfo === "string") {
            response = await fetch(interceptedRequestInfo, interceptedInit);
        }
        else {
            response = await fetch(interceptedRequestInfo);
        }
        const handledResponse = await this.handleResponse(response);
        if (!handledResponse.ok) {
            throw new Error(`[HttpClient] Request failed: ${handledResponse.status} ${handledResponse.statusText}`);
        }
        const ct = handledResponse.headers.get("content-type");
        if (ct && ct.includes("application/json")) {
            return handledResponse.json();
        }
        return handledResponse.text();
    }
    get(url, options) {
        return this.request("GET", url, undefined, options);
    }
    post(url, data, options) {
        return this.request("POST", url, data, options);
    }
    put(url, data, options) {
        return this.request("PUT", url, data, options);
    }
    delete(url, options) {
        return this.request("DELETE", url, undefined, options);
    }
    /**
     * Sends a POST request to the endpoint (or relative path if baseUrl is set).
     */
    async send(endpoint, payload) {
        return this.post(endpoint, payload);
    }
};
HttpClient = __decorate([
    injectable(),
    __metadata("design:paramtypes", [Object])
], HttpClient);
export { HttpClient };
//# sourceMappingURL=HttpClient.js.map