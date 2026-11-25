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