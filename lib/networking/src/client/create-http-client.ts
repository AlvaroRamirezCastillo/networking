import { HttpFeature } from '../features/http-feature';
import { DefaultHttpClientBuilder } from './default-http-client-builder';
import { HttpClient } from './http-client';

export function createHttpClient(
  ...features: HttpFeature[]
): HttpClient {

  const builder = new DefaultHttpClientBuilder();

  for (const feature of features) {
    feature.install(builder);
  }

  return builder.build();
}