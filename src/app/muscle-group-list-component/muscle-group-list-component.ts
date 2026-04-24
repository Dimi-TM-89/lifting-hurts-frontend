/*
 * Public list page: shows all muscle groups in a responsive grid of cards.
 *
 * Why we keep the Observable directly (instead of subscribing in ngOnInit)?
 *  - The template uses AsyncPipe (`muscleGroups$ | async`), which subscribes for us AND
 *    automatically unsubscribes when the component is destroyed. Less boilerplate, no
 *    memory-leak risk, and it works with zoneless change detection out of the box.
 *
 * The `$` suffix on `muscleGroups$` is the conventional Angular naming for an Observable.
 */
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
