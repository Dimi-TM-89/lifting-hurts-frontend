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
