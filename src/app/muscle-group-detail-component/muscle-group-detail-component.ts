import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { MuscleGroup } from '../muscle-group';
import { MuscleGroupService } from '../muscle-group-service';

@Component({
  selector: 'app-muscle-group-detail-component',
  imports: [AsyncPipe],
  templateUrl: './muscle-group-detail-component.html',
  styleUrl: './muscle-group-detail-component.css',
})
export class MuscleGroupDetailComponent implements OnInit {
  muscleGroup$: Observable<MuscleGroup> | undefined;

  private readonly muscleGroupService = inject(MuscleGroupService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id != null) {
      this.muscleGroup$ = this.muscleGroupService.getMuscleGroupById(+id);
    }
  }

  goBack(): void {
    this.router.navigate(['/muscle-groups']);
  }
}
