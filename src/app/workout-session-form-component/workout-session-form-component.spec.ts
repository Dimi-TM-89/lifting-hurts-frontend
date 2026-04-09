import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutSessionFormComponent } from './workout-session-form-component';

describe('WorkoutSessionFormComponent', () => {
  let component: WorkoutSessionFormComponent;
  let fixture: ComponentFixture<WorkoutSessionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkoutSessionFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkoutSessionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
