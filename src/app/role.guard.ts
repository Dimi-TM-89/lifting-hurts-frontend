/*
 * Access control has three levels:
 * 1. Visitor (unauthenticated) — public routes, no guard
 * 2. Registered user (authenticated) — protected by AuthGuard (login check only)
 * 3. Admin (authenticated + lifting-hurts-admin role) — protected by roleGuard
 *
 * The lifting-hurts-user role defined in Auth0 is not used here because
 * AuthGuard already distinguishes registered users from visitors
 * based on authentication status alone.
 */

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { tap, switchMap, of, map } from 'rxjs';

export const roleGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const requiredRoles = route.data['roles'] as string[] | undefined;
  const rolesClaim = 'https://liftinghurts.example.com/roles';

  return auth.isAuthenticated$.pipe(
    tap((isAuth) => {
      if (!isAuth) {
        auth.loginWithRedirect({ appState: { target: state.url } });
      }
    }),
    switchMap((isAuth) => {
      if (!isAuth) return of(false);
      if (!requiredRoles || requiredRoles.length === 0) return of(true);
      return auth.user$.pipe(
        map((user) => {
          const roles = (user?.[rolesClaim] as string[]) || [];
          const hasRole = requiredRoles.some((r) => roles.includes(r));
          if (!hasRole) return router.createUrlTree(['/']);
          return true;
        }),
      );
    }),
  );
};
