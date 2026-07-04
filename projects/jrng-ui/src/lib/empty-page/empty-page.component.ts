import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'j-empty-page',
  imports: [],
  template: `
    <section class="j-empty-page" [class]="styleClass()" data-jc-name="empty-page" data-jc-section="root" role="status">
      @if (icon()) {
        <span class="j-empty-page__icon" aria-hidden="true">{{ icon() }}</span>
      }
      <h1>{{ title() }}</h1>
      <p>{{ description() }}</p>
      <div class="j-empty-page__actions">
        <ng-content />
      </div>
    </section>
  `,
  styles: [
    `
      .j-empty-page {
        display: grid;
        gap: var(--j-spacing-3);
        margin: 0 auto;
        max-width: 38rem;
        min-height: 50dvh;
        place-content: center;
        text-align: center;
      }

      .j-empty-page__icon {
        align-items: center;
        background: var(--j-color-muted);
        border-radius: var(--j-radius-full);
        display: inline-flex;
        height: 3rem;
        justify-content: center;
        justify-self: center;
        width: 3rem;
      }

      .j-empty-page h1 {
        margin: 0;
      }

      .j-empty-page p {
        color: var(--j-color-muted-foreground);
        margin: 0;
      }

      .j-empty-page__actions {
        display: flex;
        gap: var(--j-spacing-2);
        justify-content: center;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JEmptyPageComponent {
  readonly icon = input('');
  readonly title = input('Nothing here yet');
  readonly description = input('There is no content to display.');
  readonly styleClass = input('');
}
