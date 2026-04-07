import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MuscleGroupFormComponent } from './muscle-group-form-component';

describe('MuscleGroupFormComponent', () => {
  let component: MuscleGroupFormComponent;
  let fixture: ComponentFixture<MuscleGroupFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MuscleGroupFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MuscleGroupFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
