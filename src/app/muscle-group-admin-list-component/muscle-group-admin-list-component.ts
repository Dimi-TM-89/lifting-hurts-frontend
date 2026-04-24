/*
 * Admin-only management table for muscle groups (CRUD).
 *
 * Why a separate component instead of reusing MuscleGroupListComponent?
 *  - Different layout (table vs card grid).
 *  - Different actions (edit/delete buttons vs "View details").
 *  - Different audience (admins vs visitors). Splitting keeps both views simple.
 *
 * Patterns:
 *  - `getAll()` is called both on init and after every successful delete to refresh the
 *    list. Re-assigning the observable forces AsyncPipe to re-subscribe.
 *  - `cdr.markForCheck()` after re-assignment is needed in zoneless mode so Angular knows
 *    to re-render the table.
 *  - Navigation to the form passes `mode` and `id` via router state — see the form
 *    component for why we don't put those in the URL.
 *  - `errorMessage` is a signal so the red banner appears reactively when a delete fails
 *    (e.g. FK constraint on the backend).
 */
import { Component, inject, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs';
import { MuscleGroup } from '../muscle-group';
import { MuscleGroupService } from '../muscle-group-service';
import { Router } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-muscle-group-admin-list-component',
  imports: [AsyncPipe],
  templateUrl: './muscle-group-admin-list-component.html',
  styleUrl: './muscle-group-admin-list-component.css',
})
export class MuscleGroupAdminListComponent implements OnInit {
  muscleGroups$!: Observable<MuscleGroup[]>;
  errorMessage = signal<string>('');

  private muscleGroupService = inject(MuscleGroupService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.getAll();
  }

  // Re-assigning the observable triggers AsyncPipe to re-subscribe and re-render the table.
  getAll() {
    this.muscleGroups$ = this.muscleGroupService.getMuscleGroups();
    this.cdr.markForCheck();
  }

  add() {
    this.router.navigate(['admin/muscle-groups/form'], { state: { mode: 'add' } });
  }

  edit(id: number) {
    this.router.navigate(['admin/muscle-groups/form'], { state: { id: id, mode: 'edit' } });
  }

  // Refresh the list on success; show a red banner on failure (often a 409 if the muscle
  // group still has exercises attached — backend enforces the FK constraint).
  delete(id: number) {
    this.muscleGroupService.deleteMuscleGroup(id).subscribe({
      next: () => this.getAll(),
      error: (e: HttpErrorResponse) => this.errorMessage.set(e.message),
    });
  }
}
