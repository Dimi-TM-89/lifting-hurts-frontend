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
