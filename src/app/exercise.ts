/*
 * Exercise model — mirrors the backend DTO.
 *
 * Both `muscleGroupId` and `muscleGroup` are optional (?) because the API sometimes returns
 * just the FK (in list views) and sometimes the full nested object (in detail views, or
 * inside a workout set). Marking them optional avoids defensive `!` casts everywhere.
 */
import { MuscleGroup } from './muscle-group';

export interface Exercise {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  muscleGroupId?: number;
  muscleGroup?: MuscleGroup;
}
