/*
 * Application-wide DI configuration (replaces the old AppModule).
 *
 * Special points to note:
 *  - provideZonelessChangeDetection(): we run WITHOUT zone.js. That means Angular does
 *    NOT auto-detect changes after every async event — we use signals + ChangeDetectorRef
 *    in components to trigger updates manually. This is faster and a modern Angular pattern.
 *  - provideHttpClient(withInterceptors([authHttpInterceptorFn])): registers Auth0's HTTP
 *    interceptor so every outgoing request that matches the `allowedList` below gets a
 *    Bearer token attached automatically. No manual headers anywhere in the services.
 *  - provideAuth0(...): single source of truth for Auth0 config (domain/client/audience).
 *    Values come from src/environments/environment.ts so they differ per build.
 *  - httpInterceptor.allowedList: ONLY these endpoints get a JWT attached.
 *      • All /workout-sessions calls (read + write) → require login.
 *      • Public reads of /muscle-groups and /exercises are intentionally NOT in the list,
 *        so anonymous visitors can browse them without a token.
 *      • Only POST/PUT/DELETE on /muscle-groups and /exercises are protected — the backend
 *        also enforces the admin role on those, so the JWT is needed there.
 */
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
          // Authenticated users — own workout data
          { uri: `${environment.apiUrl}/workout-sessions*` },
          { uri: `${environment.apiUrl}/workout-sessions/*` },
          // Admin-only writes (reads on these endpoints are public, so no GET here)
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
