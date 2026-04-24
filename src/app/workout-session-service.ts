/*
 * Service layer for /workout-sessions endpoints.
 *
 * All endpoints here require a logged-in user — they're all in the interceptor's allowedList
 * (see app.config.ts), so the JWT is attached automatically.
 *
 * Important: we never send `auth0UserId` from the frontend. The backend pulls the user id
 * out of the JWT (`sub` claim) and sets it server-side. This makes it impossible for a
 * client to spoof another user's identity even if they tamper with the request body.
 */
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WorkoutSession } from './workout-session';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WorkoutSessionService {
  private apiUrl = `${environment.apiUrl}/workout-sessions`;
  private httpClient = inject(HttpClient);

  // Authenticated user: get own sessions (backend extracts user from JWT — no userId in URL).
  getMySessions(): Observable<WorkoutSession[]> {
    return this.httpClient.get<WorkoutSession[]>(`${this.apiUrl}/my-sessions`);
  }

  getSessionById(id: number): Observable<WorkoutSession> {
    return this.httpClient.get<WorkoutSession>(`${this.apiUrl}/${id}`);
  }

  // No need to pass auth0UserId — backend overrides it from JWT.
  createSession(session: {
    startedAt: string;
    endedAt: string;
    notes: string;
  }): Observable<WorkoutSession> {
    return this.httpClient.post<WorkoutSession>(this.apiUrl, session);
  }

  updateSession(
    id: number,
    session: { startedAt: string; endedAt: string; notes: string },
  ): Observable<WorkoutSession> {
    return this.httpClient.put<WorkoutSession>(`${this.apiUrl}/${id}`, session);
  }

  deleteSession(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Sub-resource endpoint: a set always belongs to a specific session, so it's posted
  // under /workout-sessions/{id}/sets rather than a top-level /sets endpoint.
  // Returns the full updated session so the UI can re-render the sets table without an
  // extra GET round-trip.
  addSet(
    sessionId: number,
    set: { exerciseId: number; setNumber: number; reps: number; weightKg: number },
  ): Observable<WorkoutSession> {
    return this.httpClient.post<WorkoutSession>(`${this.apiUrl}/${sessionId}/sets`, set);
  }
}
