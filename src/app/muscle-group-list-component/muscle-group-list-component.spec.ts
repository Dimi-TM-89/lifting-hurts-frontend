import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MuscleGroupListComponent } from './muscle-group-list-component';

describe('MuscleGroupListComponent', () => {
  let component: MuscleGroupListComponent;
  let fixture: ComponentFixture<MuscleGroupListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MuscleGroupListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MuscleGroupListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
