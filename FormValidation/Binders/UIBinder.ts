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

    // First try to find elements with data-valmsg-for (standard approach)
    if (formId) {
      const form = document.getElementById(formId);
      if (form) {
        const valmsgEl = form.querySelector(`[data-valmsg-for="${baseField}"]`);
        if (valmsgEl) return valmsgEl;
      }
    }
    if (formName) {
      const form = document.querySelector(`form[name="${formName}"]`);
      if (form) {
        const valmsgEl = form.querySelector(`[data-valmsg-for="${baseField}"]`);
        if (valmsgEl) return valmsgEl;
      }
    }
    
    // Fallback: Look for elements with id pattern like "fieldname-error" or "fieldname-success"
    const errorEl = document.getElementById(`${baseField}-error`);
    const successEl = document.getElementById(`${baseField}-success`);
    
    // Return error element if it exists, otherwise success element
    return errorEl || successEl;
  }

  showFieldMessage(
    el: Element,
    message: string,
    level: "info" | "success" | "error"
  ) {
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
    const fieldEl = document.querySelector(`[name="${fieldName}"]`) as HTMLElement;
    
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
    } else if (level === 'success' && successEl) {
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

  clearField(el: Element) {
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
    const fieldEl = document.querySelector(`[name="${fieldName}"]`) as HTMLElement;
    
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
}

