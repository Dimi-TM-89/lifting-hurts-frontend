import { WorkoutSet } from './workout-set';

export interface WorkoutSession {
  id: number;
  auth0UserId: string;
  startedAt: string;
  endedAt: string;
  notes: string;
  workoutSets: WorkoutSet[];
}
