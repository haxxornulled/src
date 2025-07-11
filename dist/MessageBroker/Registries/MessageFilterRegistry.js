var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { injectable } from "inversify";
let MessageFilterRegistry = class MessageFilterRegistry {
    constructor() {
        this.filters = new Map();
    }
    /** Register (or override) a named filter */
    register(name, filter) {
        if (!name || typeof name !== "string" || !name.trim()) {
            throw new Error("Filter name must be a non-empty string");
        }
        if (typeof filter !== "function") {
            throw new Error("Filter must be a function");
        }
        this.filters.set(name, filter);
    }
    /** Retrieve a filter by name, or undefined if not found */
    get(name) {
        return this.filters.get(name);
    }
    /** Remove a filter by name */
    unregister(name) {
        this.filters.delete(name);
    }
    /** Check if a filter exists by name */
    has(name) {
        return this.filters.has(name);
    }
    /** List all registered filter names */
    list() {
        return Array.from(this.filters.keys());
    }
    /** Remove all filters from the registry */
    clear() {
        this.filters.clear();
    }
};
MessageFilterRegistry = __decorate([
    injectable()
], MessageFilterRegistry);
export { MessageFilterRegistry };
//# sourceMappingURL=MessageFilterRegistry.js.map