import { MessageFilter, MessageHandler } from "../TYPES";
import { ISubscriber } from "./Interfaces/ISubscriber";


/**
 * Simple Subscriber class for tracking subscriptions.
 * Pass this as the return value from broker.subscribe().
 */
export class Subscriber implements ISubscriber {
  constructor(
    public handler: MessageHandler,
    public filter?: MessageFilter,
    public owner?: any
  ) {}
}