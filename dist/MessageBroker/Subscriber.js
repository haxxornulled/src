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
/**
 * Simple Subscriber class for tracking subscriptions.
 * Pass this as the return value from broker.subscribe().
 */
let Subscriber = class Subscriber {
    constructor(handler, filter, owner) {
        this.handler = handler;
        this.filter = filter;
        this.owner = owner;
    }
};
Subscriber = __decorate([
    injectable(),
    __param(0, unmanaged()),
    __param(1, unmanaged()),
    __param(2, unmanaged()),
    __metadata("design:paramtypes", [Function, Function, Object])
], Subscriber);
export { Subscriber };
//# sourceMappingURL=Subscriber.js.map