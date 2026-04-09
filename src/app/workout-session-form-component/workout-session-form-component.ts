import { Component, inject, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { WorkoutSessionService } from '../workout-session-service';
import { ExerciseService } from '../exercise-service';
import { Exercise } from '../exercise';
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
  exercises = signal<Exercise[]>([]);
  errorMessage = signal<string>('');

  private userId = '';

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private auth = inject(AuthService);
  private sessionService = inject(WorkoutSessionService);
  private exerciseService = inject(ExerciseService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.setForm = this.fb.group({
      exerciseId: ['', Validators.required],
      reps: [null, [Validators.required, Validators.min(1)]],
      weightKg: [null, [Validators.required, Validators.min(0)]],
    });

    this.auth.user$.subscribe((user) => {
      if (user?.sub) {
        this.userId = user.sub;
      }
    });

    this.exerciseService.getExercises().subscribe((exercises) => {
      this.exercises.set(exercises);
    });
  }

  startSession(): void {
    this.startTime = new Date();
    const session = {
      auth0UserId: this.userId,
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

    // Auto-calculate set number: count existing sets for this exercise + 1
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
          // Keep the exercise selected, clear reps/weight for next set
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
      auth0UserId: this.userId,
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

  getNextSetNumber(exerciseId: number): number {
    if (!this.session?.workoutSets) return 1;
    const sets = this.session.workoutSets.filter((s) => s.exercise?.id === exerciseId);
    return sets.length + 1;
  }

  private formatDateTime(date: Date): string {
    return date.toISOString().slice(0, 19);
  }
}
