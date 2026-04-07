import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-menu-component',
  imports: [NgClass, RouterModule],
  templateUrl: './menu-component.html',
  styleUrl: './menu-component.css',
})
export class MenuComponent {
  private router = inject(Router);

  hamburgerOpen = false;
  adminDropdownOpen = false;

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
}
