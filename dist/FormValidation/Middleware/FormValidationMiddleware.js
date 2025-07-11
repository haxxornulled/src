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
import { injectable, inject } from 'inversify';
import ContainerTypes from "../DI/ContainerTypes";
let FormValidationMiddleware = class FormValidationMiddleware {
    constructor(formEventBinder) {
        this.formEventBinder = formEventBinder;
        this.label = "FormValidation";
    }
    /** Scan and bind all forms marked for validation */
    attachToForms() {
        const forms = Array.from(document.querySelectorAll('form[validate]'));
        console.log(`[${this.label}] Attaching to ${forms.length} forms for validation.`);
        if (forms.length === 0) {
            console.warn(`[${this.label}] No forms found with 'validate' attribute.`);
            return;
        }
        forms.forEach(form => this.formEventBinder.bind(form));
    }
    /* Middleware for broker: logs validation-related messages */
    middleware() {
        return (msg, next) => {
            if ([
                "FormSubmit",
                "FieldChanged",
                "FieldBlurred",
                "FieldRemoteValidate",
                "FormSubmitted",
                "FieldValidationResult"
            ].includes(msg.type)) {
                console.log(`[${this.label} Middleware] Intercepted:`, msg);
            }
            next(msg);
        };
    }
};
FormValidationMiddleware = __decorate([
    injectable(),
    __param(0, inject(ContainerTypes.FormEventBinder)),
    __metadata("design:paramtypes", [Object])
], FormValidationMiddleware);
export { FormValidationMiddleware };
//# sourceMappingURL=FormValidationMiddleware.js.map