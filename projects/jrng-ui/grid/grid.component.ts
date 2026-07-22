import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  input,
  numberAttribute,
} from '@angular/core';
import { JGridGap, jGridGapToken } from './grid.types';

@Component({
  selector: 'j-grid',
  template: '<ng-content />',
  host: {
    class: 'j-grid',
    'data-jc-name': 'grid',
    'data-jc-section': 'root',
    '[class.j-grid--fixed]': 'fixed()',
    '[class.j-grid--no-padding]': '!containerPadding()',
    '[class]': 'styleClass()',
    '[style.--j-grid-column-count]': 'columnCount()',
    '[style.--j-grid-column-gap]': 'resolvedColumnGap()',
    '[style.--j-grid-row-gap]': 'resolvedRowGap()',
    '[style.--j-grid-padding]': 'resolvedPadding()',
    '[style.--j-grid-max-width]': 'maxWidth() || null',
  },
  styles: [
    `
      :host {
        box-sizing: border-box;
        display: block;
        margin-inline: auto;
        max-width: var(--j-grid-max-width, var(--j-grid-fixed-max-width, none));
        padding-inline: var(--j-grid-padding);
        width: 100%;
      }

      :host(.j-grid--no-padding) {
        padding-inline: 0;
      }

      @media (min-width: 576px) {
        :host(.j-grid--fixed) {
          --j-grid-fixed-max-width: 540px;
        }
      }

      @media (min-width: 768px) {
        :host(.j-grid--fixed) {
          --j-grid-fixed-max-width: 720px;
        }
      }

      @media (min-width: 992px) {
        :host(.j-grid--fixed) {
          --j-grid-fixed-max-width: 960px;
        }
      }

      @media (min-width: 1200px) {
        :host(.j-grid--fixed) {
          --j-grid-fixed-max-width: 1140px;
        }
      }

      @media (min-width: 1400px) {
        :host(.j-grid--fixed) {
          --j-grid-fixed-max-width: 1320px;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JGridComponent {
  readonly columns = input(12, { transform: numberAttribute });
  readonly gap = input<JGridGap>('md');
  readonly rowGap = input<JGridGap | null>(null);
  readonly columnGap = input<JGridGap | null>(null);
  readonly padding = input<JGridGap>('md');
  readonly fixed = input(false, { transform: booleanAttribute });
  readonly containerPadding = input(true, { transform: booleanAttribute });
  readonly maxWidth = input('');
  readonly styleClass = input('');

  protected columnCount(): number {
    return Math.max(1, this.columns());
  }

  protected resolvedColumnGap(): string {
    return jGridGapToken(this.columnGap() ?? this.gap());
  }

  protected resolvedRowGap(): string {
    return jGridGapToken(this.rowGap() ?? this.gap());
  }

  protected resolvedPadding(): string {
    return jGridGapToken(this.padding());
  }
}
