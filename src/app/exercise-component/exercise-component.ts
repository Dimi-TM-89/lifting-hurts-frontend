import { Component, Input, inject } from '@angular/core';
import { Exercise } from '../exercise';
import { Router } from '@angular/router';

@Component({
  selector: 'app-exercise-component',
  imports: [],
  templateUrl: './exercise-component.html',
  styleUrl: './exercise-component.css',
})
export class ExerciseComponent {
  @Input() exercise!: Exercise;
  @Input() muscleGroupName = '';

  private router = inject(Router);

  viewDetails(): void {
    this.router.navigate(['/exercises', this.exercise.id]);
  }
}
