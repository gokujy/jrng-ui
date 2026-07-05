import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input, numberAttribute } from '@angular/core';
import { JPassThrough, jMergePartClasses } from '../core/pass-through';

export type JSkeletonShape = 'rectangle' | 'rounded' | 'circle';
export type JSkeletonAnimation = 'pulse' | 'wave' | 'none';
export type JSkeletonVariant = 'rectangle' | 'text' | 'avatar' | 'card' | 'table';

@Component({
  selector: 'j-skeleton',
  imports: [],
  template: `
    @switch (variant()) {
      @case ('card') {
        <div [class]="skeletonClasses()" data-jc-name="skeleton" data-jc-section="root" aria-hidden="true">
          <span class="j-skeleton__line j-skeleton__line--title" data-jc-section="line"></span>
          <span class="j-skeleton__line" data-jc-section="line"></span>
          <span class="j-skeleton__line j-skeleton__line--short" data-jc-section="line"></span>
        </div>
      }
      @case ('table') {
        <div [class]="skeletonClasses()" data-jc-name="skeleton" data-jc-section="root" aria-hidden="true">
          @for (row of tableRows(); track row) {
            <span class="j-skeleton__row" data-jc-section="row"></span>
          }
        </div>
      }
      @default {
        <span
          [class]="skeletonClasses()"
          data-jc-name="skeleton"
          data-jc-section="root"
          [style.width]="resolvedWidth()"
          [style.height]="resolvedHeight()"
          aria-hidden="true"
        ></span>
      }
    }
  `,
  styles: [
    `
      .j-skeleton {
        background: var(--j-skeleton-bg, var(--j-color-surface-subtle));
        display: block;
        min-height: 1rem;
        overflow: hidden;
        position: relative;
      }

      .j-skeleton--rectangle {
        border-radius: var(--j-radius-xs);
      }

      .j-skeleton--rounded,
      .j-skeleton--text {
        border-radius: var(--j-radius-md);
      }

      .j-skeleton--circle,
      .j-skeleton--avatar {
        border-radius: var(--j-radius-full);
      }

      .j-skeleton--card {
        background: transparent;
        border-radius: var(--j-card-radius);
        display: grid;
        gap: var(--j-spacing-md);
        min-height: auto;
      }

      .j-skeleton--table {
        background: transparent;
        display: grid;
        gap: var(--j-spacing-sm);
        min-height: auto;
      }

      .j-skeleton__line,
      .j-skeleton__row {
        background: var(--j-skeleton-bg, var(--j-color-surface-subtle));
        border-radius: var(--j-radius-sm);
        display: block;
        height: 1rem;
        position: relative;
        overflow: hidden;
      }

      .j-skeleton__line--title {
        height: 1.25rem;
        width: 48%;
      }

      .j-skeleton__line--short {
        width: 72%;
      }

      .j-skeleton__row {
        height: 2.5rem;
      }

      .j-skeleton--pulse,
      .j-skeleton--pulse .j-skeleton__line,
      .j-skeleton--pulse .j-skeleton__row {
        animation: j-skeleton-pulse 1.2s ease-in-out infinite;
      }

      .j-skeleton--wave::after,
      .j-skeleton--wave .j-skeleton__line::after,
      .j-skeleton--wave .j-skeleton__row::after {
        animation: j-skeleton-wave 1.4s linear infinite;
        background: linear-gradient(90deg, transparent, var(--j-skeleton-shimmer-color, rgb(255 255 255 / 42%)), transparent);
        content: '';
        inset: 0;
        position: absolute;
        transform: translateX(-100%);
      }

      @keyframes j-skeleton-pulse {
        50% {
          opacity: 0.55;
        }
      }

      @keyframes j-skeleton-wave {
        to {
          transform: translateX(100%);
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JSkeletonComponent {
  readonly width = input('100%');
  readonly height = input('1rem');
  readonly shape = input<JSkeletonShape>('rectangle');
  readonly variant = input<JSkeletonVariant>('rectangle');
  readonly animation = input<JSkeletonAnimation>('wave');
  readonly styleClass = input('');
  readonly pt = input<JPassThrough | null>(null);
  readonly rows = input(4, { transform: numberAttribute });
  readonly animated = input(true, { transform: booleanAttribute });

  readonly resolvedShape = computed(() => {
    if (this.variant() === 'avatar') {
      return 'avatar';
    }

    if (this.variant() === 'text') {
      return 'text';
    }

    return this.shape();
  });

  readonly resolvedAnimation = computed(() => (this.animated() ? this.animation() : 'none'));

  readonly resolvedWidth = computed(() => {
    if (this.variant() === 'avatar') {
      return this.width() === '100%' ? '2.5rem' : this.width();
    }

    return this.width();
  });

  readonly resolvedHeight = computed(() => {
    if (this.variant() === 'avatar') {
      return this.height() === '1rem' ? '2.5rem' : this.height();
    }

    if (this.variant() === 'text') {
      return this.height() === '1rem' ? '0.875rem' : this.height();
    }

    return this.height();
  });

  readonly tableRows = computed(() =>
    Array.from({ length: Math.max(1, this.rows()) }, (_, index) => index),
  );

  readonly skeletonClasses = computed(() =>
    jMergePartClasses(
      [
        'j-skeleton',
        `j-skeleton--${this.variant() === 'rectangle' ? this.resolvedShape() : this.variant()}`,
        this.resolvedAnimation() !== 'none' ? `j-skeleton--${this.resolvedAnimation()}` : '',
      ],
      this.styleClass(),
      this.pt(),
    ),
  );
}
