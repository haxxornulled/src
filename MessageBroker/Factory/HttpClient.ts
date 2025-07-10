import { injectable } from "inversify";
import { IHttpClient } from "../Interfaces/IHttpClient";
import { HttpClientConfig } from "../Interfaces/IHttpClientFactory";

@injectable()
export class HttpClient implements IHttpClient {
  constructor(private config: HttpClientConfig = {}) {}

  private async applyInterceptors(input: RequestInfo, init: RequestInit = {}) {
    let req: [RequestInfo, RequestInit?] = [input, init];
    if (this.config.interceptors) {
      for (const interceptor of this.config.interceptors) {
        req = await interceptor(req[0], req[1]);
      }
    }
    return req;
  }

  private async handleResponse(response: Response) {
    let res = response;
    if (this.config.responseInterceptors) {
      for (const interceptor of this.config.responseInterceptors) {
        res = await interceptor(res);
      }
    }
    return res;
  }

  private async request<T>(method: string, url: string, data?: any, options?: RequestInit): Promise<T> {
    let finalUrl = url;
    let headers: Record<string, string> = { ...this.config.defaultHeaders, ...(options?.headers as Record<string, string> || {}) };
    let init: RequestInit = { method, ...options, headers };

    if (this.config.baseUrl && !/^https?:\/\//.test(url)) {
      finalUrl = this.config.baseUrl.replace(/\/+$/, "") + "/" + url.replace(/^\/+/, "");
    }

    if (data !== undefined && method !== "GET" && method !== "HEAD") {
      init.body = typeof data === "string" ? data : JSON.stringify(data);
      if (!headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
      }
    }

    const [interceptedRequestInfo, interceptedInit] = await this.applyInterceptors(finalUrl, init);

    let response: Response;
    if (typeof interceptedRequestInfo === "string") {
      response = await fetch(interceptedRequestInfo, interceptedInit);
    } else {
      response = await fetch(interceptedRequestInfo);
    }
    const handledResponse = await this.handleResponse(response);

    if (!handledResponse.ok) {
      throw new Error(`[HttpClient] Request failed: ${handledResponse.status} ${handledResponse.statusText}`);
    }

    const ct = handledResponse.headers.get("content-type");
    if (ct && ct.includes("application/json")) {
      return handledResponse.json() as Promise<T>;
    }
    return handledResponse.text() as unknown as T;
  }

  get<T = any>(url: string, options?: RequestInit): Promise<T> {
    return this.request<T>("GET", url, undefined, options);
  }
  post<T = any>(url: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>("POST", url, data, options);
  }
  put<T = any>(url: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>("PUT", url, data, options);
  }
  delete<T = any>(url: string, options?: RequestInit): Promise<T> {
    return this.request<T>("DELETE", url, undefined, options);
  }

  /**
   * Sends a POST request to the endpoint (or relative path if baseUrl is set).
   */
  async send<TResponse = any>(endpoint: string, payload: any): Promise<TResponse> {
    return this.post<TResponse>(endpoint, payload);
  }
}