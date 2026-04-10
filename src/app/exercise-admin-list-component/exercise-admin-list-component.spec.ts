import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExerciseAdminListComponent } from './exercise-admin-list-component';

describe('ExerciseAdminListComponent', () => {
  let component: ExerciseAdminListComponent;
  let fixture: ComponentFixture<ExerciseAdminListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExerciseAdminListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExerciseAdminListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
