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

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'callback', component: CallbackComponent },
  { path: 'muscle-groups', component: MuscleGroupListComponent },
  { path: 'muscle-groups/:id', component: MuscleGroupDetailComponent },
  { path: 'exercises', component: ExerciseListComponent },
  // Requires login (any authenticated user)
  {
    path: 'workout-sessions/new',
    component: WorkoutSessionFormComponent,
    canActivate: [AuthGuard],
  },
  { path: 'workout-sessions', component: WorkoutSessionComponent, canActivate: [AuthGuard] },
  // Requires admin role
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
];
