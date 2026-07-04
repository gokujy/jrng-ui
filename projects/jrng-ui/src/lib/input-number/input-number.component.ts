import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  forwardRef,
  inject,
  Input,
  numberAttribute,
  Output,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { jAriaDescribedBy } from '../core/aria';
import { jCreateId } from '../core/id';
import { JSize } from '../core/types';
import { JInputVariant } from '../input/input.component';

export type JInputNumberMode = 'decimal' | 'currency';

@Component({
  selector: 'j-input-number',
  imports: [],
  template: `
    @if (label) {
      <label class="j-input-number__label" [for]="id">
        <span>{{ label }}</span>
        @if (required) {
          <span class="j-input-number__required" aria-hidden="true">*</span>
        }
      </label>
    }
    <div [class]="controlClasses">
      @if (mode === 'currency') {
        <span class="j-input-number__prefix">{{ currency }}</span>
      }
      <input
        class="j-input-number__field"
        [id]="id"
        [name]="name || null"
        type="number"
        [placeholder]="placeholder"
        [disabled]="isDisabled"
        [readOnly]="readonly"
        [required]="required"
        [min]="minValue"
        [max]="maxValue"
        [step]="step"
        [value]="displayValue"
        [attr.aria-invalid]="hasError ? 'true' : null"
        [attr.aria-describedby]="describedBy"
        (input)="handleInput($event)"
        (blur)="handleBlur()"
      />
    </div>
    @if (hasError && error) {
      <p class="j-input-number__message j-input-number__message--error" [id]="errorId">
        {{ error }}
      </p>
    }
    @if (hint && !hasError) {
      <p class="j-input-number__message" [id]="hintId">{{ hint }}</p>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .j-input-number__label {
        display: inline-flex;
        font-size: var(--j-font-size-sm);
        font-weight: var(--j-font-weight-semibold);
        gap: var(--j-spacing-xs);
        margin-bottom: var(--j-spacing-sm);
      }

      .j-input-number__required,
      .j-input-number__message--error {
        color: var(--j-color-danger);
      }

      .j-input-number {
        align-items: center;
        background: var(--j-color-surface);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-md);
        display: flex;
        gap: var(--j-spacing-sm);
        min-height: 2.5rem;
        padding-inline: var(--j-spacing-md);
      }

      .j-input-number--filled {
        background: var(--j-color-surface-muted);
      }

      .j-input-number--fluid {
        width: 100%;
      }

      .j-input-number:focus-within {
        border-color: var(--j-color-primary);
        box-shadow: var(--j-focus-ring);
      }

      .j-input-number.is-invalid {
        border-color: var(--j-color-danger);
      }

      .j-input-number.is-disabled {
        opacity: var(--j-disabled-opacity);
      }

      .j-input-number__field {
        background: transparent;
        border: 0;
        color: var(--j-color-text);
        flex: 1;
        font: inherit;
        min-width: 0;
        outline: none;
      }

      .j-input-number__prefix {
        color: var(--j-color-text-muted);
      }

      .j-input-number__message {
        color: var(--j-color-text-muted);
        font-size: var(--j-font-size-xs);
        margin: var(--j-spacing-sm) 0 0;
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => JInputNumberComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JInputNumberComponent implements ControlValueAccessor {
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  @Input() id = jCreateId('j-input-number');
  @Input() name = '';
  @Input() label = '';
  @Input() placeholder = '';
  @Input() hint = '';
  @Input() error = '';
  @Input() styleClass = '';
  @Input({ alias: 'aria-describedby' }) ariaDescribedby = '';
  @Input() size: JSize = 'md';
  @Input() variant: JInputVariant = 'outlined';
  @Input() mode: JInputNumberMode = 'decimal';
  @Input() currency = 'INR';
  @Input() locale = 'en-IN';
  @Input({ transform: numberAttribute }) min = Number.NaN;
  @Input({ transform: numberAttribute }) max = Number.NaN;
  @Input({ transform: numberAttribute }) step = 1;
  @Input({ transform: numberAttribute }) minFractionDigits = 0;
  @Input({ transform: numberAttribute }) maxFractionDigits = 2;
  @Input({ transform: booleanAttribute }) readonly = false;
  @Input({ transform: booleanAttribute }) invalid = false;
  @Input({ transform: booleanAttribute }) required = false;
  @Input({ transform: booleanAttribute }) fluid = false;
  @Input({ transform: booleanAttribute }) fullWidth = false;

  @Output() valueChange = new EventEmitter<number | null>();

  readonly hintId = jCreateId('j-input-number-hint');
  readonly errorId = jCreateId('j-input-number-error');
  value: number | null = null;
  isDisabled = false;

  private onChange: (value: number | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  @Input({ transform: booleanAttribute })
  set disabled(value: boolean) {
    this.isDisabled = value;
    this.changeDetectorRef.markForCheck();
  }

  get disabled(): boolean {
    return this.isDisabled;
  }

  get hasError(): boolean {
    return this.invalid || this.error.trim().length > 0;
  }

  get describedBy(): string | null {
    return jAriaDescribedBy(
      this.ariaDescribedby,
      this.hasError ? this.errorId : null,
      this.hint ? this.hintId : null,
    );
  }

  get minValue(): number | null {
    return Number.isNaN(this.min) ? null : this.min;
  }

  get maxValue(): number | null {
    return Number.isNaN(this.max) ? null : this.max;
  }

  get displayValue(): string {
    return this.value == null ? '' : String(this.value);
  }

  get controlClasses(): string {
    return [
      'j-input-number',
      `j-input-number--${this.size}`,
      `j-input-number--${this.variant}`,
      this.hasError ? 'is-invalid' : '',
      this.isDisabled ? 'is-disabled' : '',
      this.fluid || this.fullWidth ? 'j-input-number--fluid' : '',
      this.styleClass,
    ]
      .filter(Boolean)
      .join(' ');
  }

  writeValue(value: number | string | null | undefined): void {
    if (value == null || value === '') {
      this.value = null;
    } else {
      const parsed = Number(value);
      this.value = Number.isNaN(parsed) ? null : parsed;
    }
    this.changeDetectorRef.markForCheck();
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    this.changeDetectorRef.markForCheck();
  }

  handleInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const parsed = target.value === '' ? null : Number(target.value);
    this.value = parsed == null || Number.isNaN(parsed) ? null : parsed;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
  }

  handleBlur(): void {
    this.onTouched();
  }
}
