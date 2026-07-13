import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { JTableSortOrder } from 'jrng-ui/core';

@Component({
  selector: 'j-sort-icon',
  template: `
    <span class="j-sort-icon" [class.is-active]="order() !== 0" aria-hidden="true">
      {{ order() === -1 ? '↓' : order() === 1 ? '↑' : '↕' }}
    </span>
  `,
  styles: [
    `
      .j-sort-icon {
        color: var(--j-color-text-soft, #94a3b8);
        display: inline-flex;
        font-size: var(--j-font-size-xs, 0.75rem);
        line-height: 1;
      }

      .j-sort-icon.is-active {
        color: var(--j-color-primary, #4f46e5);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JSortIconComponent {
  readonly order = input<JTableSortOrder>(0);
}
