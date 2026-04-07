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

  getExercisesByMuscleGroup(muscleGroupId: number): Observable<Exercise[]> {
    return this.httpClient.get<Exercise[]>(`${this.apiUrl}/by-muscle-group/${muscleGroupId}`);
  }

  getExerciseById(id: number): Observable<Exercise> {
    return this.httpClient.get<Exercise>(`${this.apiUrl}/${id}`);
  }
}
