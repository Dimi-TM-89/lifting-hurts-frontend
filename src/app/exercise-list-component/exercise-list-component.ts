/*
 * Public list page for exercises with two filter mechanisms:
 *   1. Free-text search on the name.
 *   2. Filter pills by muscle group (0 = "All").
 *
 * Why client-side filtering instead of calling the backend each time?
 *  - Single fetch on init → cheap, instant filter response, no debounce needed.
 *  - The backend does have a `searchByName` endpoint (see exercise-service) for when the
 *    catalog grows large enough that loading everything stops scaling.
 *
 * Reactivity:
 *  - `exercises`, `muscleGroups`, `searchQuery`, `selectedMuscleGroupId` are all signals.
 *  - `filteredExercises` is a `computed()` that re-derives whenever ANY of those change —
 *    no manual `update()` calls anywhere.
 *  - `cdr.markForCheck()` is needed in the async callbacks because we run zoneless and
 *    HTTP responses fire outside a tracked event.
 *
 * `getMuscleGroupName` is a small helper used by the template to map the FK on each
 * exercise to a display name from the muscleGroups signal — avoids a per-card HTTP call.
 */
import { Component, inject, OnInit, signal, computed, ChangeDetectorRef } from '@angular/core';
import { ExerciseService } from '../exercise-service';
import { MuscleGroupService } from '../muscle-group-service';
import { ExerciseComponent } from '../exercise-component/exercise-component';
import { Exercise } from '../exercise';
import { MuscleGroup } from '../muscle-group';

@Component({
  selector: 'app-exercise-list-component',
  imports: [ExerciseComponent],
  templateUrl: './exercise-list-component.html',
  styleUrl: './exercise-list-component.css',
})
export class ExerciseListComponent implements OnInit {
  private readonly exerciseService = inject(ExerciseService);
  private readonly muscleGroupService = inject(MuscleGroupService);
  private cdr = inject(ChangeDetectorRef);

  exercises = signal<Exercise[]>([]);
  muscleGroups = signal<MuscleGroup[]>([]);
  searchQuery = signal<string>('');
  selectedMuscleGroupId = signal<number>(0); // 0 means "all groups"

  // Re-derived whenever any of the inputs change. AND-combined: pill filter then text filter.
  filteredExercises = computed(() => {
    let list = this.exercises();
    const mgId = this.selectedMuscleGroupId();
    const query = this.searchQuery().toLowerCase().trim();

    if (mgId > 0) {
      list = list.filter((e) => e.muscleGroupId === mgId);
    }
    if (query) {
      list = list.filter((e) => e.name.toLowerCase().includes(query));
    }
    return list;
  });

  ngOnInit(): void {
    // Load both datasets in parallel; markForCheck after each because we're zoneless.
    this.exerciseService.getExercises().subscribe((exercises) => {
      this.exercises.set(exercises);
      this.cdr.markForCheck();
    });
    this.muscleGroupService.getMuscleGroups().subscribe((groups) => {
      this.muscleGroups.set(groups);
      this.cdr.markForCheck();
    });
  }

  // Plain (input) event instead of ngModel — keeps this component free of FormsModule.
  onSearchInput(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
    this.cdr.markForCheck();
  }

  filterByMuscleGroup(id: number): void {
    this.selectedMuscleGroupId.set(id);
    this.cdr.markForCheck();
  }

  // O(n) lookup but n is tiny (number of muscle groups) so a Map would be premature.
  getMuscleGroupName(mgId: number): string {
    const mg = this.muscleGroups().find((g) => g.id === mgId);
    return mg ? mg.name : '';
  }
}
