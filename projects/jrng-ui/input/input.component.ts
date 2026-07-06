import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  forwardRef,
  inject,
  Input,
  output,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { jAriaDescribedBy } from 'jrng-ui/core';
import { jCreateId } from 'jrng-ui/core';
import { JPassThrough, jMergePartClasses } from 'jrng-ui/core';
import { JSize } from 'jrng-ui/core';

export type JInputType = 'text' | 'password' | 'search' | 'email' | 'number' | 'tel' | 'url';
export type JInputVariant = 'outlined' | 'filled';
export type JrInputType = JInputType;

@Component({
  selector: 'j-input',
  imports: [],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => JrInputComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JrInputComponent implements ControlValueAccessor {
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private internalValue = '';

  @Input() id = jCreateId('j-input');
  @Input() name = '';
  @Input() label = '';
  @Input() type: JInputType = 'text';
  @Input() placeholder = '';
  @Input() error = '';
  @Input() hint = '';
  @Input() prefixIcon = '';
  @Input() suffixIcon = '';
  @Input() styleClass = '';
  @Input() pt: JPassThrough | null = null;
  @Input({ alias: 'aria-describedby' }) ariaDescribedby = '';
  @Input() size: JSize = 'md';
  @Input() variant: JInputVariant = 'outlined';
  @Input({ transform: booleanAttribute }) readonly = false;
  @Input({ transform: booleanAttribute }) invalid = false;
  @Input({ transform: booleanAttribute }) required = false;
  @Input({ transform: booleanAttribute }) clearable = false;
  @Input({ transform: booleanAttribute }) fluid = false;
  @Input({ transform: booleanAttribute }) fullWidth = false;

  readonly valueChange = output<string>();
  readonly clear = output<void>();

  readonly hintId = jCreateId('j-input-hint');
  readonly errorId = jCreateId('j-input-error');
  isDisabled = false;

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  @Input()
  set value(value: string | number | null | undefined) {
    this.internalValue = value == null ? '' : String(value);
    this.changeDetectorRef.markForCheck();
  }

  get value(): string {
    return this.internalValue;
  }

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

  get controlClasses(): string {
    return jMergePartClasses(
      [
        'j-input',
        `j-input--${this.size}`,
        `j-input--${this.variant}`,
        this.hasError ? 'is-invalid' : '',
        this.isDisabled ? 'is-disabled' : '',
        this.readonly ? 'is-readonly' : '',
        this.fluid || this.fullWidth ? 'j-input--fluid' : '',
      ],
      this.styleClass,
      this.pt,
    );
  }

  get showClear(): boolean {
    return this.clearable && !!this.internalValue && !this.isDisabled && !this.readonly;
  }

  writeValue(value: string | number | null | undefined): void {
    this.value = value;
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
    this.internalValue = target.value;
    this.onChange(this.internalValue);
    this.valueChange.emit(this.internalValue);
  }

  handleBlur(): void {
    this.onTouched();
  }

  clearValue(): void {
    if (this.isDisabled || this.readonly || !this.internalValue) {
      return;
    }

    this.internalValue = '';
    this.onChange(this.internalValue);
    this.valueChange.emit(this.internalValue);
    this.clear.emit();
    this.changeDetectorRef.markForCheck();
  }
}
