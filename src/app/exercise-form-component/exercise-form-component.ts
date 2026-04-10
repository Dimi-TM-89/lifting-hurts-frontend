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

  constructor() {
    const state = this.router.currentNavigation()?.extras.state || {};
    this.isAdd = state['mode'] === 'add';
    this.isEdit = state['mode'] === 'edit';
    this.exerciseId = +state['id'];

    if (!this.isAdd && !this.isEdit) {
      this.isAdd = true;
    }
  }

  ngOnInit(): void {
    // Load muscle groups for the dropdown
    this.muscleGroupService.getMuscleGroups().subscribe((result) => {
      this.muscleGroups.set(result);
    });

    // If editing, load the existing exercise
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
          this.isSubmitted = false;
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
