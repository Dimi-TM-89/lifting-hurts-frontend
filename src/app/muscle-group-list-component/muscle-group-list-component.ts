import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { MuscleGroupService } from '../muscle-group-service';
import { MuscleGroupComponent } from '../muscle-group-component/muscle-group-component';

@Component({
  selector: 'app-muscle-group-list-component',
  imports: [MuscleGroupComponent, AsyncPipe],
  templateUrl: './muscle-group-list-component.html',
  styleUrl: './muscle-group-list-component.css',
})
export class MuscleGroupListComponent {
  private readonly muscleGroupService = inject(MuscleGroupService);
  muscleGroups$ = this.muscleGroupService.getMuscleGroups();
}
