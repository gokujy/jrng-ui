import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  numberAttribute,
} from '@angular/core';
import { JPassThrough, jMergePartClasses } from 'jrng-ui/core';
import { JSize } from 'jrng-ui/core';

export interface JAvatarGroupItem {
  readonly label?: string;
  readonly image?: string;
  readonly ariaLabel?: string;
}

@Component({
  selector: 'j-avatar-group',
  imports: [],
  template: `
    <span
      [class]="groupClasses()"
      data-jc-name="avatar-group"
      data-jc-section="root"
      data-jc-extend="item overflow"
      [attr.aria-label]="ariaLabel() || null"
    >
      @for (item of visibleItems(); track item.image || item.ariaLabel || item.label || $index) {
        <span
          class="j-avatar-group__item"
          data-jc-section="item"
          [class]="itemClasses()"
          [attr.aria-label]="item.ariaLabel || item.label || null"
        >
          @if (item.image) {
            <img [src]="item.image" [alt]="item.ariaLabel || item.label || ''" />
          }
          @if (!item.image) {
            <span>{{ initials(item.label || item.ariaLabel || '') }}</span>
          }
        </span>
      }
      @if (overflowCount() > 0) {
        <span
          class="j-avatar-group__item"
          data-jc-section="overflow"
          [class]="itemClasses()"
          [attr.aria-label]="overflowCount() + ' more'"
        >
          +{{ overflowCount() }}
        </span>
      }
      <ng-content></ng-content>
    </span>
  `,
  styles: [
    `
      .j-avatar-group {
        align-items: center;
        display: inline-flex;
        padding-inline-start: var(--j-spacing-sm, 0.5rem);
      }

      .j-avatar-group__item {
        align-items: center;
        background: var(--j-color-surface-subtle, #eef2f7);
        border: 2px solid var(--j-color-surface, #ffffff);
        border-radius: var(--j-radius-full, 999px);
        color: var(--j-color-text, #111827);
        display: inline-flex;
        font-weight: var(--j-font-weight-bold, 700);
        justify-content: center;
        margin-inline-start: calc(var(--j-spacing-sm, 0.5rem) * -1);
        overflow: hidden;
      }

      .j-avatar-group__item--sm {
        font-size: var(--j-font-size-xs, 0.75rem);
        height: 1.75rem;
        width: 1.75rem;
      }

      .j-avatar-group__item--md {
        font-size: var(--j-font-size-sm, 0.875rem);
        height: 2.25rem;
        width: 2.25rem;
      }

      .j-avatar-group__item--lg {
        font-size: var(--j-font-size-md, 1rem);
        height: 3rem;
        width: 3rem;
      }

      .j-avatar-group__item img {
        height: 100%;
        object-fit: cover;
        width: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JAvatarGroupComponent {
  readonly items = input<readonly JAvatarGroupItem[]>([]);
  readonly size = input<JSize>('md');
  readonly max = input(5, { transform: numberAttribute });
  readonly ariaLabel = input('');
  readonly styleClass = input('');
  readonly pt = input<JPassThrough | null>(null);

  readonly visibleItems = computed(() => this.items().slice(0, Math.max(0, this.max())));

  readonly overflowCount = computed(() =>
    Math.max(0, this.items().length - this.visibleItems().length),
  );

  readonly groupClasses = computed(() =>
    jMergePartClasses('j-avatar-group', this.styleClass(), this.pt()),
  );

  readonly itemClasses = computed(() => `j-avatar-group__item--${this.size()}`);

  initials(value: string): string {
    return value
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }
}
