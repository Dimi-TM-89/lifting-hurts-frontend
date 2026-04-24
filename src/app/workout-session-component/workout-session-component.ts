/*
 * "My Workouts" page — list of past workout sessions for the logged-in user.
 *
 * Auth-only route (see app.routes.ts). The backend's /my-sessions endpoint resolves the
 * user from the JWT, so the frontend never has to send a userId.
 *
 * Same refresh pattern as the admin list: re-assign the observable + markForCheck after
 * every successful delete so AsyncPipe re-subscribes and the table re-renders.
 */
import { Component, inject, OnInit, ChangeDetectorRef, signal } from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';
import { Observable } from 'rxjs';
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

  private sessionService = inject(WorkoutSessionService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    this.sessions$ = this.sessionService.getMySessions();
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
