import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type JSectionFooterAlign = 'left' | 'center' | 'right' | 'between';

@Component({
  selector: 'j-section-footer',
  imports: [],
  template: `
    <footer
      class="j-section-footer"
      [class]="styleClass()"
      [class.j-section-footer--left]="align() === 'left'"
      [class.j-section-footer--center]="align() === 'center'"
      [class.j-section-footer--right]="align() === 'right'"
      [class.j-section-footer--between]="align() === 'between'"
      data-jc-name="section-footer"
      data-jc-section="root"
    >
      <ng-content />
    </footer>
  `,
  styles: [
    `
      .j-section-footer {
        align-items: center;
        border-top: 1px solid var(--j-color-border);
        color: var(--j-color-muted-foreground);
        display: flex;
        gap: var(--j-spacing-3);
        padding-top: var(--j-spacing-4);
      }

      .j-section-footer--left {
        justify-content: flex-start;
      }

      .j-section-footer--center {
        justify-content: center;
      }

      .j-section-footer--right {
        justify-content: flex-end;
      }

      .j-section-footer--between {
        justify-content: space-between;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JSectionFooterComponent {
  readonly align = input<JSectionFooterAlign>('between');
  readonly styleClass = input('');
}
