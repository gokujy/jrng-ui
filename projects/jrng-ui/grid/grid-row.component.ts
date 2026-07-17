import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core';
import { JGridAlignment, JGridJustification } from './grid.types';

@Component({
  selector: 'j-row',
  template: '<ng-content />',
  host: {
    class: 'j-row',
    'data-jc-name': 'grid-row',
    'data-jc-section': 'root',
    '[class.j-row--nowrap]': '!wrap()',
    '[class]': 'styleClass()',
    '[style.--j-row-align]': 'alignValue()',
    '[style.--j-row-justify]': 'justifyValue()',
    '[style.--j-row-gutter-x]': 'gutterX() || null',
    '[style.--j-row-gutter-y]': 'gutterY() || null',
  },
  styles: [
    `
      :host {
        --j-row-gutter-x-resolved: var(
          --j-row-gutter-x,
          var(--j-grid-gutter-x, var(--j-spacing-4))
        );
        --j-row-gutter-y-resolved: var(
          --j-row-gutter-y,
          var(--j-grid-gutter-y, var(--j-spacing-4))
        );

        align-items: var(--j-row-align, stretch);
        box-sizing: border-box;
        display: flex;
        flex-wrap: wrap;
        justify-content: var(--j-row-justify, flex-start);
        margin-inline: calc(var(--j-row-gutter-x-resolved) / -2);
        min-width: 0;
        row-gap: var(--j-row-gutter-y-resolved);
      }

      :host(.j-row--nowrap) {
        flex-wrap: nowrap;
      }

      :host > j-col {
        padding-inline: calc(var(--j-row-gutter-x-resolved) / 2);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JGridRowComponent {
  readonly align = input<JGridAlignment>('stretch');
  readonly justify = input<JGridJustification>('start');
  readonly wrap = input(true, { transform: booleanAttribute });
  readonly gutterX = input('');
  readonly gutterY = input('');
  readonly styleClass = input('');

  protected alignValue(): string {
    return this.align() === 'start' || this.align() === 'end'
      ? `flex-${this.align()}`
      : this.align();
  }

  protected justifyValue(): string {
    const values: Record<JGridJustification, string> = {
      start: 'flex-start',
      center: 'center',
      end: 'flex-end',
      between: 'space-between',
      around: 'space-around',
      evenly: 'space-evenly',
    };
    return values[this.justify()];
  }
}
