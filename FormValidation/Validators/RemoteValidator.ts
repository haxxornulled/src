import { inject, injectable } from "inversify";
import { IAsyncValidator } from "../Interfaces/IAsyncValidator";
import { IValidationResult } from "../Interfaces/IValidationResult";
import ContainerTypes from "../DI/ContainerTypes";


import { IRuleDescriptor } from "../Interfaces/IRuleDescriptor";
import { v4 as uuidv4 } from 'uuid';
import { IWebSocketTransport } from "../../MessageBroker/Interfaces/IWebSocketTransport";
import { IMessage } from "../../MessageBroker/Interfaces/IMessage";
import { IHttpClientFactory } from "../../MessageBroker/Interfaces/IHttpClientFactory";




@injectable()

export class RemoteValidator implements IAsyncValidator {
  name = "remote";

  constructor(
    @inject(ContainerTypes.HttpClientFactory)
    private httpClientFactory: IHttpClientFactory,

    @inject(ContainerTypes.WebSocketTransportProvider)
    private webSocketTransportProvider: IWebSocketTransport
  ) {}

  async validate(
    value: any,
    rule: IRuleDescriptor,
    allValues?: Record<string, any>
  ): Promise<IValidationResult> {
    // --- WebSocket Path ---
    if (rule.provider === "WebSocket") {
      const ws = this.webSocketTransportProvider;
      if (!ws)
        return { valid: false, isValid: false, errorMessage: "WebSocket provider missing." };
      if (!rule.endpoint)
        return { valid: false, isValid: false, errorMessage: "No endpoint specified." };
      if (ws.readyState !== WebSocket.OPEN)
        return { valid: false, isValid: false, errorMessage: "WebSocket not connected." };

      const msg: IMessage = {
        type: "RemoteValidationRequest",
        id: uuidv4(),
        payload: {
          endpoint: rule.endpoint,
          data: { value, allValues },
        },
        _remote: false
      };

      try {
        const response = await ws.sendRequest<{ valid: boolean; message?: string }>(msg);

        // Defensive: handle any weird response shapes
        if (typeof response.valid !== "boolean") {
          return {
            valid: false,
            isValid: false,
            errorMessage: "Invalid response from remote validator.",
          };
        }

        return {
          valid: !!response.valid,
          isValid: !!response.valid,
          errorMessage: response.message ?? (response.valid ? "" : "Remote validation failed."),
        };
      } catch (error: any) {
        return {
          valid: false,
          isValid: false,
          errorMessage:
            error?.message ??
            (typeof error === "string" ? error : "Error during WebSocket validation."),
        };
      }
    }

    // --- HTTP fallback path ---
    const httpClient = this.httpClientFactory.create();
    if (!rule.endpoint)
      return { valid: false, isValid: false, errorMessage: "No endpoint specified." };

    try {
      const response = await httpClient.post<{ valid: boolean; message?: string }>(
        rule.endpoint,
        { value, allValues }
      );
      return {
        valid: !!response.valid,
        isValid: !!response.valid,
        errorMessage: response.message ?? (response.valid ? "" : "Remote validation failed."),
      };
    } catch (error: any) {
      return {
        valid: false,
        isValid: false,
        errorMessage:
          error?.message ?? (typeof error === "string" ? error : "HTTP error during validation."),
      };
    }
  }
}



