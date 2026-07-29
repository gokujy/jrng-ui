import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { JTableSortOrder } from 'jrng-ui/core';

@Component({
  selector: 'j-sort-icon',
  template: `
    <span class="j-sort-icon" [class.is-active]="order() !== 0" aria-hidden="true">
      <span>{{ order() === -1 ? '↓' : order() === 1 ? '↑' : '↕' }}</span>
      @if (priority() > 0) {
        <small>{{ priority() }}</small>
      }
    </span>
  `,
  styles: [
    `
      .j-sort-icon {
        align-items: center;
        color: var(--j-table-sort-icon-color, var(--j-color-text-soft));
        display: inline-flex;
        font-size: var(--j-font-size-xs, 0.75rem);
        gap: 0.125rem;
        line-height: 1;
        margin-inline-start: auto;
        min-width: 1.5rem;
        justify-content: flex-end;
      }

      .j-sort-icon.is-active {
        color: var(--j-table-sort-active-color, var(--j-color-primary));
      }

      .j-sort-icon small {
        align-items: center;
        background: var(--j-table-sort-active-color, var(--j-color-primary));
        border-radius: var(--j-radius-full, 999px);
        color: var(--j-color-on-primary);
        display: inline-flex;
        font-size: 0.625rem;
        font-weight: var(--j-font-weight-bold, 700);
        height: 1rem;
        justify-content: center;
        min-width: 1rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JSortIconComponent {
  readonly order = input<JTableSortOrder>(0);
  readonly priority = input(0);
}
