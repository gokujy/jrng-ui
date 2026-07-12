import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthPage } from './auth.page';

describe('AuthPage', () => {
  it('keeps invalid credentials from submitting and exposes validation state', async () => {
    await TestBed.configureTestingModule({
      imports: [AuthPage],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(AuthPage);
    fixture.detectChanges();
    await fixture.componentInstance.submit();
    expect(fixture.componentInstance.submitted()).toBe(true);
    expect(fixture.componentInstance.form.invalid).toBe(true);
  });
});
