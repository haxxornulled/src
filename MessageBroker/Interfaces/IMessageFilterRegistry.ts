import { MessageFilter } from "../Types";

/** Registry interface for named message filters */
export interface IMessageFilterRegistry {
  register(name: string, filter: MessageFilter): void;
  get(name: string): MessageFilter | undefined;
  unregister(name: string): void;
  has(name: string): boolean;
  list(): string[];
  clear(): void; // Added for convenience
}