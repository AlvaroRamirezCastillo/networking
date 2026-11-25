import type { HttpClient } from './http-client';
import type { HttpEngine } from '../engine/http-engine';
import type { HttpInterceptor } from '../interceptors/http-interceptor';
import type { HttpPipelinePhase } from '../pipeline/http-pipeline-phase';
import type { HttpPipelineStep } from '../pipeline/http-pipeline-step';
import type { HttpClientBuilder } from './http-client-builder';
import { HttpPipeline } from '../pipeline/http-pipeline';
import { DefaultHttpClient } from './default-http-client';

export class DefaultHttpClientBuilder implements HttpClientBuilder {
  private engine?: HttpEngine;

  private readonly steps: {
    phase: HttpPipelinePhase;
    step: HttpPipelineStep;
  }[] = [];

  setEngine(engine: HttpEngine): void {
    this.engine = engine;
  }

  addInterceptor(interceptor: HttpInterceptor): void {
    this.register('policy', interceptor);
  }

  register(
    phase: HttpPipelinePhase,
    step: HttpPipelineStep
  ): void {
    this.steps.push({ phase, step });
  }

  build(): HttpClient {
    const engine = this.engine;

    if (!engine) {
      throw new Error('HttpEngine is required');
    }

    const pipeline = new HttpPipeline();

    for (const { phase, step } of this.steps) {
      pipeline.register(phase, step);
    }

    const handler = pipeline.build(
      request => engine.execute(request)
    );

    return new DefaultHttpClient(handler);
  }
}
