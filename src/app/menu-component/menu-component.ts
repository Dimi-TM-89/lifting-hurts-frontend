import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
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

  toggleHamburger(): void {
    this.hamburgerOpen = !this.hamburgerOpen;
  }

  onHamburgerItemClick(): void {
    this.hamburgerOpen = false;
  }

  onAdminDropDownClick(): void {
    this.adminDropdownOpen = !this.adminDropdownOpen;
  }

  closeAdminDropDown(): void {
    this.adminDropdownOpen = false;
  }

  navigateTo(path: string): void {
    this.closeAdminDropDown();
    this.hamburgerOpen = false;
    this.router.navigate([path]);
  }

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
