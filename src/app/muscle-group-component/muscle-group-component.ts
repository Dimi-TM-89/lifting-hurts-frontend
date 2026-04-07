import { Component, Input, inject } from '@angular/core';
import { MuscleGroup } from '../muscle-group';
import { Router } from '@angular/router';

@Component({
  selector: 'app-muscle-group-component',
  imports: [],
  templateUrl: './muscle-group-component.html',
  styleUrl: './muscle-group-component.css',
})
export class MuscleGroupComponent {
  @Input() muscleGroup!: MuscleGroup;

  private readonly router = inject(Router);

  detail(id: number): void {
    this.router.navigate(['/muscle-groups', id]);
  }
}
