import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  Input,
  numberAttribute,
} from '@angular/core';
import { JSeverity } from '../core/types';

@Component({
  selector: 'j-progress-bar',
  imports: [],
  template: `
    <div
      class="j-progress-bar"
      role="progressbar"
      [attr.aria-label]="label || null"
      [attr.aria-valuemin]="0"
      [attr.aria-valuemax]="100"
      [attr.aria-valuenow]="indeterminate ? null : normalizedValue"
    >
      <span [class]="fillClasses" [style.width.%]="indeterminate ? null : normalizedValue"></span>
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
  @Input({ transform: numberAttribute }) value = 0;
  @Input() severity: JSeverity = 'primary';
  @Input() label = '';
  @Input({ transform: booleanAttribute }) indeterminate = false;

  get normalizedValue(): number {
    return Math.min(100, Math.max(0, this.value));
  }

  get fillClasses(): string {
    return [
      'j-progress-bar__fill',
      `j-progress-bar__fill--${this.severity}`,
      this.indeterminate ? 'j-progress-bar__fill--indeterminate' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }
}
