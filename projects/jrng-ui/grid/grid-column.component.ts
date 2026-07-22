import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { JGridColumnOrder, JGridColumnSize } from './grid.types';

type JGridResponsiveSize = JGridColumnSize | null;
type JGridResponsiveOffset = number | `${number}` | null;
type JGridResponsiveOrder = JGridColumnOrder | null;

@Component({
  selector: 'j-col',
  template: '<ng-content />',
  host: {
    class: 'j-col',
    'data-jc-name': 'grid-column',
    'data-jc-section': 'root',
    '[class]': 'styleClass()',
    '[style.--j-col-width]': 'width(size())',
    '[style.--j-col-flex]': 'flex(size())',
    '[style.--j-col-offset]': 'offsetValue(offset())',
    '[style.--j-col-order]': 'orderValue(order())',
    '[style.--j-col-sm-width]': 'width(sm())',
    '[style.--j-col-sm-flex]': 'flex(sm())',
    '[style.--j-col-sm-offset]': 'offsetValue(offsetSm())',
    '[style.--j-col-sm-order]': 'orderValue(orderSm())',
    '[style.--j-col-md-width]': 'width(md())',
    '[style.--j-col-md-flex]': 'flex(md())',
    '[style.--j-col-md-offset]': 'offsetValue(offsetMd())',
    '[style.--j-col-md-order]': 'orderValue(orderMd())',
    '[style.--j-col-lg-width]': 'width(lg())',
    '[style.--j-col-lg-flex]': 'flex(lg())',
    '[style.--j-col-lg-offset]': 'offsetValue(offsetLg())',
    '[style.--j-col-lg-order]': 'orderValue(orderLg())',
    '[style.--j-col-xl-width]': 'width(xl())',
    '[style.--j-col-xl-flex]': 'flex(xl())',
    '[style.--j-col-xl-offset]': 'offsetValue(offsetXl())',
    '[style.--j-col-xl-order]': 'orderValue(orderXl())',
    '[style.--j-col-xxl-width]': 'width(xxl())',
    '[style.--j-col-xxl-flex]': 'flex(xxl())',
    '[style.--j-col-xxl-offset]': 'offsetValue(offsetXxl())',
    '[style.--j-col-xxl-order]': 'orderValue(orderXxl())',
  },
  styles: [
    `
      :host {
        box-sizing: border-box;
        flex: var(--j-col-flex, 1 0 0%);
        margin-inline-start: var(--j-col-offset, 0);
        max-width: 100%;
        min-width: 0;
        order: var(--j-col-order, 0);
        width: var(--j-col-width, auto);
      }

      @media (min-width: 576px) {
        :host {
          flex: var(--j-col-sm-flex, var(--j-col-flex, 1 0 0%));
          margin-inline-start: var(--j-col-sm-offset, var(--j-col-offset, 0));
          order: var(--j-col-sm-order, var(--j-col-order, 0));
          width: var(--j-col-sm-width, var(--j-col-width, auto));
        }
      }

      @media (min-width: 768px) {
        :host {
          flex: var(--j-col-md-flex, var(--j-col-sm-flex, var(--j-col-flex, 1 0 0%)));
          margin-inline-start: var(
            --j-col-md-offset,
            var(--j-col-sm-offset, var(--j-col-offset, 0))
          );
          order: var(--j-col-md-order, var(--j-col-sm-order, var(--j-col-order, 0)));
          width: var(--j-col-md-width, var(--j-col-sm-width, var(--j-col-width, auto)));
        }
      }

      @media (min-width: 992px) {
        :host {
          flex: var(
            --j-col-lg-flex,
            var(--j-col-md-flex, var(--j-col-sm-flex, var(--j-col-flex, 1 0 0%)))
          );
          margin-inline-start: var(
            --j-col-lg-offset,
            var(--j-col-md-offset, var(--j-col-sm-offset, var(--j-col-offset, 0)))
          );
          order: var(
            --j-col-lg-order,
            var(--j-col-md-order, var(--j-col-sm-order, var(--j-col-order, 0)))
          );
          width: var(
            --j-col-lg-width,
            var(--j-col-md-width, var(--j-col-sm-width, var(--j-col-width, auto)))
          );
        }
      }

      @media (min-width: 1200px) {
        :host {
          flex: var(
            --j-col-xl-flex,
            var(
              --j-col-lg-flex,
              var(--j-col-md-flex, var(--j-col-sm-flex, var(--j-col-flex, 1 0 0%)))
            )
          );
          margin-inline-start: var(
            --j-col-xl-offset,
            var(
              --j-col-lg-offset,
              var(--j-col-md-offset, var(--j-col-sm-offset, var(--j-col-offset, 0)))
            )
          );
          order: var(
            --j-col-xl-order,
            var(
              --j-col-lg-order,
              var(--j-col-md-order, var(--j-col-sm-order, var(--j-col-order, 0)))
            )
          );
          width: var(
            --j-col-xl-width,
            var(
              --j-col-lg-width,
              var(--j-col-md-width, var(--j-col-sm-width, var(--j-col-width, auto)))
            )
          );
        }
      }

      @media (min-width: 1400px) {
        :host {
          flex: var(
            --j-col-xxl-flex,
            var(
              --j-col-xl-flex,
              var(
                --j-col-lg-flex,
                var(--j-col-md-flex, var(--j-col-sm-flex, var(--j-col-flex, 1 0 0%)))
              )
            )
          );
          margin-inline-start: var(
            --j-col-xxl-offset,
            var(
              --j-col-xl-offset,
              var(
                --j-col-lg-offset,
                var(--j-col-md-offset, var(--j-col-sm-offset, var(--j-col-offset, 0)))
              )
            )
          );
          order: var(
            --j-col-xxl-order,
            var(
              --j-col-xl-order,
              var(
                --j-col-lg-order,
                var(--j-col-md-order, var(--j-col-sm-order, var(--j-col-order, 0)))
              )
            )
          );
          width: var(
            --j-col-xxl-width,
            var(
              --j-col-xl-width,
              var(
                --j-col-lg-width,
                var(--j-col-md-width, var(--j-col-sm-width, var(--j-col-width, auto)))
              )
            )
          );
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JGridColumnComponent {
  readonly size = input<JGridResponsiveSize>(null);
  readonly sm = input<JGridResponsiveSize>(null);
  readonly md = input<JGridResponsiveSize>(null);
  readonly lg = input<JGridResponsiveSize>(null);
  readonly xl = input<JGridResponsiveSize>(null);
  readonly xxl = input<JGridResponsiveSize>(null);

  readonly offset = input<JGridResponsiveOffset>(null);
  readonly offsetSm = input<JGridResponsiveOffset>(null);
  readonly offsetMd = input<JGridResponsiveOffset>(null);
  readonly offsetLg = input<JGridResponsiveOffset>(null);
  readonly offsetXl = input<JGridResponsiveOffset>(null);
  readonly offsetXxl = input<JGridResponsiveOffset>(null);

  readonly order = input<JGridResponsiveOrder>(null);
  readonly orderSm = input<JGridResponsiveOrder>(null);
  readonly orderMd = input<JGridResponsiveOrder>(null);
  readonly orderLg = input<JGridResponsiveOrder>(null);
  readonly orderXl = input<JGridResponsiveOrder>(null);
  readonly orderXxl = input<JGridResponsiveOrder>(null);

  readonly styleClass = input('');

  protected width(value: JGridResponsiveSize): string | null {
    if (value == null) return null;
    if (value === 'auto') return 'auto';
    return `calc(${this.normalizeSpan(value)} / var(--j-grid-column-count, 12) * 100%)`;
  }

  protected flex(value: JGridResponsiveSize): string | null {
    return value == null ? null : '0 0 auto';
  }

  protected offsetValue(value: JGridResponsiveOffset): string | null {
    if (value == null) return null;
    const offset = Math.max(0, Number(value) || 0);
    return `calc(${offset} / var(--j-grid-column-count, 12) * 100%)`;
  }

  protected orderValue(value: JGridResponsiveOrder): number | null {
    if (value == null) return null;
    if (value === 'first') return -1;
    if (value === 'last') return 13;
    return Number.isFinite(Number(value)) ? Number(value) : 0;
  }

  private normalizeSpan(value: number | `${number}`): number {
    return Math.max(1, Number(value) || 1);
  }
}
