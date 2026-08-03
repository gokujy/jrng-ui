import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { JTableSortOrder } from 'jrng-ui/core';
import { JIconComponent } from 'jrng-ui/icon';

@Component({
  selector: 'j-sort-icon',
  imports: [JIconComponent],
  template: `
    <span class="j-sort-icon" [class.is-active]="order() !== 0" aria-hidden="true">
      <j-icon
        [name]="order() === -1 ? 'chevron-down' : order() === 1 ? 'chevron-up' : 'sort'"
        size="0.875rem"
        [strokeWidth]="order() === 0 ? 2 : 3"
      />
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
        gap: 0.125rem;
        justify-content: flex-end;
        line-height: 1;
        margin-inline-start: auto;
        min-width: 1.25rem;
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
