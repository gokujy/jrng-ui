import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  forwardRef,
  inject,
  input,
  numberAttribute,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { JRNG_CONFIG, jAriaDescribedBy } from 'jrng-ui/core';
import { jCreateId } from 'jrng-ui/core';
import { JPassThrough, jMergePartClasses } from 'jrng-ui/core';
import { JSize } from 'jrng-ui/core';
import { JInputVariant } from 'jrng-ui/input';

export type JInputNumberMode = 'decimal' | 'currency';

@Component({
  selector: 'j-input-number',
  imports: [],
  template: `
    @if (label()) {
      <label
        class="j-input-number__label"
        data-jc-name="input-number"
        data-jc-section="label"
        [for]="id()"
      >
        <span>{{ label() }}</span>
        @if (required()) {
          <span class="j-input-number__required" aria-hidden="true">*</span>
        }
      </label>
    }
    <div
      [class]="controlClasses"
      data-jc-name="input-number"
      data-jc-section="root"
      data-jc-extend="prefix suffix clear"
      [attr.data-j-disabled]="isDisabled() ? 'true' : null"
      [attr.data-j-invalid]="hasError ? 'true' : null"
      [attr.data-j-active]="value !== null ? 'true' : null"
    >
      @if (resolvedPrefix) {
        <span class="j-input-number__prefix" data-jc-section="prefix">{{ resolvedPrefix }}</span>
      }
      <input
        class="j-input-number__field"
        data-jc-section="input"
        [id]="id()"
        [name]="name() || null"
        type="text"
        inputmode="decimal"
        [placeholder]="placeholder()"
        [disabled]="isDisabled()"
        [readOnly]="readonly()"
        [required]="required()"
        [min]="minValue"
        [max]="maxValue"
        [step]="step()"
        [value]="displayValue"
        [attr.aria-invalid]="hasError ? 'true' : null"
        [attr.aria-describedby]="describedBy"
        (input)="handleInput($event)"
        (focus)="handleFocus($event)"
        (keydown)="handleKeydown($event)"
        (blur)="handleBlur()"
      />
      @if (suffix()) {
        <span class="j-input-number__suffix" data-jc-section="suffix">{{ suffix() }}</span>
      }
      @if (clearable() && value !== null) {
        <button
          class="j-input-number__clear"
          data-jc-section="clear"
          type="button"
          aria-label="Clear"
          [disabled]="isDisabled() || readonly()"
          (click)="clearValue()"
        >
          x
        </button>
      }
    </div>
    @if (hasError && error()) {
      <p class="j-input-number__message j-input-number__message--error" [id]="errorId">
        {{ error() }}
      </p>
    }
    @if (hint() && !hasError) {
      <p class="j-input-number__message" [id]="hintId">{{ hint() }}</p>
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

      .j-input-number__prefix,
      .j-input-number__suffix {
        color: var(--j-color-text-muted);
      }

      .j-input-number__clear {
        background: transparent;
        border: 0;
        color: var(--j-color-muted-foreground);
        cursor: pointer;
        font: inherit;
        padding: 0;
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
  private readonly config = inject(JRNG_CONFIG);

  readonly id = input(jCreateId('j-input-number'));
  readonly name = input('');
  readonly label = input('');
  readonly placeholder = input('');
  readonly hint = input('');
  readonly error = input('');
  readonly styleClass = input('');
  readonly pt = input<JPassThrough | null>(null);
  readonly ariaDescribedby = input('', { alias: 'aria-describedby' });
  readonly size = input<JSize>('md');
  readonly variant = input<JInputVariant | undefined>(undefined);
  readonly mode = input<JInputNumberMode>('decimal');
  readonly currency = input('');
  readonly prefix = input('');
  readonly suffix = input('');
  readonly locale = input('');
  readonly min = input(Number.NaN, { transform: numberAttribute });
  readonly max = input(Number.NaN, { transform: numberAttribute });
  readonly step = input(1, { transform: numberAttribute });
  readonly minFractionDigits = input(0, { transform: numberAttribute });
  readonly maxFractionDigits = input(2, { transform: numberAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly clearable = input(false, { transform: booleanAttribute });
  readonly fluid = input(false, { transform: booleanAttribute });
  readonly fullWidth = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });

  readonly valueChange = output<number | null>();
  readonly clear = output<void>();

  readonly hintId = jCreateId('j-input-number-hint');
  readonly errorId = jCreateId('j-input-number-error');
  value: number | null = null;
  readonly formDisabled = signal(false);
  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  private editingText: string | null = null;

  private onChange: (value: number | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

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

  get minValue(): number | null {
    return Number.isNaN(this.min()) ? null : this.min();
  }

  get maxValue(): number | null {
    return Number.isNaN(this.max()) ? null : this.max();
  }

  get resolvedPrefix(): string {
    return this.prefix();
  }

  get displayValue(): string {
    if (this.editingText !== null) return this.editingText;
    return this.value == null ? '' : this.formatValue(this.value);
  }

  get controlClasses(): string {
    return jMergePartClasses(
      [
        'j-input-number',
        `j-input-number--${this.size()}`,
        `j-input-number--${this.variant() ?? this.config.inputStyle}`,
        this.hasError ? 'is-invalid' : '',
        this.isDisabled() ? 'is-disabled' : '',
        this.fluid() || this.fullWidth() ? 'j-input-number--fluid' : '',
      ],
      this.styleClass(),
      this.pt(),
    );
  }

  writeValue(value: number | string | null | undefined): void {
    if (value == null || value === '') {
      this.value = null;
    } else {
      const parsed = Number(value);
      this.value = this.clamp(Number.isNaN(parsed) ? null : parsed);
    }
    this.editingText = null;
    this.changeDetectorRef.markForCheck();
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
    this.changeDetectorRef.markForCheck();
  }

  handleInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.editingText = target.value;
    const parsed = this.parseValue(target.value);
    // Do not clamp mid-typing — that rewrites the field on every keystroke and
    // makes multi-digit / below-min entry impossible. Clamping happens on blur.
    if (parsed === undefined) return;
    this.value = parsed;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
  }

  handleFocus(event: FocusEvent): void {
    const target = event.target as HTMLInputElement;
    this.editingText = this.value == null ? '' : this.formatEditableValue(this.value);
    target.value = this.editingText;
  }

  handleKeydown(event: KeyboardEvent): void {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
    if (this.isDisabled() || this.readonly()) return;
    event.preventDefault();
    const configuredStep = this.step();
    const step = Number.isFinite(configuredStep) && configuredStep > 0 ? configuredStep : 1;
    this.value = this.clamp((this.value ?? 0) + (event.key === 'ArrowUp' ? step : -step));
    this.editingText = this.value == null ? '' : this.formatEditableValue(this.value);
    this.onChange(this.value);
    this.valueChange.emit(this.value);
    this.changeDetectorRef.markForCheck();
  }

  handleBlur(): void {
    const parsed = this.editingText === null ? this.value : this.parseValue(this.editingText);
    if (parsed !== undefined) this.value = parsed;
    const clamped = this.clamp(this.value);
    if (clamped !== this.value) {
      this.value = clamped;
      this.onChange(this.value);
      this.valueChange.emit(this.value);
      this.changeDetectorRef.markForCheck();
    }
    this.editingText = null;
    this.onTouched();
  }

  clearValue(): void {
    if (this.isDisabled() || this.readonly() || this.value === null) {
      return;
    }

    this.value = null;
    this.editingText = null;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
    this.clear.emit();
    this.changeDetectorRef.markForCheck();
  }

  private clamp(value: number | null): number | null {
    if (value === null) {
      return null;
    }

    const min = this.minValue;
    const max = this.maxValue;
    return Math.min(max ?? value, Math.max(min ?? value, value));
  }

  private formatValue(value: number): string {
    return this.numberFormat().format(value);
  }

  private formatEditableValue(value: number): string {
    return this.decimalFormat()
      .formatToParts(value)
      .filter((part) => part.type !== 'group')
      .map((part) => part.value)
      .join('');
  }

  private parseValue(raw: string): number | null | undefined {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    const parts = this.decimalFormat().formatToParts(-12345.6);
    const group = parts.find((part) => part.type === 'group')?.value ?? ',';
    const decimal = parts.find((part) => part.type === 'decimal')?.value ?? '.';
    const minus = parts.find((part) => part.type === 'minusSign')?.value ?? '-';
    const digits = new Map<string, string>();
    for (let digit = 0; digit <= 9; digit += 1) {
      digits.set(
        new Intl.NumberFormat(this.resolvedLocale(), { useGrouping: false }).format(digit),
        String(digit),
      );
    }
    let normalized = '';
    for (const character of trimmed) {
      if (digits.has(character)) normalized += digits.get(character);
      else if (character >= '0' && character <= '9') normalized += character;
      else if (character === decimal) normalized += '.';
      else if (character === minus || character === '-') normalized += '-';
      else if (character === group || /[\s\u00a0\u202f]/.test(character)) continue;
    }
    if (normalized === '-' || normalized === '.' || normalized === '-.') return undefined;
    if (!/^-?\d*(?:\.\d*)?$/.test(normalized)) return undefined;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  private numberFormat(): Intl.NumberFormat {
    const digits = this.fractionDigits();
    const options: Intl.NumberFormatOptions = {
      minimumFractionDigits: digits.minimum,
      maximumFractionDigits: digits.maximum,
    };
    if (this.mode() === 'currency' && this.isValidCurrency(this.currency())) {
      options.style = 'currency';
      options.currency = this.currency().toUpperCase();
    }
    return new Intl.NumberFormat(this.resolvedLocale(), options);
  }

  private decimalFormat(): Intl.NumberFormat {
    return new Intl.NumberFormat(this.resolvedLocale(), {
      useGrouping: true,
      minimumFractionDigits: 0,
      maximumFractionDigits: this.fractionDigits().maximum,
    });
  }

  private fractionDigits(): { minimum: number; maximum: number } {
    const minimum = Math.min(20, Math.max(0, Math.trunc(this.minFractionDigits())));
    const requestedMaximum = Math.min(20, Math.max(0, Math.trunc(this.maxFractionDigits())));
    return { minimum, maximum: Math.max(minimum, requestedMaximum) };
  }

  private resolvedLocale(): string {
    const requested = this.locale().trim();
    if (!requested) return this.config.locale || 'en-US';
    try {
      return Intl.NumberFormat.supportedLocalesOf([requested])[0] ?? 'en-US';
    } catch {
      return 'en-US';
    }
  }

  private isValidCurrency(currency: string): boolean {
    if (!/^[A-Za-z]{3}$/.test(currency)) return false;
    try {
      new Intl.NumberFormat(this.resolvedLocale(), { style: 'currency', currency });
      return true;
    } catch {
      return false;
    }
  }
}
