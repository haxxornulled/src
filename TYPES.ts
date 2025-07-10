import { IMessage } from "./MessageBroker/Interfaces/IMessage";
import { IWebSocketTransport } from "./MessageBroker/Interfaces/IWebSocketTransport";



// Basic handler types
export type MessageHandler = (msg: IMessage) => void;
export type MessageFilter = (msg: IMessage) => boolean;
export type MessageCallback = (msg: string, ws: IWebSocketTransport) => void;
export type OpenCallback = (ws: IWebSocketTransport) => void;
export type CloseCallback = (event: CloseEvent, ws: IWebSocketTransport) => void;





