import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { JPassThrough, jMergePartClasses } from 'jrng-ui/core';
import { JSeverity, JComponentSize } from 'jrng-ui/core';

@Component({
  selector: 'j-tag',
  imports: [],
  template: `
    <span [class]="tagClasses()" data-jc-name="tag" data-jc-section="root" data-jc-extend="remove">
      <span class="j-tag__label" data-jc-section="label"
        >{{ label() }}<ng-content></ng-content
      ></span>
      @if (removable()) {
        <button
          class="j-tag__remove"
          data-jc-section="remove"
          type="button"
          [attr.aria-label]="removeLabel()"
          (click)="remove.emit($event)"
        >
          x
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
        border-radius: var(--j-radius-full);
        color: inherit;
        cursor: pointer;
        display: inline-flex;
        font: inherit;
        height: 1rem;
        justify-content: center;
        padding: 0;
        width: 1rem;
      }

      .j-tag__remove:focus-visible {
        box-shadow: var(--j-focus-ring);
        outline: none;
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
  readonly label = input('');
  readonly severity = input<JSeverity>('neutral');
  readonly size = input<JComponentSize>('md');
  readonly styleClass = input('');
  readonly removeLabel = input('Remove');
  readonly pt = input<JPassThrough | null>(null);
  readonly rounded = input(false, { transform: booleanAttribute });
  readonly removable = input(false, { transform: booleanAttribute });

  readonly remove = output<MouseEvent>();

  readonly tagClasses = computed(() =>
    jMergePartClasses(
      [
        'j-tag',
        `j-tag--${this.severity()}`,
        `j-tag--${this.size()}`,
        this.rounded() ? 'j-tag--rounded' : '',
      ],
      this.styleClass(),
      this.pt(),
    ),
  );
}
