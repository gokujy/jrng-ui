import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  input,
  numberAttribute,
} from '@angular/core';

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
    '[style.--j-grid-gutter-x]': 'gutterX()',
    '[style.--j-grid-gutter-y]': 'gutterY()',
    '[style.--j-grid-max-width]': 'maxWidth() || null',
  },
  styles: [
    `
      :host {
        box-sizing: border-box;
        display: block;
        margin-inline: auto;
        max-width: var(--j-grid-max-width, var(--j-grid-fixed-max-width, none));
        padding-inline: calc(var(--j-grid-gutter-x, var(--j-spacing-4)) / 2);
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
  readonly gutterX = input('var(--j-spacing-4)');
  readonly gutterY = input('var(--j-spacing-4)');
  readonly fixed = input(false, { transform: booleanAttribute });
  readonly containerPadding = input(true, { transform: booleanAttribute });
  readonly maxWidth = input('');
  readonly styleClass = input('');

  protected columnCount(): number {
    return Math.max(1, this.columns());
  }
}
