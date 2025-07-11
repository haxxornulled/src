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
import ContainerTypes from "../DI/ContainerTypes";
import { inject, injectable } from 'inversify';
let UIBinder = class UIBinder {
    constructor(broker) {
        this.broker = broker;
        broker.subscribe((msg) => this.handleMessage(msg), (msg) => msg.type === "FieldValidationResult" ||
            msg.type === "StatusMessage" ||
            msg.type === "ErrorMessage");
    }
    handleMessage(msg) {
        if (!msg?.payload)
            return;
        // Prefer explicit 'name', else 'field'
        const field = msg.payload.name ?? msg.payload.field;
        const { formId, formName } = msg.payload;
        if (!field)
            return;
        // Defensive: Ensure there's always a selector match
        const el = this.findMsgEl(formId, formName, field);
        if (!el)
            return;
        if (msg.type === "FieldValidationResult" && msg.payload.result) {
            const result = msg.payload.result;
            if (typeof result.valid === "boolean") {
                if (!result.valid) {
                    this.showFieldMessage(el, result.message || "Invalid value", "error");
                }
                else {
                    this.clearField(el);
                }
            }
        }
        else if ((msg.type === "StatusMessage" || msg.type === "ErrorMessage") &&
            msg.payload.message) {
            const level = msg.type === "ErrorMessage"
                ? "error"
                : msg.payload.level || "info";
            this.showFieldMessage(el, msg.payload.message, level);
        }
    }
    findMsgEl(formId, formName, field) {
        // Support for field names with [] for array fields (checkbox groups)
        const baseField = field.replace(/\[\]$/, "");
        // First try to find elements with data-valmsg-for (standard approach)
        if (formId) {
            const form = document.getElementById(formId);
            if (form) {
                const valmsgEl = form.querySelector(`[data-valmsg-for="${baseField}"]`);
                if (valmsgEl)
                    return valmsgEl;
            }
        }
        if (formName) {
            const form = document.querySelector(`form[name="${formName}"]`);
            if (form) {
                const valmsgEl = form.querySelector(`[data-valmsg-for="${baseField}"]`);
                if (valmsgEl)
                    return valmsgEl;
            }
        }
        // Fallback: Look for elements with id pattern like "fieldname-error" or "fieldname-success"
        const errorEl = document.getElementById(`${baseField}-error`);
        const successEl = document.getElementById(`${baseField}-success`);
        // Return error element if it exists, otherwise success element
        return errorEl || successEl;
    }
    showFieldMessage(el, message, level) {
        // Get the field name from the element id (e.g., "email-error" -> "email")
        const fieldName = el.id?.replace(/-error$|-success$/, '');
        if (!fieldName) {
            // Fallback to original behavior
            el.innerHTML = `<span class="toast toast-${level}" aria-live="polite">${message}</span>`;
            el.setAttribute("role", "alert");
            el.setAttribute("aria-live", "polite");
            el.setAttribute("aria-atomic", "true");
            el.setAttribute("data-valmsg-active", level);
            return;
        }
        // Find the corresponding error and success elements
        const errorEl = document.getElementById(`${fieldName}-error`);
        const successEl = document.getElementById(`${fieldName}-success`);
        const fieldEl = document.querySelector(`[name="${fieldName}"]`);
        // Clear both containers first
        if (errorEl) {
            errorEl.innerHTML = '';
            errorEl.style.display = 'none';
        }
        if (successEl) {
            successEl.innerHTML = '';
            successEl.style.display = 'none';
        }
        // Show message in appropriate container
        if (level === 'error' && errorEl) {
            errorEl.innerHTML = message;
            errorEl.style.display = 'block';
            errorEl.setAttribute("role", "alert");
            errorEl.setAttribute("aria-live", "polite");
            // Add error class to field
            if (fieldEl) {
                fieldEl.classList.add('validation-error');
                fieldEl.classList.remove('validation-success');
            }
        }
        else if (level === 'success' && successEl) {
            successEl.innerHTML = message;
            successEl.style.display = 'block';
            successEl.setAttribute("role", "alert");
            successEl.setAttribute("aria-live", "polite");
            // Add success class to field
            if (fieldEl) {
                fieldEl.classList.add('validation-success');
                fieldEl.classList.remove('validation-error');
            }
        }
    }
    clearField(el) {
        // Get the field name from the element id (e.g., "email-error" -> "email")
        const fieldName = el.id?.replace(/-error$|-success$/, '');
        if (!fieldName) {
            // Fallback to original behavior
            el.innerHTML = "";
            el.removeAttribute("role");
            el.removeAttribute("aria-live");
            el.removeAttribute("aria-atomic");
            el.removeAttribute("data-valmsg-active");
            el.classList.remove("fade-out-toast");
            return;
        }
        // Clear both error and success containers
        const errorEl = document.getElementById(`${fieldName}-error`);
        const successEl = document.getElementById(`${fieldName}-success`);
        const fieldEl = document.querySelector(`[name="${fieldName}"]`);
        if (errorEl) {
            errorEl.innerHTML = '';
            errorEl.style.display = 'none';
            errorEl.removeAttribute("role");
            errorEl.removeAttribute("aria-live");
        }
        if (successEl) {
            successEl.innerHTML = '';
            successEl.style.display = 'none';
            successEl.removeAttribute("role");
            successEl.removeAttribute("aria-live");
        }
        // Remove validation classes from field
        if (fieldEl) {
            fieldEl.classList.remove('validation-error', 'validation-success');
        }
    }
};
UIBinder = __decorate([
    injectable(),
    __param(0, inject(ContainerTypes.MessageBroker)),
    __metadata("design:paramtypes", [Object])
], UIBinder);
export { UIBinder };
//# sourceMappingURL=UIBinder.js.map