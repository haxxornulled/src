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
import { injectable, inject } from "inversify";
import { Debouncer } from "../Utils/Debouncer";
let FormEventBinder = class FormEventBinder {
    constructor(broker, dispatcher) {
        this.broker = broker;
        this.dispatcher = dispatcher;
        this.fieldDebouncers = new Map();
        this.fieldHandlerRefs = new WeakMap();
        this.mutationObservers = new WeakMap();
        this.boundForms = new Set();
        this.onFormSubmit = async (evt) => {
            evt.preventDefault();
            console.log("FormEventBinder: onFormSubmit called");
            const form = evt.target;
            const formId = form.id || "";
            const values = this.extractFormValues(form);
            // Optional: Announce the submit
            this.broker.publish({
                type: "FormSubmit",
                topic: "form",
                from: "FormEventBinder",
                payload: { formId, values },
                _remote: false,
            });
            // *** VALIDATE ALL FIELDS ***
            const results = await this.dispatcher.validateAllFields(formId, values, form);
            let allValid = true;
            for (const { name, result } of results) {
                // This is the key line: always publish the result for each field!
                this.broker.publish({
                    type: "FieldValidationResult",
                    topic: "form",
                    from: "FormEventBinder",
                    payload: { formId, name, result },
                    _remote: false,
                });
                if (!result.valid)
                    allValid = false;
            }
            if (allValid) {
                this.broker.publish({
                    type: "FormSubmitted",
                    topic: "form",
                    from: "FormEventBinder",
                    payload: { formId, values },
                    _remote: false,
                });
            }
            else {
                const firstInvalid = results.find((r) => !r.result.valid);
                if (firstInvalid) {
                    const el = form.querySelector(`[name="${firstInvalid.name}"]`);
                    if (el)
                        el.focus();
                }
            }
        };
    }
    bind(form) {
        this.bindFields(form);
        this.observeForm(form);
        form.addEventListener("submit", this.onFormSubmit);
        this.boundForms.add(form);
        this.broker.publish({
            type: "KeepAliveRequest",
            topic: "transport",
            payload: { formId: form.id },
            _remote: false,
        });
    }
    unbind(form) {
        const observer = this.mutationObservers.get(form);
        if (observer)
            observer.disconnect();
        this.mutationObservers.delete(form);
        Array.from(form.elements)
            .filter(this.isBindableField)
            .forEach((field) => {
            const handlers = this.fieldHandlerRefs.get(field) || [];
            ["change", "blur"].forEach((evt, idx) => {
                if (handlers[idx])
                    field.removeEventListener(evt, handlers[idx]);
            });
            this.fieldHandlerRefs.delete(field);
        });
        form.removeEventListener("submit", this.onFormSubmit);
        this.fieldDebouncers.forEach((d) => d.clear());
        this.fieldDebouncers.clear();
        this.boundForms.delete(form);
    }
    unbindAll() {
        for (const form of this.boundForms) {
            const observer = this.mutationObservers.get(form);
            if (observer)
                observer.disconnect();
            this.unbind(form);
        }
        this.boundForms.clear();
        this.mutationObservers = new WeakMap();
        this.fieldDebouncers.clear();
        this.fieldHandlerRefs = new WeakMap();
    }
    observeForm(form) {
        const observer = new MutationObserver(() => this.bindFields(form));
        observer.observe(form, { childList: true, subtree: true });
        this.mutationObservers.set(form, observer);
    }
    bindFields(form) {
        // This can be a good place to publish schema if needed!
        // e.g. const schema = this.buildSchema(form); this.broker.publish({type: "SchemaDetected", ...})
        const fields = Array.from(form.elements).filter(this.isBindableField);
        fields.forEach((field) => {
            if (this.fieldHandlerRefs.has(field))
                return;
            const name = field.name;
            const isRemote = this.hasRemoteRule(field);
            const handler = (evt) => {
                this.handleEvent(evt, isRemote);
            };
            field.addEventListener("change", handler);
            field.addEventListener("blur", handler);
            this.fieldHandlerRefs.set(field, [handler, handler]);
        });
    }
    handleEvent(evt, isRemote) {
        const field = evt.target;
        if (!field || !field.name)
            return;
        if (isRemote) {
            let debouncer = this.fieldDebouncers.get(field.name);
            if (!debouncer) {
                debouncer = new Debouncer(350);
                this.fieldDebouncers.set(field.name, debouncer);
            }
            debouncer.run(() => this.onRemoteEvent(evt, field));
        }
        else {
            this.onLocalEvent(evt, field);
        }
    }
    onRemoteEvent(evt, field) {
        const form = field.form;
        const formId = form?.id || undefined;
        const allValues = this.extractFormValues(form);
        const msg = {
            type: "FieldRemoteValidate",
            topic: "form",
            payload: {
                formId,
                name: field.name,
                value: this.getFieldValue(field),
                fieldType: field.type,
                remoteType: field.getAttribute("data-rule-remote"),
                provider: field.getAttribute("data-rule-remote-provider"),
                endpoint: field.getAttribute("data-rule-remote-endpoint"),
                fieldName: field.name, // Add field name for configuration lookup
                allValues,
            },
            _remote: false,
        };
        this.broker.publish(msg);
    }
    onLocalEvent(evt, field) {
        const form = field.form;
        const formId = form?.id || undefined;
        const allValues = this.extractFormValues(form);
        const msg = {
            type: evt.type === "blur" ? "FieldBlurred" : "FieldChanged",
            topic: "form",
            payload: {
                formId,
                name: field.name,
                value: this.getFieldValue(field),
                fieldType: field.type,
                allValues,
            },
            _remote: false,
        };
        this.broker.publish(msg);
    }
    extractFormValues(form) {
        if (!form)
            return {};
        const values = {};
        Array.from(form.elements)
            .filter(this.isBindableField)
            .forEach((el) => {
            const value = this.getFieldValue(el);
            // Map by name
            if (el.name)
                values[el.name] = value;
            // Map by id if present and different from name
            if (el.id && el.id !== el.name)
                values[el.id] = value;
        });
        // This ensures validators can reference fields by either name or id
        return values;
    }
    getFieldValue(field) {
        if (field instanceof HTMLInputElement) {
            switch (field.type) {
                case "checkbox":
                    if (field.form) {
                        const checkboxes = field.form.querySelectorAll(`input[type="checkbox"][name="${field.name}"]`);
                        if (checkboxes.length > 1) {
                            return Array.from(checkboxes)
                                .filter((cb) => cb.checked)
                                .map((cb) => cb.value);
                        }
                    }
                    return field.checked;
                case "radio":
                    if (field.form) {
                        const checked = field.form.querySelector(`input[type="radio"][name="${field.name}"]:checked`);
                        return checked ? checked.value : null;
                    }
                    return field.checked ? field.value : null;
                case "file":
                    return field.files ? Array.from(field.files) : null;
                default:
                    return field.value;
            }
        }
        else if (field instanceof HTMLSelectElement) {
            if (field.multiple) {
                return Array.from(field.selectedOptions).map((option) => option.value);
            }
            return field.value;
        }
        else if (field instanceof HTMLTextAreaElement) {
            return field.value;
        }
        return undefined;
    }
    hasRemoteRule(field) {
        return !!(field instanceof HTMLElement &&
            field.hasAttribute("data-rule-remote") &&
            !!field.getAttribute("data-rule-remote-provider"));
    }
    isBindableField(el) {
        if (!(el instanceof HTMLInputElement ||
            el instanceof HTMLSelectElement ||
            el instanceof HTMLTextAreaElement))
            return false;
        if (!el.name)
            return false;
        if (el.type === "hidden")
            return false;
        if (el.name.startsWith("__"))
            return false;
        if (el.hasAttribute("data-ignore-validation"))
            return false;
        if (el
            .disabled)
            return false;
        return true;
    }
};
FormEventBinder = __decorate([
    injectable(),
    __param(0, inject(ContainerTypes.MessageBroker)),
    __param(1, inject(ContainerTypes.ValidatorDispatcher)),
    __metadata("design:paramtypes", [Object, Object])
], FormEventBinder);
export { FormEventBinder };
//# sourceMappingURL=FormEventBinder.js.map