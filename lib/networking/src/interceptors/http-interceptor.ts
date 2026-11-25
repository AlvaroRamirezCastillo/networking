import { HttpRequest } from '../models/http-request';
import { HttpResponse } from '../models/http-response';
import { HttpHandler } from '../pipeline/http-handler';

export type HttpInterceptor = (
  request: HttpRequest,
  next: HttpHandler
) => Promise<HttpResponse>;
