export interface IHttpClient {
  get<T = any>(url: string, options?: RequestInit): Promise<T>;
  post<T = any>(url: string, data?: any, options?: RequestInit): Promise<T>;
  put<T = any>(url: string, data?: any, options?: RequestInit): Promise<T>;
  delete<T = any>(url: string, options?: RequestInit): Promise<T>;
  send<TResponse = any>(endpoint: string, payload: any): Promise<TResponse>;
}