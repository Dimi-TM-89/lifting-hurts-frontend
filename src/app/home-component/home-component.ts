/*
 * Landing page. Has two states:
 *   - Visitor: shows a welcome message + "log in to start tracking" hint.
 *   - Logged-in: greets by name and embeds the dashboard.
 *
 * Why toSignal()?
 *  - Auth0's `isAuthenticated$` and `user$` are RxJS Observables. We're running zoneless
 *    (see app.config.ts), so the cleanest way to react to them in the template is to
 *    convert them into signals. Signals trigger Angular's reactivity automatically, no
 *    AsyncPipe and no manual subscribe/unsubscribe needed.
 *  - `initialValue` avoids the "value before first emission" being `undefined` — important
 *    because the template renders before the observable resolves.
 */
import { Component, inject } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { toSignal } from '@angular/core/rxjs-interop';
import { DashboardComponent } from '../dashboard-component/dashboard-component';

@Component({
  selector: 'app-home-component',
  imports: [DashboardComponent],
  templateUrl: './home-component.html',
  styleUrl: './home-component.css',
})
export class HomeComponent {
  private auth = inject(AuthService);
  readonly isAuth = toSignal(this.auth.isAuthenticated$, { initialValue: false });
  readonly user = toSignal(this.auth.user$, { initialValue: null });
}
