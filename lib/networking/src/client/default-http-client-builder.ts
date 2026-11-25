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
  private baseUrl?: string;

  private readonly steps: {
    phase: HttpPipelinePhase;
    step: HttpPipelineStep;
  }[] = [];

  setEngine(engine: HttpEngine): void {
    this.engine = engine;
  }

  setBaseUrl(url: string): void {
    this.baseUrl = url;
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
    const baseUrl = this.baseUrl;

    if (!engine) {
      throw new Error('HttpEngine is required');
    }

    const pipeline = new HttpPipeline();

    if (baseUrl) {
      pipeline.register('prepare', (request, next) => {
        const url = /^[a-z][a-z\d+.-]*:/i.test(request.url)
          ? request.url
          : `${baseUrl.replace(/\/+$/, '')}/${request.url.replace(/^\/+/, '')}`;

        return next({ ...request, url });
      });
    }

    for (const { phase, step } of this.steps) {
      pipeline.register(phase, step);
    }

    const handler = pipeline.build(
      request => engine.execute(request)
    );

    return new DefaultHttpClient(handler);
  }
}