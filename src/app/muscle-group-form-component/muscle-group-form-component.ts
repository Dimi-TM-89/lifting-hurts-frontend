import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MuscleGroupService } from '../muscle-group-service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-muscle-group-form-component',
  imports: [FormsModule],
  templateUrl: './muscle-group-form-component.html',
  styleUrl: './muscle-group-form-component.css',
})
export class MuscleGroupFormComponent {
  isAdd = false;
  isEdit = false;
  muscleGroupId = 0;

  muscleGroupData = signal<{ name: string; description: string; imageUrl: string }>({
    name: '',
    description: '',
    imageUrl: '',
  });

  isSubmitted = false;
  errorMessage = signal<string>('');

  constructor(
    private router: Router,
    private muscleGroupService: MuscleGroupService,
  ) {
    const state = this.router.currentNavigation()?.extras.state || {};
    this.isAdd = state['mode'] === 'add';
    this.isEdit = state['mode'] === 'edit';
    this.muscleGroupId = +state['id'];

    if (!this.isAdd && !this.isEdit) {
      this.isAdd = true;
    }

    if (this.muscleGroupId != null && this.muscleGroupId > 0) {
      this.muscleGroupService.getMuscleGroupById(this.muscleGroupId).subscribe((result) => {
        this.muscleGroupData.set({
          name: result.name,
          description: result.description,
          imageUrl: result.imageUrl,
        });
      });
    }
  }

  onSubmit() {
    this.isSubmitted = true;
    if (this.isAdd) {
      this.muscleGroupService.postMuscleGroup(this.muscleGroupData()).subscribe({
        next: () => this.router.navigateByUrl('/admin/muscle-groups'),
        error: (e: HttpErrorResponse) => this.errorMessage.set(e.message),
      });
    }
    if (this.isEdit) {
      this.muscleGroupService.putMuscleGroup(this.muscleGroupId, this.muscleGroupData()).subscribe({
        next: () => this.router.navigateByUrl('/admin/muscle-groups'),
        error: (e: HttpErrorResponse) => this.errorMessage.set(e.message),
      });
    }
  }
}
