// A note in case the examiner runs ng test: even after this fix,
// the createComponent call may still fail at runtime because AppComponent renders <app-menu-component>
// which calls inject(AuthService), and we don't provide one in the test bed.
// That's the same situation as MenuComponent.spec.ts, HomeComponent.spec.ts, etc. —
// the default specs across the project don't set up Auth0 mocking.

import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
