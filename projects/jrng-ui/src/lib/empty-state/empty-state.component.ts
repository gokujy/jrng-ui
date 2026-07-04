import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'j-empty-state',
  imports: [],
  template: `
    <section class="j-empty-state">
      @if (icon) {
        <div class="j-empty-state__icon" aria-hidden="true">{{ icon }}</div>
      }
      @if (title) {
        <h3 class="j-empty-state__title">{{ title }}</h3>
      }
      @if (description) {
        <p class="j-empty-state__description">{{ description }}</p>
      }
      <ng-content></ng-content>
    </section>
  `,
  styles: [
    `
      .j-empty-state {
        align-items: center;
        color: var(--j-color-text);
        display: flex;
        flex-direction: column;
        gap: var(--j-spacing-sm);
        padding: var(--j-spacing-3xl);
        text-align: center;
      }

      .j-empty-state__icon {
        color: var(--j-color-text-soft);
        font-size: var(--j-font-size-2xl);
      }

      .j-empty-state__title {
        font-size: var(--j-font-size-lg);
        margin: 0;
      }

      .j-empty-state__description {
        color: var(--j-color-text-muted);
        margin: 0;
        max-width: 32rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JEmptyStateComponent {
  @Input() title = '';
  @Input() description = '';
  @Input() icon = '';
}
