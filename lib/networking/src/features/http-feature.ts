import { HttpClientBuilder } from '../client/http-client-builder';

export interface HttpFeature {
  install(builder: HttpClientBuilder): void;
}
