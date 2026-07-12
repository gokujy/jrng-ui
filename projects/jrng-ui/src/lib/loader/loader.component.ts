import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  numberAttribute,
} from '@angular/core';
import { JPassThrough, jMergePartClasses } from 'jrng-ui/core';

export type JLoaderVariant = 'dots' | 'bars' | 'pulse';

@Component({
  selector: 'j-loader',
  imports: [],
  template: `
    <span
      [class]="loaderClasses()"
      data-jc-name="loader"
      data-jc-section="root"
      data-j-loading="true"
      role="status"
      [attr.aria-label]="label()"
      [style.width.px]="size()"
      [style.height.px]="size()"
      [style.--j-loader-stroke.px]="strokeWidth()"
    >
      @switch (variant()) {
        @case ('bars') {
          <i></i><i></i><i></i>
        }
        @case ('pulse') {
          <i></i>
        }
        @default {
          <i></i><i></i><i></i>
        }
      }
    </span>
  `,
  styles: [
    `
      .j-loader {
        align-items: center;
        color: var(--j-loader-color, var(--j-color-primary, #2563eb));
        display: inline-flex;
        gap: max(2px, calc(var(--j-loader-stroke, 3px) / 2));
        justify-content: center;
      }

      .j-loader i {
        background: currentColor;
        display: block;
        font-style: normal;
      }

      .j-loader--dots i {
        animation: j-loader-dot 900ms ease-in-out infinite;
        border-radius: var(--j-radius-full);
        height: max(4px, var(--j-loader-stroke, 3px));
        width: max(4px, var(--j-loader-stroke, 3px));
      }

      .j-loader--dots i:nth-child(2),
      .j-loader--bars i:nth-child(2) {
        animation-delay: 120ms;
      }

      .j-loader--dots i:nth-child(3),
      .j-loader--bars i:nth-child(3) {
        animation-delay: 240ms;
      }

      .j-loader--bars i {
        animation: j-loader-bar 900ms ease-in-out infinite;
        border-radius: var(--j-radius-sm);
        height: 70%;
        transform: scaleY(0.4);
        width: max(3px, var(--j-loader-stroke, 3px));
      }

      .j-loader--pulse i {
        animation: j-loader-pulse 1.1s ease-out infinite;
        border-radius: var(--j-radius-full);
        height: 70%;
        width: 70%;
      }

      @keyframes j-loader-dot {
        0%,
        60%,
        100% {
          opacity: 0.35;
          transform: translateY(0);
        }
        30% {
          opacity: 1;
          transform: translateY(-45%);
        }
      }

      @keyframes j-loader-bar {
        0%,
        100% {
          opacity: 0.45;
          transform: scaleY(0.4);
        }
        50% {
          opacity: 1;
          transform: scaleY(1);
        }
      }

      @keyframes j-loader-pulse {
        0% {
          opacity: 0.9;
          transform: scale(0.55);
        }
        100% {
          opacity: 0;
          transform: scale(1.15);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .j-loader {
          animation: none;
        }

        .j-loader i {
          animation: none;
          opacity: 1;
          transform: none;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JLoaderComponent {
  readonly variant = input<JLoaderVariant>('dots');
  readonly size = input(24, { transform: numberAttribute });
  readonly strokeWidth = input(3, { transform: numberAttribute });
  readonly label = input('Loading');
  readonly styleClass = input('');
  readonly pt = input<JPassThrough | null>(null);

  readonly loaderClasses = computed(() =>
    jMergePartClasses(['j-loader', `j-loader--${this.variant()}`], this.styleClass(), this.pt()),
  );
}
