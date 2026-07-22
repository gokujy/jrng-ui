import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
  numberAttribute,
} from '@angular/core';
import { JPassThrough, jMergePartClasses } from 'jrng-ui/core';

export type JLoaderVariant =
  | 'spinner'
  | 'dots'
  | 'pulse'
  | 'ring'
  | 'dual-ring'
  | 'bars'
  | 'wave'
  | 'bounce'
  | 'orbit'
  | 'typing';
export type JLoaderSize = 'sm' | 'md' | 'lg' | number;
export type JLoaderSpeed = 'slow' | 'normal' | 'fast';

const LOADER_VARIANTS: readonly JLoaderVariant[] = [
  'spinner',
  'dots',
  'pulse',
  'ring',
  'dual-ring',
  'bars',
  'wave',
  'bounce',
  'orbit',
  'typing',
];

@Component({
  selector: 'j-loader',
  imports: [],
  template: `
    <span
      [class]="loaderClasses()"
      data-jc-name="loader"
      data-jc-section="root"
      data-j-loading="true"
      [attr.role]="isDeterminate() ? 'progressbar' : 'status'"
      [attr.aria-label]="label()"
      [attr.aria-busy]="!isDeterminate()"
      [attr.aria-valuemin]="isDeterminate() ? 0 : null"
      [attr.aria-valuemax]="isDeterminate() ? 100 : null"
      [attr.aria-valuenow]="isDeterminate() ? normalizedValue() : null"
      [style.width.px]="resolvedSize()"
      [style.height.px]="resolvedSize()"
      [style.--j-loader-stroke.px]="normalizedStrokeWidth()"
      [style.--j-loader-progress]="normalizedValue() + '%'"
    >
      <span class="j-loader__visual" aria-hidden="true">
        @for (item of indicators(); track $index) {
          <i></i>
        }
      </span>
      @if (inline()) {
        <span class="j-loader__label">{{ label() }}</span>
      } @else {
        <span class="j-hidden-accessible">{{ label() }}</span>
      }
    </span>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
      }

      .j-loader {
        --j-loader-duration: 900ms;
        align-items: center;
        color: var(--j-loader-color, var(--j-color-primary, #2563eb));
        display: inline-flex;
        justify-content: center;
        position: relative;
      }

      .j-loader--inline {
        gap: var(--j-spacing-sm, 0.5rem);
        width: auto !important;
      }

      .j-loader--overlay,
      .j-loader--fullscreen {
        background: color-mix(in srgb, var(--j-color-background, #fff) 82%, transparent);
        inset: 0;
        position: absolute;
        width: auto !important;
        z-index: var(--j-z-index-overlay, 1000);
      }

      .j-loader--fullscreen {
        position: fixed;
      }

      .j-loader--slow {
        --j-loader-duration: 1.4s;
      }
      .j-loader--fast {
        --j-loader-duration: 560ms;
      }

      .j-loader__visual {
        align-items: center;
        display: inline-flex;
        gap: max(2px, calc(var(--j-loader-stroke, 3px) / 2));
        height: 100%;
        justify-content: center;
        width: 100%;
      }

      .j-loader i {
        background: currentColor;
        display: block;
        font-style: normal;
      }

      .j-loader--spinner i,
      .j-loader--ring i,
      .j-loader--dual-ring i {
        animation: j-loader-spin var(--j-loader-duration) linear infinite;
        background: transparent;
        border: var(--j-loader-stroke, 3px) solid color-mix(in srgb, currentColor 22%, transparent);
        border-radius: var(--j-radius-full, 999px);
        border-top-color: currentColor;
        height: 72%;
        width: 72%;
      }

      .j-loader--dual-ring i {
        border-bottom-color: currentColor;
      }

      .j-loader--ring.j-loader--determinate i {
        animation: none;
        background: conic-gradient(
          currentColor var(--j-loader-progress),
          color-mix(in srgb, currentColor 18%, transparent) 0
        );
        border: 0;
        mask: radial-gradient(transparent 52%, #000 54%);
      }

      .j-loader--dots i,
      .j-loader--typing i,
      .j-loader--bounce i {
        animation: j-loader-dot var(--j-loader-duration) ease-in-out infinite;
        border-radius: var(--j-radius-full, 999px);
        height: max(4px, var(--j-loader-stroke, 3px));
        width: max(4px, var(--j-loader-stroke, 3px));
      }

      .j-loader--typing .j-loader__visual {
        background: var(--j-color-surface-subtle, #eef2f7);
        border-radius: var(--j-radius-full, 999px);
        padding-inline: var(--j-spacing-sm, 0.5rem);
      }

      .j-loader i:nth-child(2) {
        animation-delay: 120ms;
      }
      .j-loader i:nth-child(3) {
        animation-delay: 240ms;
      }
      .j-loader i:nth-child(4) {
        animation-delay: 360ms;
      }
      .j-loader i:nth-child(5) {
        animation-delay: 480ms;
      }

      .j-loader--bars i,
      .j-loader--wave i {
        animation: j-loader-bar var(--j-loader-duration) ease-in-out infinite;
        border-radius: var(--j-radius-sm, 0.25rem);
        height: 70%;
        transform: scaleY(0.35);
        width: max(3px, var(--j-loader-stroke, 3px));
      }

      .j-loader--wave i:nth-child(2),
      .j-loader--wave i:nth-child(4) {
        animation-delay: 120ms;
      }
      .j-loader--wave i:nth-child(3) {
        animation-delay: 240ms;
      }

      .j-loader--pulse i {
        animation: j-loader-pulse var(--j-loader-duration) ease-out infinite;
        border-radius: var(--j-radius-full, 999px);
        height: 70%;
        width: 70%;
      }

      .j-loader--orbit .j-loader__visual {
        animation: j-loader-spin var(--j-loader-duration) linear infinite;
        border: 1px solid color-mix(in srgb, currentColor 25%, transparent);
        border-radius: var(--j-radius-full, 999px);
        height: 76%;
        position: relative;
        width: 76%;
      }

      .j-loader--orbit i {
        border-radius: var(--j-radius-full, 999px);
        height: 24%;
        inset-block-start: -12%;
        position: absolute;
        width: 24%;
      }

      .j-loader__label {
        color: var(--j-color-text, currentColor);
        font-size: var(--j-font-size-sm, 0.875rem);
        white-space: nowrap;
      }

      @keyframes j-loader-spin {
        to {
          transform: rotate(360deg);
        }
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
          transform: scaleY(0.35);
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
        .j-loader *,
        .j-loader i {
          animation: none !important;
          opacity: 1;
          transform: none;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JLoaderComponent {
  readonly type = input<JLoaderVariant | string>('dots');
  readonly size = input<JLoaderSize>('md');
  readonly strokeWidth = input(3, { transform: numberAttribute });
  readonly label = input('Loading');
  readonly inline = input(false, { transform: booleanAttribute });
  readonly overlay = input(false, { transform: booleanAttribute });
  readonly fullscreen = input(false, { transform: booleanAttribute });
  readonly speed = input<JLoaderSpeed>('normal');
  readonly value = input<number | null, unknown>(null, {
    transform: (value) =>
      value === null || value === undefined || value === '' ? null : Number(value),
  });
  readonly styleClass = input('');
  readonly pt = input<JPassThrough | null>(null);

  readonly resolvedType = computed<JLoaderVariant>(() => {
    const requested = this.type();
    return LOADER_VARIANTS.includes(requested as JLoaderVariant)
      ? (requested as JLoaderVariant)
      : 'spinner';
  });
  readonly resolvedSize = computed(() => {
    const value = this.size();
    if (typeof value === 'number') return Math.max(8, value);
    return value === 'sm' ? 16 : value === 'lg' ? 48 : 24;
  });
  readonly normalizedStrokeWidth = computed(() => Math.max(1, this.strokeWidth()));
  readonly isDeterminate = computed(() => this.value() !== null);
  readonly normalizedValue = computed(() => Math.min(100, Math.max(0, this.value() ?? 0)));
  readonly indicators = computed(() => {
    const type = this.resolvedType();
    if (type === 'wave') return Array(5);
    if (type === 'dots' || type === 'typing' || type === 'bounce' || type === 'bars')
      return Array(3);
    return Array(1);
  });

  readonly loaderClasses = computed(() =>
    jMergePartClasses(
      [
        'j-loader',
        `j-loader--${this.resolvedType()}`,
        `j-loader--${this.speed()}`,
        this.inline() ? 'j-loader--inline' : '',
        this.overlay() ? 'j-loader--overlay' : '',
        this.fullscreen() ? 'j-loader--fullscreen' : '',
        this.isDeterminate() ? 'j-loader--determinate' : '',
      ],
      this.styleClass(),
      this.pt(),
    ),
  );
}
