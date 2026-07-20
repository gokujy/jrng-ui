import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core';
import { JGridAlignment, JGridGap, JGridJustification, jGridGapToken } from './grid.types';

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
    '[style.--j-row-column-gap]': 'resolvedColumnGap()',
    '[style.--j-row-row-gap]': 'resolvedRowGap()',
  },
  styles: [
    `
      :host {
        align-items: var(--j-row-align, stretch);
        box-sizing: border-box;
        display: flex;
        flex-wrap: wrap;
        justify-content: var(--j-row-justify, flex-start);
        column-gap: var(--j-row-column-gap, var(--j-grid-column-gap));
        min-width: 0;
        row-gap: var(--j-row-row-gap, var(--j-grid-row-gap));
      }

      :host(.j-row--nowrap) {
        flex-wrap: nowrap;
      }

    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JGridRowComponent {
  readonly align = input<JGridAlignment>('stretch');
  readonly justify = input<JGridJustification>('start');
  readonly wrap = input(true, { transform: booleanAttribute });
  readonly gap = input<JGridGap | null>(null);
  readonly rowGap = input<JGridGap | null>(null);
  readonly columnGap = input<JGridGap | null>(null);
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

  protected resolvedColumnGap(): string | null {
    const value = this.columnGap() ?? this.gap();
    return value ? jGridGapToken(value) : null;
  }

  protected resolvedRowGap(): string | null {
    const value = this.rowGap() ?? this.gap();
    return value ? jGridGapToken(value) : null;
  }
}
