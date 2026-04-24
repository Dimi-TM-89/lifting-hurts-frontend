/*
 * WorkoutSession model.
 *
 * - `auth0UserId` is the Auth0 `sub` claim that owns this session. The frontend never
 *   sets it on create — the backend extracts it from the JWT (see workout-session-service).
 *   It's kept on the type so the frontend can read it back from responses.
 * - `startedAt` / `endedAt` are ISO-8601 strings (not Date objects) because that's how
 *   they cross the JSON boundary; we convert with `new Date(...)` only at the use site.
 */
import { WorkoutSet } from './workout-set';

export interface WorkoutSession {
  id: number;
  auth0UserId: string;
  startedAt: string;
  endedAt: string;
  notes: string;
  workoutSets: WorkoutSet[];
}
