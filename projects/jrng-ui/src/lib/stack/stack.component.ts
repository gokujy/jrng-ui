import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type JStackDirection = 'vertical' | 'horizontal';
export type JStackAlign = 'start' | 'center' | 'end' | 'stretch';
export type JStackJustify = 'start' | 'center' | 'end' | 'between';

@Component({
  selector: 'j-stack',
  imports: [],
  template: `<div [class]="classes()" data-jc-name="stack" data-jc-section="root"><ng-content /></div>`,
  styles: [
    `
      .j-stack {
        align-items: var(--j-stack-align);
        display: flex;
        flex-direction: var(--j-stack-direction);
        gap: var(--j-stack-gap);
        justify-content: var(--j-stack-justify);
      }

      .j-stack--vertical { --j-stack-direction: column; }
      .j-stack--horizontal { --j-stack-direction: row; }
      .j-stack--align-start { --j-stack-align: flex-start; }
      .j-stack--align-center { --j-stack-align: center; }
      .j-stack--align-end { --j-stack-align: flex-end; }
      .j-stack--align-stretch { --j-stack-align: stretch; }
      .j-stack--justify-start { --j-stack-justify: flex-start; }
      .j-stack--justify-center { --j-stack-justify: center; }
      .j-stack--justify-end { --j-stack-justify: flex-end; }
      .j-stack--justify-between { --j-stack-justify: space-between; }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JStackComponent {
  readonly direction = input<JStackDirection>('vertical');
  readonly align = input<JStackAlign>('stretch');
  readonly justify = input<JStackJustify>('start');
  readonly gap = input('var(--j-spacing-4)');
  readonly styleClass = input('');

  classes(): string {
    return [
      'j-stack',
      `j-stack--${this.direction()}`,
      `j-stack--align-${this.align()}`,
      `j-stack--justify-${this.justify()}`,
      this.styleClass(),
    ]
      .filter(Boolean)
      .join(' ');
  }
}
