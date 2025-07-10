import { injectable } from "inversify";

import { ITransportProvider } from "../Interfaces/ITransportProvider";
import { ITransportProviderRegistry } from "../Interfaces/ITransportProviderRegistry";

@injectable()
export class TransportProviderRegistry implements ITransportProviderRegistry {
  private providers = new Map<string, ITransportProvider>();

  /** Register (or override) a provider by name */
  register(name: string, provider: ITransportProvider): void {
    if (!name || typeof name !== "string" || !name.trim()) {
      throw new Error("Provider name must be a non-empty string");
    }
    if (!provider) throw new Error("Provider instance is required");
    this.providers.set(name, provider);
  }

  /** Retrieve a provider by name, or undefined */
  get(name: string): ITransportProvider | undefined {
    return this.providers.get(name);
  }

  /** Remove a provider by name */
  unregister(name: string): void {
    this.providers.delete(name);
  }

  /** Check if a provider exists */
  has(name: string): boolean {
    return this.providers.has(name);
  }

  /** List all registered provider names */
  list(): string[] {
    return Array.from(this.providers.keys());
  }

  /** Remove all providers from the registry */
  clear(): void {
    this.providers.clear();
  }
}
