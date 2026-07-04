import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type JSkeletonShape = 'rectangle' | 'rounded' | 'circle';
export type JSkeletonAnimation = 'pulse' | 'wave' | 'none';

@Component({
  selector: 'j-skeleton',
  imports: [],
  template: `<span
    [class]="skeletonClasses"
    [style.width]="width"
    [style.height]="height"
    aria-hidden="true"
  ></span>`,
  styles: [
    `
      .j-skeleton {
        background: var(--j-color-surface-subtle);
        display: block;
        min-height: 1rem;
        overflow: hidden;
        position: relative;
      }

      .j-skeleton--rectangle {
        border-radius: var(--j-radius-xs);
      }

      .j-skeleton--rounded {
        border-radius: var(--j-radius-md);
      }

      .j-skeleton--circle {
        border-radius: var(--j-radius-full);
      }

      .j-skeleton--pulse {
        animation: j-skeleton-pulse 1.2s ease-in-out infinite;
      }

      .j-skeleton--wave::after {
        animation: j-skeleton-wave 1.4s linear infinite;
        background: linear-gradient(90deg, transparent, rgb(255 255 255 / 42%), transparent);
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
  @Input() width = '100%';
  @Input() height = '1rem';
  @Input() shape: JSkeletonShape = 'rectangle';
  @Input() animation: JSkeletonAnimation = 'wave';

  get skeletonClasses(): string {
    return [
      'j-skeleton',
      `j-skeleton--${this.shape}`,
      this.animation !== 'none' ? `j-skeleton--${this.animation}` : '',
    ]
      .filter(Boolean)
      .join(' ');
  }
}
