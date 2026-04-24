/*
 * Root component of the application — wraps everything inside the menu + router-outlet shell.
 * Kept intentionally minimal: it only hosts the layout. All real logic lives in feature components.
 *
 * `imports: [RouterOutlet, MenuComponent]` — standalone-component style (no NgModule),
 * which is the default in modern Angular. Each component declares the directives it uses.
 */
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuComponent } from './menu-component/menu-component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MenuComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class AppComponent {
  title = 'lifting-hurts-frontend';
}
