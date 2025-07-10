import { IMessage } from "../../MessageBroker/Interfaces/IMessage";
import { IMessageBroker } from "../../MessageBroker/Interfaces/IMessageBroker";
import ContainerTypes from "../DI/ContainerTypes";
import { UIBinderMsg } from "../Interfaces/IUiBindingMsg";
import { inject, injectable } from 'inversify';

@injectable()
export class UIBinder {
  constructor(@inject(ContainerTypes.MessageBroker) private readonly broker: IMessageBroker) {
    broker.subscribe(
      (msg: IMessage) => this.handleMessage(msg as UIBinderMsg),
      (msg: IMessage) =>
        msg.type === "FieldValidationResult" ||
        msg.type === "StatusMessage" ||
        msg.type === "ErrorMessage"
    );
  }

  handleMessage(msg: UIBinderMsg) {
    if (!msg?.payload) return;

    // Prefer explicit 'name', else 'field'
    const field: string | undefined = msg.payload.name ?? msg.payload.field;
    const { formId, formName } = msg.payload;

    if (!field) return;

    // Defensive: Ensure there's always a selector match
    const el = this.findMsgEl(formId, formName, field);
    if (!el) return;

    if (msg.type === "FieldValidationResult" && msg.payload.result) {
      const result = msg.payload.result;
      if (typeof result.valid === "boolean") {
        if (!result.valid) {
          this.showFieldMessage(el, result.message || "Invalid value", "error");
        } else {
          this.clearField(el);
        }
      }
    } else if (
      (msg.type === "StatusMessage" || msg.type === "ErrorMessage") &&
      msg.payload.message
    ) {
      const level: "info" | "success" | "error" =
        msg.type === "ErrorMessage"
          ? "error"
          : (msg.payload.level as any) || "info";
      this.showFieldMessage(el, msg.payload.message, level);
    }
  }

  private findMsgEl(
    formId: string | undefined,
    formName: string | undefined,
    field: string
  ): Element | null {
    // Support for field names with [] for array fields (checkbox groups)
    const baseField = field.replace(/\[\]$/, "");

    if (formId) {
      const form = document.getElementById(formId);
      if (form) return form.querySelector(`[data-valmsg-for="${baseField}"]`);
    }
    if (formName) {
      const form = document.querySelector(`form[name="${formName}"]`);
      if (form) return form.querySelector(`[data-valmsg-for="${baseField}"]`);
    }
    return document.querySelector(`[data-valmsg-for="${baseField}"]`);
  }

  showFieldMessage(
    el: Element,
    message: string,
    level: "info" | "success" | "error"
  ) {
    el.innerHTML = `<span class="toast toast-${level}" aria-live="polite">${message}</span>`;
    el.setAttribute("role", "alert");
    el.setAttribute("aria-live", "polite");
    el.setAttribute("aria-atomic", "true");
    el.setAttribute("data-valmsg-active", level);

    // Only auto-fade for non-errors (success/info)
    if (level !== "error") {
      void (el as HTMLElement).offsetWidth; // Force reflow to retrigger animation
      el.classList.add("fade-out-toast");
      el.addEventListener(
        "animationend",
        () => this.clearField(el),
        { once: true }
      );
    }
  }

  clearField(el: Element) {
    el.innerHTML = "";
    el.removeAttribute("role");
    el.removeAttribute("aria-live");
    el.removeAttribute("aria-atomic");
    el.removeAttribute("data-valmsg-active");
    el.classList.remove("fade-out-toast");
  }
}

