import { HttpEngine } from '../engine/http-engine';
import { HttpFeature } from './http-feature';

export function withEngine(
  engine: HttpEngine
): HttpFeature {
  return {
    install(builder) {
      builder.setEngine(engine);
    }
  };
}