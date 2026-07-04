import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { JSize } from '../core/types';

export type JAvatarShape = 'circle' | 'square';

@Component({
  selector: 'j-avatar',
  imports: [],
  template: `
    <span [class]="avatarClasses" [attr.aria-label]="ariaLabel || label || null">
      @if (image) {
        <img class="j-avatar__image" [src]="image" [alt]="ariaLabel || label || ''" />
      }
      @if (!image) {
        <span class="j-avatar__label">{{ label }}</span>
      }
      <ng-content></ng-content>
    </span>
  `,
  styles: [
    `
      .j-avatar {
        align-items: center;
        background: var(--j-color-surface-subtle);
        color: var(--j-color-text);
        display: inline-flex;
        font-weight: var(--j-font-weight-bold);
        justify-content: center;
        overflow: hidden;
      }

      .j-avatar--sm {
        font-size: var(--j-font-size-xs);
        height: 1.75rem;
        width: 1.75rem;
      }

      .j-avatar--md {
        font-size: var(--j-font-size-sm);
        height: 2.25rem;
        width: 2.25rem;
      }

      .j-avatar--lg {
        font-size: var(--j-font-size-md);
        height: 3rem;
        width: 3rem;
      }

      .j-avatar--circle {
        border-radius: var(--j-radius-full);
      }

      .j-avatar--square {
        border-radius: var(--j-radius-md);
      }

      .j-avatar__image {
        height: 100%;
        object-fit: cover;
        width: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JAvatarComponent {
  @Input() label = '';
  @Input() image = '';
  @Input() ariaLabel = '';
  @Input() size: JSize = 'md';
  @Input() shape: JAvatarShape = 'circle';

  get avatarClasses(): string {
    return ['j-avatar', `j-avatar--${this.size}`, `j-avatar--${this.shape}`].join(' ');
  }
}
