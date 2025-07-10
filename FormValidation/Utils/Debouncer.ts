import { inject, injectable } from "inversify";

@injectable()
export class Debouncer {
  private timer: number | null = null;

  constructor(private delayMs: number) {}

  run(callback: () => void) {
    if (this.timer) clearTimeout(this.timer);
    this.timer = window.setTimeout(callback, this.delayMs);
  }

  clear() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }
}
