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

  getSessionsByUser(auth0UserId: string): Observable<WorkoutSession[]> {
    return this.httpClient.get<WorkoutSession[]>(`${this.apiUrl}/by-user/${auth0UserId}`);
  }

  getSessionById(id: number): Observable<WorkoutSession> {
    return this.httpClient.get<WorkoutSession>(`${this.apiUrl}/${id}`);
  }

  createSession(session: {
    auth0UserId: string;
    startedAt: string;
    endedAt: string;
    notes: string;
  }): Observable<WorkoutSession> {
    return this.httpClient.post<WorkoutSession>(this.apiUrl, session);
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

  updateSession(
    id: number,
    session: { auth0UserId: string; startedAt: string; endedAt: string; notes: string },
  ): Observable<WorkoutSession> {
    return this.httpClient.put<WorkoutSession>(`${this.apiUrl}/${id}`, session);
  }
}
