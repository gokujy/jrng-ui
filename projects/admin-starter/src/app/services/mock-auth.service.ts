import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class MockAuthService {
  private readonly router = inject(Router);
  private readonly authenticated = signal(false);
  readonly isAuthenticated = computed(() => this.authenticated());

  async login(email: string, password: string): Promise<boolean> {
    const valid = email.trim().length > 0 && password.length >= 8;
    this.authenticated.set(valid);
    if (valid) await this.router.navigateByUrl('/dashboard');
    return valid;
  }

  async logout(): Promise<void> {
    this.authenticated.set(false);
    await this.router.navigateByUrl('/login');
  }
}
