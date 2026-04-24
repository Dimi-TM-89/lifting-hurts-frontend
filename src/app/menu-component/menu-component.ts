/*
 * Top navigation bar.
 *
 * Three render variants depending on the user:
 *   - Visitor → just sees public links + a "Log in" button.
 *   - Authenticated user → also sees "Workouts" and a "Log out" button.
 *   - Admin → additionally sees the "Admin" dropdown.
 *
 * Special points:
 *  - `isAdmin` is a `computed()` signal derived from `user`. It re-evaluates automatically
 *    whenever the user signal changes; we don't have to manually re-check on every render.
 *  - The roles claim key is the same custom-namespaced URI we use in role.guard.ts.
 *    Auth0 requires custom claims to live under a URI namespace.
 *  - Two state booleans (`hamburgerOpen`, `adminDropdownOpen`) are plain fields, not
 *    signals: they're only ever read inside the template via direct binding and we use the
 *    cdr-free pattern of letting Angular re-render on click events. (zoneless re-renders
 *    on the originating event tick.)
 *  - logout() returns to a hard-coded localhost URL because Auth0 requires the returnTo
 *    URL to be in its allowed list — for prod this should be moved to environment.ts.
 */
import { NgClass } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-menu-component',
  imports: [NgClass, RouterModule],
  templateUrl: './menu-component.html',
  styleUrl: './menu-component.css',
})
export class MenuComponent {
  private router = inject(Router);
  private auth = inject(AuthService);

  hamburgerOpen = false;
  adminDropdownOpen = false;

  readonly isAuth = toSignal(this.auth.isAuthenticated$, { initialValue: false });
  readonly user = toSignal(this.auth.user$, { initialValue: null });

  // Derived signal: true only when the user has the admin role in their JWT.
  readonly isAdmin = computed(() => {
    const roles = this.user()?.['https://liftinghurts.example.com/roles'] as string[] | undefined;
    return roles?.includes('lifting-hurts-admin') ?? false;
  });

  toggleHamburger(): void {
    this.hamburgerOpen = !this.hamburgerOpen;
  }

  // Auto-close the mobile menu after a link click — common UX expectation on mobile.
  onHamburgerItemClick(): void {
    this.hamburgerOpen = false;
  }

  onAdminDropDownClick(): void {
    this.adminDropdownOpen = !this.adminDropdownOpen;
  }

  closeAdminDropDown(): void {
    this.adminDropdownOpen = false;
  }

  // Used by the admin dropdown items: routerLink doesn't fire after a manual close, so we
  // navigate imperatively and reset both menu states in one go.
  navigateTo(path: string): void {
    this.closeAdminDropDown();
    this.hamburgerOpen = false;
    this.router.navigate([path]);
  }

  // `prompt: 'login'` forces Auth0 to show the login screen even if the user has an
  // active SSO session — useful so users can switch accounts without an extra step.
  login(): void {
    this.auth.loginWithRedirect({
      appState: { target: '/' },
      authorizationParams: { prompt: 'login' },
    });
  }

  logout(): void {
    this.auth.logout({
      logoutParams: { returnTo: 'http://localhost:4200' },
    });
  }
}
