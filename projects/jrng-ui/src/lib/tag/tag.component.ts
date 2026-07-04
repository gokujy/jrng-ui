import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { JSeverity, JSize } from '../core/types';

@Component({
  selector: 'j-tag',
  imports: [],
  template: `
    <span [class]="tagClasses">
      <span class="j-tag__label">{{ label }}<ng-content></ng-content></span>
      @if (removable) {
        <button
          class="j-tag__remove"
          type="button"
          aria-label="Remove"
          (click)="remove.emit($event)"
        >
          ×
        </button>
      }
    </span>
  `,
  styles: [
    `
      .j-tag {
        align-items: center;
        background: var(--j-tag-bg);
        border: 1px solid var(--j-tag-border);
        border-radius: var(--j-radius-sm);
        color: var(--j-tag-color);
        display: inline-flex;
        font-weight: var(--j-font-weight-semibold);
        gap: var(--j-spacing-xs);
        line-height: var(--j-line-height-tight);
      }

      .j-tag--sm {
        font-size: var(--j-font-size-xs);
        min-height: 1.375rem;
        padding: 0 var(--j-spacing-sm);
      }

      .j-tag--md {
        font-size: var(--j-font-size-sm);
        min-height: 1.75rem;
        padding: 0 var(--j-spacing-md);
      }

      .j-tag--lg {
        font-size: var(--j-font-size-md);
        min-height: 2.125rem;
        padding: 0 var(--j-spacing-lg);
      }

      .j-tag--rounded {
        border-radius: var(--j-radius-full);
      }

      .j-tag__remove {
        align-items: center;
        background: transparent;
        border: 0;
        color: inherit;
        cursor: pointer;
        display: inline-flex;
        font: inherit;
        height: 1rem;
        justify-content: center;
        padding: 0;
        width: 1rem;
      }

      .j-tag--primary {
        --j-tag-bg: var(--j-color-primary-soft);
        --j-tag-border: transparent;
        --j-tag-color: var(--j-color-primary-active);
      }

      .j-tag--secondary {
        --j-tag-bg: var(--j-color-secondary-soft);
        --j-tag-border: transparent;
        --j-tag-color: var(--j-color-secondary-hover);
      }

      .j-tag--success {
        --j-tag-bg: var(--j-color-success-soft);
        --j-tag-border: transparent;
        --j-tag-color: var(--j-color-success);
      }

      .j-tag--warning {
        --j-tag-bg: var(--j-color-warning-soft);
        --j-tag-border: transparent;
        --j-tag-color: var(--j-color-warning);
      }

      .j-tag--danger {
        --j-tag-bg: var(--j-color-danger-soft);
        --j-tag-border: transparent;
        --j-tag-color: var(--j-color-danger);
      }

      .j-tag--info {
        --j-tag-bg: var(--j-color-info-soft);
        --j-tag-border: transparent;
        --j-tag-color: var(--j-color-info);
      }

      .j-tag--neutral {
        --j-tag-bg: var(--j-color-surface-subtle);
        --j-tag-border: var(--j-color-border);
        --j-tag-color: var(--j-color-text);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JTagComponent {
  @Input() label = '';
  @Input() severity: JSeverity = 'neutral';
  @Input() size: JSize = 'md';
  @Input({ transform: booleanAttribute }) rounded = false;
  @Input({ transform: booleanAttribute }) removable = false;

  @Output() remove = new EventEmitter<MouseEvent>();

  get tagClasses(): string {
    return [
      'j-tag',
      `j-tag--${this.severity}`,
      `j-tag--${this.size}`,
      this.rounded ? 'j-tag--rounded' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }
}
