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
  selectedMuscleGroupId = signal<number>(0);

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
    this.exerciseService.getExercises().subscribe((exercises) => {
      this.exercises.set(exercises);
      this.cdr.markForCheck();
    });
    this.muscleGroupService.getMuscleGroups().subscribe((groups) => {
      this.muscleGroups.set(groups);
      this.cdr.markForCheck();
    });
  }

  onSearchInput(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
    this.cdr.markForCheck();
  }

  filterByMuscleGroup(id: number): void {
    this.selectedMuscleGroupId.set(id);
    this.cdr.markForCheck();
  }

  getMuscleGroupName(mgId: number): string {
    const mg = this.muscleGroups().find((g) => g.id === mgId);
    return mg ? mg.name : '';
  }
}
