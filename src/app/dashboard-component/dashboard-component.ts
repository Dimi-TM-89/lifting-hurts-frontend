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

  totalSets = computed(() => {
    return this.filteredSessions().reduce((sum, s) => sum + (s.workoutSets?.length ?? 0), 0);
  });

  totalTimeMinutes = computed(() => {
    return this.filteredSessions().reduce((sum, s) => {
      const start = new Date(s.startedAt).getTime();
      const end = new Date(s.endedAt).getTime();
      const diff = end - start;
      return sum + (diff > 0 ? diff / 60000 : 0);
    }, 0);
  });

  formattedTime = computed(() => {
    const mins = Math.round(this.totalTimeMinutes());
    if (mins < 60) return `${mins} min`;
    const hours = Math.floor(mins / 60);
    const remaining = mins % 60;
    return `${hours}h ${remaining}m`;
  });

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
    this.sessionService.getMySessions().subscribe((sessions) => {
      this.allSessions.set(sessions);
      this.cdr.markForCheck();
    });
  }

  setPeriod(period: string): void {
    this.selectedPeriod.set(period);
    this.cdr.markForCheck();
  }
}
