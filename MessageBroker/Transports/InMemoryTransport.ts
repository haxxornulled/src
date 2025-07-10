import { IMessage } from "../Interfaces/IMessage";
import { ITransportProvider } from "../Interfaces/ITransportProvider";


// Simple UUID (or use your preferred method)
function uuidv4(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Enhanced in-memory pub/sub transport with request/reply support.
 */
export class InMemoryTransport implements ITransportProvider {
  public readonly name = "InMemoryTransport";
  public readonly endpoint = "local";
  public readonly readyState = 1;

  // static event bus for all instances in same JS runtime
  private static globalListeners: Set<(msg: IMessage) => void> = new Set();

  // --- Request/Reply support ---
  private static pendingReplies: Map<string, (msg: IMessage) => void> = new Map();

  private onMessageHandler?: (msg: IMessage) => void;

  onMessage(cb: (msg: IMessage) => void): void {
    this.onMessageHandler = cb;
    InMemoryTransport.globalListeners.add(cb);
  }

  async disconnect(): Promise<void> {
    if (this.onMessageHandler) {
      InMemoryTransport.globalListeners.delete(this.onMessageHandler);
      this.onMessageHandler = undefined;
    }
  }

  async connect(): Promise<void> {
    // no-op for in-memory
  }

  async sendBroadcast(msg: IMessage): Promise<void> {
    // Broadcast to all listeners
    InMemoryTransport.globalListeners.forEach(cb => {
      try {
        cb(msg);
      } catch (err) {
        // Handle/log errors as needed
      }
    });
  }

  async send<TResponse = any>(endpoint: string, payload: any): Promise<TResponse> {
    await this.sendBroadcast(payload as IMessage);
    return undefined as unknown as TResponse;
  }

  /** Request/reply with correlationId */
  async sendRequest<T = any>(msg: IMessage, timeout = 8000): Promise<T> {
    if (!msg.id) msg.id = uuidv4();
    msg._isRequest = true;

    // Set up a promise that will be resolved by the reply
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        InMemoryTransport.pendingReplies.delete(msg.id!);
        reject(new Error("Request timed out: " + msg.id));
      }, timeout);

      InMemoryTransport.pendingReplies.set(msg.id!, (reply: IMessage) => {
        clearTimeout(timer);
        InMemoryTransport.pendingReplies.delete(msg.id!);
        resolve(reply as T);
      });

      // Send the message to all listeners (including self, for testing)
      this.sendBroadcast(msg);
    });
  }

  // How a consumer should reply to a request (for demo purposes)
  static replyToRequest(requestMsg: IMessage, replyPayload: any) {
    // Form a reply message, keeping the same ID (correlation)
    const reply: IMessage = {
      ...replyPayload,
      id: requestMsg.id,
      _isReply: true
    };
    // Synchronously resolve any awaiting promise
    const pending = InMemoryTransport.pendingReplies.get(requestMsg.id!);
    if (pending) {
      pending(reply);
    }
  }
}
