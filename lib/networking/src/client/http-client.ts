import type { HttpOptions } from '../models/http-options';
import type { HttpRequest } from '../models/http-request';
import type { HttpResponse } from '../models/http-response';

export interface HttpClient {
  request<T>(request: HttpRequest): Promise<HttpResponse<T>>;
  get<T>(url: string, options?: HttpOptions): Promise<T>;
  post<T>(url: string, body: unknown, options?: HttpOptions): Promise<T>;
  put<T>(url: string, body: unknown, options?: HttpOptions): Promise<T>;
  patch<T>(url: string, body: unknown, options?: HttpOptions): Promise<T>;
  delete<T>(url: string, options?: HttpOptions): Promise<T>;
  head<T>(url: string, options?: HttpOptions): Promise<T>;
  options<T>(url: string, options?: HttpOptions): Promise<T>;
}
