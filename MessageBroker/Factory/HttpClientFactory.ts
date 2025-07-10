import { injectable } from "inversify";
import { HttpClientConfig, IHttpClientFactory } from "../Interfaces/IHttpClientFactory";
import { IHttpClient } from "../Interfaces/IHttpClient";
import { HttpClient } from "./HttpClient";

@injectable()
export class HttpClientFactory implements IHttpClientFactory {
  create(config?: HttpClientConfig, transport?: IHttpClient): IHttpClient {
    if (!transport) {
      transport = new HttpClient(config || {});
    }
    return new HttpClient({
      baseUrl: config?.baseUrl,
      defaultHeaders: config?.defaultHeaders,
      interceptors: config?.interceptors,
      responseInterceptors: config?.responseInterceptors
    });
  }
  
}