import { HttpEngine } from '../engine/http-engine';
import { HttpInterceptor } from '../interceptors/http-interceptor';
import { HttpPipelinePhase } from '../pipeline/http-pipeline-phase';
import { HttpPipelineStep } from '../pipeline/http-pipeline-step';
import { HttpClient } from './http-client';

export interface HttpClientBuilder {
  setEngine(engine: HttpEngine): void;
  addInterceptor(interceptor: HttpInterceptor): void;
  register(
    phase: HttpPipelinePhase,
    step: HttpPipelineStep
  ): void;
  build(): HttpClient;
}
