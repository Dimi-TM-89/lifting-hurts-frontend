/*
 * Service layer for /exercises endpoints.
 *
 * Same overall design as MuscleGroupService (singleton, environment-driven URL,
 * observables back to the caller). Two extra read endpoints worth noting:
 *  - getExercisesByMuscleGroup: server-side filter by FK — cheaper than client-side
 *    filtering when the dataset gets large.
 *  - searchByName: server-side LIKE query. NOTE: name is interpolated raw into the URL;
 *    a hardening step would be to use HttpParams so special characters get encoded.
 */
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Exercise } from './exercise';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ExerciseService {
  private apiUrl = `${environment.apiUrl}/exercises`;
  private httpClient = inject(HttpClient);

  getExercises(): Observable<Exercise[]> {
    return this.httpClient.get<Exercise[]>(this.apiUrl);
  }

  getExerciseById(id: number): Observable<Exercise> {
    return this.httpClient.get<Exercise>(`${this.apiUrl}/${id}`);
  }

  getExercisesByMuscleGroup(muscleGroupId: number): Observable<Exercise[]> {
    return this.httpClient.get<Exercise[]>(`${this.apiUrl}/by-muscle-group/${muscleGroupId}`);
  }

  searchByName(name: string): Observable<Exercise[]> {
    return this.httpClient.get<Exercise[]>(`${this.apiUrl}/search?name=${name}`);
  }

  // Admin-only on the backend; muscleGroupId is the FK linking the exercise to a group.
  postExercise(exercise: {
    name: string;
    description: string;
    imageUrl: string;
    muscleGroupId: number;
  }): Observable<Exercise> {
    return this.httpClient.post<Exercise>(this.apiUrl, exercise);
  }

  putExercise(
    id: number,
    exercise: { name: string; description: string; imageUrl: string; muscleGroupId: number },
  ): Observable<Exercise> {
    return this.httpClient.put<Exercise>(`${this.apiUrl}/${id}`, exercise);
  }

  deleteExercise(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/${id}`);
  }
}
