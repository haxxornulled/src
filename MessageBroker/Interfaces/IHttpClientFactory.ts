// Add the following import or type definition as appropriate for your project
// import { HttpClientConfig } from './HttpClientConfig'; 

import { IHttpClient } from "./IHttpClient";

export type HttpInterceptor = (input: RequestInfo, init?: RequestInit) => Promise<[RequestInfo, RequestInit?]>;
export type ResponseInterceptor = (response: Response) => Promise<Response>;

export interface HttpClientConfig {
  baseUrl?: string;
  defaultHeaders?: Record<string, string>;
  interceptors?: Array<(input: RequestInfo, init?: RequestInit) => Promise<[RequestInfo, RequestInit?]>>;
  responseInterceptors?: Array<(res: Response) => Promise<Response>>;
}


export interface IHttpClientFactory {
  create(config?: HttpClientConfig, transport?: IHttpClient): IHttpClient;
}