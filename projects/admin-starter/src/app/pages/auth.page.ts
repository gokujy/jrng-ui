import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { JButtonComponent } from 'jrng-ui/button';
import { JInputComponent } from 'jrng-ui/input';
import { MockAuthService } from '../services/mock-auth.service';

@Component({
  selector: 'admin-auth-page',
  imports: [ReactiveFormsModule, RouterLink, JButtonComponent, JInputComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<main class="admin-auth">
    <form class="admin-auth-card" [formGroup]="form" (ngSubmit)="submit()">
      <span class="admin-brand">JRNG Admin Starter</span>
      <div>
        <h1>{{ mode() === 'login' ? 'Welcome back' : 'Reset your password' }}</h1>
        <p class="admin-muted">
          {{
            mode() === 'login'
              ? 'Sign in to the operations workspace.'
              : 'We will prepare a reset request for this email.'
          }}
        </p>
      </div>
      <j-input
        label="Email address"
        type="email"
        formControlName="email"
        required
        [invalid]="submitted() && form.controls.email.invalid"
        error="Enter a valid email address."
      />
      @if (mode() === 'login') {
        <j-input
          label="Password"
          type="password"
          formControlName="password"
          required
          [invalid]="submitted() && form.controls.password.invalid"
          error="Use at least eight characters."
        />
      }
      @if (error()) {
        <p role="alert">{{ error() }}</p>
      }
      <j-button
        [label]="mode() === 'login' ? 'Sign in' : 'Request reset'"
        type="submit"
        [loading]="loading()"
      />
      <a [routerLink]="mode() === 'login' ? '/forgot-password' : '/login'">{{
        mode() === 'login' ? 'Forgot password?' : 'Return to sign in'
      }}</a>
    </form>
  </main>`,
})
export class AuthPage {
  readonly mode = input<'login' | 'forgot'>('login');
  private readonly auth = inject(MockAuthService);
  readonly submitted = signal(false);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.minLength(8)] }),
  });
  async submit(): Promise<void> {
    this.submitted.set(true);
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');
    if (this.mode() === 'login') {
      const valid = await this.auth.login(
        this.form.controls.email.value,
        this.form.controls.password.value,
      );
      if (!valid) this.error.set('Enter a valid email and password.');
    } else {
      await Promise.resolve();
      this.error.set('If the account exists, reset instructions are ready to send.');
    }
    this.loading.set(false);
  }
}
