import { HttpFeature } from './http-feature';

export function withBaseUrl(
  url: string
): HttpFeature {
  return {
    install(builder) {
      builder.setBaseUrl(url);
    }
  };
}
