import { IMessage } from "./IMessage";
export interface ISubscriber {
  handler: (msg: IMessage) => void | Promise<void>;
  filter?: (msg: IMessage) => boolean;
  owner?: any;
}
