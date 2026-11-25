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