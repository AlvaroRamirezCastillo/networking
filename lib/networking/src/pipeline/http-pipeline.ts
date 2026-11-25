import { HttpHandler } from './http-handler';
import { HttpPipelinePhase } from './http-pipeline-phase';
import { HttpPipelineStep } from './http-pipeline-step';

export class HttpPipeline {
  private readonly phases: Record<
    HttpPipelinePhase,
    HttpPipelineStep[]
  > = {
    prepare: [],
    policy: [],
    send: []
  };

  register(
    phase: HttpPipelinePhase,
    step: HttpPipelineStep
  ): void {
    this.phases[phase].push(step);
  }

  build(terminal: HttpHandler): HttpHandler {
    const steps = [
      ...this.phases.prepare,
      ...this.phases.policy,
      ...this.phases.send
    ];

    return steps.reduceRight<HttpHandler>(
      (next, step) => {
        return (request) => step(request, next);
      },
      terminal
    );
  }
}
