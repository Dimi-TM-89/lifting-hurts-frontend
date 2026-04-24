/*
 * WorkoutSet model — one row in a workout session (e.g. "bench press, set 2, 8 reps @ 60kg").
 *
 * `exercise?` is optional: on POST we send only `exerciseId` (see addSet in
 * workout-session-service.ts), but on GET the backend embeds the full Exercise object so we
 * can render its name without an extra round-trip.
 */
import { Exercise } from './exercise';

export interface WorkoutSet {
  id: number;
  setNumber: number;
  reps: number;
  weightKg: number;
  exercise?: Exercise;
}
