import { booleanAttribute, ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { JSeverity, JSize } from 'jrng-ui/core';

@Component({
  selector: 'j-chip',
  imports: [],
  template: `
    <span [class]="chipClasses" data-jc-name="chip" data-jc-section="root" data-jc-extend="remove">
      <ng-content></ng-content>
      @if (label()) {
        <span data-jc-section="label">{{ label() }}</span>
      }
      @if (removable()) {
        <button
          class="j-chip__remove"
          data-jc-section="remove"
          type="button"
          [attr.aria-label]="removeAriaLabel()"
          (click)="remove.emit()"
        >
          x
        </button>
      }
    </span>
  `,
  styles: [
    `
      .j-chip {
        align-items: center;
        background: var(--j-color-surface-muted);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-full);
        color: var(--j-color-text);
        display: inline-flex;
        font-size: var(--j-font-size-sm);
        gap: var(--j-spacing-xs);
        min-height: 1.75rem;
        padding: 0 var(--j-spacing-sm);
      }

      .j-chip--sm {
        font-size: var(--j-font-size-xs);
        min-height: 1.5rem;
      }

      .j-chip--lg {
        min-height: 2rem;
      }

      .j-chip--primary {
        background: var(--j-color-primary-soft);
        border-color: var(--j-color-primary);
        color: var(--j-color-primary);
      }

      .j-chip--danger {
        background: var(--j-color-danger-soft);
        border-color: var(--j-color-danger);
        color: var(--j-color-danger);
      }

      .j-chip__remove {
        background: transparent;
        border: 0;
        color: inherit;
        cursor: pointer;
        font: inherit;
        padding: 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JChipComponent {
  readonly label = input('');
  readonly severity = input<JSeverity>('neutral');
  readonly size = input<JSize>('md');
  readonly styleClass = input('');
  readonly removeAriaLabel = input('Remove');
  readonly removable = input(false, { transform: booleanAttribute });

  readonly remove = output<void>();

  get chipClasses(): string {
    return ['j-chip', `j-chip--${this.size()}`, `j-chip--${this.severity()}`, this.styleClass()]
      .filter(Boolean)
      .join(' ');
  }
}
