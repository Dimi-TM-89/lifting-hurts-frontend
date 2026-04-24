/*
 * "Live workout" form. The most complex component in the app — it has THREE phases:
 *
 *   1. Pre-session  → big "Start Session" button only.
 *   2. Active       → an "Add a set" form, a notes field, the running list of logged sets,
 *                     and an "End Session" button.
 *   3. Done         → navigates away to /workout-sessions on End.
 *
 * Why split into phases (instead of a single CRUD form)?
 *  - The session is created AS SOON AS the user clicks "Start" so we capture an accurate
 *    `startedAt` and assign a real backend id immediately. From then on, every "Add Set"
 *    is a POST to /workout-sessions/{id}/sets, which keeps the data persistent — if the
 *    browser crashes mid-workout the user doesn't lose their progress.
 *  - "End Session" then PUTs the final `endedAt` and notes.
 *
 * Why reactive forms here (vs template-driven elsewhere)?
 *  - The set form has dynamic validators (min(1), min(0)) and we patch values
 *    programmatically (clear reps + weight after each add, mark untouched). Reactive
 *    forms make those operations explicit and type-safe.
 *  - The exercise picker is NOT a form control; it's separate state because it needs
 *    search + filter + open/close UX that doesn't map to a single input.
 *
 * Exercise picker design:
 *  - Custom dropdown panel (not a <select>) because we need search + muscle-group pills.
 *  - Mirrors the search/filter pattern of ExerciseListComponent — same UX so users learn
 *    one model.
 *  - On select we patch the hidden `exerciseId` form control AND keep a separate
 *    `selectedExercise` signal so the picker button can show "name + group".
 *
 * Date format helper: `formatDateTime` slices the ISO string to "YYYY-MM-DDTHH:mm:ss"
 * because the backend's LocalDateTime parser doesn't accept the trailing "Z" and millis.
 */
import { Component, inject, OnInit, signal, computed, ChangeDetectorRef } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { WorkoutSessionService } from '../workout-session-service';
import { ExerciseService } from '../exercise-service';
import { MuscleGroupService } from '../muscle-group-service';
import { Exercise } from '../exercise';
import { MuscleGroup } from '../muscle-group';
import { WorkoutSession } from '../workout-session';
import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-workout-session-form-component',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './workout-session-form-component.html',
  styleUrl: './workout-session-form-component.css',
})
export class WorkoutSessionFormComponent implements OnInit {
  // Session state
  session: WorkoutSession | null = null;
  isActive = false;
  startTime: Date | null = null;

  // Reactive form for the "Add a Set" sub-form (exerciseId + reps + weight).
  setForm!: FormGroup;

  // Reference data
  exercises = signal<Exercise[]>([]);
  muscleGroups = signal<MuscleGroup[]>([]);
  errorMessage = signal<string>('');

  // Exercise picker state — kept separate from setForm because picker UX needs
  // search/filter/open-close that don't map to a single form control.
  searchQuery = signal<string>('');
  selectedMuscleGroupId = signal<number>(0); // 0 = "All"
  selectedExercise = signal<Exercise | null>(null);
  exercisePickerOpen = signal<boolean>(false);

  // Same client-side filter pattern as the public exercise list.
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

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private sessionService = inject(WorkoutSessionService);
  private exerciseService = inject(ExerciseService);
  private muscleGroupService = inject(MuscleGroupService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    // Validators.min(1) on reps prevents 0/negative; min(0) on weight allows bodyweight sets.
    this.setForm = this.fb.group({
      exerciseId: ['', Validators.required],
      reps: [null, [Validators.required, Validators.min(1)]],
      weightKg: [null, [Validators.required, Validators.min(0)]],
    });

    this.exerciseService.getExercises().subscribe((exercises) => {
      this.exercises.set(exercises);
    });

    this.muscleGroupService.getMuscleGroups().subscribe((groups) => {
      this.muscleGroups.set(groups);
    });
  }

  // --- Exercise picker -------------------------------------------------------------------

  toggleExercisePicker(): void {
    this.exercisePickerOpen.update((v) => !v);
    this.cdr.markForCheck();
  }

  onSearchInput(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
    this.cdr.markForCheck();
  }

  filterByMuscleGroup(id: number): void {
    this.selectedMuscleGroupId.set(id);
    this.cdr.markForCheck();
  }

  // Selecting an exercise both records it in our signal AND patches the hidden form
  // control so the form's validity flips to "valid" once reps/weight are also filled.
  selectExercise(exercise: Exercise): void {
    this.selectedExercise.set(exercise);
    this.setForm.patchValue({ exerciseId: exercise.id });
    this.exercisePickerOpen.set(false);
    this.cdr.markForCheck();
  }

  getMuscleGroupName(mgId: number): string {
    const mg = this.muscleGroups().find((g) => g.id === mgId);
    return mg ? mg.name : '';
  }

  // --- Session lifecycle -----------------------------------------------------------------

  // Persist the session to the backend immediately so we have an id to attach sets to.
  // endedAt is set to the same value as startedAt for now; it gets updated on End.
  startSession(): void {
    this.startTime = new Date();
    const session = {
      startedAt: this.formatDateTime(this.startTime),
      endedAt: this.formatDateTime(this.startTime),
      notes: '',
    };

    this.sessionService.createSession(session).subscribe({
      next: (created) => {
        this.session = created;
        this.isActive = true;
        this.cdr.markForCheck();
      },
      error: (e: HttpErrorResponse) => this.errorMessage.set(e.message),
    });
  }

  // setNumber is computed client-side: it's the count of existing sets for this exercise + 1.
  // This lets the user log multiple sets of the same exercise without manually numbering them.
  addSet(): void {
    if (!this.session || this.setForm.invalid) return;

    const formValue = this.setForm.value;
    const exerciseId = +formValue.exerciseId;

    const existingSets = this.session.workoutSets
      ? this.session.workoutSets.filter((s) => s.exercise?.id === exerciseId)
      : [];
    const nextSetNumber = existingSets.length + 1;

    this.sessionService
      .addSet(this.session.id, {
        exerciseId: exerciseId,
        setNumber: nextSetNumber,
        reps: +formValue.reps,
        weightKg: +formValue.weightKg,
      })
      .subscribe({
        next: (updated) => {
          this.session = updated;
          // Reset reps + weight (but keep the exercise selected — common pattern: log multiple
          // sets of the same exercise without re-picking it). markAsUntouched silences the
          // "required" errors on the freshly-cleared inputs.
          this.setForm.patchValue({ reps: null, weightKg: null });
          this.setForm.get('reps')?.markAsUntouched();
          this.setForm.get('weightKg')?.markAsUntouched();
          this.errorMessage.set('');
          this.cdr.markForCheck();
        },
        error: (e: HttpErrorResponse) => this.errorMessage.set(e.message),
      });
  }

  // PUT to set the real endedAt + final notes, then leave the page.
  endSession(): void {
    if (!this.session) return;

    const endTime = new Date();
    const updatedSession = {
      startedAt: this.formatDateTime(this.startTime!),
      endedAt: this.formatDateTime(endTime),
      notes: this.session.notes,
    };

    this.sessionService.updateSession(this.session.id, updatedSession).subscribe({
      next: () => this.router.navigateByUrl('/workout-sessions'),
      error: (e: HttpErrorResponse) => this.errorMessage.set(e.message),
    });
  }

  // Notes are kept in memory and only sent to the backend on End — avoids one HTTP call
  // per keystroke. (Could be debounced + auto-saved later for resilience.)
  updateNotes(event: Event): void {
    if (this.session) {
      this.session.notes = (event.target as HTMLInputElement).value;
    }
  }

  // Backend's LocalDateTime parser doesn't accept the trailing "Z" or millis that
  // toISOString() produces, so we slice to "YYYY-MM-DDTHH:mm:ss" before sending.
  private formatDateTime(date: Date): string {
    return date.toISOString().slice(0, 19);
  }
}
