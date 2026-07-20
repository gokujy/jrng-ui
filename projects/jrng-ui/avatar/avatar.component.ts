import {
  ChangeDetectionStrategy,
  Component,
  OnChanges,
  SimpleChanges,
  booleanAttribute,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { JPassThrough, jMergePartClasses } from 'jrng-ui/core';
import { JInternalImageViewerComponent } from 'jrng-ui/image';
import { JComponentSize } from 'jrng-ui/core';

export type JAvatarShape = 'circle' | 'square' | 'rounded';
export type JAvatarStatus = 'online' | 'offline' | 'away' | 'busy' | 'none';

@Component({
  selector: 'j-avatar',
  imports: [JInternalImageViewerComponent],
  template: `
    <span
      [class]="avatarClasses()"
      data-jc-name="avatar"
      data-jc-section="root"
      data-jc-extend="image fallback status"
      [attr.data-j-active]="status() !== 'none' ? 'true' : null"
      [class.j-avatar--zoomable]="previewable() && showImage()"
      [attr.role]="previewable() && showImage() ? 'button' : null"
      [attr.tabindex]="previewable() && showImage() ? 0 : null"
      [attr.aria-label]="
        previewable() && showImage()
          ? previewAriaLabel()
          : ariaLabel() || label() || initials() || null
      "
      [attr.aria-haspopup]="previewable() && showImage() ? 'dialog' : null"
      (click)="handleZoom($event)"
      (keydown)="handleZoomKeydown($event)"
    >
      @if (showImage()) {
        <img
          class="j-avatar__image"
          data-jc-section="image"
          [src]="image()"
          [alt]="ariaLabel() || label() || initials() || ''"
          [attr.loading]="imageLoading()"
          (error)="handleImageError()"
        />
      }
      @if (!showImage()) {
        <span class="j-avatar__label" data-jc-section="fallback">
          {{ displayInitials() || icon() }}
        </span>
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
    <j-internal-image-viewer
      [src]="image()"
      [alt]="ariaLabel() || label() || initials()"
      width="400px"
      height="400px"
      [visible]="previewVisible()"
      (visibleChange)="previewVisible.set($event)"
      (closed)="handlePreviewClosed()"
    />
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

      .j-avatar--xs {
        font-size: var(--j-font-size-xs);
        height: 1.375rem;
        width: 1.375rem;
      }
      .j-avatar--xl {
        font-size: var(--j-font-size-lg);
        height: 4rem;
        width: 4rem;
      }

      .j-avatar--circle {
        border-radius: var(--j-radius-full);
      }

      .j-avatar--square {
        border-radius: var(--j-radius-md);
      }

      .j-avatar--rounded {
        border-radius: var(--j-radius-lg);
      }

      .j-avatar__image {
        height: 100%;
        object-fit: cover;
        width: 100%;
      }

      .j-avatar--zoomable {
        cursor: zoom-in;
      }

      .j-avatar--zoomable:focus-visible {
        box-shadow: var(--j-focus-ring);
        outline: none;
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
export class JAvatarComponent implements OnChanges {
  private zoomTrigger: HTMLElement | null = null;
  readonly label = input('');
  readonly image = input('');
  readonly initials = input('');
  readonly icon = input('');
  readonly ariaLabel = input('');
  readonly size = input<JComponentSize | 'xs' | 'xl'>('md');
  readonly imageLoading = input<'eager' | 'lazy'>('eager');
  readonly shape = input<JAvatarShape>('circle');
  readonly status = input<JAvatarStatus>('none');
  readonly previewable = input(false, { transform: booleanAttribute });
  readonly previewAriaLabel = input('Preview profile image');
  readonly styleClass = input('');
  readonly pt = input<JPassThrough | null>(null);
  readonly imageFailed = signal(false);
  readonly previewVisible = signal(false);
  readonly open = output<Event>();

  readonly showImage = computed(() => !!this.image() && !this.imageFailed());

  readonly displayInitials = computed(
    () => this.initials() || this.createInitials(this.label() || this.ariaLabel()),
  );

  readonly avatarClasses = computed(() =>
    jMergePartClasses(
      ['j-avatar', `j-avatar--${this.size()}`, `j-avatar--${this.shape()}`],
      this.styleClass(),
      this.pt(),
    ),
  );

  handleImageError(): void {
    this.imageFailed.set(true);
    this.previewVisible.set(false);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['image']) {
      this.imageFailed.set(false);
    }
  }

  handleZoom(event: Event): void {
    if (!this.previewable() || !this.showImage()) {
      return;
    }
    this.zoomTrigger = event.currentTarget as HTMLElement;
    this.open.emit(event);
    this.previewVisible.set(true);
  }

  handleZoomKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }
    event.preventDefault();
    this.handleZoom(event);
  }

  handlePreviewClosed(): void {
    this.zoomTrigger?.focus();
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
