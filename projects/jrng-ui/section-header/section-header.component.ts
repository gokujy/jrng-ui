import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'j-section-header',
  imports: [],
  template: `
    <header
      class="j-section-header"
      [class]="styleClass()"
      data-jc-name="section-header"
      data-jc-section="root"
    >
      <div>
        <h2>{{ title() }}</h2>
        @if (description()) {
          <p>{{ description() }}</p>
        }
      </div>
      <div class="j-section-header__actions" data-jc-section="actions">
        <ng-content />
      </div>
    </header>
  `,
  styles: [
    `
      .j-section-header {
        align-items: flex-start;
        display: flex;
        gap: var(--j-spacing-3);
        justify-content: space-between;
      }

      .j-section-header h2 {
        font-size: var(--j-font-size-xl, 1.25rem);
        margin: 0;
      }

      .j-section-header p {
        color: var(--j-color-muted-foreground);
        margin: var(--j-spacing-1) 0 0;
      }

      .j-section-header__actions {
        display: flex;
        flex-wrap: wrap;
        gap: var(--j-spacing-2);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JSectionHeaderComponent {
  readonly title = input('');
  readonly description = input('');
  readonly styleClass = input('');
}
