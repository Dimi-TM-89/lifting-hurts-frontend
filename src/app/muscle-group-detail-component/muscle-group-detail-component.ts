/*
 * Detail page for one muscle group: shows its info plus the list of exercises that
 * target it.
 *
 * Why route param + GET-by-id?
 *  - The id comes from the URL (`/muscle-groups/:id`), so the page is bookmarkable and
 *    deep-linkable. We use `paramMap.get('id')` and coerce with `+id` (string → number).
 *  - We use `snapshot` (one-shot read) instead of subscribing to `paramMap` because the
 *    user can't change the id without leaving the route — a fresh component instance is
 *    created for each navigation.
 *  - The exercises list is embedded in the response (eager load on the backend), so we
 *    don't need a second HTTP call for the related entities.
 */
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
    // Defensive null check — paramMap.get returns null if the param is missing.
    if (id != null) {
      this.muscleGroup$ = this.muscleGroupService.getMuscleGroupById(+id);
    }
  }

  goToExercise(exerciseId: number): void {
    this.router.navigate(['/exercises', exerciseId]);
  }

  goBack(): void {
    this.router.navigate(['/muscle-groups']);
  }
}
