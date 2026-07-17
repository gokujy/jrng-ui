import {
  booleanAttribute,
  ChangeDetectionStrategy,
  computed,
  Component,
  input,
  numberAttribute,
} from '@angular/core';
import { JPassThrough, jMergePartClasses } from 'jrng-ui/core';
import { JSeverity } from 'jrng-ui/core';

export type JProgressBarVariant = 'default' | 'segmented' | 'labeled';

@Component({
  selector: 'j-progress-bar',
  imports: [],
  template: `
    <div
      [class]="barClasses()"
      data-jc-name="progress-bar"
      data-jc-section="root"
      [attr.data-j-loading]="indeterminate() ? 'true' : null"
      role="progressbar"
      [attr.aria-label]="label() || null"
      [attr.aria-valuemin]="0"
      [attr.aria-valuemax]="100"
      [attr.aria-valuenow]="indeterminate() ? null : normalizedValue()"
      [class.j-progress-bar--segmented]="variant() === 'segmented'"
      [class.j-progress-bar--labeled]="variant() === 'labeled'"
      [attr.data-j-variant]="variant()"
    >
      <span
        [class]="fillClasses()"
        data-jc-section="fill"
        [style.width.%]="indeterminate() ? null : normalizedValue()"
      ></span>
      @if (variant() === 'labeled' && !indeterminate()) {
        <span class="j-progress-bar__value" aria-hidden="true">{{ normalizedValue() }}%</span>
      }
    </div>
  `,
  styles: [
    `
      .j-progress-bar {
        background: var(--j-color-surface-subtle);
        border-radius: var(--j-radius-full);
        height: 0.5rem;
        overflow: hidden;
        width: 100%;
      }

      .j-progress-bar__fill {
        background: var(--j-progress-color);
        display: block;
        height: 100%;
        transition: width var(--j-duration-normal) var(--j-ease-standard);
      }

      .j-progress-bar__fill--indeterminate {
        animation: j-progress-indeterminate 1.2s ease-in-out infinite;
        width: 40%;
      }

      .j-progress-bar__fill--primary {
        --j-progress-color: var(--j-color-primary);
      }

      .j-progress-bar__fill--success {
        --j-progress-color: var(--j-color-success);
      }

      .j-progress-bar__fill--warning {
        --j-progress-color: var(--j-color-warning);
      }

      .j-progress-bar__fill--danger {
        --j-progress-color: var(--j-color-danger);
      }

      .j-progress-bar__fill--secondary,
      .j-progress-bar__fill--info,
      .j-progress-bar__fill--neutral {
        --j-progress-color: var(--j-color-secondary);
      }

      .j-progress-bar--segmented,
      .j-progress-bar--segmented .j-progress-bar__fill {
        border-radius: var(--j-radius-sm, 0.375rem);
      }

      .j-progress-bar--segmented .j-progress-bar__fill {
        background: repeating-linear-gradient(
          90deg,
          var(--j-progress-color) 0,
          var(--j-progress-color) calc(10% - 2px),
          transparent calc(10% - 2px),
          transparent 10%
        );
      }

      .j-progress-bar--labeled {
        align-items: center;
        display: flex;
        height: 1.5rem;
        position: relative;
      }

      .j-progress-bar--labeled .j-progress-bar__value {
        color: var(--j-color-text, #111827);
        font-size: var(--j-font-size-xs, 0.75rem);
        font-weight: var(--j-font-weight-semibold, 650);
        inset-inline-end: var(--j-spacing-sm, 0.5rem);
        position: absolute;
      }

      @media (prefers-reduced-motion: reduce) {
        .j-progress-bar__fill {
          animation-duration: 2.4s;
          transition: none;
        }
      }

      @keyframes j-progress-indeterminate {
        from {
          transform: translateX(-100%);
        }

        to {
          transform: translateX(250%);
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JProgressBarComponent {
  readonly value = input(0, { transform: numberAttribute });
  readonly severity = input<JSeverity>('primary');
  readonly label = input('');
  readonly styleClass = input('');
  readonly pt = input<JPassThrough | null>(null);
  readonly indeterminate = input(false, { transform: booleanAttribute });
  readonly variant = input<JProgressBarVariant>('default');

  readonly normalizedValue = computed(() => Math.min(100, Math.max(0, this.value())));

  readonly barClasses = computed(() =>
    jMergePartClasses('j-progress-bar', this.styleClass(), this.pt()),
  );

  readonly fillClasses = computed(() =>
    [
      'j-progress-bar__fill',
      `j-progress-bar__fill--${this.severity()}`,
      this.indeterminate() ? 'j-progress-bar__fill--indeterminate' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );
}
