/*
 * Presentational card for a single exercise (used in the exercise grid + the detail view).
 *
 * Two signal inputs (Angular 17.1+ API):
 *  - `exercise` (required): `input.required<Exercise>()` makes the framework enforce that
 *    the parent binds the input, so the non-null assertion (`!`) we used to need is gone.
 *  - `muscleGroupName` (optional, default ''): the parent already knows the related group's
 *    name from its own data, so it can pass it in to avoid an extra HTTP call per card.
 *    If empty, the badge isn't rendered.
 *
 * Signal inputs return an `InputSignal<T>` — we call the field as a function to read the
 * value: `this.exercise().id` in TS, `ex.id` (after `@let ex = exercise()`) in the template.
 *
 * Why is the whole card clickable (vs. just a "View" button)?
 *  - Bigger tap target on mobile and a more "modern" feel — common pattern on cards.
 */
import { Component, inject, input } from '@angular/core';
import { Exercise } from '../exercise';
import { Router } from '@angular/router';

@Component({
  selector: 'app-exercise-component',
  imports: [],
  templateUrl: './exercise-component.html',
  styleUrl: './exercise-component.css',
})
export class ExerciseComponent {
  exercise = input.required<Exercise>();
  muscleGroupName = input('');

  private router = inject(Router);

  viewDetails(): void {
    this.router.navigate(['/exercises', this.exercise().id]);
  }
}
