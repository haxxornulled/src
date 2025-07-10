export interface IFormEventBinder {
  /**
   * Bind event handlers to the form and all its relevant fields.
   */
  bind(form: HTMLFormElement): void;

  /**
   * Remove all event handlers and clear all internal state for the given form.
   */
  unbind(form: HTMLFormElement): void;

  /**
   * Remove all handlers and clear state for all bound forms.
   */
  unbindAll(): void;

  /**
   * Get the current value of a form field (input, select, textarea).
   */
  getFieldValue(field: Element): any;

  /**
   * Determine if the given field uses a remote validation rule.
   */
  hasRemoteRule(field: Element): boolean;

  /**
   * Utility: Check if a field is considered "bindable" by this binder.
   */
  isBindableField(el: Element): el is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
}
