import { Component, inject, OnInit, signal, computed, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ExerciseService } from '../exercise-service';
import { WorkoutSessionService } from '../workout-session-service';
import { MuscleGroupService } from '../muscle-group-service';
import { Exercise } from '../exercise';
import { WorkoutSession } from '../workout-session';
import { WorkoutSet } from '../workout-set';
import { AuthService } from '@auth0/auth0-angular';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';

interface SetHistory {
  date: string;
  setNumber: number;
  reps: number;
  weightKg: number;
  workSet: number; // reps * weight
}

@Component({
  selector: 'app-exercise-detail-component',
  imports: [DatePipe],
  templateUrl: './exercise-detail-component.html',
  styleUrl: './exercise-detail-component.css',
})
export class ExerciseDetailComponent implements OnInit {
  exercise = signal<Exercise | null>(null);
  muscleGroupName = signal<string>('');
  setHistory = signal<SetHistory[]>([]);

  private auth = inject(AuthService);
  readonly isAuth = toSignal(this.auth.isAuthenticated$, { initialValue: false });

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private exerciseService = inject(ExerciseService);
  private sessionService = inject(WorkoutSessionService);
  private muscleGroupService = inject(MuscleGroupService);
  private cdr = inject(ChangeDetectorRef);

  // Computed stats
  heaviestWeight = computed(() => {
    const history = this.setHistory();
    if (history.length === 0) return 0;
    return Math.max(...history.map((s) => s.weightKg));
  });

  bestWorkSet = computed(() => {
    const history = this.setHistory();
    if (history.length === 0) return null;
    return history.reduce((best, s) => (s.workSet > best.workSet ? s : best), history[0]);
  });

  totalSetsAllTime = computed(() => this.setHistory().length);

  heaviestWeightSet = computed(() => {
    const history = this.setHistory();
    if (history.length === 0) return null;
    return history.reduce((best, s) => (s.weightKg > best.weightKg ? s : best), history[0]);
  });

  recentSets = computed(() => {
    return this.setHistory().slice(0, 20);
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.exerciseService.getExerciseById(+id).subscribe((exercise) => {
        this.exercise.set(exercise);
        if (exercise.muscleGroupId) {
          this.muscleGroupService.getMuscleGroupById(exercise.muscleGroupId).subscribe((mg) => {
            this.muscleGroupName.set(mg.name);
            this.cdr.markForCheck();
          });
        }
        this.cdr.markForCheck();
      });

      // Load stats for logged-in users
      this.auth.isAuthenticated$.subscribe((isAuth) => {
        if (isAuth) {
          this.sessionService.getMySessions().subscribe((sessions) => {
            this.buildHistory(sessions, +id!);
            this.cdr.markForCheck();
          });
        }
      });
    }
  }

  private buildHistory(sessions: WorkoutSession[], exerciseId: number): void {
    const history: SetHistory[] = [];
    for (const session of sessions) {
      for (const set of session.workoutSets ?? []) {
        if (set.exercise?.id === exerciseId) {
          history.push({
            date: session.startedAt,
            setNumber: set.setNumber,
            reps: set.reps,
            weightKg: set.weightKg,
            workSet: set.reps * set.weightKg,
          });
        }
      }
    }
    // Most recent first
    history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    this.setHistory.set(history);
  }

  goBack(): void {
    this.router.navigate(['/exercises']);
  }
}
