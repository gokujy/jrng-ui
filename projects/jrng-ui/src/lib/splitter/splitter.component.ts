import { ChangeDetectionStrategy, Component, input, numberAttribute } from '@angular/core';

export type JSplitterOrientation = 'horizontal' | 'vertical';

@Component({
  selector: 'j-splitter',
  template: `
    <div
      class="j-splitter"
      [class]="styleClass()"
      [class.j-splitter--vertical]="orientation() === 'vertical'"
      data-jc-name="splitter"
      data-jc-section="root"
      [style.gap.px]="gutterSize()"
    >
      <ng-content></ng-content>
    </div>
  `,
  styles: [
    `
      .j-splitter {
        display: flex;
        gap: 0.5rem;
      }

      .j-splitter--vertical {
        flex-direction: column;
      }

      .j-splitter ::ng-deep > * {
        flex: 1 1 0;
        min-width: 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JSplitterComponent {
  readonly orientation = input<JSplitterOrientation>('horizontal');
  readonly gutterSize = input(8, { transform: numberAttribute });
  readonly styleClass = input('');
}
