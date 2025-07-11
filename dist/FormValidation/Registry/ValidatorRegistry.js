var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { injectable } from "inversify";
let ValidatorRegistry = class ValidatorRegistry {
    constructor() {
        this.validators = new Map();
    }
    register(type, validator) {
        this.validators.set(type, validator);
    }
    getValidator(type) {
        const validator = this.validators.get(type);
        console.log(`[ValidatorRegistry] getValidator('${type}') =>`, validator ? 'FOUND' : 'NOT FOUND');
        return validator;
    }
    unregister(type) {
        this.validators.delete(type);
    }
    listValidators() {
        return Array.from(this.validators.keys());
    }
    clear() {
        this.validators.clear();
    }
};
ValidatorRegistry = __decorate([
    injectable()
], ValidatorRegistry);
export { ValidatorRegistry };
//# sourceMappingURL=ValidatorRegistry.js.map