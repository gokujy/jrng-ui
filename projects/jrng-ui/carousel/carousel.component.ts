import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  booleanAttribute,
  computed,
  contentChild,
  effect,
  inject,
  input,
  model,
  numberAttribute,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { isPlatformBrowser, NgTemplateOutlet } from '@angular/common';

export interface JCarouselItem {
  readonly title?: string;
  readonly description?: string;
  readonly image?: string;
  readonly alt?: string;
  readonly data?: unknown;
}

export interface JCarouselItemContext {
  readonly $implicit: JCarouselItem;
  readonly item: JCarouselItem;
  readonly index: number;
}

@Component({
  selector: 'j-carousel',
  imports: [NgTemplateOutlet],
  template: `
    <section
      class="j-carousel"
      [class]="styleClass()"
      data-jc-name="carousel"
      data-jc-section="root"
      role="group"
      aria-roledescription="carousel"
      [attr.aria-label]="ariaLabel()"
      tabindex="0"
      (keydown)="handleKeydown($event)"
      (mouseenter)="paused.set(true)"
      (mouseleave)="paused.set(false)"
    >
      <div class="j-carousel__viewport" [style.--j-carousel-items]="visibleItems()">
        @for (item of value(); track $index; let index = $index) {
          <article
            class="j-carousel__item"
            [class.is-active]="index === activeIndex()"
            [style.transform]="transform()"
            [attr.aria-hidden]="index < activeIndex() || index > lastVisibleIndex()"
          >
            @if (itemTemplate(); as template) {
              <ng-container
                [ngTemplateOutlet]="template"
                [ngTemplateOutletContext]="itemContext(item, index)"
              />
            } @else {
              @if (item.image) {
                <img [src]="item.image" [alt]="item.alt || item.title || ''" />
              }
              @if (item.title) {
                <strong>{{ item.title }}</strong>
              }
              @if (item.description) {
                <p>{{ item.description }}</p>
              }
            }
          </article>
        }
      </div>

      @if (controls()) {
        <button
          class="j-carousel__control j-carousel__control--previous"
          type="button"
          (click)="previous()"
          aria-label="Previous"
          [disabled]="!value().length || (!loop() && activeIndex() === 0)"
        >
          &lt;
        </button>
        <button
          class="j-carousel__control j-carousel__control--next"
          type="button"
          (click)="next()"
          aria-label="Next"
          [disabled]="!value().length || (!loop() && activeIndex() === maxIndex())"
        >
          &gt;
        </button>
      }

      @if (indicators()) {
        <div class="j-carousel__indicators" data-jc-section="indicators">
          @for (index of indicatorIndexes(); track index) {
            <button
              type="button"
              [class.is-active]="index === activeIndex()"
              [attr.aria-label]="'Go to item ' + (index + 1)"
              [attr.aria-current]="index === activeIndex() ? 'true' : null"
              (click)="activeIndex.set(index)"
            ></button>
          }
        </div>
      }
    </section>
  `,
  styles: [
    `
      .j-carousel {
        display: grid;
        gap: var(--j-spacing-3);
        overflow: hidden;
        position: relative;
      }

      .j-carousel__viewport {
        display: grid;
        gap: var(--j-spacing-3);
        grid-auto-columns: calc(
          (100% - (var(--j-carousel-items, 1) - 1) * var(--j-spacing-3)) /
            var(--j-carousel-items, 1)
        );
        grid-auto-flow: column;
        overflow: hidden;
      }

      .j-carousel__item {
        background: var(--j-color-card);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-lg);
        display: grid;
        gap: var(--j-spacing-2);
        overflow: hidden;
        padding: var(--j-spacing-3);
        transition: transform var(--j-duration-normal) var(--j-ease-standard);
      }

      .j-carousel:focus-visible {
        border-radius: var(--j-radius-lg);
        box-shadow: var(--j-focus-ring);
        outline: none;
      }

      .j-carousel__item img {
        aspect-ratio: 16 / 9;
        border-radius: var(--j-radius-md);
        object-fit: cover;
        width: 100%;
      }

      .j-carousel__item p {
        color: var(--j-color-muted-foreground);
        margin: 0;
      }

      .j-carousel__control {
        background: var(--j-color-card);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-full);
        box-shadow: var(--j-shadow-sm);
        cursor: pointer;
        height: 2.25rem;
        position: absolute;
        top: 45%;
        width: 2.25rem;
      }

      .j-carousel__control--previous {
        left: var(--j-spacing-2);
      }

      .j-carousel__control--next {
        right: var(--j-spacing-2);
      }

      .j-carousel__indicators {
        display: flex;
        gap: var(--j-spacing-2);
        justify-content: center;
      }

      .j-carousel__indicators button {
        background: var(--j-color-border);
        border: 0;
        border-radius: var(--j-radius-full);
        cursor: pointer;
        height: 0.5rem;
        width: 0.5rem;
      }

      .j-carousel__indicators button.is-active {
        background: var(--j-color-primary);
      }

      @media (prefers-reduced-motion: reduce) {
        .j-carousel__item {
          transition: none;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JCarouselComponent {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly value = input<readonly JCarouselItem[]>([]);
  readonly activeIndex = model(0);
  readonly autoplay = input(false, { transform: booleanAttribute });
  readonly interval = input(4000, { transform: numberAttribute });
  readonly controls = input(true, { transform: booleanAttribute });
  readonly indicators = input(true, { transform: booleanAttribute });
  readonly visibleItems = input(1, { transform: numberAttribute });
  readonly loop = input(true, { transform: booleanAttribute });
  readonly pauseOnHover = input(true, { transform: booleanAttribute });
  readonly ariaLabel = input('Featured items');
  readonly styleClass = input('');
  readonly paused = signal(false);
  readonly normalizedVisibleItems = computed(() => {
    const value = this.visibleItems();
    return Number.isFinite(value) ? Math.max(1, Math.floor(value)) : 1;
  });
  readonly maxIndex = computed(() =>
    Math.max(0, this.value().length - this.normalizedVisibleItems()),
  );
  readonly lastVisibleIndex = computed(() =>
    Math.min(this.value().length - 1, this.activeIndex() + this.normalizedVisibleItems() - 1),
  );
  readonly indicatorIndexes = computed(() =>
    this.value().length ? Array.from({ length: this.maxIndex() + 1 }, (_, index) => index) : [],
  );
  readonly itemTemplate = contentChild<unknown, TemplateRef<JCarouselItemContext>>(
    'jCarouselItem',
    { read: TemplateRef },
  );

  constructor() {
    // Keep activeIndex within bounds when the data array shrinks so it never
    // points past the last slide.
    effect(() => {
      const maxIndex = this.maxIndex();
      const index = this.activeIndex();
      const normalized = Number.isFinite(index)
        ? Math.min(maxIndex, Math.max(0, Math.floor(index)))
        : 0;
      if (index !== normalized) {
        this.activeIndex.set(normalized);
      }
    });

    effect((onCleanup) => {
      if (
        !this.isBrowser ||
        !this.autoplay() ||
        this.value().length < 2 ||
        (this.pauseOnHover() && this.paused())
      ) {
        return;
      }
      const configuredInterval = this.interval();
      const delay = Number.isFinite(configuredInterval)
        ? Math.max(100, Math.floor(configuredInterval))
        : 4000;
      const timer = setInterval(() => this.next(), delay);
      onCleanup(() => clearInterval(timer));
    });
  }

  transform(): string {
    return `translateX(calc(-${this.activeIndex()} * (100% + var(--j-spacing-3))))`;
  }

  next(): void {
    const maxIndex = this.maxIndex();
    if (this.value().length) {
      this.activeIndex.set(
        this.activeIndex() >= maxIndex ? (this.loop() ? 0 : maxIndex) : this.activeIndex() + 1,
      );
    }
  }

  previous(): void {
    const maxIndex = this.maxIndex();
    if (this.value().length) {
      this.activeIndex.set(
        this.activeIndex() <= 0 ? (this.loop() ? maxIndex : 0) : this.activeIndex() - 1,
      );
    }
  }

  handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.next();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.previous();
    } else if (event.key === 'Home') {
      event.preventDefault();
      this.activeIndex.set(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      this.activeIndex.set(this.maxIndex());
    }
  }

  itemContext(item: JCarouselItem, index: number): JCarouselItemContext {
    return { $implicit: item, item, index };
  }
}
