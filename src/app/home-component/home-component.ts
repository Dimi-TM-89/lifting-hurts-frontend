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
