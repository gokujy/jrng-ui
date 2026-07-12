import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { JButtonComponent } from 'jrng-ui/button';
import { JCheckboxComponent } from 'jrng-ui/checkbox';
import { JInputComponent } from 'jrng-ui/input';
import { JPageHeaderComponent } from 'jrng-ui/page-header';
import { JSwitchComponent } from 'jrng-ui/switch';
import { JrToastService } from 'jrng-ui/toast';

@Component({
  selector: 'admin-account-page',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    JButtonComponent,
    JCheckboxComponent,
    JInputComponent,
    JPageHeaderComponent,
    JSwitchComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="admin-page">
    <j-page-header [title]="title()" [description]="description()" />
    @if (page() === 'profile') {
      <form class="admin-panel admin-form" [formGroup]="profile" (ngSubmit)="save('Profile')">
        <j-input label="Display name" formControlName="name" /><j-input
          label="Email"
          type="email"
          formControlName="email"
        /><j-button label="Save profile" type="submit" [disabled]="profile.invalid" />
      </form>
    } @else if (page() === 'settings') {
      <section class="admin-panel">
        <j-switch label="Compact navigation" [(ngModel)]="compact" /><j-switch
          label="Reduced animation"
          [(ngModel)]="reducedMotion"
        /><j-button label="Save settings" (onClick)="save('Settings')" />
      </section>
    } @else {
      <section class="admin-panel">
        <j-checkbox label="Security notifications" [(ngModel)]="security" /><j-checkbox
          label="Weekly summary"
          [(ngModel)]="weekly"
        /><j-checkbox label="Product updates" [(ngModel)]="updates" /><j-button
          label="Save notification preferences"
          (onClick)="save('Notification preferences')"
        />
      </section>
    }
  </div>`,
})
export class AccountPage {
  readonly page = input<'profile' | 'settings' | 'notifications'>('profile');
  private readonly toast = inject(JrToastService);
  compact = false;
  reducedMotion = false;
  security = true;
  weekly = true;
  updates = false;
  readonly profile = new FormGroup({
    name: new FormControl('Avery Morgan', { nonNullable: true, validators: Validators.required }),
    email: new FormControl('avery@example.com', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
  });
  readonly title = () =>
    ({ profile: 'Profile', settings: 'Settings', notifications: 'Notifications' })[this.page()];
  readonly description = () =>
    ({
      profile: 'Manage account identity and contact details.',
      settings: 'Customize workspace behaviour.',
      notifications: 'Choose which application updates you receive.',
    })[this.page()];
  save(section: string): void {
    this.toast.success(`${section} saved.`, 'Saved');
  }
}
