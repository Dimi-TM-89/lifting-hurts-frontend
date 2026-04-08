import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAuth0, authHttpInterceptorFn } from '@auth0/auth0-angular';
import { routes } from './app.routes';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authHttpInterceptorFn])),
    provideAuth0({
      domain: environment.auth0.domain,
      clientId: environment.auth0.clientId,
      authorizationParams: {
        audience: environment.auth0.audience,
        redirect_uri: environment.auth0.redirectUri,
      },
      httpInterceptor: {
        allowedList: [
          // Only attach token to these protected endpoints
          {
            uri: `${environment.apiUrl}/workout-sessions*`,
            tokenOptions: { authorizationParams: { audience: environment.auth0.audience } },
          },
          { uri: `${environment.apiUrl}/muscle-groups*`, httpMethod: 'POST' },
          { uri: `${environment.apiUrl}/muscle-groups/*`, httpMethod: 'PUT' },
          { uri: `${environment.apiUrl}/muscle-groups/*`, httpMethod: 'DELETE' },
          { uri: `${environment.apiUrl}/exercises*`, httpMethod: 'POST' },
          { uri: `${environment.apiUrl}/exercises/*`, httpMethod: 'PUT' },
          { uri: `${environment.apiUrl}/exercises/*`, httpMethod: 'DELETE' },
        ],
      },
    }),
  ],
};
