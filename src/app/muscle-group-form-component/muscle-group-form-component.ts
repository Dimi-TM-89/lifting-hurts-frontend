/*
 * Add / edit form for a muscle group (admin only — protected by roleGuard in app.routes.ts).
 *
 * Notable design choices:
 *  - One component handles BOTH "add" and "edit" — the mode is decided by router state
 *    (`{ mode: 'add' | 'edit', id: number }`) rather than separate routes. This keeps the
 *    template, validation, and submit handler in a single place; only the called service
 *    method differs (POST vs PUT).
 *  - Mode + id come via `router.currentNavigation()?.extras.state`, NOT via query params,
 *    so they don't pollute the URL. Trade-off: the form route can't be deep-linked
 *    (refreshing /admin/muscle-groups/form loses the state) — acceptable here because the
 *    admin always reaches it through the list page.
 *  - We use template-driven forms (FormsModule + ngModel) instead of reactive forms because
 *    the form has only three trivial fields. Reactive forms shine when validation gets
 *    complex; here the boilerplate isn't worth it.
 *  - `muscleGroupData` is a `signal` so binding still works and we can read the latest
 *    value with `muscleGroupData()` in onSubmit().
 *  - `isSubmitted` flag prevents double-submits AND drives the error banner visibility.
 */
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MuscleGroupService } from '../muscle-group-service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-muscle-group-form-component',
  imports: [FormsModule],
  templateUrl: './muscle-group-form-component.html',
  styleUrl: './muscle-group-form-component.css',
})
export class MuscleGroupFormComponent {
  isAdd = false;
  isEdit = false;
  muscleGroupId = 0;

  muscleGroupData = signal<{ name: string; description: string; imageUrl: string }>({
    name: '',
    description: '',
    imageUrl: '',
  });

  isSubmitted = false;
  errorMessage = signal<string>('');

  // Constructor injection here (instead of inject()) so we can read the navigation state
  // immediately — currentNavigation() is only valid before the navigation completes,
  // i.e. during construction.
  constructor(
    private router: Router,
    private muscleGroupService: MuscleGroupService,
  ) {
    const state = this.router.currentNavigation()?.extras.state || {};
    this.isAdd = state['mode'] === 'add';
    this.isEdit = state['mode'] === 'edit';
    this.muscleGroupId = +state['id'];

    // Safety net: if someone arrives without state (e.g. via dev refresh), default to "add".
    if (!this.isAdd && !this.isEdit) {
      this.isAdd = true;
    }

    // Edit mode → pre-fill the form by fetching the existing record.
    if (this.muscleGroupId != null && this.muscleGroupId > 0) {
      this.muscleGroupService.getMuscleGroupById(this.muscleGroupId).subscribe((result) => {
        this.muscleGroupData.set({
          name: result.name,
          description: result.description,
          imageUrl: result.imageUrl,
        });
      });
    }
  }

  onSubmit() {
    this.isSubmitted = true;
    if (this.isAdd) {
      this.muscleGroupService.postMuscleGroup(this.muscleGroupData()).subscribe({
        next: () => this.router.navigateByUrl('/admin/muscle-groups'),
        error: (e: HttpErrorResponse) => this.errorMessage.set(e.message),
      });
    }
    if (this.isEdit) {
      this.muscleGroupService.putMuscleGroup(this.muscleGroupId, this.muscleGroupData()).subscribe({
        next: () => this.router.navigateByUrl('/admin/muscle-groups'),
        error: (e: HttpErrorResponse) => this.errorMessage.set(e.message),
      });
    }
  }
}
