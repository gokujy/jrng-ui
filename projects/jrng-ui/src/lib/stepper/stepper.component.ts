import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  booleanAttribute,
  numberAttribute,
} from '@angular/core';

export interface JStepItem {
  readonly label: string;
  readonly description?: string;
  readonly disabled?: boolean;
  readonly completed?: boolean;
}

@Component({
  selector: 'j-stepper',
  imports: [],
  template: `
    <nav class="j-stepper" aria-label="Progress">
      @for (item of items; track item.label || $index; let index = $index) {
        <button
          type="button"
          class="j-stepper__step"
          [class.is-active]="index === activeIndex"
          [class.is-completed]="isCompleted(item, index)"
          [disabled]="isDisabled(item, index)"
          [attr.aria-current]="index === activeIndex ? 'step' : null"
          (click)="activate(index)"
        >
          <span class="j-stepper__marker">{{ isCompleted(item, index) ? '✓' : index + 1 }}</span>
          <span class="j-stepper__text">
            <span>{{ item.label }}</span>
            @if (item.description) {
              <small>{{ item.description }}</small>
            }
          </span>
        </button>
      }
    </nav>
  `,
  styles: [
    `
      .j-stepper {
        align-items: stretch;
        display: flex;
        gap: var(--j-spacing-sm, 0.5rem);
        overflow-x: auto;
      }

      .j-stepper__step {
        align-items: center;
        background: var(--j-color-surface, #ffffff);
        border: 1px solid var(--j-color-border, #dbe2ea);
        border-radius: var(--j-radius-md, 0.5rem);
        color: var(--j-color-text, #111827);
        cursor: pointer;
        display: inline-flex;
        flex: 1 1 0;
        gap: var(--j-spacing-sm, 0.5rem);
        min-height: 3.25rem;
        min-width: 9rem;
        padding: var(--j-spacing-sm, 0.5rem);
        text-align: left;
      }

      .j-stepper__step.is-active {
        border-color: var(--j-color-primary, #4f46e5);
        box-shadow: inset 0 0 0 1px var(--j-color-primary, #4f46e5);
      }

      .j-stepper__step:disabled {
        cursor: not-allowed;
        opacity: var(--j-disabled-opacity, 0.55);
      }

      .j-stepper__step:focus-visible {
        box-shadow: var(--j-focus-ring, 0 0 0 3px rgb(79 70 229 / 24%));
        outline: none;
      }

      .j-stepper__marker {
        align-items: center;
        background: var(--j-color-surface-subtle, #eef2f7);
        border-radius: var(--j-radius-full, 999px);
        display: inline-flex;
        flex: 0 0 2rem;
        height: 2rem;
        justify-content: center;
      }

      .j-stepper__step.is-active .j-stepper__marker,
      .j-stepper__step.is-completed .j-stepper__marker {
        background: var(--j-color-primary, #4f46e5);
        color: var(--j-color-on-primary, #ffffff);
      }

      .j-stepper__text {
        display: grid;
        gap: var(--j-spacing-2xs, 0.125rem);
      }

      .j-stepper__text small {
        color: var(--j-color-text-muted, #64748b);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JStepperComponent {
  @Input() items: readonly JStepItem[] = [];
  @Input({ transform: numberAttribute }) activeIndex = 0;
  @Input({ transform: booleanAttribute }) linear = false;
  @Output() activeIndexChange = new EventEmitter<number>();

  activate(index: number): void {
    const item = this.items[index];

    if (!item || this.isDisabled(item, index) || index === this.activeIndex) {
      return;
    }

    this.activeIndex = index;
    this.activeIndexChange.emit(index);
  }

  isCompleted(item: JStepItem, index: number): boolean {
    return item.completed === true || index < this.activeIndex;
  }

  isDisabled(item: JStepItem, index: number): boolean {
    return item.disabled === true || (this.linear && index > this.activeIndex + 1);
  }
}
