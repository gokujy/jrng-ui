import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { JButtonComponent } from 'jrng-ui/button';
import { JConfirmationService } from 'jrng-ui/confirm-dialog';
import { JEmptyStateComponent } from 'jrng-ui/empty-state';
import { JPageHeaderComponent } from 'jrng-ui/page-header';
import { JTableColumn, JTableComponent } from 'jrng-ui/table';
import { JrToastService } from 'jrng-ui/toast';
import { MockAdminApiService } from '../services/mock-admin-api.service';

@Component({
  selector: 'admin-users-page',
  imports: [
    RouterLink,
    JButtonComponent,
    JEmptyStateComponent,
    JPageHeaderComponent,
    JTableComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="admin-page">
    <div class="admin-page-header">
      <j-page-header title="Users" description="Manage access, roles and profile status." /><a
        routerLink="/users/new"
        ><j-button label="Create user"
      /></a>
    </div>
    @if (api.users().length) {
      <article class="admin-panel">
        <div class="admin-actions">
          <a [routerLink]="['/users', api.users()[0].id, 'edit']"
            ><j-button label="Edit first user" variant="outline" /></a
          ><j-button
            label="Remove first user"
            severity="danger"
            variant="outline"
            (onClick)="confirmRemove()"
          />
        </div>
        <j-table [value]="api.users()" [columns]="columns" />
      </article>
    } @else {
      <j-empty-state
        title="No users"
        description="Create the first user to begin managing access."
      >
        <a jEmptyStateAction routerLink="/users/new"><j-button label="Create user" /></a>
      </j-empty-state>
    }
  </div>`,
})
export class UsersPage {
  readonly api = inject(MockAdminApiService);
  private readonly confirmation = inject(JConfirmationService);
  private readonly toast = inject(JrToastService);
  readonly columns: readonly JTableColumn[] = [
    { field: 'name', header: 'Name' },
    { field: 'email', header: 'Email' },
    { field: 'role', header: 'Role' },
    { field: 'status', header: 'Status' },
  ];
  confirmRemove(): void {
    const user = this.api.users()[0];
    if (!user) return;
    this.confirmation.confirm({
      header: 'Remove user?',
      message: `Remove ${user.name} from this workspace?`,
      acceptLabel: 'Remove',
      rejectLabel: 'Cancel',
      accept: () => {
        this.api.removeUser(user.id);
        this.toast.success('The user was removed.', 'User removed');
      },
    });
  }
}
