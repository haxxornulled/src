var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { injectable } from "inversify";
let TransportProviderRegistry = class TransportProviderRegistry {
    constructor() {
        this.providers = new Map();
    }
    /** Register (or override) a provider by name */
    register(name, provider) {
        if (!name || typeof name !== "string" || !name.trim()) {
            throw new Error("Provider name must be a non-empty string");
        }
        if (!provider)
            throw new Error("Provider instance is required");
        this.providers.set(name, provider);
    }
    /** Retrieve a provider by name, or undefined */
    get(name) {
        return this.providers.get(name);
    }
    /** Remove a provider by name */
    unregister(name) {
        this.providers.delete(name);
    }
    /** Check if a provider exists */
    has(name) {
        return this.providers.has(name);
    }
    /** List all registered provider names */
    list() {
        return Array.from(this.providers.keys());
    }
    /** Remove all providers from the registry */
    clear() {
        this.providers.clear();
    }
};
TransportProviderRegistry = __decorate([
    injectable()
], TransportProviderRegistry);
export { TransportProviderRegistry };
//# sourceMappingURL=TransportProviderRegistry.js.map