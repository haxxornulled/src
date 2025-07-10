import { ITransportProvider } from "./ITransportProvider";

export interface ITransportProviderRegistry {
  register(name: string, provider: ITransportProvider): void;
  get(name: string): ITransportProvider | undefined;
  unregister(name: string): void;
  has(name: string): boolean;
  list(): string[];
  clear(): void;
}
