import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { JIconComponent } from 'jrng-ui/icon';
import { JTableEmptyState } from './table.types';

@Component({
  selector: 'j-table-empty-state',
  imports: [JIconComponent],
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
        <button type="button" (click)="action.emit()">{{ actionLabel() }}</button>
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

      .j-table-empty-state button {
        background: var(--j-color-primary, #4f46e5);
        border: 0;
        border-radius: var(--j-radius-md, 0.5rem);
        color: var(--j-color-primary-foreground, #ffffff);
        cursor: pointer;
        font: inherit;
        font-weight: var(--j-font-weight-semibold, 600);
        min-height: 2.25rem;
        padding-inline: var(--j-spacing-md, 0.75rem);
      }

      .j-table-empty-state button:focus-visible {
        box-shadow: var(--j-focus-ring);
        outline: none;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * @deprecated Prefer the integrated `j-table` empty-state inputs and `jTableEmpty` template.
 * This compatibility component remains available for existing applications.
 */
export class JTableEmptyStateComponent {
  readonly state = input<JTableEmptyState>('no-data');
  readonly title = input('No records');
  readonly message = input('There is no data to display.');
  readonly icon = input('table');
  readonly actionLabel = input('');
  readonly action = output<void>();
}
