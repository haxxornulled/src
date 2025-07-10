import { IMessageBroker } from "../../MessageBroker/Interfaces/IMessageBroker";
import ContainerTypes from "../DI/ContainerTypes";
import { injectable, inject } from "inversify";
import { IValidatorDispatcher } from "../Interfaces/IValidatorDispatcher";
import { Debouncer } from "../Utils/Debouncer";
import { IMessage } from "../../MessageBroker/Interfaces/IMessage";
import { IFormEventBinder } from "../Interfaces/IFormEventBinder";

@injectable()
export class FormEventBinder implements IFormEventBinder {
  private fieldDebouncers = new Map<string, Debouncer>();
  private fieldHandlerRefs = new WeakMap<Element, Function[]>();
  private mutationObservers = new WeakMap<HTMLFormElement, MutationObserver>();
  private boundForms = new Set<HTMLFormElement>();

  constructor(
    @inject(ContainerTypes.MessageBroker) private broker: IMessageBroker,
    @inject(ContainerTypes.ValidatorDispatcher)
    private dispatcher: IValidatorDispatcher
  ) {}

  public bind(form: HTMLFormElement): void {
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

  public unbind(form: HTMLFormElement): void {
    const observer = this.mutationObservers.get(form);
    if (observer) observer.disconnect();
    this.mutationObservers.delete(form);

    Array.from(form.elements)
      .filter(this.isBindableField)
      .forEach((field) => {
        const handlers = this.fieldHandlerRefs.get(field) || [];
        ["change", "blur"].forEach((evt, idx) => {
          if (handlers[idx])
            field.removeEventListener(evt, handlers[idx] as EventListener);
        });
        this.fieldHandlerRefs.delete(field);
      });

    form.removeEventListener("submit", this.onFormSubmit);
    this.fieldDebouncers.forEach((d) => d.clear());
    this.fieldDebouncers.clear();
    this.boundForms.delete(form);
  }

  public unbindAll(): void {
    for (const form of this.boundForms) {
      const observer = this.mutationObservers.get(form);
      if (observer) observer.disconnect();
      this.unbind(form);
    }
    this.boundForms.clear();
    this.mutationObservers = new WeakMap();
    this.fieldDebouncers.clear();
    this.fieldHandlerRefs = new WeakMap();
  }

  private observeForm(form: HTMLFormElement) {
    const observer = new MutationObserver(() => this.bindFields(form));
    observer.observe(form, { childList: true, subtree: true });
    this.mutationObservers.set(form, observer);
  }

  private bindFields(form: HTMLFormElement) {
    // This can be a good place to publish schema if needed!
    // e.g. const schema = this.buildSchema(form); this.broker.publish({type: "SchemaDetected", ...})

    const fields = Array.from(form.elements).filter(this.isBindableField);
    fields.forEach((field: Element) => {
      if (this.fieldHandlerRefs.has(field)) return;

      const name = (field as HTMLInputElement).name;
      const isRemote = this.hasRemoteRule(field);

      const handler = (evt: Event) => {
        this.handleEvent(evt, isRemote);
      };

      field.addEventListener("change", handler);
      field.addEventListener("blur", handler);
      this.fieldHandlerRefs.set(field, [handler, handler]);
    });
  }

  private handleEvent(evt: Event, isRemote: boolean): void {
    const field = evt.target as
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement;
    if (!field || !field.name) return;

    if (isRemote) {
      let debouncer = this.fieldDebouncers.get(field.name);
      if (!debouncer) {
        debouncer = new Debouncer(350);
        this.fieldDebouncers.set(field.name, debouncer);
      }
      debouncer.run(() => this.onRemoteEvent(evt, field));
    } else {
      this.onLocalEvent(evt, field);
    }
  }

  private onRemoteEvent(
    evt: Event,
    field: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  ) {
    const form = field.form;
    const formId = form?.id || undefined;
    const allValues = this.extractFormValues(form);

    const msg: IMessage = {
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
        allValues,
      },
      _remote: false,
    };
    this.broker.publish(msg);
  }

  private onLocalEvent(
    evt: Event,
    field: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  ) {
    const form = field.form;
    const formId = form?.id || undefined;
    const allValues = this.extractFormValues(form);

    const msg: IMessage = {
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

  private onFormSubmit = async (evt: Event) => {
  evt.preventDefault();
  console.log("FormEventBinder: onFormSubmit called");
  const form = evt.target as HTMLFormElement;
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
    if (!result.valid) allValid = false;
  }

  if (allValid) {
    this.broker.publish({
      type: "FormSubmitted",
      topic: "form",
      from: "FormEventBinder",
      payload: { formId, values },
      _remote: false,
    });
  } else {
    const firstInvalid = results.find((r: any) => !r.result.valid);
    if (firstInvalid) {
      const el = form.querySelector(`[name="${firstInvalid.name}"]`);
      if (el) (el as HTMLElement).focus();
    }
  }
};

  private extractFormValues(form: HTMLFormElement | null): Record<string, any> {
    if (!form) return {};
    const values: Record<string, any> = {};
    Array.from(form.elements)
      .filter(this.isBindableField)
      .forEach((el: any) => {
        if (el.name) values[el.name] = this.getFieldValue(el);
      });
    return values;
  }

  public getFieldValue(field: Element): any {
    if (field instanceof HTMLInputElement) {
      switch (field.type) {
        case "checkbox":
          if (field.form) {
            const checkboxes = field.form.querySelectorAll<HTMLInputElement>(
              `input[type="checkbox"][name="${field.name}"]`
            );
            if (checkboxes.length > 1) {
              return Array.from(checkboxes)
                .filter((cb) => cb.checked)
                .map((cb) => cb.value);
            }
          }
          return field.checked;
        case "radio":
          if (field.form) {
            const checked = field.form.querySelector<HTMLInputElement>(
              `input[type="radio"][name="${field.name}"]:checked`
            );
            return checked ? checked.value : null;
          }
          return field.checked ? field.value : null;
        case "file":
          return field.files ? Array.from(field.files) : null;
        default:
          return field.value;
      }
    } else if (field instanceof HTMLSelectElement) {
      if (field.multiple) {
        return Array.from(field.selectedOptions).map((option) => option.value);
      }
      return field.value;
    } else if (field instanceof HTMLTextAreaElement) {
      return field.value;
    }
    return undefined;
  }

  public hasRemoteRule(field: Element): boolean {
    return !!(
      field instanceof HTMLElement &&
      field.hasAttribute("data-rule-remote") &&
      !!field.getAttribute("data-rule-remote-provider")
    );
  }

  public isBindableField(
    el: Element
  ): el is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement {
    if (
      !(
        el instanceof HTMLInputElement ||
        el instanceof HTMLSelectElement ||
        el instanceof HTMLTextAreaElement
      )
    )
      return false;
    if (!el.name) return false;
    if (el.type === "hidden") return false;
    if (el.name.startsWith("__")) return false;
    if (el.hasAttribute("data-ignore-validation")) return false;
    if (
      (el as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)
        .disabled
    )
      return false;
    return true;
  }
}
