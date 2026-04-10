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
  session: WorkoutSession | null = null;
  isActive = false;
  startTime: Date | null = null;

  setForm!: FormGroup;

  // Data
  exercises = signal<Exercise[]>([]);
  muscleGroups = signal<MuscleGroup[]>([]);
  errorMessage = signal<string>('');

  // Exercise picker state
  searchQuery = signal<string>('');
  selectedMuscleGroupId = signal<number>(0); // 0 = all
  selectedExercise = signal<Exercise | null>(null);
  exercisePickerOpen = signal<boolean>(false);

  // Filtered exercises (computed)
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

  // Exercise picker methods
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
          this.setForm.patchValue({ reps: null, weightKg: null });
          this.setForm.get('reps')?.markAsUntouched();
          this.setForm.get('weightKg')?.markAsUntouched();
          this.errorMessage.set('');
          this.cdr.markForCheck();
        },
        error: (e: HttpErrorResponse) => this.errorMessage.set(e.message),
      });
  }

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

  updateNotes(event: Event): void {
    if (this.session) {
      this.session.notes = (event.target as HTMLInputElement).value;
    }
  }

  private formatDateTime(date: Date): string {
    return date.toISOString().slice(0, 19);
  }
}
