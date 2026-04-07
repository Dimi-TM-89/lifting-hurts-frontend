import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MuscleGroupAdminListComponent } from './muscle-group-admin-list-component';

describe('MuscleGroupAdminListComponent', () => {
  let component: MuscleGroupAdminListComponent;
  let fixture: ComponentFixture<MuscleGroupAdminListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MuscleGroupAdminListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MuscleGroupAdminListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
