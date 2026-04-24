/*
 * Add / edit form for an exercise (admin only).
 *
 * Same dual-mode pattern as MuscleGroupFormComponent:
 *  - One component, mode + id passed via router state.
 *  - Template-driven forms (FormsModule) — only four fields, reactive forms would be overkill.
 *  - Submit dispatches to POST or PUT based on the mode.
 *
 * What's different from the muscle-group form?
 *  - The exercise is owned by a muscle group, so we render a <select> dropdown populated
 *    from MuscleGroupService — that's why we hit the muscle-group endpoint here too.
 *  - On error we ALSO reset `isSubmitted = false` so the user can retry. The muscle-group
 *    form leaves it true (admin would just navigate away). Could be unified later.
 *
 * Why ngOnInit (vs constructor) for the data fetches?
 *  - currentNavigation() must be read in the constructor (only available before navigation
 *    completes), but the HTTP fetches are deferred to ngOnInit so the component is fully
 *    constructed and Angular's lifecycle is the one driving them.
 */
import { Component, signal, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ExerciseService } from '../exercise-service';
import { MuscleGroupService } from '../muscle-group-service';
import { MuscleGroup } from '../muscle-group';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-exercise-form-component',
  imports: [FormsModule],
  templateUrl: './exercise-form-component.html',
  styleUrl: './exercise-form-component.css',
})
export class ExerciseFormComponent implements OnInit {
  isAdd = false;
  isEdit = false;
  exerciseId = 0;

  exerciseData = signal<{
    name: string;
    description: string;
    imageUrl: string;
    muscleGroupId: number;
  }>({
    name: '',
    description: '',
    imageUrl: '',
    muscleGroupId: 0,
  });

  muscleGroups = signal<MuscleGroup[]>([]);
  isSubmitted = false;
  errorMessage = signal<string>('');

  private router = inject(Router);
  private exerciseService = inject(ExerciseService);
  private muscleGroupService = inject(MuscleGroupService);

  // Constructor reads router state — that data is only valid before navigation completes.
  constructor() {
    const state = this.router.currentNavigation()?.extras.state || {};
    this.isAdd = state['mode'] === 'add';
    this.isEdit = state['mode'] === 'edit';
    this.exerciseId = +state['id'];

    // Default to add mode if state is missing (e.g. direct URL hit).
    if (!this.isAdd && !this.isEdit) {
      this.isAdd = true;
    }
  }

  ngOnInit(): void {
    // Always load muscle groups for the dropdown (used in both add and edit).
    this.muscleGroupService.getMuscleGroups().subscribe((result) => {
      this.muscleGroups.set(result);
    });

    // Edit mode → pre-fill the form with the existing record.
    if (this.exerciseId != null && this.exerciseId > 0) {
      this.exerciseService.getExerciseById(this.exerciseId).subscribe((result) => {
        this.exerciseData.set({
          name: result.name,
          description: result.description,
          imageUrl: result.imageUrl,
          muscleGroupId: result.muscleGroupId ?? 0,
        });
      });
    }
  }

  onSubmit() {
    this.isSubmitted = true;
    if (this.isAdd) {
      this.exerciseService.postExercise(this.exerciseData()).subscribe({
        next: () => this.router.navigateByUrl('/admin/exercises'),
        error: (e: HttpErrorResponse) => {
          this.errorMessage.set(e.message);
          this.isSubmitted = false; // re-enable the button so the admin can retry
        },
      });
    }
    if (this.isEdit) {
      this.exerciseService.putExercise(this.exerciseId, this.exerciseData()).subscribe({
        next: () => this.router.navigateByUrl('/admin/exercises'),
        error: (e: HttpErrorResponse) => {
          this.errorMessage.set(e.message);
          this.isSubmitted = false;
        },
      });
    }
  }
}
