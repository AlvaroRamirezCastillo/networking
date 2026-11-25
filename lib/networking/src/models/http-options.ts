import type { HttpHeaders } from './http-headers';
import type { HttpParams } from './http-params';
import type { HttpResponseType } from './http-response-type';

export interface HttpOptions {
  headers?: HttpHeaders;
  params?: HttpParams;
  responseType?: HttpResponseType;
  signal?: AbortSignal;
}
