import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { createHttpClient, withBaseUrl, withEngine, AngularHttpEngine, withInterceptors, HttpInterceptor } from 'networking';

@Component({
  selector: 'app-root',
  template: '<button (click)="getUser()">get user</button>',
})
class AppComponent {
  responseInterceptor: HttpInterceptor = async (
    request,
    next
  ) => {
    const response = await next(request);

    return {
      ...response,
      body: {
        chuponeo: true,
        ...response.body as any
      }
    };
  };

  httpClient = createHttpClient(
    withEngine(new AngularHttpEngine(inject(HttpClient))),
    withInterceptors([
      this.responseInterceptor
    ]),
    withBaseUrl('http://localhost:3000/api'),
  );

  async getUser() {
    const user = await this.httpClient.get('/user');

    console.log(user);
  }
}

bootstrapApplication(AppComponent);
