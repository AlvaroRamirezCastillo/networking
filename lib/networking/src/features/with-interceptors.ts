import { HttpInterceptor } from '../interceptors/http-interceptor';
import { HttpFeature } from './http-feature';

export function withInterceptors(
  interceptors: readonly HttpInterceptor[]
): HttpFeature {
  return {
    install(builder) {
      for (const interceptor of interceptors) {
        builder.addInterceptor(interceptor);
      }
    }
  };
}
