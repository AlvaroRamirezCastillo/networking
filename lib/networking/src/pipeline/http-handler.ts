import { HttpRequest } from '../models/http-request';
import { HttpResponse } from '../models/http-response';

export type HttpHandler = (
  request: HttpRequest
) => Promise<HttpResponse>;