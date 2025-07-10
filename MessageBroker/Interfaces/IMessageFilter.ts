import { IMessage } from "./IMessage";
export interface IMessageFilter {
  matches(message: IMessage): boolean;
}