import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  effect,
  input,
  numberAttribute,
  output,
  signal,
} from '@angular/core';

export interface JStepItem {
  readonly label: string;
  readonly description?: string;
  readonly disabled?: boolean;
  readonly completed?: boolean;
  readonly error?: boolean;
}

/** Complete presentation presets for the stepper. `default` preserves the pre-0.0.9 design. */
export type JStepperVariant = 'default' | 'rail' | 'progress';

@Component({
  selector: 'j-stepper',
  imports: [],
  template: `
    <nav
      class="j-stepper"
      [class.j-stepper--vertical]="orientation() === 'vertical'"
      [class.j-stepper--horizontal]="orientation() === 'horizontal'"
      [class]="'j-stepper j-stepper--' + variant()"
      [attr.data-j-variant]="variant()"
      data-jc-name="stepper"
      data-jc-section="root"
      [attr.aria-label]="ariaLabel()"
    >
      @for (item of items(); track item.label || $index; let index = $index) {
        <button
          type="button"
          class="j-stepper__step"
          [class.is-active]="index === activeIndexState()"
          [class.is-completed]="isCompleted(item, index)"
          [class.is-error]="item.error"
          [disabled]="isDisabled(item, index)"
          [attr.aria-current]="index === activeIndexState() ? 'step' : null"
          [attr.data-j-active]="index === activeIndexState() ? 'true' : null"
          [attr.data-j-disabled]="isDisabled(item, index) ? 'true' : null"
          [attr.data-j-invalid]="item.error ? 'true' : null"
          (click)="activate(index)"
        >
          <span class="j-stepper__marker" aria-hidden="true">
            @if (isCompleted(item, index)) {
              <span class="j-stepper__check">&#10003;</span>
            } @else {
              {{ index + 1 }}
            }
          </span>
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
        padding: 0.125rem;
        scrollbar-width: thin;
      }

      .j-stepper--vertical {
        flex-direction: column;
        overflow-x: visible;
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
        padding: var(--j-spacing-sm, 0.5rem) var(--j-spacing-md, 0.75rem);
        scroll-snap-align: start;
        text-align: left;
        transition:
          background-color 160ms ease,
          border-color 160ms ease,
          box-shadow 160ms ease,
          transform 160ms ease;
      }

      .j-stepper__step.is-active {
        background: color-mix(in srgb, var(--j-color-primary) 5%, var(--j-color-surface, #ffffff));
        border-color: var(--j-color-primary, #4f46e5);
        box-shadow: inset 0 0 0 1px var(--j-color-primary, #4f46e5);
      }

      .j-stepper__step:not(:disabled):hover {
        border-color: color-mix(in srgb, var(--j-color-primary) 45%, var(--j-color-border));
        transform: translateY(-1px);
      }

      .j-stepper__step.is-error {
        background: color-mix(in srgb, var(--j-color-danger) 5%, var(--j-color-surface, #ffffff));
        border-color: var(--j-color-danger);
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
        font-size: var(--j-font-size-sm);
        font-weight: var(--j-font-weight-semibold);
        height: 2rem;
        justify-content: center;
        transition:
          background-color 160ms ease,
          color 160ms ease;
      }

      .j-stepper__check {
        font-size: 1rem;
        line-height: 1;
      }

      .j-stepper__step.is-active .j-stepper__marker,
      .j-stepper__step.is-completed .j-stepper__marker {
        background: var(--j-color-primary, #4f46e5);
        color: var(--j-color-on-primary, #ffffff);
      }

      .j-stepper__step.is-error .j-stepper__marker {
        background: var(--j-color-danger);
        color: var(--j-color-danger-foreground, #ffffff);
      }

      .j-stepper__text {
        display: grid;
        gap: var(--j-spacing-2xs, 0.125rem);
        line-height: 1.3;
        min-width: 0;
        overflow-wrap: anywhere;
      }

      .j-stepper__text > span {
        font-weight: var(--j-font-weight-medium, 500);
      }

      .j-stepper__text small {
        color: var(--j-color-text-muted, #64748b);
      }

      .j-stepper--rail {
        gap: 0;
      }

      .j-stepper--rail .j-stepper__step {
        background: transparent;
        border: 0;
        border-radius: 0;
        flex-direction: column;
        min-width: 7rem;
        overflow: visible;
        padding-inline: var(--j-spacing-sm, 0.5rem);
        position: relative;
        text-align: center;
      }

      .j-stepper--rail .j-stepper__step:hover {
        transform: none;
      }

      .j-stepper--rail .j-stepper__step:not(:last-child)::after {
        background: var(--j-color-border, #dbe2ea);
        content: '';
        height: 2px;
        inset-inline-start: calc(50% + 1rem);
        position: absolute;
        top: calc(var(--j-spacing-sm, 0.5rem) + 1rem);
        width: calc(100% - 2rem);
        z-index: 0;
      }

      .j-stepper--rail .j-stepper__step.is-completed:not(:last-child)::after {
        background: var(--j-color-primary, #4f46e5);
      }

      .j-stepper--rail .j-stepper__marker {
        position: relative;
        z-index: 1;
      }

      .j-stepper--progress {
        background: var(--j-color-surface-subtle, #eef2f7);
        border-radius: var(--j-radius-lg, 0.75rem);
        gap: var(--j-spacing-2xs, 0.125rem);
        padding: var(--j-spacing-xs, 0.25rem);
      }

      .j-stepper--progress .j-stepper__step {
        background: transparent;
        border: 0;
        border-radius: var(--j-radius-md, 0.5rem);
        min-height: 2.75rem;
        min-width: 7rem;
        padding: var(--j-spacing-sm, 0.5rem) var(--j-spacing-md, 0.75rem);
      }

      .j-stepper--progress .j-stepper__step.is-active {
        background: var(--j-color-surface, #ffffff);
        box-shadow:
          var(--j-shadow-sm),
          inset 0 0 0 1px color-mix(in srgb, var(--j-color-primary) 16%, transparent);
      }

      .j-stepper--progress .j-stepper__marker {
        border-radius: var(--j-radius-sm, 0.375rem);
        flex-basis: 0.375rem;
        font-size: 0;
        height: 1.75rem;
      }

      .j-stepper--progress .j-stepper__step.is-active .j-stepper__marker,
      .j-stepper--progress .j-stepper__step.is-completed .j-stepper__marker {
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--j-color-primary) 12%, transparent);
      }

      .j-stepper--vertical.j-stepper--rail .j-stepper__step {
        align-items: flex-start;
        flex-direction: row;
        text-align: start;
      }

      .j-stepper--vertical.j-stepper--rail .j-stepper__step:not(:last-child)::after {
        height: calc(100% - 2rem);
        inset-inline-start: calc(var(--j-spacing-sm, 0.5rem) + 1rem);
        top: calc(var(--j-spacing-sm, 0.5rem) + 2rem);
        width: 2px;
      }

      @media (max-width: 640px) {
        .j-stepper--horizontal {
          scroll-snap-type: inline mandatory;
        }

        .j-stepper--default .j-stepper__step {
          flex-basis: min(82vw, 17rem);
        }

        .j-stepper--rail .j-stepper__text small,
        .j-stepper--progress .j-stepper__text small {
          display: none;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .j-stepper__step,
        .j-stepper__marker {
          transition: none;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JStepperComponent {
  readonly items = input<readonly JStepItem[]>([]);
  readonly activeIndex = input(0, { transform: numberAttribute });
  readonly linear = input(false, { transform: booleanAttribute });
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  readonly variant = input<JStepperVariant>('default');
  readonly ariaLabel = input('Progress');
  readonly activeIndexChange = output<number>();

  /** Internal, mutable mirror of the `activeIndex` input (no two-way binding exists). */
  protected readonly activeIndexState = signal(0);

  constructor() {
    effect(() => this.activeIndexState.set(this.activeIndex()));
  }

  activate(index: number): void {
    const item = this.items()[index];

    if (!item || this.isDisabled(item, index) || index === this.activeIndexState()) {
      return;
    }

    this.activeIndexState.set(index);
    this.activeIndexChange.emit(index);
  }

  isCompleted(item: JStepItem, index: number): boolean {
    return item.completed === true || index < this.activeIndexState();
  }

  isDisabled(item: JStepItem, index: number): boolean {
    return item.disabled === true || (this.linear() && index > this.activeIndexState() + 1);
  }
}
