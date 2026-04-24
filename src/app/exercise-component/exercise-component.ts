/*
 * Presentational card for a single exercise (used in the exercise grid + the detail view).
 *
 * Two @Inputs:
 *  - `exercise` (required): the exercise to render.
 *  - `muscleGroupName` (optional): the parent already knows the related group's name from
 *    its own data set, so it can pass it in to avoid an extra HTTP call per card. If empty
 *    the badge just isn't rendered.
 *
 * Why is the whole card clickable (vs. just a "View" button)?
 *  - Bigger tap target on mobile and a more "modern" feel — common pattern on cards.
 */
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
