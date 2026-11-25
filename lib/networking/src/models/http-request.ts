import type { HttpMethod } from './http-method';
import type { HttpOptions } from './http-options';

export interface HttpRequest extends HttpOptions {
  method: HttpMethod;
  url: string;
  body?: unknown;
}
