import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  QueryList,
  ViewChildren,
  computed,
  forwardRef,
  inject,
  input,
  numberAttribute,
  output,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { jCreateId } from '../core/id';
import { JPassThrough, jMergePartClasses } from '../core/pass-through';
import { JSize } from '../core/types';
import { JInputVariant } from '../input/input.component';

@Component({
  selector: 'j-input-otp',
  imports: [],
  template: `
    @if (label()) {
      <label class="j-input-otp__label" data-jc-section="label" [id]="labelId">
        <span>{{ label() }}</span>
        @if (required()) {
          <span class="j-input-otp__required" aria-hidden="true">*</span>
        }
      </label>
    }
    <div
      [class]="rootClasses()"
      data-jc-name="input-otp"
      data-jc-section="root"
      [attr.data-j-disabled]="effectiveDisabled() ? 'true' : null"
      [attr.data-j-invalid]="hasError() ? 'true' : null"
      [attr.aria-labelledby]="label() ? labelId : null"
    >
      @for (item of cells(); track item.index) {
        <input
          #otpInput
          class="j-input-otp__cell"
          data-jc-section="cell"
          [attr.inputmode]="numericOnly() ? 'numeric' : 'text'"
          autocomplete="one-time-code"
          [type]="mask() ? 'password' : 'text'"
          [value]="item.value"
          [disabled]="effectiveDisabled()"
          [readOnly]="readonly()"
          [required]="required()"
          [attr.aria-label]="ariaLabelFor(item.index)"
          [attr.aria-invalid]="hasError() ? 'true' : null"
          [attr.maxlength]="1"
          (input)="handleInput($event, item.index)"
          (keydown)="handleKeydown($event, item.index)"
          (paste)="handlePaste($event, item.index)"
          (blur)="handleBlur()"
        />
      }
    </div>
    @if (hasError() && error()) {
      <p class="j-input-otp__message j-input-otp__message--error" data-jc-section="message" [id]="errorId">
        {{ error() }}
      </p>
    }
    @if (hint() && !hasError()) {
      <p class="j-input-otp__message" data-jc-section="message" [id]="hintId">{{ hint() }}</p>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .j-input-otp__label {
        display: inline-flex;
        font-size: var(--j-font-size-sm);
        font-weight: var(--j-font-weight-semibold);
        gap: var(--j-spacing-xs);
        margin-bottom: var(--j-spacing-sm);
      }

      .j-input-otp {
        display: inline-flex;
        gap: var(--j-spacing-sm);
      }

      .j-input-otp--fluid {
        width: 100%;
      }

      .j-input-otp__cell {
        background: var(--j-color-surface);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-input-radius);
        color: var(--j-color-text);
        font: inherit;
        font-weight: var(--j-font-weight-semibold);
        height: var(--j-input-height-md);
        outline: none;
        text-align: center;
        transition: var(--j-transition-colors), var(--j-transition-shadow);
        width: var(--j-input-height-md);
      }

      .j-input-otp--sm .j-input-otp__cell {
        height: var(--j-input-height-sm);
        width: var(--j-input-height-sm);
      }

      .j-input-otp--lg .j-input-otp__cell {
        height: var(--j-input-height-lg);
        width: var(--j-input-height-lg);
      }

      .j-input-otp--filled .j-input-otp__cell {
        background: var(--j-color-surface-muted);
      }

      .j-input-otp__cell:focus-visible {
        border-color: var(--j-color-primary);
        box-shadow: var(--j-focus-ring);
      }

      .j-input-otp.is-invalid .j-input-otp__cell {
        border-color: var(--j-color-danger);
      }

      .j-input-otp.is-disabled {
        opacity: var(--j-disabled-opacity);
      }

      .j-input-otp__required,
      .j-input-otp__message--error {
        color: var(--j-color-danger);
      }

      .j-input-otp__message {
        color: var(--j-color-text-muted);
        font-size: var(--j-font-size-xs);
        margin: var(--j-spacing-sm) 0 0;
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => JInputOtpComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JInputOtpComponent implements ControlValueAccessor {
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  @ViewChildren('otpInput') private inputs?: QueryList<ElementRef<HTMLInputElement>>;

  readonly length = input(6, { transform: numberAttribute });
  readonly label = input('');
  readonly placeholder = input('');
  readonly hint = input('');
  readonly error = input('');
  readonly styleClass = input('');
  readonly ariaLabel = input('One-time code');
  readonly size = input<JSize>('md');
  readonly variant = input<JInputVariant>('outlined');
  readonly pt = input<JPassThrough | null>(null);
  readonly numericOnly = input(false, { transform: booleanAttribute });
  readonly mask = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly fullWidth = input(false, { transform: booleanAttribute });

  readonly valueChange = output<string>();

  readonly labelId = jCreateId('j-input-otp-label');
  readonly hintId = jCreateId('j-input-otp-hint');
  readonly errorId = jCreateId('j-input-otp-error');

  value = '';
  isDisabled = false;

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  readonly hasError = computed(() => this.invalid() || this.error().trim().length > 0);

  readonly cells = computed(() => {
    const count = Math.max(1, this.length());
    return Array.from({ length: count }, (_, index) => ({
      index,
      value: this.value[index] ?? '',
    }));
  });

  readonly rootClasses = computed(() =>
    jMergePartClasses(
      [
        'j-input-otp',
        `j-input-otp--${this.size()}`,
        `j-input-otp--${this.variant()}`,
        this.fullWidth() ? 'j-input-otp--fluid' : '',
        this.hasError() ? 'is-invalid' : '',
        this.effectiveDisabled() ? 'is-disabled' : '',
      ],
      this.styleClass(),
      this.pt(),
    ),
  );

  readonly effectiveDisabled = computed(() => this.isDisabled || this.disabled());

  writeValue(value: string | number | null | undefined): void {
    this.value = this.normalize(String(value ?? ''));
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

  handleInput(event: Event, index: number): void {
    const target = event.target as HTMLInputElement;
    const next = this.normalize(target.value).slice(-1);
    this.setChar(index, next);

    if (next) {
      this.focusCell(index + 1);
    }
  }

  handleKeydown(event: KeyboardEvent, index: number): void {
    if (event.key !== 'Backspace') {
      return;
    }

    if (this.value[index]) {
      this.setChar(index, '');
      return;
    }

    this.focusCell(index - 1);
  }

  handlePaste(event: ClipboardEvent, index: number): void {
    const text = this.normalize(event.clipboardData?.getData('text') ?? '');

    if (!text) {
      return;
    }

    event.preventDefault();
    const chars = this.value.padEnd(this.length()).split('');
    for (let offset = 0; offset < text.length && index + offset < this.length(); offset += 1) {
      chars[index + offset] = text[offset] ?? '';
    }
    this.commit(chars.join('').slice(0, this.length()));
    this.focusCell(Math.min(index + text.length, this.length() - 1));
  }

  handleBlur(): void {
    this.onTouched();
  }

  ariaLabelFor(index: number): string {
    return `${this.ariaLabel()} digit ${index + 1} of ${this.length()}`;
  }

  private setChar(index: number, char: string): void {
    const chars = this.value.padEnd(this.length()).split('');
    chars[index] = char;
    this.commit(chars.join('').slice(0, this.length()).trimEnd());
  }

  private commit(value: string): void {
    this.value = value;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
    this.changeDetectorRef.markForCheck();
  }

  private normalize(value: string): string {
    const trimmed = value.slice(0, this.length());
    return this.numericOnly() ? trimmed.replace(/\D/g, '') : trimmed;
  }

  private focusCell(index: number): void {
    const input = this.inputs?.get(index)?.nativeElement;
    input?.focus();
    input?.select();
  }
}
