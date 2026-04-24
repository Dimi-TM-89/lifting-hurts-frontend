/*
 * Personal stats dashboard, embedded in the home page for logged-in users.
 *
 * Architecture decisions:
 *  - We fetch ALL sessions once (in ngOnInit) and then filter them client-side via a
 *    `computed()` signal. This avoids re-hitting the backend every time the user clicks
 *    a different period button. Trade-off: works only as long as the dataset stays small —
 *    if a user ever has thousands of sessions we'd switch to a server-side filter.
 *  - All derived numbers (totals, top exercises, muscle-group breakdown) are `computed()`
 *    signals so they re-evaluate automatically when either `allSessions` or
 *    `selectedPeriod` changes — no manual refresh code in the period-switching button.
 *  - `cdr.markForCheck()` is required because the app runs zoneless. After an async
 *    callback (HTTP response) we have to tell Angular "something changed, please re-render".
 *    Setting a signal alone doesn't schedule a tick in zoneless mode.
 *
 * Local interfaces (ExerciseStat, MuscleGroupStat) are kept private to this file —
 * they're only useful here and would clutter the global model layer.
 */
import { Component, inject, OnInit, signal, computed, ChangeDetectorRef } from '@angular/core';
import { WorkoutSessionService } from '../workout-session-service';
import { WorkoutSession } from '../workout-session';

interface ExerciseStat {
  name: string;
  totalSets: number;
}

interface MuscleGroupStat {
  name: string;
  totalSets: number;
}

@Component({
  selector: 'app-dashboard-component',
  imports: [],
  templateUrl: './dashboard-component.html',
  styleUrl: './dashboard-component.css',
})
export class DashboardComponent implements OnInit {
  allSessions = signal<WorkoutSession[]>([]);
  selectedPeriod = signal<string>('month');

  private sessionService = inject(WorkoutSessionService);
  private cdr = inject(ChangeDetectorRef);

  // Period filter — recomputes whenever allSessions or selectedPeriod changes.
  // Cutoff dates are calculated relative to today (now) so the window slides over time.
  filteredSessions = computed(() => {
    const sessions = this.allSessions();
    const now = new Date();
    let cutoff: Date;

    switch (this.selectedPeriod()) {
      case '3months':
        cutoff = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case 'year':
        cutoff = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        cutoff = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    }

    return sessions.filter((s) => new Date(s.startedAt) >= cutoff);
  });

  totalWorkouts = computed(() => this.filteredSessions().length);

  // ?? 0 guards against sessions without any sets logged.
  totalSets = computed(() => {
    return this.filteredSessions().reduce((sum, s) => sum + (s.workoutSets?.length ?? 0), 0);
  });

  // Skip negative diffs (clock skew or open sessions) so we never subtract from the total.
  totalTimeMinutes = computed(() => {
    return this.filteredSessions().reduce((sum, s) => {
      const start = new Date(s.startedAt).getTime();
      const end = new Date(s.endedAt).getTime();
      const diff = end - start;
      return sum + (diff > 0 ? diff / 60000 : 0);
    }, 0);
  });

  // Format minutes as either "X min" or "Xh Ym" depending on size — better UX than raw minutes.
  formattedTime = computed(() => {
    const mins = Math.round(this.totalTimeMinutes());
    if (mins < 60) return `${mins} min`;
    const hours = Math.floor(mins / 60);
    const remaining = mins % 60;
    return `${hours}h ${remaining}m`;
  });

  // Aggregate sets per exercise name → top 5. Map handles the grouping in O(n).
  topExercises = computed<ExerciseStat[]>(() => {
    const map = new Map<string, number>();
    for (const session of this.filteredSessions()) {
      for (const set of session.workoutSets ?? []) {
        const name = set.exercise?.name ?? 'Unknown';
        map.set(name, (map.get(name) ?? 0) + 1);
      }
    }
    return Array.from(map.entries())
      .map(([name, totalSets]) => ({ name, totalSets }))
      .sort((a, b) => b.totalSets - a.totalSets)
      .slice(0, 5);
  });

  // Same shape as topExercises but grouped by muscle group, no top-N cap (used by the bar chart).
  muscleGroupStats = computed<MuscleGroupStat[]>(() => {
    const map = new Map<string, number>();
    for (const session of this.filteredSessions()) {
      for (const set of session.workoutSets ?? []) {
        const name = set.exercise?.muscleGroup?.name ?? 'Unknown';
        map.set(name, (map.get(name) ?? 0) + 1);
      }
    }
    return Array.from(map.entries())
      .map(([name, totalSets]) => ({ name, totalSets }))
      .sort((a, b) => b.totalSets - a.totalSets);
  });

  ngOnInit(): void {
    // One fetch up-front; all filtering after that is in-memory via computed signals.
    this.sessionService.getMySessions().subscribe((sessions) => {
      this.allSessions.set(sessions);
      this.cdr.markForCheck(); // zoneless: explicit re-render after async work
    });
  }

  setPeriod(period: string): void {
    this.selectedPeriod.set(period);
    this.cdr.markForCheck();
  }
}
