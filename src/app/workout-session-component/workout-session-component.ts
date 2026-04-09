import { Component, inject, OnInit, ChangeDetectorRef, signal } from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';
import { Observable } from 'rxjs';
import { AuthService } from '@auth0/auth0-angular';
import { WorkoutSession } from '../workout-session';
import { WorkoutSessionService } from '../workout-session-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-workout-session-component',
  imports: [AsyncPipe, DatePipe],
  templateUrl: './workout-session-component.html',
  styleUrl: './workout-session-component.css',
})
export class WorkoutSessionComponent implements OnInit {
  sessions$!: Observable<WorkoutSession[]>;
  errorMessage = signal<string>('');

  private auth = inject(AuthService);
  private sessionService = inject(WorkoutSessionService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  private userId = '';

  ngOnInit(): void {
    this.auth.user$.subscribe((user) => {
      if (user?.sub) {
        this.userId = user.sub;
        this.loadSessions();
      }
    });
  }

  loadSessions(): void {
    this.sessions$ = this.sessionService.getSessionsByUser(this.userId);
    this.cdr.markForCheck();
  }

  newSession(): void {
    this.router.navigate(['/workout-sessions/new']);
  }

  deleteSession(id: number): void {
    this.sessionService.deleteSession(id).subscribe({
      next: () => this.loadSessions(),
      error: (e) => this.errorMessage.set(e.message),
    });
  }
}
