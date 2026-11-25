import { HttpRequest } from '../models/http-request';
import { HttpHandler } from '../pipeline/http-handler';
import { HttpFeature } from './http-feature';

const loggingStep = async (request: HttpRequest, next: HttpHandler) => {
  console.log('antes', request);

  const response = await next(request);

  console.log('despues', response);
  return response;
};

export function withLogging(): HttpFeature {
  return {
    install(builder) {
      builder.register('policy', loggingStep);
    }
  };
}
