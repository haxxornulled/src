import { IMessage } from "./Interfaces/IMessage";
import { IWebSocketTransport } from "./Interfaces/IWebSocketTransport";
import { Subscriber } from "./Subscriber";

export type BrokerErrorHandler = (
  err: any,
  msg: IMessage,
  subscriber?: Subscriber
) => void;
export type MessageFilter = (msg: IMessage) => boolean;

export type ErrorCallback = (err: Error, ws?: IWebSocketTransport, event?: any) => void;
