/*
 * Presentational "card" for a single muscle group.
 *
 * This is intentionally dumb (presentation only): the data is passed in via @Input from
 * the list parent. Splitting it out lets us reuse the card in any list / grid context and
 * keeps each component small.
 *
 * `muscleGroup!: MuscleGroup` uses the non-null assertion because the value MUST be passed
 * in by the parent — we don't want a default. The `@if (muscleGroup)` guard in the template
 * is just belt-and-braces for the very first paint.
 */
import { Component, Input, inject } from '@angular/core';
import { MuscleGroup } from '../muscle-group';
import { Router } from '@angular/router';

@Component({
  selector: 'app-muscle-group-component',
  imports: [],
  templateUrl: './muscle-group-component.html',
  styleUrl: './muscle-group-component.css',
})
export class MuscleGroupComponent {
  @Input() muscleGroup!: MuscleGroup;

  private readonly router = inject(Router);

  // Imperative navigation (vs routerLink) keeps the click handler co-located with any
  // future logic we might add (analytics, confirmation, etc.).
  detail(id: number): void {
    this.router.navigate(['/muscle-groups', id]);
  }
}
