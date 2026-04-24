/*
 * MuscleGroup model — mirrors the backend DTO 1:1 so HttpClient can deserialize JSON
 * directly into typed objects (`http.get<MuscleGroup[]>(...)`).
 *
 * `exercises: Exercise[]` is included because the API returns the related exercises
 * eagerly when a muscle group is fetched (used by the detail view).
 */
import { Exercise } from './exercise';

export interface MuscleGroup {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  exercises: Exercise[];
}
