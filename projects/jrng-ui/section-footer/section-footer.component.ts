import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'j-section-footer',
  imports: [],
  template: `
    <footer
      class="j-section-footer"
      [class]="styleClass()"
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
        justify-content: space-between;
        padding-top: var(--j-spacing-4);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JSectionFooterComponent {
  readonly styleClass = input('');
}
