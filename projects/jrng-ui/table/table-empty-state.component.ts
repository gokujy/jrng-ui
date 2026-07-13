import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'j-table-empty-state',
  template: `
    <div class="j-table-empty-state" role="status">
      <strong>{{ title() }}</strong>
      <p>{{ message() }}</p>
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

      .j-table-empty-state p {
        margin: 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JTableEmptyStateComponent {
  readonly title = input('No records');
  readonly message = input('There is no data to display.');
}
