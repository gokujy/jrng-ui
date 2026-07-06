import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  inject,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { jAriaDescribedBy } from 'jrng-ui/core';
import { jCreateId } from 'jrng-ui/core';
import { JSize } from 'jrng-ui/core';

@Component({
  selector: 'j-checkbox',
  imports: [],
  template: `
    <label [class]="rootClasses">
      <input
        #input
        class="j-checkbox__input"
        type="checkbox"
        [id]="id"
        [name]="name || null"
        [checked]="checked"
        [disabled]="isDisabled"
        [readOnly]="readonly"
        [required]="required"
        [attr.aria-checked]="indeterminate ? 'mixed' : checked"
        [attr.aria-invalid]="hasError ? 'true' : null"
        [attr.aria-describedby]="describedBy"
        (change)="handleChange($event)"
        (blur)="handleBlur()"
      />
      <span class="j-checkbox__box" aria-hidden="true"></span>
      @if (label || hasProjectedLabel) {
        <span class="j-checkbox__label">
          <ng-content></ng-content>
          @if (label) {
            <span>{{ label }}</span>
          }
          @if (required) {
            <span class="j-checkbox__required" aria-hidden="true">*</span>
          }
        </span>
      }
    </label>
    @if (hasError && error) {
      <p class="j-checkbox__message j-checkbox__message--error" [id]="errorId">{{ error }}</p>
    }
    @if (hint && !hasError) {
      <p class="j-checkbox__message" [id]="hintId">{{ hint }}</p>
    }
  `,
  styles: [
    `
      :host {
        display: inline-block;
      }

      .j-checkbox {
        align-items: center;
        color: var(--j-color-text);
        cursor: pointer;
        display: inline-flex;
        gap: var(--j-spacing-sm);
      }

      .j-checkbox.is-disabled {
        cursor: not-allowed;
        opacity: var(--j-disabled-opacity);
      }

      .j-checkbox__input {
        height: 1px;
        opacity: 0;
        position: absolute;
        width: 1px;
      }

      .j-checkbox__box {
        align-items: center;
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-xs);
        display: inline-flex;
        flex: 0 0 auto;
        height: 1rem;
        justify-content: center;
        transition:
          background-color 0.15s ease,
          border-color 0.15s ease;
        width: 1rem;
      }

      .j-checkbox--sm .j-checkbox__box {
        height: 0.875rem;
        width: 0.875rem;
      }

      .j-checkbox--lg .j-checkbox__box {
        height: 1.25rem;
        width: 1.25rem;
      }

      .j-checkbox__input:checked + .j-checkbox__box,
      .j-checkbox.is-indeterminate .j-checkbox__box {
        background: var(--j-color-primary);
        border-color: var(--j-color-primary);
        color: var(--j-color-primary-foreground, var(--j-color-white, #ffffff));
      }

      .j-checkbox__input:checked + .j-checkbox__box::after {
        border-bottom: 2px solid currentColor;
        border-right: 2px solid currentColor;
        box-sizing: border-box;
        content: '';
        height: 0.5rem;
        /* Optical centering: lift the mark slightly so the rotated tick reads centered. */
        margin-top: -0.0625rem;
        transform: rotate(45deg);
        width: 0.3rem;
      }

      .j-checkbox.is-indeterminate .j-checkbox__box::after {
        background: currentColor;
        content: '';
        height: 2px;
        width: 0.55rem;
      }

      .j-checkbox__input:focus-visible + .j-checkbox__box {
        box-shadow: var(--j-focus-ring);
      }

      .j-checkbox.is-invalid .j-checkbox__box {
        border-color: var(--j-color-danger);
      }

      .j-checkbox__label {
        align-items: center;
        display: inline-flex;
        gap: var(--j-spacing-xs);
        font-size: var(--j-font-size-sm);
      }

      .j-checkbox__required,
      .j-checkbox__message--error {
        color: var(--j-color-danger);
      }

      .j-checkbox__message {
        color: var(--j-color-text-muted);
        font-size: var(--j-font-size-xs);
        margin: var(--j-spacing-sm) 0 0;
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => JCheckboxComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JCheckboxComponent implements ControlValueAccessor {
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  @ViewChild('input') private inputRef?: ElementRef<HTMLInputElement>;

  @Input() id = jCreateId('j-checkbox');
  @Input() name = '';
  @Input() label = '';
  @Input() value: unknown = true;
  @Input() hint = '';
  @Input() error = '';
  @Input() styleClass = '';
  @Input() size: JSize = 'md';
  @Input({ transform: booleanAttribute }) required = false;
  @Input({ transform: booleanAttribute }) invalid = false;
  @Input({ transform: booleanAttribute }) readonly = false;
  @Input({ transform: booleanAttribute }) indeterminate = false;
  @Input({ transform: booleanAttribute }) hasProjectedLabel = true;

  @Output() valueChange = new EventEmitter<boolean | readonly unknown[]>();

  checked = false;
  isDisabled = false;
  private arrayValue: readonly unknown[] | null = null;

  readonly hintId = jCreateId('j-checkbox-hint');
  readonly errorId = jCreateId('j-checkbox-error');

  private onChange: (value: boolean | readonly unknown[]) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  @Input({ transform: booleanAttribute })
  set disabled(value: boolean) {
    this.isDisabled = value;
    this.changeDetectorRef.markForCheck();
  }

  get hasError(): boolean {
    return this.invalid || this.error.trim().length > 0;
  }

  get describedBy(): string | null {
    return jAriaDescribedBy(this.hasError ? this.errorId : null, this.hint ? this.hintId : null);
  }

  get rootClasses(): string {
    return [
      'j-checkbox',
      `j-checkbox--${this.size}`,
      this.checked ? 'is-checked' : '',
      this.indeterminate ? 'is-indeterminate' : '',
      this.isDisabled ? 'is-disabled' : '',
      this.hasError ? 'is-invalid' : '',
      this.styleClass,
    ]
      .filter(Boolean)
      .join(' ');
  }

  writeValue(value: boolean | readonly unknown[] | null | undefined): void {
    if (Array.isArray(value)) {
      this.arrayValue = value;
      this.checked = value.some((item) => Object.is(item, this.value));
    } else {
      this.arrayValue = null;
      this.checked = value === true;
    }
    this.syncIndeterminate();
    this.changeDetectorRef.markForCheck();
  }

  registerOnChange(fn: (value: boolean | readonly unknown[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    this.changeDetectorRef.markForCheck();
  }

  handleChange(event: Event): void {
    if (this.readonly) {
      (event.target as HTMLInputElement).checked = this.checked;
      return;
    }
    const target = event.target as HTMLInputElement;
    this.checked = target.checked;
    this.indeterminate = false;

    const nextValue =
      this.arrayValue == null
        ? this.checked
        : this.checked
          ? [...this.arrayValue, this.value]
          : this.arrayValue.filter((item) => !Object.is(item, this.value));

    if (Array.isArray(nextValue)) {
      this.arrayValue = nextValue;
    }

    this.onChange(nextValue);
    this.valueChange.emit(nextValue);
  }

  handleBlur(): void {
    this.onTouched();
  }

  private syncIndeterminate(): void {
    queueMicrotask(() => {
      if (this.inputRef?.nativeElement) {
        this.inputRef.nativeElement.indeterminate = this.indeterminate;
      }
    });
  }
}
