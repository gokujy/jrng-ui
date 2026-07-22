import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  forwardRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { jAriaDescribedBy } from 'jrng-ui/core';
import { jCreateId } from 'jrng-ui/core';
import { JPassThrough, jMergePartClasses } from 'jrng-ui/core';
import { JComponentSize, JComponentWidth } from 'jrng-ui/core';

export type JInputType = 'text' | 'password' | 'search' | 'email' | 'number' | 'tel' | 'url';
export type JInputVariant = 'outlined' | 'filled';

@Component({
  selector: 'j-input',
  imports: [],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => JInputComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JInputComponent implements ControlValueAccessor {
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  protected readonly internalValue = signal('');

  readonly id = input(jCreateId('j-input'));
  readonly name = input('');
  readonly label = input('');
  readonly type = input<JInputType>('text');
  readonly placeholder = input('');
  readonly error = input('');
  readonly hint = input('');
  readonly prefixIcon = input('');
  readonly suffixIcon = input('');
  readonly styleClass = input('');
  readonly pt = input<JPassThrough | null>(null);
  readonly ariaDescribedby = input('', { alias: 'aria-describedby' });
  readonly size = input<JComponentSize>('md');
  readonly variant = input<JInputVariant>('outlined');
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly clearable = input(false, { transform: booleanAttribute });
  readonly width = input<JComponentWidth>('auto');
  readonly value = input<string | number | null | undefined>();
  readonly disabled = input(false, { transform: booleanAttribute });

  readonly valueChange = output<string>();
  readonly clear = output<void>();

  readonly hintId = jCreateId('j-input-hint');
  readonly errorId = jCreateId('j-input-error');
  readonly isDisabled = signal(false);

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor() {
    effect(() => {
      const value = this.value();
      if (value !== undefined) {
        this.internalValue.set(value === null ? '' : String(value));
      }
    });
    effect(() => this.isDisabled.set(this.disabled()));
  }

  get hasError(): boolean {
    return this.invalid() || this.error().trim().length > 0;
  }

  get describedBy(): string | null {
    return jAriaDescribedBy(
      this.ariaDescribedby(),
      this.hasError ? this.errorId : null,
      this.hint() ? this.hintId : null,
    );
  }

  get controlClasses(): string {
    return jMergePartClasses(
      [
        'j-input',
        `j-input--${this.size()}`,
        `j-input--${this.variant()}`,
        this.hasError ? 'is-invalid' : '',
        this.isDisabled() ? 'is-disabled' : '',
        this.readonly() ? 'is-readonly' : '',
        this.width() === 'full' ? 'j-input--fluid' : '',
      ],
      this.styleClass(),
      this.pt(),
    );
  }

  get showClear(): boolean {
    return this.clearable() && !!this.internalValue() && !this.isDisabled() && !this.readonly();
  }

  writeValue(value: string | number | null | undefined): void {
    this.internalValue.set(value == null ? '' : String(value));
    this.changeDetectorRef.markForCheck();
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
    this.changeDetectorRef.markForCheck();
  }

  handleInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.internalValue.set(target.value);
    this.onChange(this.internalValue());
    this.valueChange.emit(this.internalValue());
  }

  handleBlur(): void {
    this.onTouched();
  }

  clearValue(): void {
    if (this.isDisabled() || this.readonly() || !this.internalValue()) {
      return;
    }

    this.internalValue.set('');
    this.onChange(this.internalValue());
    this.valueChange.emit(this.internalValue());
    this.clear.emit();
    this.changeDetectorRef.markForCheck();
  }
}
