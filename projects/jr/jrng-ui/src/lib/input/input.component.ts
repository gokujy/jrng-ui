import { CommonModule } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  ChangeDetectorRef,
  forwardRef,
  inject,
  Input,
  numberAttribute,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { jrCreateId } from '../core/id';

export type JrInputType = 'text' | 'password' | 'search' | 'email' | 'number';

@Component({
  selector: 'jr-input',
  imports: [CommonModule],
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

  @Input() type: JrInputType = 'text';
  @Input() label = '';
  @Input() placeholder = '';
  @Input() hint = '';
  @Input() error = '';
  @Input() success = '';
  @Input() prefixIcon = '';
  @Input() suffixIcon = '';
  @Input({ transform: booleanAttribute }) readonly = false;
  @Input({ transform: booleanAttribute }) required = false;
  @Input({ transform: booleanAttribute }) multiline = false;
  @Input({ transform: numberAttribute }) rows = 3;

  readonly inputId = jrCreateId('jr-input');
  readonly hintId = jrCreateId('jr-input-hint');
  readonly errorId = jrCreateId('jr-input-error');
  readonly successId = jrCreateId('jr-input-success');

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
    return this.error.trim().length > 0;
  }

  get hasSuccess(): boolean {
    return !this.hasError && this.success.trim().length > 0;
  }

  get message(): string {
    return this.error || this.success || this.hint;
  }

  get messageId(): string | null {
    if (this.hasError) {
      return this.errorId;
    }

    if (this.hasSuccess) {
      return this.successId;
    }

    return this.hint ? this.hintId : null;
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
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  handleBlur(): void {
    this.onTouched();
  }
}
