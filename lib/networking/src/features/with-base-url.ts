import type { HttpFeature } from './http-feature';

export function withBaseUrl(
  baseUrl: string
): HttpFeature {
  return {
    install(builder) {
      if (!baseUrl) {
        return;
      }

      const prefix = baseUrl.replace(/\/+$/, '');

      builder.register('prepare', (request, next) => {
        const url = /^[a-z][a-z\d+.-]*:/i.test(request.url)
          ? request.url
          : `${prefix}/${request.url.replace(/^\/+/, '')}`;

        return next({ ...request, url });
      });
    }
  };
}
