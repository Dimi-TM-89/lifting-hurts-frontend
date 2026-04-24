/*
 * Service layer for /muscle-groups endpoints.
 *
 * Design choices:
 *  - `providedIn: 'root'` → singleton, tree-shakable, no need to declare it in any module.
 *  - `inject(HttpClient)` instead of constructor injection → modern Angular style, lets us
 *    declare the field as `private` + `readonly`-ish without a verbose constructor.
 *  - apiUrl is built from `environment.apiUrl` so dev/prod can point to different backends
 *    without code changes.
 *  - GET methods are public (no token attached by interceptor); POST/PUT/DELETE will
 *    automatically receive the JWT thanks to the allowedList in app.config.ts. The backend
 *    enforces the admin role on those endpoints.
 *  - Methods return `Observable<T>` rather than firing `.subscribe()` here — subscription
 *    is the caller's responsibility (so they can use AsyncPipe, combine streams, etc.).
 */
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MuscleGroup } from './muscle-group';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MuscleGroupService {
  private apiUrl = `${environment.apiUrl}/muscle-groups`;
  private httpClient = inject(HttpClient);

  getMuscleGroups(): Observable<MuscleGroup[]> {
    return this.httpClient.get<MuscleGroup[]>(this.apiUrl);
  }

  getMuscleGroupById(id: number): Observable<MuscleGroup> {
    return this.httpClient.get<MuscleGroup>(`${this.apiUrl}/${id}`);
  }

  // Admin-only on the backend; we send only the writable fields, never `id` or `exercises`.
  postMuscleGroup(muscleGroup: {
    name: string;
    description: string;
    imageUrl: string;
  }): Observable<MuscleGroup> {
    return this.httpClient.post<MuscleGroup>(this.apiUrl, muscleGroup);
  }

  putMuscleGroup(
    id: number,
    muscleGroup: { name: string; description: string; imageUrl: string },
  ): Observable<MuscleGroup> {
    return this.httpClient.put<MuscleGroup>(`${this.apiUrl}/${id}`, muscleGroup);
  }

  deleteMuscleGroup(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/${id}`);
  }
}
