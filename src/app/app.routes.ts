import { Routes } from '@angular/router';
import { HomeComponent } from './home-component/home-component';
import { MuscleGroupListComponent } from './muscle-group-list-component/muscle-group-list-component';
import { MuscleGroupDetailComponent } from './muscle-group-detail-component/muscle-group-detail-component';
import { MuscleGroupAdminListComponent } from './muscle-group-admin-list-component/muscle-group-admin-list-component';
import { MuscleGroupFormComponent } from './muscle-group-form-component/muscle-group-form-component';
import { ExerciseComponent } from './exercise-component/exercise-component';
import { WorkoutSessionComponent } from './workout-session-component/workout-session-component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'muscle-groups', component: MuscleGroupListComponent },
  { path: 'muscle-groups/:id', component: MuscleGroupDetailComponent },
  { path: 'exercises', component: ExerciseComponent },
  { path: 'workout-sessions', component: WorkoutSessionComponent },
  { path: 'admin/muscle-groups', component: MuscleGroupAdminListComponent },
  { path: 'admin/muscle-groups/form', component: MuscleGroupFormComponent },
];
