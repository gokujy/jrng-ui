import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { MockAuthService } from '../services/mock-auth.service';
import { AuthPage } from './auth.page';

describe('AuthPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthPage],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('keeps invalid credentials from submitting and exposes validation state', async () => {
    const fixture = TestBed.createComponent(AuthPage);
    fixture.detectChanges();
    await fixture.componentInstance.submit();
    expect(fixture.componentInstance.submitted()).toBe(true);
    expect(fixture.componentInstance.form.invalid).toBe(true);
  });

  it('signs in with valid credentials and clears any previous error', async () => {
    const fixture = TestBed.createComponent(AuthPage);
    const component = fixture.componentInstance;
    const login = vi.spyOn(TestBed.inject(MockAuthService), 'login').mockResolvedValue(true);

    component.form.setValue({ email: 'admin@example.com', password: 'password1' });
    await component.submit();

    expect(login).toHaveBeenCalledWith('admin@example.com', 'password1');
    expect(component.error()).toBe('');
    expect(component.loading()).toBe(false);
  });

  it('surfaces an error when sign in is rejected', async () => {
    const fixture = TestBed.createComponent(AuthPage);
    const component = fixture.componentInstance;
    vi.spyOn(TestBed.inject(MockAuthService), 'login').mockResolvedValue(false);

    component.form.setValue({ email: 'admin@example.com', password: 'password1' });
    await component.submit();

    expect(component.error()).toContain('valid email and password');
  });

  it('acknowledges a reset request in forgot-password mode', async () => {
    const fixture = TestBed.createComponent(AuthPage);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('mode', 'forgot');

    component.form.controls.email.setValue('admin@example.com');
    await component.submit();

    expect(component.error()).toContain('reset instructions');
    expect(component.loading()).toBe(false);
  });
});
