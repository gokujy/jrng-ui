import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  PLATFORM_ID,
  Renderer2,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { JInternalImageViewerComponent } from 'jrng-ui/image';
import { JButtonComponent } from 'jrng-ui/button';

export interface JGalleryItem {
  readonly src: string;
  readonly alt?: string;
  readonly thumbnail?: string;
  readonly caption?: string;
}

export type JGalleryVariant =
  'standard' | 'contained' | 'minimal' | 'filmstrip' | 'hero' | 'masonry';
export type JGalleryAnimation = 'fade' | 'zoom' | 'slide' | 'crossfade' | 'none';
export type JGallerySlideDirection = 'left' | 'right' | 'up' | 'down';

@Component({
  selector: 'j-gallery',
  imports: [JInternalImageViewerComponent, JButtonComponent],
  template: `
    <section
      [class]="galleryClasses()"
      [style.--j-gallery-animation-duration]="animationDuration() + 'ms'"
      [style.--j-gallery-animation-easing]="animationEasing()"
      [attr.data-j-animation]="animation()"
      [attr.aria-busy]="activeItem() && !isLoaded(activeItem()!.src)"
      data-jc-name="gallery"
      data-jc-section="root"
    >
      @if (activeItem(); as item) {
        <button class="j-gallery__stage" type="button" (click)="previewVisible.set(true)">
          @if (previousItem(); as previous) {
            <img
              class="j-gallery__image j-gallery__image--previous"
              [src]="previous.src"
              [alt]="previous.alt || ''"
            />
          }
          @for (active of [item]; track active.src) {
            <img
              [class]="
                'j-gallery__image j-gallery__image--active j-gallery__image--' +
                animation() +
                ' j-gallery__image--from-' +
                slideDirection()
              "
              [src]="active.src"
              [alt]="active.alt || ''"
              [class.is-ready]="isLoaded(active.src)"
              (load)="markLoaded(active.src)"
              (error)="markFailed(active.src)"
            />
          }
          @if (!isLoaded(item.src) && !failedSources().has(item.src)) {
            <span class="j-gallery__loader" role="status">Loading image</span>
          }
          @if (failedSources().has(item.src)) {
            <span class="j-gallery__error" role="alert">Unable to load image</span>
          }
          @if (item.caption) {
            <span>{{ item.caption }}</span>
          }
        </button>
        <div class="j-gallery__navigation" aria-label="Gallery navigation">
          <j-button
            variant="text"
            actionDisplay="icon"
            icon="chevron-left"
            ariaLabel="Previous image"
            title="Previous image"
            [disabled]="!loop() && activeIndex() === 0"
            (onClick)="previous()"
          />
          <span aria-live="polite">{{ activeIndex() + 1 }} / {{ value().length }}</span>
          <j-button
            variant="text"
            actionDisplay="icon"
            icon="chevron-right"
            ariaLabel="Next image"
            title="Next image"
            [disabled]="!loop() && activeIndex() === value().length - 1"
            (onClick)="next()"
          />
        </div>
      }

      <div class="j-gallery__thumbs" data-jc-section="thumbnails">
        @for (item of value(); track item.src; let index = $index) {
          <button
            type="button"
            [class.is-active]="index === activeIndex()"
            [attr.aria-current]="index === activeIndex() ? 'true' : null"
            (click)="select(index)"
          >
            <img [src]="item.thumbnail || item.src" [alt]="item.alt || ''" />
          </button>
        }
      </div>
    </section>

    @if (activeItem(); as item) {
      <j-internal-image-viewer
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
        position: relative;
      }

      .j-gallery__stage img {
        aspect-ratio: 16 / 9;
        object-fit: cover;
        width: 100%;
      }

      .j-gallery__image--active {
        animation-duration: var(--j-gallery-animation-duration);
        animation-timing-function: var(--j-gallery-animation-easing);
        opacity: 0;
      }
      .j-gallery__image--active.is-ready {
        opacity: 1;
      }

      .j-gallery__image--fade {
        animation-name: j-gallery-fade;
      }
      .j-gallery__image--crossfade {
        animation-name: j-gallery-fade;
      }
      .j-gallery__image--zoom {
        animation-name: j-gallery-zoom;
      }
      .j-gallery__image--slide {
        animation-name: j-gallery-slide-left;
      }
      .j-gallery__image--slide.j-gallery__image--from-right {
        animation-name: j-gallery-slide-right;
      }
      .j-gallery__image--slide.j-gallery__image--from-up {
        animation-name: j-gallery-slide-up;
      }
      .j-gallery__image--slide.j-gallery__image--from-down {
        animation-name: j-gallery-slide-down;
      }

      .j-gallery__image--previous {
        inset: 0;
        position: absolute;
      }
      .j-gallery__loader, .j-gallery__error { align-self: center; background: color-mix(in srgb, var(--j-color-card) 88%, transparent); border-radius: var(--j-radius-md); justify-self: center; padding: var(--j-spacing-2) var(--j-spacing-3); position: absolute; }

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

      @keyframes j-gallery-slide-left {
        from {
          opacity: 0;
          transform: translateX(1.5rem);
        }
      }
      @keyframes j-gallery-slide-right {
        from {
          opacity: 0;
          transform: translateX(-1.5rem);
        }
      }
      @keyframes j-gallery-slide-up {
        from {
          opacity: 0;
          transform: translateY(1.5rem);
        }
      }
      @keyframes j-gallery-slide-down {
        from {
          opacity: 0;
          transform: translateY(-1.5rem);
        }
      }

      .j-gallery__navigation {
        align-items: center;
        display: flex;
        justify-content: space-between;
      }

      .j-gallery--contained {
        background: var(--j-color-surface-muted);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-lg);
        padding: var(--j-spacing-3);
      }
      .j-gallery--minimal .j-gallery__stage {
        border: 0;
        border-radius: 0;
      }
      .j-gallery--filmstrip .j-gallery__thumbs {
        order: -1;
      }
      .j-gallery--hero .j-gallery__stage img {
        aspect-ratio: 21 / 9;
      }
      .j-gallery--masonry .j-gallery__thumbs {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(5rem, 1fr));
      }

      @media (prefers-reduced-motion: reduce) {
        .j-gallery__image--active {
          animation-duration: 1ms;
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
  readonly variant = input<JGalleryVariant>('standard');
  readonly animation = input<JGalleryAnimation>('fade');
  readonly animationDuration = input(450);
  readonly animationEasing = input('ease-in-out');
  readonly slideDirection = input<JGallerySlideDirection>('left');
  readonly loop = input(true, { transform: booleanAttribute });
  readonly previewVisible = model(false);
  readonly activeItem = computed(() => this.value()[this.activeIndex()] ?? null);
  readonly previousItem = signal<JGalleryItem | null>(null);
  readonly loadedSources = signal<ReadonlySet<string>>(new Set());
  readonly failedSources = signal<ReadonlySet<string>>(new Set());
  private transitionTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly preloadRequests = new Map<string, HTMLImageElement>();

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
    this.destroyRef.onDestroy(() => this.clearTransition());
    this.destroyRef.onDestroy(() => {
      for (const image of this.preloadRequests.values()) {
        image.onload = null;
        image.onerror = null;
        image.src = '';
      }
      this.preloadRequests.clear();
    });
    let previousIndex = this.activeIndex();
    effect(() => {
      const nextIndex = this.activeIndex();
      const items = this.value();
      this.preloadAround(nextIndex, items);
      if (nextIndex !== previousIndex) {
        this.previousItem.set(items[previousIndex] ?? null);
        previousIndex = nextIndex;
        this.clearTransition();
      }
    });
  }

  next(): void {
    const last = this.value().length - 1;
    this.select(
      this.activeIndex() >= last && this.loop() ? 0 : Math.min(last, this.activeIndex() + 1),
    );
  }

  previous(): void {
    const last = this.value().length - 1;
    this.select(
      this.activeIndex() <= 0 && this.loop() ? last : Math.max(0, this.activeIndex() - 1),
    );
  }

  select(index: number): void {
    if (index >= 0 && index < this.value().length && index !== this.activeIndex()) {
      this.activeIndex.set(index);
    }
  }

  isLoaded(src: string): boolean {
    return this.loadedSources().has(src);
  }

  markLoaded(src: string): void {
    if (!this.loadedSources().has(src)) {
      this.loadedSources.update((current) => new Set([...current, src]));
    }
    this.failedSources.update((current) => {
      const next = new Set(current);
      next.delete(src);
      return next;
    });
    if (this.activeItem()?.src === src) this.finishTransition();
  }

  markFailed(src: string): void {
    this.failedSources.update((current) => new Set([...current, src]));
    if (this.activeItem()?.src === src) this.finishTransition();
  }

  galleryClasses(): string {
    return ['j-gallery', `j-gallery--${this.variant()}`, this.styleClass()]
      .filter(Boolean)
      .join(' ');
  }

  private clearTransition(): void {
    if (this.transitionTimer !== null) {
      clearTimeout(this.transitionTimer);
      this.transitionTimer = null;
    }
  }

  private finishTransition(): void {
    this.clearTransition();
    this.transitionTimer = setTimeout(
      () => this.previousItem.set(null),
      Math.max(0, this.animationDuration()),
    );
  }

  private preloadAround(index: number, items: readonly JGalleryItem[]): void {
    if (!items.length) return;
    const indexes = [index, (index + 1) % items.length, (index - 1 + items.length) % items.length];
    for (const candidate of indexes) {
      const src = items[candidate]?.src;
      if (!src || this.loadedSources().has(src) || this.preloadRequests.has(src)) continue;
      const image = this.documentRef.createElement('img');
      this.preloadRequests.set(src, image);
      image.onload = () => { this.preloadRequests.delete(src); this.markLoaded(src); };
      image.onerror = () => { this.preloadRequests.delete(src); this.markFailed(src); };
      image.src = src;
    }
  }
}
