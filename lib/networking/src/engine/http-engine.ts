import { HttpRequest } from '../models/http-request';
import { HttpResponse } from '../models/http-response';

export interface HttpEngine {
  execute(request: HttpRequest): Promise<HttpResponse>;
}
