import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { JPassThrough, jMergePartClasses } from '../core/pass-through';

@Component({
  selector: 'j-empty-state',
  imports: [],
  template: `
    <section
      [class]="emptyStateClasses()"
      data-jc-name="empty-state"
      data-jc-section="root"
      data-jc-extend="icon action"
    >
      @if (imageUrl()) {
        <img class="j-empty-state__image" data-jc-section="image" [src]="imageUrl()" [alt]="imageAlt()" />
      } @else if (icon()) {
        <div class="j-empty-state__icon" data-jc-section="icon" aria-hidden="true">{{ icon() }}</div>
      }
      @if (title()) {
        <h3 class="j-empty-state__title" data-jc-section="title">{{ title() }}</h3>
      }
      @if (description()) {
        <p class="j-empty-state__description" data-jc-section="description">{{ description() }}</p>
      }
      <div class="j-empty-state__action" data-jc-section="action">
        <ng-content select="[jEmptyStateAction]"></ng-content>
      </div>
      <ng-content></ng-content>
    </section>
  `,
  styles: [
    `
      .j-empty-state {
        align-items: center;
        color: var(--j-empty-state-color, var(--j-color-foreground, #111827));
        display: flex;
        flex-direction: column;
        gap: var(--j-spacing-sm);
        padding: var(--j-spacing-3xl);
        text-align: center;
      }

      .j-empty-state--compact {
        gap: var(--j-spacing-xs);
        padding: var(--j-spacing-xl);
      }

      .j-empty-state__icon {
        align-items: center;
        background: var(--j-empty-state-icon-bg, var(--j-color-muted, #f1f5f9));
        border-radius: var(--j-radius-full);
        color: var(--j-empty-state-icon-color, var(--j-color-muted-foreground, #64748b));
        display: inline-flex;
        font-size: var(--j-font-size-2xl);
        height: 3rem;
        justify-content: center;
        width: 3rem;
      }

      .j-empty-state__image {
        max-height: var(--j-empty-state-image-height, 8rem);
        max-width: min(100%, var(--j-empty-state-image-width, 14rem));
        object-fit: contain;
      }

      .j-empty-state--compact .j-empty-state__icon {
        font-size: var(--j-font-size-xl);
        height: 2.25rem;
        width: 2.25rem;
      }

      .j-empty-state__title {
        font-size: var(--j-font-size-lg);
        letter-spacing: 0;
        line-height: var(--j-line-height-tight);
        margin: 0;
      }

      .j-empty-state__description {
        color: var(--j-empty-state-description-color, var(--j-color-muted-foreground, #64748b));
        margin: 0;
        max-width: 32rem;
      }

      .j-empty-state__action {
        margin-top: var(--j-spacing-sm);
      }

      .j-empty-state__action:empty {
        display: none;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JEmptyStateComponent {
  readonly title = input('');
  readonly description = input('');
  readonly icon = input('');
  readonly imageUrl = input('');
  readonly imageAlt = input('');
  readonly styleClass = input('');
  readonly pt = input<JPassThrough | null>(null);
  readonly compact = input(false, { transform: booleanAttribute });

  readonly emptyStateClasses = computed(() =>
    jMergePartClasses(
      ['j-empty-state', this.compact() ? 'j-empty-state--compact' : ''],
      this.styleClass(),
      this.pt(),
    ),
  );
}
