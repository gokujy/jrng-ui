import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { JPassThrough, jMergePartClasses } from '../core/pass-through';

export type JDividerLayout = 'horizontal' | 'vertical';

@Component({
  selector: 'j-divider',
  imports: [],
  template: `<div
    [class]="dividerClasses()"
    data-jc-name="divider"
    data-jc-section="root"
    role="separator"
    [attr.aria-orientation]="layout()"
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
  readonly layout = input<JDividerLayout>('horizontal');
  readonly styleClass = input('');
  readonly pt = input<JPassThrough | null>(null);

  readonly dividerClasses = computed(() =>
    jMergePartClasses(['j-divider', `j-divider--${this.layout()}`], this.styleClass(), this.pt()),
  );
}
