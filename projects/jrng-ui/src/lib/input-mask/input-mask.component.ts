import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  forwardRef,
  inject,
  Input,
  Output,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { jAriaDescribedBy } from '../core/aria';
import { jCreateId } from '../core/id';
import { JSize } from '../core/types';
import { JInputVariant } from '../input/input.component';

@Component({
  selector: 'j-input-mask',
  imports: [],
  template: `
    @if (label) {
      <label class="j-input-mask__label" [for]="id">
        <span>{{ label }}</span>
        @if (required) {
          <span class="j-input-mask__required" aria-hidden="true">*</span>
        }
      </label>
    }
    <input
      [class]="inputClasses"
      [id]="id"
      [name]="name || null"
      type="text"
      [placeholder]="placeholder || mask"
      [disabled]="isDisabled"
      [readOnly]="readonly"
      [required]="required"
      [value]="value"
      [attr.aria-invalid]="hasError ? 'true' : null"
      [attr.aria-describedby]="describedBy"
      (input)="handleInput($event)"
      (blur)="handleBlur()"
    />
    @if (hasError && error) {
      <p class="j-input-mask__message j-input-mask__message--error" [id]="errorId">{{ error }}</p>
    }
    @if (hint && !hasError) {
      <p class="j-input-mask__message" [id]="hintId">{{ hint }}</p>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .j-input-mask__label {
        display: inline-flex;
        font-size: var(--j-font-size-sm);
        font-weight: var(--j-font-weight-semibold);
        gap: var(--j-spacing-xs);
        margin-bottom: var(--j-spacing-sm);
      }

      .j-input-mask__required,
      .j-input-mask__message--error {
        color: var(--j-color-danger);
      }

      .j-input-mask {
        background: var(--j-color-surface);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-md);
        color: var(--j-color-text);
        font: inherit;
        min-height: 2.5rem;
        outline: none;
        padding-inline: var(--j-spacing-md);
      }

      .j-input-mask--filled {
        background: var(--j-color-surface-muted);
      }

      .j-input-mask--fluid {
        width: 100%;
      }

      .j-input-mask:focus-visible {
        border-color: var(--j-color-primary);
        box-shadow: var(--j-focus-ring);
      }

      .j-input-mask.is-invalid {
        border-color: var(--j-color-danger);
      }

      .j-input-mask.is-disabled {
        opacity: var(--j-disabled-opacity);
      }

      .j-input-mask__message {
        color: var(--j-color-text-muted);
        font-size: var(--j-font-size-xs);
        margin: var(--j-spacing-sm) 0 0;
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => JInputMaskComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JInputMaskComponent implements ControlValueAccessor {
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  @Input() id = jCreateId('j-input-mask');
  @Input() name = '';
  @Input() label = '';
  @Input() placeholder = '';
  @Input() mask = '';
  @Input() hint = '';
  @Input() error = '';
  @Input() styleClass = '';
  @Input({ alias: 'aria-describedby' }) ariaDescribedby = '';
  @Input() size: JSize = 'md';
  @Input() variant: JInputVariant = 'outlined';
  @Input({ transform: booleanAttribute }) readonly = false;
  @Input({ transform: booleanAttribute }) invalid = false;
  @Input({ transform: booleanAttribute }) required = false;
  @Input({ transform: booleanAttribute }) fluid = false;
  @Input({ transform: booleanAttribute }) fullWidth = false;

  @Output() valueChange = new EventEmitter<string>();

  readonly hintId = jCreateId('j-input-mask-hint');
  readonly errorId = jCreateId('j-input-mask-error');
  value = '';
  isDisabled = false;

  private onChange: (value: string) => void = () => undefined;
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

  get inputClasses(): string {
    return [
      'j-input-mask',
      `j-input-mask--${this.size}`,
      `j-input-mask--${this.variant}`,
      this.hasError ? 'is-invalid' : '',
      this.isDisabled ? 'is-disabled' : '',
      this.fluid || this.fullWidth ? 'j-input-mask--fluid' : '',
      this.styleClass,
    ]
      .filter(Boolean)
      .join(' ');
  }

  writeValue(value: string | number | null | undefined): void {
    this.value = value == null ? '' : String(value);
    this.changeDetectorRef.markForCheck();
  }

  registerOnChange(fn: (value: string) => void): void {
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
    this.value = target.value;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
  }

  handleBlur(): void {
    this.onTouched();
  }
}
