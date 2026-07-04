import { booleanAttribute, ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { JSeverity, JSize } from '../core/types';

@Component({
  selector: 'j-badge',
  imports: [],
  template: `<span [class]="badgeClasses">{{ value }}<ng-content></ng-content></span>`,
  styles: [
    `
      .j-badge {
        align-items: center;
        background: var(--j-badge-bg);
        border-radius: var(--j-radius-sm);
        color: var(--j-badge-color);
        display: inline-flex;
        font-weight: var(--j-font-weight-bold);
        justify-content: center;
        line-height: var(--j-line-height-tight);
        min-width: 1.25rem;
        white-space: nowrap;
      }

      .j-badge--sm {
        font-size: var(--j-font-size-xs);
        min-height: 1rem;
        padding: 0 var(--j-spacing-xs);
      }

      .j-badge--md {
        font-size: var(--j-font-size-xs);
        min-height: 1.25rem;
        padding: 0 var(--j-spacing-sm);
      }

      .j-badge--lg {
        font-size: var(--j-font-size-sm);
        min-height: 1.5rem;
        padding: 0 var(--j-spacing-md);
      }

      .j-badge--rounded {
        border-radius: var(--j-radius-full);
      }

      .j-badge--primary {
        --j-badge-bg: var(--j-color-primary);
        --j-badge-color: var(--j-color-on-primary);
      }

      .j-badge--secondary {
        --j-badge-bg: var(--j-color-secondary);
        --j-badge-color: var(--j-color-on-primary);
      }

      .j-badge--success {
        --j-badge-bg: var(--j-color-success);
        --j-badge-color: #ffffff;
      }

      .j-badge--warning {
        --j-badge-bg: var(--j-color-warning);
        --j-badge-color: #111827;
      }

      .j-badge--danger {
        --j-badge-bg: var(--j-color-danger);
        --j-badge-color: var(--j-color-on-danger);
      }

      .j-badge--info {
        --j-badge-bg: var(--j-color-info);
        --j-badge-color: #ffffff;
      }

      .j-badge--neutral {
        --j-badge-bg: var(--j-color-surface-subtle);
        --j-badge-color: var(--j-color-text);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JBadgeComponent {
  @Input() value = '';
  @Input() severity: JSeverity = 'primary';
  @Input() size: JSize = 'md';
  @Input({ transform: booleanAttribute }) rounded = true;

  get badgeClasses(): string {
    return [
      'j-badge',
      `j-badge--${this.severity}`,
      `j-badge--${this.size}`,
      this.rounded ? 'j-badge--rounded' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }
}
