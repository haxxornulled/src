import { CloseCallback, MessageCallback, MessageHandler, OpenCallback} from "../../TYPES";
import { ErrorCallback } from "../Types";
import { IMessage } from "./IMessage";

/** Promise-based request/reply and pub/sub for app messages over WebSocket. Oh Brother! */
export interface IWebSocketTransport {
  readonly id: string;
  readonly connectionId: string | null;
  readonly readyState: number;
  readonly isOpen: boolean;

  onOpen?: OpenCallback;
  onClose?: CloseCallback;
  onError?:ErrorCallback;
  onRawMessage?: MessageCallback;
  onConnectionIdAssigned?: (connectionId: string) => void;

  connect(): void;
  disconnect(): void;

  subscribe(topicOrType: string, handler: MessageHandler): void;
  unsubscribe(topicOrType: string, handler: MessageHandler): void;
  onAny(handler: MessageHandler): void;

  sendBroadcast(msg: IMessage): Promise<void>;
  sendRequest<T = any>(msg: IMessage, timeout?: number): Promise<T>;
  request(msg: IMessage, timeout?: number): Promise<IMessage>;

  ping(): Promise<number>;
  sendUserMessage(text: string): void;
}
