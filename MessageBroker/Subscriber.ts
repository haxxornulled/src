import { MessageFilter, MessageHandler } from "../TYPES";
import { ISubscriber } from "./Interfaces/ISubscriber";
import { injectable, unmanaged } from "inversify";


/**
 * Simple Subscriber class for tracking subscriptions.
 * Pass this as the return value from broker.subscribe().
 */
@injectable()
export class Subscriber implements ISubscriber {
  constructor(
    @unmanaged() public handler: MessageHandler,
    @unmanaged() public filter?: MessageFilter,
    @unmanaged() public owner?: any
  ) {}
}