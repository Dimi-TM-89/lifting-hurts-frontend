import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ExerciseService } from '../exercise-service';
import { ExerciseComponent } from '../exercise-component/exercise-component';

@Component({
  selector: 'app-exercise-list-component',
  imports: [ExerciseComponent, AsyncPipe],
  templateUrl: './exercise-list-component.html',
  styleUrl: './exercise-list-component.css',
})
export class ExerciseListComponent {
  private readonly exerciseService = inject(ExerciseService);
  exercises$ = this.exerciseService.getExercises();
}
