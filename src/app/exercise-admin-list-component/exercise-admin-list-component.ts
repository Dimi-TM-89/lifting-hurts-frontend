/*
 * Admin-only management table for exercises (CRUD).
 *
 * Mirrors MuscleGroupAdminListComponent — same patterns:
 *  - Observable kept on the field, AsyncPipe in template = no manual subscribe/unsubscribe.
 *  - `getAll()` is called on init AND after every successful delete to refresh the list.
 *  - Form navigation passes `mode` and `id` via router state (not URL).
 *  - cdr.markForCheck() after re-assigning the observable so AsyncPipe re-subscribes
 *    under zoneless change detection.
 *  - errorMessage signal drives the red banner when a delete fails.
 */
import { Component, inject, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs';
import { Exercise } from '../exercise';
import { ExerciseService } from '../exercise-service';
import { Router } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-exercise-admin-list-component',
  imports: [AsyncPipe],
  templateUrl: './exercise-admin-list-component.html',
  styleUrl: './exercise-admin-list-component.css',
})
export class ExerciseAdminListComponent implements OnInit {
  exercises$!: Observable<Exercise[]>;
  errorMessage = signal<string>('');

  private exerciseService = inject(ExerciseService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.getAll();
  }

  getAll() {
    this.exercises$ = this.exerciseService.getExercises();
    this.cdr.markForCheck();
  }

  add() {
    this.router.navigate(['admin/exercises/form'], { state: { mode: 'add' } });
  }

  edit(id: number) {
    this.router.navigate(['admin/exercises/form'], { state: { id: id, mode: 'edit' } });
  }

  delete(id: number) {
    this.exerciseService.deleteExercise(id).subscribe({
      next: () => this.getAll(),
      error: (e: HttpErrorResponse) => this.errorMessage.set(e.message),
    });
  }
}
