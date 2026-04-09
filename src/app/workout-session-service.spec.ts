import { TestBed } from '@angular/core/testing';

import { WorkoutSessionService } from './workout-session-service';

describe('WorkoutSessionService', () => {
  let service: WorkoutSessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkoutSessionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
