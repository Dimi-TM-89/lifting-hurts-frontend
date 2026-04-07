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

  delete(id: number) {
    this.muscleGroupService.deleteMuscleGroup(id).subscribe({
      next: () => this.getAll(),
      error: (e: HttpErrorResponse) => this.errorMessage.set(e.message),
    });
  }
}
