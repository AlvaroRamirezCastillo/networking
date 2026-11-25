import { HttpRequest } from '../models/http-request';
import { HttpResponse } from '../models/http-response';
import { HttpHandler } from './http-handler';

export type HttpPipelineStep = (
  request: HttpRequest,
  next: HttpHandler
) => Promise<HttpResponse>;
