import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { JIconComponent } from 'jrng-ui/icon';
import { JButtonComponent } from 'jrng-ui/button';
import { JTableEmptyState } from './table.types';

@Component({
  selector: 'j-table-empty-state',
  imports: [JButtonComponent, JIconComponent],
  template: `
    <div
      class="j-table-empty-state"
      [attr.role]="state() === 'error' ? 'alert' : 'status'"
      [attr.data-j-state]="state()"
    >
      @if (icon()) {
        <j-icon class="j-table-empty-state__icon" [name]="icon()" aria-hidden="true" />
      }
      <strong>{{ title() }}</strong>
      <p>{{ message() }}</p>
      @if (actionLabel()) {
        <j-button [label]="actionLabel()" (onClick)="action.emit()" />
      }
    </div>
  `,
  styles: [
    `
      .j-table-empty-state {
        color: var(--j-color-text-muted, #64748b);
        display: grid;
        gap: var(--j-spacing-xs, 0.25rem);
        justify-items: center;
        padding: var(--j-spacing-3xl, 2rem) var(--j-spacing-lg, 1rem);
        text-align: center;
      }

      .j-table-empty-state strong {
        color: var(--j-color-text, #111827);
        font-size: var(--j-font-size-sm, 0.875rem);
      }

      .j-table-empty-state__icon {
        color: var(--j-color-muted-foreground, #64748b);
        font-size: 1.5rem;
      }

      .j-table-empty-state p {
        margin: 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JTableEmptyStateComponent {
  readonly state = input<JTableEmptyState>('no-data');
  readonly title = input('No records');
  readonly message = input('There is no data to display.');
  readonly icon = input('table');
  readonly actionLabel = input('');
  readonly action = output<void>();
}
