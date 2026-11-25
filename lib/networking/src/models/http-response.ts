import type { HttpHeaders } from './http-headers';

export interface HttpResponse<T = unknown> {
  status: number;
  statusText?: string;
  headers: HttpHeaders;
  body: T;
  url?: string;
}
