import { IMessage } from "../Interfaces/IMessage";
import { ITransportProvider } from "../Interfaces/ITransportProvider";
import { injectable, unmanaged } from "inversify";

@injectable()
export class HttpTransport implements ITransportProvider {
  public readonly name = "HttpTransport";
  public readonly endpoint: string;
  public readonly readyState = 1; // Always "open" for HTTP

  constructor(@unmanaged() endpoint?: string) {
    // Can be set via constructor, or provided per-request
    this.endpoint = endpoint || "/api/message"; // Default fallback, change as needed
  }

  // --- ITransportProvider Methods ---

  /**
   * Broadcast a message (typically posts to an endpoint)
   */
  async sendBroadcast(msg: IMessage): Promise<void> {
    await this.send(this.endpoint, msg);
  }

  /**
   * Send to a specific endpoint (if provided) or the default
   */
  async send<TResponse = any>(endpointOrMsg: string | IMessage, payloadMaybe?: any): Promise<TResponse> {
    let url: string;
    let payload: any;
    if (typeof endpointOrMsg === "string") {
      url = endpointOrMsg || this.endpoint;
      payload = payloadMaybe;
    } else {
      url = this.endpoint;
      payload = endpointOrMsg;
    }
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    // Attempt to parse JSON, else return undefined
    try {
      return await response.json();
    } catch {
      return undefined as unknown as TResponse;
    }
  }

  /**
   * Request/reply pattern using HTTP POST (optionally with a timeout)
   */
  async sendRequest<T = any>(msg: IMessage, timeout = 8000): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(msg),
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      return await response.json();
    } catch (e) {
      clearTimeout(timer);
      throw e;
    }
  }

  /**
   * No-op: HTTP is stateless, but for compatibility
   */
  async connect(): Promise<void> { /* no-op */ }
  async disconnect(): Promise<void> { /* no-op */ }

  // onMessage is not meaningful for HTTP, but provide for interface compliance
  onMessage?(cb: (msg: any) => void): void {
    // Not supported in HTTP (stateless/polling model)
    // Optionally, throw or ignore
  }
}
