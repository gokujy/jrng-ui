import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type JDividerLayout = 'horizontal' | 'vertical';

@Component({
  selector: 'j-divider',
  imports: [],
  template: `<div
    [class]="dividerClasses"
    role="separator"
    [attr.aria-orientation]="layout"
  ></div>`,
  styles: [
    `
      .j-divider {
        background: var(--j-color-border);
        display: block;
      }

      .j-divider--horizontal {
        height: 1px;
        width: 100%;
      }

      .j-divider--vertical {
        align-self: stretch;
        min-height: 1rem;
        width: 1px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JDividerComponent {
  @Input() layout: JDividerLayout = 'horizontal';

  get dividerClasses(): string {
    return `j-divider j-divider--${this.layout}`;
  }
}
