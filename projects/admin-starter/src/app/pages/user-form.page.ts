import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { JButtonComponent } from 'jrng-ui/button';
import { JInputComponent } from 'jrng-ui/input';
import { JPageHeaderComponent } from 'jrng-ui/page-header';
import { JSelectComponent } from 'jrng-ui/select';
import { JrToastService } from 'jrng-ui/toast';
import { AdminUser } from '../models/admin.models';
import { MockAdminApiService } from '../services/mock-admin-api.service';

@Component({
  selector: 'admin-user-form-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    JButtonComponent,
    JInputComponent,
    JPageHeaderComponent,
    JSelectComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="admin-page">
    <j-page-header
      [title]="id() ? 'Edit user' : 'Create user'"
      description="Use validation before saving access changes."
    />
    <form class="admin-panel admin-form" [formGroup]="form" (ngSubmit)="save()">
      <div class="admin-form-grid">
        <j-input
          label="Full name"
          formControlName="name"
          required
          [invalid]="submitted() && form.controls.name.invalid"
          error="Full name is required."
        /><j-input
          label="Email"
          type="email"
          formControlName="email"
          required
          [invalid]="submitted() && form.controls.email.invalid"
          error="Enter a valid email."
        /><j-select label="Role" [options]="roles" formControlName="role" /><j-select
          label="Status"
          [options]="statuses"
          formControlName="status"
        />
      </div>
      <div class="admin-actions">
        <j-button label="Save user" type="submit" [loading]="api.loading()" /><a routerLink="/users"
          ><j-button label="Cancel" variant="outline" type="button"
        /></a>
      </div>
    </form>
  </div>`,
})
export class UserFormPage {
  readonly id = input('');
  readonly api = inject(MockAdminApiService);
  private readonly router = inject(Router);
  private readonly toast = inject(JrToastService);
  readonly submitted = signal(false);
  readonly roles = ['Administrator', 'Manager', 'Analyst'];
  readonly statuses = ['Active', 'Invited', 'Suspended'];
  readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: Validators.required }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    role: new FormControl<AdminUser['role']>('Analyst', { nonNullable: true }),
    status: new FormControl<AdminUser['status']>('Invited', { nonNullable: true }),
  });
  constructor() {
    effect(() => {
      const user = this.api.users().find((item) => item.id === this.id());
      if (user) this.form.patchValue(user);
    });
  }
  async save(): Promise<void> {
    this.submitted.set(true);
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    await this.api.saveUser({ id: this.id() || `usr-${Date.now()}`, ...value });
    this.toast.success('The user was saved.', 'Saved');
    await this.router.navigateByUrl('/users');
  }
}
