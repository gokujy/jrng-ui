import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  PLATFORM_ID,
  Renderer2,
  booleanAttribute,
  inject,
  input,
  model,
  OnChanges,
  output,
  signal,
} from '@angular/core';

@Component({
  selector: 'j-image-preview',
  imports: [],
  template: `
    @if (visible()) {
      <div
        class="j-image-preview"
        data-jc-name="image-preview"
        data-jc-section="root"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="alt() || 'Image preview'"
      >
        <button
          type="button"
          class="j-image-preview__backdrop"
          aria-label="Close preview"
          (click)="close()"
        ></button>
        <div class="j-image-preview__content">
          <button
            type="button"
            class="j-image-preview__close"
            aria-label="Close preview"
            (click)="close()"
          >
            x
          </button>
          <img [src]="src()" [alt]="alt()" />
        </div>
      </div>
    }
  `,
  styles: [
    `
      .j-image-preview {
        inset: 0;
        position: fixed;
        z-index: var(--j-z-index-modal, 1100);
      }

      .j-image-preview__backdrop {
        background: rgb(15 23 42 / 72%);
        border: 0;
        cursor: zoom-out;
        inset: 0;
        position: absolute;
      }

      .j-image-preview__content {
        display: grid;
        inset: var(--j-spacing-6, 2rem);
        place-items: center;
        pointer-events: none;
        position: absolute;
      }

      .j-image-preview__content img {
        background: var(--j-color-card);
        border-radius: var(--j-radius-lg);
        max-height: 100%;
        max-width: 100%;
        object-fit: contain;
        pointer-events: auto;
      }

      .j-image-preview__close {
        background: var(--j-color-card);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-full);
        color: var(--j-color-foreground);
        cursor: pointer;
        font: inherit;
        height: 2.5rem;
        inset-block-start: 0;
        inset-inline-end: 0;
        position: absolute;
        width: 2.5rem;
      }

      .j-image-preview__close:focus-visible {
        box-shadow: var(--j-focus-ring);
        outline: none;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JImagePreviewComponent {
  private readonly documentRef = inject(DOCUMENT);
  private readonly renderer = inject(Renderer2);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly src = input('');
  readonly alt = input('');
  readonly visible = model(false);
  readonly closed = output<void>();

  constructor() {
    if (!this.isBrowser) {
      return;
    }

    const removeKeydownListener = this.renderer.listen(
      this.documentRef,
      'keydown',
      (event: KeyboardEvent) => {
        if (event.key === 'Escape' && this.visible()) {
          event.preventDefault();
          this.close();
        }
      },
    );

    this.destroyRef.onDestroy(removeKeydownListener);
  }

  close(): void {
    this.visible.set(false);
    this.closed.emit();
  }
}

@Component({
  selector: 'j-image',
  imports: [JImagePreviewComponent],
  template: `
    <span
      class="j-image"
      [class]="styleClass()"
      data-jc-name="image"
      data-jc-section="root"
      [style.width]="width() || null"
      [style.height]="height() || null"
    >
      @if (preview()) {
        <button
          type="button"
          class="j-image__button"
          [attr.aria-label]="'Preview image: ' + alt()"
          (click)="openPreview()"
        >
          <img
            [src]="currentSrc()"
            [alt]="alt()"
            [attr.loading]="loading()"
            (error)="useFallback()"
          />
        </button>
      } @else {
        <img
          [src]="currentSrc()"
          [alt]="alt()"
          [attr.loading]="loading()"
          (error)="useFallback()"
        />
      }
    </span>

    <j-image-preview
      [src]="currentSrc()"
      [alt]="alt()"
      [visible]="previewVisible()"
      (visibleChange)="previewVisible.set($event)"
    />
  `,
  styles: [
    `
      .j-image,
      .j-image__button,
      .j-image img {
        display: inline-block;
      }

      .j-image {
        border-radius: var(--j-radius-md);
        overflow: hidden;
      }

      .j-image__button {
        background: transparent;
        border: 0;
        cursor: zoom-in;
        padding: 0;
      }

      .j-image__button:focus-visible {
        box-shadow: var(--j-focus-ring);
        outline: none;
      }

      .j-image img {
        height: 100%;
        max-width: 100%;
        object-fit: cover;
        width: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JImageComponent implements OnChanges {
  readonly src = input('');
  readonly alt = input('');
  readonly width = input('');
  readonly height = input('');
  readonly loading = input<'lazy' | 'eager'>('lazy');
  readonly preview = input(false, { transform: booleanAttribute });
  readonly fallback = input('');
  readonly styleClass = input('');

  readonly currentSrc = signal('');
  readonly previewVisible = signal(false);

  ngOnChanges(): void {
    this.currentSrc.set(this.src());
  }

  openPreview(): void {
    this.previewVisible.set(true);
  }

  useFallback(): void {
    if (this.fallback() && this.currentSrc() !== this.fallback()) {
      this.currentSrc.set(this.fallback());
    }
  }
}
