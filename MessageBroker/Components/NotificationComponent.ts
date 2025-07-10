import ContainerTypes from "../ContainerTypes";
import { IMessage } from "../Interfaces/IMessage";
import { IMessageBroker } from "../Interfaces/IMessageBroker";
import { IMessageFilterRegistry } from "../Interfaces/IMessageFilterRegistry";
import { MessageDrivenComponent } from "./MessageDrivenComponent";
import { inject, injectable, optional } from 'inversify';

/**
 * Example: A component that listens for "notification" messages.
 */
@injectable()
export class NotificationComponent extends MessageDrivenComponent {
  public receivedNotifications: IMessage[] = [];

  /**
   * You can inject broker and (optionally) registry, or supply a custom filter.
   */
  constructor(
    @inject(ContainerTypes.MessageBroker) broker: IMessageBroker,
    @inject(ContainerTypes.MessageFilterRegistry) @optional()
    filterRegistry?: IMessageFilterRegistry
  ) {
    // Use the filter registry if provided, or use a direct filter
    // You can also supply a direct filter as the last argument:
    // super(broker, undefined, filterRegistry, false, (msg) => msg.type === "notification");
    super(broker, undefined, filterRegistry);
  }

  /**
   * Handles messages that match the filter.
   */
  async handleMessage(msg: IMessage): Promise<void> {
    if (msg.type === "notification") {
      this.receivedNotifications.push(msg);
      // Replace this with your UI logic or state update
      console.log(`[NotificationComponent] Received notification:`, msg);
    }
  }
}