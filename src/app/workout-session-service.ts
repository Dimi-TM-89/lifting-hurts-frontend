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

  // Authenticated user: get own sessions (backend extracts user from JWT)
  getMySessions(): Observable<WorkoutSession[]> {
    return this.httpClient.get<WorkoutSession[]>(`${this.apiUrl}/my-sessions`);
  }

  getSessionById(id: number): Observable<WorkoutSession> {
    return this.httpClient.get<WorkoutSession>(`${this.apiUrl}/${id}`);
  }

  // No need to pass auth0UserId — backend overrides it from JWT
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

  addSet(
    sessionId: number,
    set: { exerciseId: number; setNumber: number; reps: number; weightKg: number },
  ): Observable<WorkoutSession> {
    return this.httpClient.post<WorkoutSession>(`${this.apiUrl}/${sessionId}/sets`, set);
  }
}
