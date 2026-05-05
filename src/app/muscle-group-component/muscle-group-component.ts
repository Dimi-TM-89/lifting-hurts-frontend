/*
 * Presentational "card" for a single muscle group.
 *
 * This is intentionally dumb (presentation only): the data is passed in via signal input
 * from the list parent. Splitting it out lets us reuse the card in any list/grid context
 * and keeps each component small.
 *
 * `input.required<MuscleGroup>()` is the modern signal-based input API (Angular 17.1+).
 * Compared to the older `@Input() muscleGroup!: MuscleGroup`:
 *   - The framework enforces at runtime that the parent MUST bind the input — Angular
 *     throws NG0950 if it's missing, so the non-null assertion (`!`) isn't needed.
 *   - The field is an `InputSignal<MuscleGroup>`, so the value is read by CALLING it:
 *     `this.muscleGroup()` in TS, `muscleGroup()` in the template.
 *   - It plays nicely with `computed()` and `effect()` if we ever need derived values.
 *
 * The `@if (muscleGroup)` guard the previous version had at the top of the template is
 * also gone — it was a belt-and-braces for the first-paint case, but `input.required`
 * guarantees the value is set before the component renders.
 */
import { Component, inject, input } from '@angular/core';
import { MuscleGroup } from '../muscle-group';
import { Router } from '@angular/router';

@Component({
  selector: 'app-muscle-group-component',
  imports: [],
  templateUrl: './muscle-group-component.html',
  styleUrl: './muscle-group-component.css',
})
export class MuscleGroupComponent {
  muscleGroup = input.required<MuscleGroup>();

  private readonly router = inject(Router);

  // Imperative navigation (vs routerLink) keeps the click handler co-located with any
  // future logic we might add (analytics, confirmation, etc.).
  detail(id: number): void {
    this.router.navigate(['/muscle-groups', id]);
  }
}
