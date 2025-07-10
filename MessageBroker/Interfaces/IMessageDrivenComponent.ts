

import { Subscriber } from "../Subscriber";
import { IMessage } from "./IMessage";

export interface IMessageDrivenComponent {
  readonly id: string;
  readonly universal: boolean;
  subscribers: readonly Subscriber[];
  handleMessage(msg: IMessage): void | Promise<void>;
}