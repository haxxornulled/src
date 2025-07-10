import { injectable } from "inversify";
import { IMessage } from "../Interfaces/IMessage";
import { MessageFilter } from "../Types";
import { IMessageFilterRegistry } from "../Interfaces/IMessageFilterRegistry";


@injectable()
export class MessageFilterRegistry implements IMessageFilterRegistry {
  private filters = new Map<string, MessageFilter>();

  /** Register (or override) a named filter */
  register(name: string, filter: MessageFilter): void {
    if (!name || typeof name !== "string" || !name.trim()) {
      throw new Error("Filter name must be a non-empty string");
    }
    if (typeof filter !== "function") {
      throw new Error("Filter must be a function");
    }
    this.filters.set(name, filter);
  }

  /** Retrieve a filter by name, or undefined if not found */
  get(name: string): MessageFilter | undefined {
    return this.filters.get(name);
  }

  /** Remove a filter by name */
  unregister(name: string): void {
    this.filters.delete(name);
  }

  /** Check if a filter exists by name */
  has(name: string): boolean {
    return this.filters.has(name);
  }

  /** List all registered filter names */
  list(): string[] {
    return Array.from(this.filters.keys());
  }

  /** Remove all filters from the registry */
  clear(): void {
    this.filters.clear();
  }
}
