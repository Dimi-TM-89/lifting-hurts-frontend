/*
 * Detail page for one exercise.
 *
 * Two-tier rendering based on auth:
 *  - Visitor → just the exercise info card.
 *  - Authenticated user → ALSO sees personal stats (heaviest weight, best work set,
 *    total sets logged) + a recent-history table built from their own workout sessions.
 *
 * Why fetch ALL sessions (vs a dedicated /exercises/{id}/history endpoint)?
 *  - The same call is already used by the dashboard. Reusing it keeps the backend simple
 *    and lets the browser cache the response between page transitions.
 *  - Stats are computed client-side via `computed()` signals, so changing the exercise
 *    or having new sessions just triggers re-derivation, no extra HTTP.
 *
 * `SetHistory` is a local view-model: it's the flattened (session, set) pair plus a
 * pre-computed `workSet = reps * weightKg` (lifting-jargon for "volume"), used twice in
 * the template so we calculate it once at build time.
 */
import { Component, inject, OnInit, signal, computed, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ExerciseService } from '../exercise-service';
import { WorkoutSessionService } from '../workout-session-service';
import { MuscleGroupService } from '../muscle-group-service';
import { Exercise } from '../exercise';
import { WorkoutSession } from '../workout-session';
import { AuthService } from '@auth0/auth0-angular';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';

interface SetHistory {
  date: string;
  setNumber: number;
  reps: number;
  weightKg: number;
  workSet: number; // reps * weight — lifting "volume" metric
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
  // Used by the template to decide whether to render the stats section.
  readonly isAuth = toSignal(this.auth.isAuthenticated$, { initialValue: false });

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private exerciseService = inject(ExerciseService);
  private sessionService = inject(WorkoutSessionService);
  private muscleGroupService = inject(MuscleGroupService);
  private cdr = inject(ChangeDetectorRef);

  // --- Computed stats --------------------------------------------------------------------

  // Math.max with spread is fine here — set history per exercise is at most a few hundred entries.
  heaviestWeight = computed(() => {
    const history = this.setHistory();
    if (history.length === 0) return 0;
    return Math.max(...history.map((s) => s.weightKg));
  });

  // "Best work set" = set with highest reps × weight (highest volume in a single set).
  bestWorkSet = computed(() => {
    const history = this.setHistory();
    if (history.length === 0) return null;
    return history.reduce((best, s) => (s.workSet > best.workSet ? s : best), history[0]);
  });

  totalSetsAllTime = computed(() => this.setHistory().length);

  // Unused publicly today, kept for symmetry / future use.
  heaviestWeightSet = computed(() => {
    const history = this.setHistory();
    if (history.length === 0) return null;
    return history.reduce((best, s) => (s.weightKg > best.weightKg ? s : best), history[0]);
  });

  // Cap the table at 20 most-recent rows so the page doesn't grow unbounded.
  recentSets = computed(() => {
    return this.setHistory().slice(0, 20);
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      // 1) Fetch the exercise itself.
      this.exerciseService.getExerciseById(+id).subscribe((exercise) => {
        this.exercise.set(exercise);
        // 2) If it has a muscle group, resolve the name in a follow-up call.
        // Could be optimized to one call by embedding the group on the backend response.
        if (exercise.muscleGroupId) {
          this.muscleGroupService.getMuscleGroupById(exercise.muscleGroupId).subscribe((mg) => {
            this.muscleGroupName.set(mg.name);
            this.cdr.markForCheck();
          });
        }
        this.cdr.markForCheck();
      });

      // 3) Stats only for logged-in users — the /my-sessions endpoint is auth-only,
      //    and visitors don't have personal data anyway.
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

  // Walk every session → every set → keep only sets for THIS exercise.
  // Sort newest first so the recent-history table is in the right order.
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
    history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    this.setHistory.set(history);
  }

  goBack(): void {
    this.router.navigate(['/exercises']);
  }
}
