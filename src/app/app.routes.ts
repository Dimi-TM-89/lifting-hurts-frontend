/*
 * Route table — single source of truth for which URL renders which component
 * and which guard protects it.
 *
 * Three access tiers:
 *   1. Public            → no canActivate (visitors can browse muscle groups + exercises).
 *   2. Authenticated     → canActivate: [AuthGuard] (any logged-in user, e.g. workout sessions).
 *   3. Admin only        → canActivate: [roleGuard] + data.roles, see role.guard.ts.
 *
 * The /callback route is required by Auth0: after the user logs in on Auth0's hosted page,
 * Auth0 redirects back here with the auth code in the URL — the SDK consumes it and finishes
 * the login. The component itself is just a "Logging in..." placeholder.
 *
 * Form routes (workout-sessions/new, admin/.../form) intentionally have NO :id segment —
 * mode and id are passed via router state (see *-form-component.ts) instead of the URL,
 * so the form URL can't be deep-linked or bookmarked.
 */
import { Routes } from '@angular/router';
import { AuthGuard } from '@auth0/auth0-angular';
import { roleGuard } from './role.guard';
import { HomeComponent } from './home-component/home-component';
import { MuscleGroupListComponent } from './muscle-group-list-component/muscle-group-list-component';
import { MuscleGroupDetailComponent } from './muscle-group-detail-component/muscle-group-detail-component';
import { MuscleGroupAdminListComponent } from './muscle-group-admin-list-component/muscle-group-admin-list-component';
import { MuscleGroupFormComponent } from './muscle-group-form-component/muscle-group-form-component';
import { ExerciseComponent } from './exercise-component/exercise-component';
import { WorkoutSessionComponent } from './workout-session-component/workout-session-component';
import { CallbackComponent } from './callback-component/callback-component';
import { ExerciseListComponent } from './exercise-list-component/exercise-list-component';
import { WorkoutSessionFormComponent } from './workout-session-form-component/workout-session-form-component';
import { ExerciseAdminListComponent } from './exercise-admin-list-component/exercise-admin-list-component';
import { ExerciseFormComponent } from './exercise-form-component/exercise-form-component';
import { ExerciseDetailComponent } from './exercise-detail-component/exercise-detail-component';

export const routes: Routes = [
  // Public routes — visible to anyone
  { path: '', component: HomeComponent },
  { path: 'callback', component: CallbackComponent },
  { path: 'muscle-groups', component: MuscleGroupListComponent },
  { path: 'muscle-groups/:id', component: MuscleGroupDetailComponent },
  { path: 'exercises/:id', component: ExerciseDetailComponent },
  { path: 'exercises', component: ExerciseListComponent },

  // Requires login (any authenticated user)
  {
    path: 'workout-sessions/new',
    component: WorkoutSessionFormComponent,
    canActivate: [AuthGuard],
  },
  { path: 'workout-sessions', component: WorkoutSessionComponent, canActivate: [AuthGuard] },

  // Requires admin role — roleGuard reads `data.roles` and checks the JWT claim
  {
    path: 'admin/muscle-groups',
    component: MuscleGroupAdminListComponent,
    canActivate: [roleGuard],
    data: { roles: ['lifting-hurts-admin'] },
  },
  {
    path: 'admin/muscle-groups/form',
    component: MuscleGroupFormComponent,
    canActivate: [roleGuard],
    data: { roles: ['lifting-hurts-admin'] },
  },
  {
    path: 'admin/exercises',
    component: ExerciseAdminListComponent,
    canActivate: [roleGuard],
    data: { roles: ['lifting-hurts-admin'] },
  },
  {
    path: 'admin/exercises/form',
    component: ExerciseFormComponent,
    canActivate: [roleGuard],
    data: { roles: ['lifting-hurts-admin'] },
  },
];
