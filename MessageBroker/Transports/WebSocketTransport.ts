import { IMessage } from "../Interfaces/IMessage";
import {
  CloseCallback,
  MessageCallback,
  MessageHandler,
  OpenCallback,
} from "../../TYPES";
import { v4 as uuidv4 } from "uuid";
import { ErrorCallback } from "../Types";
import { ITransportProvider } from "../Interfaces/ITransportProvider";
import { injectable } from 'inversify';

@injectable()
export class WebSocketTransport implements ITransportProvider {
  public readonly name = "WebSocketTransport";
  public endpoint: string = "";
  public id: string = uuidv4();
  isOpen: boolean = false;
  public get readyState() { return this.ws?.readyState ?? WebSocket.CLOSED; }

  // Internal
  public clientId: string = uuidv4();
  public ws: WebSocket | null = null;
  private _connectionId: string | null = null;
  private isConnecting = false;
  private openPromise!: Promise<void>;
  private openResolve!: () => void;
  private handlers = new Set<MessageHandler>();
  private topicHandlers = new Map<string, Set<MessageHandler>>();
  private pending = new Map<string, (msg: IMessage) => void>();

  // Callbacks
  onOpen?: OpenCallback;
  onClose?: CloseCallback;
  onError?: ErrorCallback;
  onRawMessage?: MessageCallback;
  onConnectionIdAssigned?: (connectionId: string) => void;

  private autoReconnect = true;
  private reconnectDelay = 1000;
  private maxReconnectDelay = 30000;
  private reconnectAttempts = 0;
  private reconnectTimer: any = null;
  private logger: ((msg: string) => void) | null = null;

  constructor() {
    this.resetOpenPromise();
    // No auto-connect! User must call setEndpoint()
    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", () => this.disconnect());
    }
  }

  /** Set (or change) the WebSocket endpoint and (re)connect */
  public setEndpoint(endpoint: string) {
    if (this.endpoint !== endpoint) {
      this.endpoint = endpoint;
      this.connect();
    }
  }

  // Required by interface (async for future compatibility)
  async connect(): Promise<void> {
    if (!this.endpoint) {
      throw new Error("WebSocket endpoint not set. Use setEndpoint() first.");
    }
    if (this.isOpen || this.isConnecting) return;
    this.isConnecting = true;
    if (this.ws) {
      this.log("[WS] Closing old socket before reconnect");
      this.ws.close();
    }
    this.ws = new WebSocket(this.endpoint);
    this.ws.onopen = () => {
      this.isConnecting = false;
      this.openResolve();
      this.onOpen?.(this);
      this.resetOpenPromise();
      this.log("[WS] Connected");
      this.reconnectAttempts = 0;
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
    };
    this.ws.onclose = (evt) => {
      this._connectionId = null;
      this.onClose?.(evt, this);
      this.log("[WS] Disconnected");
      this.rejectAllPending("WebSocket closed");
      if (this.autoReconnect && this.endpoint) this.scheduleReconnect();
    };
    this.ws.onerror = (evt) => {
      const error = new Error("WebSocket error");
      (error as any).event = evt;
      this.onError?.(error, this, evt);
      this.log(`[WS] Error: ${error}`);
      this.rejectAllPending("WebSocket error");
      if (this.autoReconnect && this.endpoint) this.scheduleReconnect();
    };
    this.ws.onmessage = (evt) => {
      this.onRawMessage?.(evt.data, this);
      this.handleIncomingMessage(evt.data);
    };
  }

  async disconnect(): Promise<void> {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.rejectAllPending("WebSocket disconnected");
    }
  }

  async sendBroadcast(msg: IMessage): Promise<void> {
    await this.send(msg.type, msg);
  }

  async send<TResponse = any>(endpoint: string, payload: any): Promise<TResponse> {
    await this.openPromise;
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket not open");
    }
    const msg: IMessage = typeof payload === "object" ? { ...payload } : { type: String(payload) };
    msg.id ??= uuidv4();
    msg.from ??= this.connectionId ?? this.clientId;
    msg.timestamp ??= new Date().toISOString();
    if (this.connectionId) msg.connectionId = this.connectionId;

    this.ws.send(JSON.stringify(msg));
    this.log(`[WS] Sent: ${msg.type} ${msg.topic ?? ""} ${msg.id}`);
    return undefined as unknown as TResponse;
  }

  async sendRequest<T = any>(msg: IMessage, timeout = 8000): Promise<T> {
    return this.request<T>(msg, timeout) as Promise<T>;
  }

  onMessage?(cb: (msg: any) => void): void {
    this.onAny(cb);
  }

  subscribe(topicOrType: string, handler: MessageHandler): void {
    if (!this.topicHandlers.has(topicOrType)) {
      this.topicHandlers.set(topicOrType, new Set());
    }
    this.topicHandlers.get(topicOrType)!.add(handler);
  }
  unsubscribe(topicOrType: string, handler: MessageHandler): void {
    if (this.topicHandlers.has(topicOrType)) {
      this.topicHandlers.get(topicOrType)!.delete(handler);
      if (this.topicHandlers.get(topicOrType)!.size === 0) {
        this.topicHandlers.delete(topicOrType);
      }
    }
  }
  onAny(handler: MessageHandler): void {
    this.handlers.add(handler);
  }

  async ping(): Promise<number> {
    const start = Date.now();
    await this.request({ type: "Ping", _remote: false });
    return Date.now() - start;
  }

  async sendUserMessage(text: string): Promise<void> {
    await this.send(
      "UserMessage",
      {
        type: "UserMessage",
        payload: text,
        _remote: false,
      }
    ).catch((err) => {
      this.log("Failed to send user message: " + err);
    });
  }

  private async sendMsgInternal(msg: IMessage) {
    await this.openPromise;
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket not open");
    }
    this.ws.send(JSON.stringify(msg));
    this.log(`[WS] Sent: ${msg.type} ${msg.topic ?? ""} ${msg.id}`);
  }

  public async request<T = any>(msg: IMessage, timeout = 8000): Promise<IMessage> {
    await this.openPromise;
    msg.id ??= uuidv4();
    msg.from ??= this.connectionId ?? this.clientId;
    msg.timestamp ??= new Date().toISOString();
    if (this.connectionId) msg.connectionId = this.connectionId;

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket not open");
    }
    this.ws.send(JSON.stringify(msg));
    this.log(`[WS] Sent: ${msg.type} ${msg.topic ?? ""} ${msg.id}`);

    return new Promise<IMessage>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(msg.id!);
        this.log(
          `[WS][TIMEOUT] Request timed out for msg.id=${msg.id} type=${msg.type} 
          from=${msg.from} connId=${this.connectionId ?? this.clientId} endpoint=${this.endpoint}`
        );
        reject(new Error(
          `Request timed out (id=${msg.id}, type=${msg.type}, from=${msg.from}, connId=${this.connectionId ?? this.clientId}, endpoint=${this.endpoint})`
        ));
      }, timeout);

      this.pending.set(msg.id!, (reply) => {
        clearTimeout(timer);
        this.pending.delete(msg.id!);
        resolve(reply);
      });
    });
  }

  private handleIncomingMessage(data: string) {
    let msg: IMessage;
    try {
      msg = JSON.parse(data);
    } catch {
      this.log("Malformed message: " + data);
      return;
    }
    if (msg.type === "ConnectionId" && msg.id) {
      this._connectionId = msg.id;
      this.onConnectionIdAssigned?.(msg.id);
      this.log(`[WS] Assigned connectionId: ${this._connectionId}`);
    }
    if (msg.id && this.pending.has(msg.id)) {
      this.pending.get(msg.id)!(msg);
    }
    if (msg.topic && this.topicHandlers.has(msg.topic)) {
      this.topicHandlers.get(msg.topic)!.forEach((handler) => handler(msg));
    }
    this.handlers.forEach((handler) => handler(msg));
    this.log(
      `[WS] Received: ${msg.type} ${msg.topic ?? ""} ${msg.id ?? ""}`
    );
  }

  private rejectAllPending(reason: string) {
    for (const [id, cb] of this.pending.entries()) {
      cb({ type: "Error", error: reason, id } as any);
    }
    this.pending.clear();
  }
  private resetOpenPromise() {
    this.openPromise = new Promise((res) => (this.openResolve = res));
  }
  private log(msg: string) {
    if (this.logger) {
      this.logger(msg);
    } else if (
      typeof window !== "undefined" &&
      window.console
    ) {
      console.log(`%c${msg}`);
    } else {
      console.log(msg);
    }
  }
  private scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      this.maxReconnectDelay
    );
    this.log(
      `[WS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`
    );
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  get connectionId(): string | null {
    return this._connectionId;
  }
}

