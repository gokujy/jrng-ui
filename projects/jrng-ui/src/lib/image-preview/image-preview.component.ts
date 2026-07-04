import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  Output,
  PLATFORM_ID,
  Renderer2,
  booleanAttribute,
  inject,
} from '@angular/core';

@Component({
  selector: 'j-image-preview',
  imports: [],
  template: `
    @if (visible) {
      <div
        class="j-image-preview"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="alt || 'Image preview'"
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
            ×
          </button>
          <img [src]="src" [alt]="alt" />
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
        inset: var(--j-spacing-3xl, 2rem);
        place-items: center;
        pointer-events: none;
        position: absolute;
      }

      .j-image-preview__content img {
        background: var(--j-color-surface, #ffffff);
        border-radius: var(--j-radius-md, 0.5rem);
        max-height: 100%;
        max-width: 100%;
        object-fit: contain;
        pointer-events: auto;
      }

      .j-image-preview__close {
        background: var(--j-color-surface, #ffffff);
        border: 0;
        border-radius: var(--j-radius-full, 999px);
        color: var(--j-color-text, #111827);
        cursor: pointer;
        font: inherit;
        height: 2.5rem;
        position: absolute;
        inset-block-start: 0;
        inset-inline-end: 0;
        width: 2.5rem;
      }

      .j-image-preview__close:focus-visible {
        box-shadow: var(--j-focus-ring, 0 0 0 3px rgb(79 70 229 / 24%));
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

  @Input() src = '';
  @Input() alt = '';
  @Input({ transform: booleanAttribute }) visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() closed = new EventEmitter<void>();

  constructor() {
    if (!this.isBrowser) {
      return;
    }

    const removeKeydownListener = this.renderer.listen(this.documentRef, 'keydown', (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        this.handleEscape(event);
      }
    });

    this.destroyRef.onDestroy(removeKeydownListener);
  }

  handleEscape(event: Event): void {
    if (!this.visible) {
      return;
    }

    event.preventDefault();
    this.close();
  }

  close(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.closed.emit();
  }
}

@Component({
  selector: 'j-image',
  imports: [JImagePreviewComponent],
  template: `
    <span class="j-image" [style.width]="width || null" [style.height]="height || null">
      @if (preview) {
        <button
          type="button"
          class="j-image__button"
          [attr.aria-label]="'Preview image: ' + alt"
          (click)="openPreview()"
        >
          <img [src]="currentSrc" [alt]="alt" (error)="useFallback()" />
        </button>
      } @else {
        <img [src]="currentSrc" [alt]="alt" (error)="useFallback()" />
      }
    </span>

    <j-image-preview [src]="currentSrc" [alt]="alt" [(visible)]="previewVisible" />
  `,
  styles: [
    `
      .j-image,
      .j-image__button,
      .j-image img {
        display: inline-block;
      }

      .j-image {
        overflow: hidden;
      }

      .j-image__button {
        background: transparent;
        border: 0;
        cursor: zoom-in;
        padding: 0;
      }

      .j-image__button:focus-visible {
        border-radius: var(--j-radius-sm, 0.375rem);
        box-shadow: var(--j-focus-ring, 0 0 0 3px rgb(79 70 229 / 24%));
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
export class JImageComponent {
  @Input() src = '';
  @Input() alt = '';
  @Input() width = '';
  @Input() height = '';
  @Input({ transform: booleanAttribute }) preview = false;
  @Input() fallback = '';

  currentSrc = '';
  previewVisible = false;

  ngOnChanges(): void {
    this.currentSrc = this.src;
  }

  openPreview(): void {
    this.previewVisible = true;
  }

  useFallback(): void {
    if (this.fallback && this.currentSrc !== this.fallback) {
      this.currentSrc = this.fallback;
    }
  }
}
