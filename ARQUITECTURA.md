# Networking

Biblioteca de networking multiplataforma, extensible e independiente de la plataforma, desarrollada en TypeScript.

Proporcionar una abstracción común de networking que permita desacoplar el código consumidor de las implementaciones específicas de cada plataforma.

Inicialmente, la biblioteca estará orientada a aplicaciones Angular y React Native.

## Scaffolding

```code
networking/
├── src/
│   ├── client/
│   │   ├── http-client.ts
│   │   ├── http-client-builder.ts
│   │   ├── default-http-client.ts
│   │   ├── default-http-client-builder.ts
│   │   ├── create-http-client.ts
│   ├── models/
│   │   ├── http-request.ts
│   │   ├── http-response.ts
│   │   ├── http-options.ts
│   │   ├── http-method.ts
│   │   ├── http-headers.ts
│   │   ├── http-params.ts
│   │   └── http-response-type.ts
│   ├── engine/
│   │   └── http-engine.ts
│   │   └── angular-http-engine.ts
│   ├── features/
│   │   ├── http-feature.ts
│   │   ├── with-engine.ts
│   │   ├── with-base-url.ts
│   │   ├── with-interceptors.ts
│   │   └── with-logging.ts
│   ├── pipeline/
│   │   ├── http-handler.ts
│   │   ├── http-pipeline-phase.ts
│   │   ├── http-pipeline-step.ts
│   │   ├── http-pipeline.ts
│   ├── interceptors/
│   │   └── http-interceptor.ts
│   └── index.ts
```

## Tabla de contenidos
* [Diseño de la API publica](#Diseño-de-la-API-publica)
* [Contrato HttpClient](#Contrato-HttpClient)
* [Modelos HTTP](#Modelos-HTTP)
* [HttpEngine](#HttpEngine)
* [Sistema de Features](#Sistema-de-Features)
* [Pipeline de ejecucion](#Pipeline-de-ejecucion)
* [Sitema de interceptores](#Sitema-de-interceptores)
* [Implementacion del HttpClient](#Implementacion-del-HttpClient)
* [integracion con angular](#integracion-con-angular)

## Diseño de la API publica

Se propone una API declarativa basada en la composición de **features**, donde cada función `with...` representa una configuración o funcionalidad independiente.

```typescript
const httpClient = createHttpClient(
  withEngine(angularEngine),
  withBaseUrl('https://api.example.com'),
  withInterceptors([authInterceptor]),
  withTimeout(5000),
  withLogging()
);
```

`createHttpClient` recibe estas features y construye un cliente HTTP configurado según las necesidades del consumidor.

## Contrato HttpClient

El `HttpClient` será el punto de entrada para los consumidores de nuestra biblioteca. Su responsabilidad será exponer las operaciones HTTP de manera independiente del engine y de las features configuradas.

```typescript
export interface HttpClient {
  request<T>(request: HttpRequest): Promise<HttpResponse<T>>;
  get<T>(url: string, options?: HttpOptions): Promise<T>;
  post<T>(url: string, body: unknown, options?: HttpOptions): Promise<T>;
  put<T>(url: string, body: unknown, options?: HttpOptions): Promise<T>;
  patch<T>(url: string, body: unknown, options?: HttpOptions): Promise<T>;
  delete<T>(url: string, options?: HttpOptions): Promise<T>;
  head<T>(url: string, options?: HttpOptions): Promise<T>;
  options<T>(url: string, options?: HttpOptions): Promise<T>;
}
```

La función createHttpClient que definimos en la primera etapa devolverá una instancia que cumpla con el contrato `HttpClient`.

```typescript
const users = await httpClient.get<User[]>('/users');
```

## Modelos HTTP

Ahora vamos a definir los modelos que utilizará nuestra biblioteca de networking.

| Contrato     | Responsabilidad                               |
|--------------|-----------------------------------------------|
| HttpOptions  | Configuración de una petición.                |
| HttpRequest  | Representación completa de una petición HTTP. |
| HttpResponse | Representación de una respuesta HTTP.         |

### HttpOptions

```typescript
export interface HttpOptions {
  headers?: HttpHeaders;
  params?: HttpParams;
  responseType?: HttpResponseType;
  signal?: AbortSignal;
}

export type HttpHeaders = Record<
  string,
  string | readonly string[]
>;

export type HttpParamValue = string | number | boolean;

export type HttpParams = Record<
  string,
  HttpParamValue | readonly HttpParamValue[]
>;

export type HttpResponseType =
  | 'json'
  | 'text'
  | 'arraybuffer'
  | 'blob';
```

### HttpRequest

```typescript
export interface HttpRequest extends HttpOptions {
  method: HttpMethod;
  url: string;
  body?: unknown;
}

export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS';
```

### HttpResponse

```typescript
export interface HttpResponse<T = unknown> {
  status: number;
  statusText?: string;
  headers: HttpHeaders;
  body: T;
  url?: string;
}
```

## HttpEngine

El HttpEngine será el componente responsable de ejecutar las peticiones HTTP utilizando una implementación concreta de networking.

La biblioteca no necesita saber cómo se realiza una petición HTTP, solamente necesita saber que existe un componente capaz de ejecutarla.

```typescript
export interface HttpEngine {
  execute(request: HttpRequest): Promise<HttpResponse>;
}
```

un ejemplo de engine seria:

```typescript
export class MockHttpEngine implements HttpEngine {

  async execute(
    request: HttpRequest
  ): Promise<HttpResponse> {

    return {
      status: 200,
      headers: {},
      url: request.url,
      body: {
        message: 'Hello World'
      }
    };
  }
}
```

En el consumidor quedaria asi:

```typescript
const httpClient = createHttpClient(
  withEngine(new MockHttpEngine())
);
```

un ejemplo de engine para angular seria:

```typescript
import {
  HttpClient as AngularHttpClient,
  HttpErrorResponse
} from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { HttpRequest } from '../models/http-request';
import { HttpResponse } from '../models/http-response';
import { HttpEngine } from './http-engine';

export class AngularHttpEngine implements HttpEngine  {

  constructor(
    private readonly http: AngularHttpClient
  ) {}

  async execute(request: HttpRequest): Promise<HttpResponse> {

    try {
      const response = await firstValueFrom(
        this.http.request(request.method, request.url, {
          body: request.body,
          observe: 'response',
          responseType: 'json'
        })
      );

      return {
        status: response.status,
        statusText: response.statusText,
        body: response.body,
        headers: Object.fromEntries(
          response.headers.keys().map(key => [
            key,
            response.headers.getAll(key) ?? []
          ])
        ),
        url: response.url ?? undefined
      };

    } catch (error) {
      if (
        error instanceof HttpErrorResponse &&
        error.status > 0 &&
        (error.status < 200 || error.status >= 300)
      ) {
        return {
          status: error.status,
          statusText: error.statusText,
          body: error.error,
          headers: Object.fromEntries(
            error.headers.keys().map(key => [
              key,
              error.headers.getAll(key) ?? []
            ])
          ),
          url: error.url ?? undefined
        };
      }

      throw error;
    }
  }
}
```

## Sistema de Features

Mecanismo que permitirá extender las capacidades del HttpClient sin modificar su implementación.

Recordemos nuestra API pública:

```typescript
const httpClient = createHttpClient(
  withEngine(angularEngine),
  withBaseUrl('https://api.example.com'),
  withInterceptors([authInterceptor]),
  withTimeout(5000),
  withLogging()
);
```

Cada una de estas funciones (with...) devuelve un `HttpFeature`.

### HttpFeature

Una feature es una unidad de configuración o comportamiento que podemos `instalar` en nuestro cliente HTTP.

Contrato de HttpFeature:

```typescript
export interface HttpFeature {
  install(builder: HttpClientBuilder): void;
}
```

Cada feature se instalara usando el `HttpClientBuilder`.

Contrato de HttpClientBuilder:

```typescript
export interface HttpClientBuilder {
  setEngine(engine: HttpEngine): void;
  addInterceptor(interceptor: HttpInterceptor): void;
  register(
    phase: HttpPipelinePhase,
    step: HttpPipelineStep
  ): void;
  build(): HttpClient;
}
```

#### feature: withEngine

```typescript
export function withEngine(
  engine: HttpEngine
): HttpFeature {
  return {
    install(builder) {
      builder.setEngine(engine);
    }
  };
}
```

#### feature: withBaseUrl

```typescript
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
```

#### feature: withInterceptor

```typescript
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
```

Idealmente, las features deberían construirse sobre un conjunto reducido de mecanismos de extensión genéricos.

Por ejemplo, una feature de logging podría instalarse registrando un interceptor:

```typescript
export function withLogging(): HttpFeature {
  return {
    install(builder) {
      builder.addInterceptor(loggingInterceptor);
    }
  };
}
```

No necesitamos un `setLogging()`.

## Pipeline de ejecucion

Es une mecanismo que permite que una petición HTTP atraviese diferentes etapas antes de llegar al engine y que su respuesta pueda ser procesada antes de regresar al consumidor.

`HttpPipeline` componente que orquesta la ejecución de una petición.

Tres fases:

| Fase    | Responsabilidad                             |
|---------|---------------------------------------------|
| prepare | Preparar y transformar la petición inicial. |
| policy  | Aplicar políticas de networking.            |
| send    | Preparar cada intento de envío.             |

```typescript
export type HttpPipelinePhase =
  | 'prepare'
  | 'policy'
  | 'send';
```

### HttpHandler

Representacion de una operacion capaz de procesar una peticion HTTP.

```typescript
export type HttpHandler = (
  request: HttpRequest
) => Promise<HttpResponse>;
```

### HttpPipelineStep

Contrato para representar cada comportamiento que participa en el pipeline.

```typescript
export type HttpPipelineStep = (
  request: HttpRequest,
  next: HttpHandler
) => Promise<HttpResponse>;
```

El next representa la continuacion del pipeline.

ejemplo:

```typescript
const loggingStep: HttpPipelineStep = async (
  request,
  next
) => {
  console.log('Request', request); // antes de una peticion

  const response = await next(request);

  console.log('Response', response); // despues de una peticion

  return response;
};
```

### Implementacion del HttpPipeline

```typescript
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
```

### El builder `HttpClientBuilder`

Ahora nuestro HttpClientBuilder podría evolucionar incorporando un mecanismo de extensión genérico:

```typescript
export interface HttpClientBuilder {
  setEngine(engine: HttpEngine): void;
  addInterceptor(interceptor: HttpInterceptor): void;
  register(
    phase: HttpPipelinePhase,
    step: HttpPipelineStep
  ): void;
  build(): HttpClient;
}
```

De esta manera, una feature podría instalar comportamientos directamente en el pipeline.

```typescript
const loggingStep = async (request: HttpRequest, next: HttpHandler) => {
  console.log('antes', request); // ida

  const response = await next(request);

  console.log('despues', response); // vuelta
  return response;
};

export function withLogging(): HttpFeature {
  return {
    install(builder) {
      builder.register('policy', loggingStep);
    }
  };
}
```

## Sitema de interceptores

Contrato de interceptor.

```typescript
export type HttpInterceptor = (
  request: HttpRequest,
  next: HttpHandler
) => Promise<HttpResponse>;
```

ejemplos:

Transforma una peticion.

```typescript
const languageInterceptor: HttpInterceptor = (
  request,
  next
) => {
  return next({
    ...request,
    headers: {
      ...request.headers,
      'Accept-Language': 'es'
    }
  });
};
```

Transforma una respuesta.

```typescript
const responseInterceptor: HttpInterceptor = async (
  request,
  next
) => {
  const response = await next(request);

  return {
    ...response,
    headers: {
      ...response.headers,
      'X-Processed': 'true'
    }
  };
};
```

Capturar errores.

```typescript
const errorInterceptor: HttpInterceptor = async (
  request,
  next
) => {
  try {
    return await next(request);
  } catch (error) {
    console.error('Request failed', error);
    throw error;
  }
};
```

Interrumpir el pipeline

```typescript
const mockInterceptor: HttpInterceptor = (
  request,
  next
) => {
  if (request.url === '/mock') {
    return Promise.resolve({
      status: 200,
      headers: {},
      body: { message: 'Mock response' }
    });
  }

  return next(request);
};
```

### feature de interceptor

```typescript
addInterceptor(interceptor: HttpInterceptor): void {
  this.pipeline.register('policy', interceptor);
}

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
```

## Implementacion del HttpClient

*default-http-client.ts*
```typescript
import type { HttpClient } from './http-client';
import type { HttpOptions } from '../models/http-options';
import type { HttpRequest } from '../models/http-request';
import type { HttpResponse } from '../models/http-response';
import type { HttpHandler } from '../pipeline/http-handler';

export class DefaultHttpClient implements HttpClient {
  constructor(
    private readonly handler: HttpHandler
  ) {}

  async request<T>(
    request: HttpRequest
  ): Promise<HttpResponse<T>> {
    return await this.handler(request) as HttpResponse<T>;
  }

  async get<T>(
    url: string,
    options?: HttpOptions
  ): Promise<T> {
    const response = await this.request<T>({
      ...options,
      method: 'GET',
      url
    });

    return response.body;
  }

  async post<T>(
    url: string,
    body: unknown,
    options?: HttpOptions
  ): Promise<T> {
    const response = await this.request<T>({
      ...options,
      method: 'POST',
      url,
      body
    });

    return response.body;
  }

  async put<T>(
    url: string,
    body: unknown,
    options?: HttpOptions
  ): Promise<T> {
    const response = await this.request<T>({
      ...options,
      method: 'PUT',
      url,
      body
    });

    return response.body;
  }

  async patch<T>(
    url: string,
    body: unknown,
    options?: HttpOptions
  ): Promise<T> {
    const response = await this.request<T>({
      ...options,
      method: 'PATCH',
      url,
      body
    });

    return response.body;
  }

  async delete<T>(
    url: string,
    options?: HttpOptions
  ): Promise<T> {
    const response = await this.request<T>({
      ...options,
      method: 'DELETE',
      url
    });

    return response.body;
  }

  async head<T>(
    url: string,
    options?: HttpOptions
  ): Promise<T> {
    const response = await this.request<T>({
      ...options,
      method: 'HEAD',
      url
    });

    return response.body;
  }

  async options<T>(
    url: string,
    options?: HttpOptions
  ): Promise<T> {
    const response = await this.request<T>({
      ...options,
      method: 'OPTIONS',
      url
    });

    return response.body;
  }
}
```

*default-http-client-builder.ts*
```typescript
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
```

*create-http-client.ts*
```typescript
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
```

## integracion con angular

Podemos crear un token para proporcionar nuestro propio cliente HTTP dentro de Angular.

```typescript
export const HTTP_CLIENT = new InjectionToken<HttpClient>(
  'Networking HttpClient'
);
```

```typescript
{
  provide: HTTP_CLIENT,
  useFactory: () => {
    const angularHttp = inject(AngularHttpClient);

    return createHttpClient(
      withEngine(new AngularHttpEngine(angularHttp)),
      withBaseUrl('https://api.example.com'),
      withLogging()
    );
  }
}
```

Ejemplo de uso

```typescript
@Injectable({ providedIn: 'root' })
export class UserService {

  private readonly http = inject(HTTP_CLIENT);

  getUsers(): Promise<User[]> {
    return this.http.get<User[]>('/users');
  }
}
```

