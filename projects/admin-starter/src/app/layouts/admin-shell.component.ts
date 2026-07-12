import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { JAppShellComponent } from 'jrng-ui/app-shell';
import { JButtonComponent } from 'jrng-ui/button';
import { JThemeService } from 'jrng-ui/theming';
import { MockAuthService } from '../services/mock-auth.service';

@Component({
  selector: 'admin-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, JAppShellComponent, JButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <j-app-shell [(sidebarCollapsed)]="collapsed">
      <div jShellHeader class="admin-topbar">
        <strong>Operations workspace</strong>
        <div class="admin-actions">
          <j-button label="Theme" variant="ghost" (onClick)="toggleTheme()" />
          <j-button label="Sign out" variant="outline" (onClick)="logout()" />
        </div>
      </div>
      <div jShellSidebar class="admin-sidebar">
        <a class="admin-brand" routerLink="/dashboard"><span>JR</span><span>Admin Starter</span></a>
        <j-button
          [label]="collapsed() ? 'Expand' : 'Collapse'"
          variant="ghost"
          (onClick)="collapsed.set(!collapsed())"
        />
        <nav class="admin-nav" aria-label="Application">
          @for (item of navigation; track item.path) {
            <a [routerLink]="item.path" routerLinkActive="is-active">{{ item.label }}</a>
          }
        </nav>
      </div>
      <router-outlet />
      <span jShellFooter class="admin-muted">JRNG Angular Admin Starter</span>
    </j-app-shell>
  `,
})
export class AdminShellComponent {
  private readonly auth = inject(MockAuthService);
  private readonly theme = inject(JThemeService);
  readonly collapsed = signal(false);
  readonly navigation = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Users', path: '/users' },
    { label: 'Profile', path: '/profile' },
    { label: 'Settings', path: '/settings' },
    { label: 'Notifications', path: '/notifications' },
    { label: 'Application states', path: '/states' },
  ] as const;
  toggleTheme(): void {
    this.theme.setMode(this.theme.mode() === 'dark' ? 'light' : 'dark');
  }
  logout(): void {
    void this.auth.logout();
  }
}
