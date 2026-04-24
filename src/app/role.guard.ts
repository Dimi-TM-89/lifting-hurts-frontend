/*
 * Custom route guard for role-based access control.
 *
 * Access control has three levels:
 * 1. Visitor (unauthenticated) — public routes, no guard
 * 2. Registered user (authenticated) — protected by AuthGuard (login check only)
 * 3. Admin (authenticated + lifting-hurts-admin role) — protected by roleGuard
 *
 * The lifting-hurts-user role defined in Auth0 is not used here because
 * AuthGuard already distinguishes registered users from visitors based on
 * authentication status alone.
 *
 * Why a custom guard?
 *  - Auth0's built-in AuthGuard only checks "is the user logged in?". It cannot inspect
 *    custom claims (roles), so we need our own to enforce admin-only routes.
 *
 * Behavior:
 *  - Not logged in            → trigger Auth0 login redirect, return false (block route).
 *  - Logged in, no required roles → allow.
 *  - Logged in, missing role → redirect to '/' instead of just blocking
 *    (returning a UrlTree is the Angular-recommended way to redirect from a guard).
 *
 * The roles claim namespace ('https://liftinghurts.example.com/roles') is what we
 * configured on the Auth0 side via a custom Action. Auth0 requires custom claims to use
 * a namespaced URI to avoid colliding with reserved JWT claim names.
 */

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { tap, switchMap, of, map } from 'rxjs';

export const roleGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  // The roles whitelisted on this route — set via `data: { roles: [...] }` in app.routes.ts.
  const requiredRoles = route.data['roles'] as string[] | undefined;
  const rolesClaim = 'https://liftinghurts.example.com/roles';

  return auth.isAuthenticated$.pipe(
    // Side-effect: if the user isn't logged in, kick off the Auth0 login flow.
    // appState.target preserves where they wanted to go so we can land them there after login.
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
          // Returning a UrlTree triggers a redirect — better UX than a blank "blocked" state.
          if (!hasRole) return router.createUrlTree(['/']);
          return true;
        }),
      );
    }),
  );
};
