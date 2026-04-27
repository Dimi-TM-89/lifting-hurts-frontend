/*
 * "My Workouts" page — list of past workout sessions for the logged-in user.
 *
 * Auth-only route (see app.routes.ts). The backend's /my-sessions endpoint resolves the
 * user from the JWT, so the frontend never has to send a userId.
 *
 * Active session handling:
 *  - If a session is in flight (id stored via WorkoutSessionService — written by
 *    WorkoutSessionFormComponent.startSession, cleared on End), we filter it out of the
 *    list. Otherwise it would render as a one-second-long completed workout, because
 *    `endedAt` is set equal to `startedAt` at create time as a placeholder until End
 *    Session updates it.
 *  - We also surface a "Resume Active Workout" banner at the top so users coming back
 *    via the Workouts menu link don't lose track of their in-flight session.
 *  - The active id is VALIDATED against the backend before the banner is shown. If the
 *    GET returns 404 (session deleted) or 403 (session belongs to a different user —
 *    happens when account A logs out and account B logs in on the same browser without
 *    the logout having cleared state) we drop the key and skip the banner. This prevents
 *    cross-user contamination of localStorage state.
 *  - Logout proactively clears the same key (see MenuComponent.logout), but this
 *    backend check is the safety net for cases where logout didn't fire (browser
 *    crash, dev clearing tokens directly, etc).
 *
 * Refresh pattern: re-call loadSessions() after every successful delete so AsyncPipe
 * re-subscribes and the table re-renders. The banner state is also re-validated.
 */
import { Component, inject, OnInit, ChangeDetectorRef, signal } from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';
import { Observable, map } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
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
  // Drives the Resume banner. Set ONLY after we've confirmed the session actually
  // belongs to the current user (validated via getSessionById). A raw localStorage
  // read isn't enough — the previous user's id could still be sitting there.
  activeSessionId = signal<number | null>(null);
  errorMessage = signal<string>('');

  private sessionService = inject(WorkoutSessionService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    // Always fetch the past-sessions list. We'll filter out the active session below
    // once we've confirmed it's actually ours.
    const allSessions$ = this.sessionService.getMySessions();

    const storedId = this.sessionService.getActiveSessionId();
    if (storedId === null) {
      // No stored id → no banner, no filtering.
      this.activeSessionId.set(null);
      this.sessions$ = allSessions$;
      this.cdr.markForCheck();
      return;
    }

    // Validate the stored id against the backend before trusting it. The owner check
    // happens server-side in WorkoutSessionController.getById — if the session belongs
    // to a different user we get 403, if it was deleted we get 404. Either way the
    // stored id is meaningless for the current user; drop it.
    this.sessionService.getSessionById(storedId).subscribe({
      next: () => {
        // Session exists AND belongs to this user → show banner + hide it from the list.
        this.activeSessionId.set(storedId);
        this.sessions$ = allSessions$.pipe(
          map((sessions) => sessions.filter((s) => s.id !== storedId)),
        );
        this.cdr.markForCheck();
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 404 || err.status === 403) {
          this.sessionService.clearActiveSessionId();
        }
        // Either way (stale key OR transient network error), we don't show the banner.
        // For transient errors the key is preserved and the next visit re-validates.
        this.activeSessionId.set(null);
        this.sessions$ = allSessions$;
        this.cdr.markForCheck();
      },
    });
  }

  // Both Resume and New navigate to the same form route — the form component reads the
  // active session id on init (via WorkoutSessionService) and either resumes the in-flight
  // workout or shows the Start Session screen. Two methods for template-readability only.
  resumeSession(): void {
    this.router.navigate(['/workout-sessions/new']);
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
