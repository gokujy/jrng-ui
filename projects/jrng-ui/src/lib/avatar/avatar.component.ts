import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { JPassThrough, jMergePartClasses } from '../core/pass-through';
import { JSize } from '../core/types';

export type JAvatarShape = 'circle' | 'square';
export type JAvatarStatus = 'online' | 'offline' | 'away' | 'busy' | 'none';

@Component({
  selector: 'j-avatar',
  imports: [],
  template: `
    <span
      [class]="avatarClasses()"
      data-jc-name="avatar"
      data-jc-section="root"
      data-jc-extend="image fallback status"
      [attr.data-j-active]="status() !== 'none' ? 'true' : null"
      [attr.aria-label]="ariaLabel() || label() || initials() || null"
    >
      @if (showImage()) {
        <img
          class="j-avatar__image"
          data-jc-section="image"
          [src]="image()"
          [alt]="ariaLabel() || label() || initials() || ''"
          (error)="handleImageError()"
        />
      }
      @if (!showImage()) {
        <span class="j-avatar__label" data-jc-section="fallback">{{ displayInitials() }}</span>
      }
      @if (status() !== 'none') {
        <span
          class="j-avatar__status"
          data-jc-section="status"
          [class]="'j-avatar__status j-avatar__status--' + status()"
          aria-hidden="true"
        ></span>
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
        position: relative;
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

      .j-avatar__label {
        letter-spacing: 0;
        line-height: 1;
      }

      .j-avatar__status {
        border: 2px solid var(--j-color-card);
        border-radius: var(--j-radius-full);
        bottom: 0;
        height: 0.65rem;
        position: absolute;
        right: 0;
        width: 0.65rem;
      }

      .j-avatar__status--online {
        background: var(--j-color-success);
      }

      .j-avatar__status--offline {
        background: var(--j-color-muted-foreground);
      }

      .j-avatar__status--away {
        background: var(--j-color-warning);
      }

      .j-avatar__status--busy {
        background: var(--j-color-danger);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JAvatarComponent {
  readonly label = input('');
  readonly image = input('');
  readonly initials = input('');
  readonly ariaLabel = input('');
  readonly size = input<JSize>('md');
  readonly shape = input<JAvatarShape>('circle');
  readonly status = input<JAvatarStatus>('none');
  readonly styleClass = input('');
  readonly pt = input<JPassThrough | null>(null);
  readonly imageFailed = signal(false);

  readonly showImage = computed(() => !!this.image() && !this.imageFailed());

  readonly displayInitials = computed(() => this.initials() || this.createInitials(this.label() || this.ariaLabel()));

  readonly avatarClasses = computed(() =>
    jMergePartClasses(
      ['j-avatar', `j-avatar--${this.size()}`, `j-avatar--${this.shape()}`],
      this.styleClass(),
      this.pt(),
    ),
  );

  handleImageError(): void {
    this.imageFailed.set(true);
  }

  private createInitials(value: string): string {
    return value
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }
}
