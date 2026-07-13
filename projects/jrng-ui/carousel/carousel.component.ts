import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  booleanAttribute,
  contentChild,
  effect,
  input,
  model,
  numberAttribute,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

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
    >
      <div class="j-carousel__viewport" [style.--j-carousel-items]="visibleItems()">
        @for (item of value(); track item.image || item.title || $index; let index = $index) {
          <article
            class="j-carousel__item"
            [class.is-active]="index === activeIndex()"
            [style.transform]="transform()"
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
        >
          &lt;
        </button>
        <button
          class="j-carousel__control j-carousel__control--next"
          type="button"
          (click)="next()"
          aria-label="Next"
        >
          &gt;
        </button>
      }

      @if (indicators()) {
        <div class="j-carousel__indicators" data-jc-section="indicators">
          @for (item of value(); track item.image || item.title || $index; let index = $index) {
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
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JCarouselComponent {
  readonly value = input<readonly JCarouselItem[]>([]);
  readonly activeIndex = model(0);
  readonly autoplay = input(false, { transform: booleanAttribute });
  readonly interval = input(4000, { transform: numberAttribute });
  readonly controls = input(true, { transform: booleanAttribute });
  readonly indicators = input(true, { transform: booleanAttribute });
  readonly visibleItems = input(1, { transform: numberAttribute });
  readonly styleClass = input('');
  readonly itemTemplate = contentChild<unknown, TemplateRef<JCarouselItemContext>>(
    'jCarouselItem',
    { read: TemplateRef },
  );

  constructor() {
    // Keep activeIndex within bounds when the data array shrinks so it never
    // points past the last slide.
    effect(() => {
      const length = this.value().length;
      const maxIndex = length > 0 ? length - 1 : 0;
      if (this.activeIndex() > maxIndex) {
        this.activeIndex.set(maxIndex);
      }
    });

    effect((onCleanup) => {
      if (!this.autoplay() || this.value().length < 2) {
        return;
      }
      const timer = setInterval(() => this.next(), this.interval());
      onCleanup(() => clearInterval(timer));
    });
  }

  transform(): string {
    return `translateX(-${this.activeIndex() * 100}%)`;
  }

  next(): void {
    const length = this.value().length;
    if (length) {
      this.activeIndex.set((this.activeIndex() + 1) % length);
    }
  }

  previous(): void {
    const length = this.value().length;
    if (length) {
      this.activeIndex.set((this.activeIndex() - 1 + length) % length);
    }
  }

  itemContext(item: JCarouselItem, index: number): JCarouselItemContext {
    return { $implicit: item, item, index };
  }
}
