import { Exercise } from './exercise';

export interface WorkoutSet {
  id: number;
  setNumber: number;
  reps: number;
  weightKg: number;
  exercise?: Exercise;
}
