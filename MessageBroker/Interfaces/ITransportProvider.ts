import { IMessage } from "./IMessage";

export interface ITransportProvider {
  /**
   * Broadcast a message (to all clients, pub/sub, or global topic).
   */
  sendBroadcast(msg: IMessage): Promise<void>;

  name: string;
  endpoint: string;

  /**
   * Send a message and get a typed response.
   * Endpoint param is used for protocol/route (ignored for in-memory, often used for HTTP).
   */
  send<TResponse = any>(endpoint: string, payload: any): Promise<TResponse>;

  /**
   * Optionally, send a message and expect a reply (request/reply pattern).
   */
  sendRequest?<T = any>(msg: IMessage, timeout?: number): Promise<T>;

  /**
   * Register a callback for incoming messages.
   */
  onMessage?(cb: (msg: any) => void): void;

  /**
   * Connect/start the provider.
   */
  connect?(): Promise<void> | void;

  /**
   * Disconnect/close the provider.
   */
  disconnect?(): Promise<void> | void;

  readonly readyState?: number;
}

