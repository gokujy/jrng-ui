import { ChangeDetectionStrategy, Component, Input, numberAttribute } from '@angular/core';
import { JSize } from '../core/types';

export interface JAvatarGroupItem {
  readonly label?: string;
  readonly image?: string;
  readonly ariaLabel?: string;
}

@Component({
  selector: 'j-avatar-group',
  imports: [],
  template: `
    <span class="j-avatar-group" [attr.aria-label]="ariaLabel || null">
      @for (item of visibleItems; track item.image || item.ariaLabel || item.label || $index) {
        <span
          class="j-avatar-group__item"
          [class]="itemClasses"
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
      @if (overflowCount > 0) {
        <span class="j-avatar-group__item" [class]="itemClasses"> +{{ overflowCount }} </span>
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
  @Input() items: readonly JAvatarGroupItem[] = [];
  @Input() size: JSize = 'md';
  @Input({ transform: numberAttribute }) max = 5;
  @Input() ariaLabel = '';

  get visibleItems(): readonly JAvatarGroupItem[] {
    return this.items.slice(0, Math.max(0, this.max));
  }

  get overflowCount(): number {
    return Math.max(0, this.items.length - this.visibleItems.length);
  }

  get itemClasses(): string {
    return `j-avatar-group__item--${this.size}`;
  }

  initials(value: string): string {
    return value
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }
}
