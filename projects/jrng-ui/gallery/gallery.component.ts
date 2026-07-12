import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  PLATFORM_ID,
  Renderer2,
  computed,
  inject,
  input,
  model,
} from '@angular/core';
import { JImagePreviewComponent } from 'jrng-ui/image-preview';

export interface JGalleryItem {
  readonly src: string;
  readonly alt?: string;
  readonly thumbnail?: string;
  readonly caption?: string;
}

export type JGalleryAnimation = 'fade' | 'zoom' | 'slide' | 'none';

@Component({
  selector: 'j-gallery',
  imports: [JImagePreviewComponent],
  template: `
    <section class="j-gallery" [class]="styleClass()" data-jc-name="gallery" data-jc-section="root">
      @if (activeItem(); as item) {
        <button class="j-gallery__stage" type="button" (click)="previewVisible.set(true)">
          @for (active of [item]; track active.src) {
            <img
              [class]="'j-gallery__image j-gallery__image--' + animation()"
              [src]="active.src"
              [alt]="active.alt || ''"
            />
          }
          @if (item.caption) {
            <span>{{ item.caption }}</span>
          }
        </button>
      }

      <div class="j-gallery__thumbs" data-jc-section="thumbnails">
        @for (item of value(); track item.src; let index = $index) {
          <button
            type="button"
            [class.is-active]="index === activeIndex()"
            [attr.aria-current]="index === activeIndex() ? 'true' : null"
            (click)="activeIndex.set(index)"
          >
            <img [src]="item.thumbnail || item.src" [alt]="item.alt || ''" />
          </button>
        }
      </div>
    </section>

    @if (activeItem(); as item) {
      <j-image-preview
        [src]="item.src"
        [alt]="item.alt || ''"
        [visible]="previewVisible()"
        (visibleChange)="previewVisible.set($event)"
      />
    }
  `,
  styles: [
    `
      .j-gallery {
        display: grid;
        gap: var(--j-spacing-3);
      }

      .j-gallery__stage {
        background: var(--j-color-card);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-lg);
        cursor: zoom-in;
        display: grid;
        overflow: hidden;
        padding: 0;
        text-align: start;
      }

      .j-gallery__stage img {
        aspect-ratio: 16 / 9;
        object-fit: cover;
        width: 100%;
      }

      .j-gallery__image--fade {
        animation: j-gallery-fade 320ms ease-out;
      }

      .j-gallery__image--zoom {
        animation: j-gallery-zoom 360ms ease-out;
      }

      .j-gallery__image--slide {
        animation: j-gallery-slide 360ms ease-out;
      }

      @keyframes j-gallery-fade {
        from {
          opacity: 0;
        }
      }

      @keyframes j-gallery-zoom {
        from {
          opacity: 0;
          transform: scale(1.04);
        }
      }

      @keyframes j-gallery-slide {
        from {
          opacity: 0;
          transform: translateX(1.5rem);
        }
      }

      .j-gallery__stage span {
        color: var(--j-color-muted-foreground);
        padding: var(--j-spacing-3);
      }

      .j-gallery__thumbs {
        display: flex;
        gap: var(--j-spacing-2);
        overflow: auto;
      }

      .j-gallery__thumbs button {
        background: transparent;
        border: 2px solid transparent;
        border-radius: var(--j-radius-md);
        cursor: pointer;
        padding: 0;
      }

      .j-gallery__thumbs button.is-active {
        border-color: var(--j-color-primary);
      }

      .j-gallery__thumbs img {
        border-radius: calc(var(--j-radius-md) - 2px);
        display: block;
        height: 4rem;
        object-fit: cover;
        width: 5rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JGalleryComponent {
  private readonly documentRef = inject(DOCUMENT);
  private readonly renderer = inject(Renderer2);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly value = input<readonly JGalleryItem[]>([]);
  readonly activeIndex = model(0);
  readonly styleClass = input('');
  readonly animation = input<JGalleryAnimation>('fade');
  readonly previewVisible = model(false);
  readonly activeItem = computed(() => this.value()[this.activeIndex()] ?? null);

  constructor() {
    if (!this.isBrowser) {
      return;
    }
    const remove = this.renderer.listen(this.documentRef, 'keydown', (event: KeyboardEvent) => {
      if (!this.previewVisible()) {
        return;
      }
      if (event.key === 'ArrowRight') {
        this.next();
      }
      if (event.key === 'ArrowLeft') {
        this.previous();
      }
    });
    this.destroyRef.onDestroy(remove);
  }

  next(): void {
    this.activeIndex.set(Math.min(this.value().length - 1, this.activeIndex() + 1));
  }

  previous(): void {
    this.activeIndex.set(Math.max(0, this.activeIndex() - 1));
  }
}
