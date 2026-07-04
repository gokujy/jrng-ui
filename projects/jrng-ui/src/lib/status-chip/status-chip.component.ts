import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { JSeverity, JSize } from '../core/types';

@Component({
  selector: 'j-status-chip',
  imports: [],
  template: `
    <span [class]="chipClasses">
      <span class="j-status-chip__dot" aria-hidden="true"></span>
      <span>{{ label }}</span>
    </span>
  `,
  styles: [
    `
      .j-status-chip {
        align-items: center;
        background: var(--j-status-chip-bg);
        border: 1px solid var(--j-status-chip-border);
        border-radius: var(--j-radius-full, 999px);
        color: var(--j-status-chip-color);
        display: inline-flex;
        font-weight: var(--j-font-weight-semibold, 650);
        gap: var(--j-spacing-sm, 0.5rem);
        line-height: 1;
      }

      .j-status-chip--sm {
        font-size: var(--j-font-size-xs, 0.75rem);
        min-height: 1.5rem;
        padding: 0 var(--j-spacing-sm, 0.5rem);
      }

      .j-status-chip--md {
        font-size: var(--j-font-size-sm, 0.875rem);
        min-height: 1.75rem;
        padding: 0 var(--j-spacing-md, 0.75rem);
      }

      .j-status-chip--lg {
        font-size: var(--j-font-size-md, 1rem);
        min-height: 2.125rem;
        padding: 0 var(--j-spacing-lg, 1rem);
      }

      .j-status-chip__dot {
        background: currentColor;
        border-radius: var(--j-radius-full, 999px);
        height: 0.5rem;
        width: 0.5rem;
      }

      .j-status-chip--primary {
        --j-status-chip-bg: var(--j-color-primary-soft, #eef2ff);
        --j-status-chip-border: transparent;
        --j-status-chip-color: var(--j-color-primary, #4f46e5);
      }

      .j-status-chip--secondary {
        --j-status-chip-bg: var(--j-color-secondary-soft, #dbeafe);
        --j-status-chip-border: transparent;
        --j-status-chip-color: var(--j-color-secondary, #2563eb);
      }

      .j-status-chip--success {
        --j-status-chip-bg: var(--j-color-success-soft, #dcfce7);
        --j-status-chip-border: transparent;
        --j-status-chip-color: var(--j-color-success, #16a34a);
      }

      .j-status-chip--warning {
        --j-status-chip-bg: var(--j-color-warning-soft, #fef3c7);
        --j-status-chip-border: transparent;
        --j-status-chip-color: var(--j-color-warning, #d97706);
      }

      .j-status-chip--danger {
        --j-status-chip-bg: var(--j-color-danger-soft, #fee2e2);
        --j-status-chip-border: transparent;
        --j-status-chip-color: var(--j-color-danger, #dc2626);
      }

      .j-status-chip--info {
        --j-status-chip-bg: var(--j-color-info-soft, #e0f2fe);
        --j-status-chip-border: transparent;
        --j-status-chip-color: var(--j-color-info, #0284c7);
      }

      .j-status-chip--neutral {
        --j-status-chip-bg: var(--j-color-surface-subtle, #eef2f7);
        --j-status-chip-border: var(--j-color-border, #dbe2ea);
        --j-status-chip-color: var(--j-color-text, #111827);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JStatusChipComponent {
  @Input() label = '';
  @Input() severity: JSeverity = 'neutral';
  @Input() size: JSize = 'md';

  get chipClasses(): string {
    return ['j-status-chip', `j-status-chip--${this.severity}`, `j-status-chip--${this.size}`].join(
      ' ',
    );
  }
}
