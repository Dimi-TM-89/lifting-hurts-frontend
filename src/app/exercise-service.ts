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
