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
  selector: 'j-password',
  imports: [],
  template: `
    @if (label) {
      <label class="j-password__label" [for]="id">
        <span>{{ label }}</span>
        @if (required) {
          <span class="j-password__required" aria-hidden="true">*</span>
        }
      </label>
    }
    <div [class]="controlClasses">
      <input
        class="j-password__field"
        [id]="id"
        [name]="name || null"
        [type]="visible ? 'text' : 'password'"
        [placeholder]="placeholder"
        [disabled]="isDisabled"
        [readOnly]="readonly"
        [required]="required"
        [value]="value"
        [attr.aria-invalid]="hasError ? 'true' : null"
        [attr.aria-describedby]="describedBy"
        (input)="handleInput($event)"
        (blur)="handleBlur()"
      />
      @if (toggleMask) {
        <button
          class="j-password__toggle"
          type="button"
          [disabled]="isDisabled"
          (click)="visible = !visible"
        >
          {{ visible ? 'Hide' : 'Show' }}
        </button>
      }
    </div>
    @if (feedback && value) {
      <div class="j-password__meter" aria-hidden="true">
        <span [style.width.%]="strength"></span>
      </div>
    }
    @if (hasError && error) {
      <p class="j-password__message j-password__message--error" [id]="errorId">{{ error }}</p>
    }
    @if (hint && !hasError) {
      <p class="j-password__message" [id]="hintId">{{ hint }}</p>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .j-password__label {
        display: inline-flex;
        font-size: var(--j-font-size-sm);
        font-weight: var(--j-font-weight-semibold);
        gap: var(--j-spacing-xs);
        margin-bottom: var(--j-spacing-sm);
      }

      .j-password__required,
      .j-password__message--error {
        color: var(--j-color-danger);
      }

      .j-password {
        align-items: center;
        background: var(--j-color-surface);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-md);
        display: flex;
        gap: var(--j-spacing-sm);
        min-height: 2.5rem;
        padding-inline: var(--j-spacing-md);
      }

      .j-password--filled {
        background: var(--j-color-surface-muted);
      }

      .j-password--fluid {
        width: 100%;
      }

      .j-password:focus-within {
        border-color: var(--j-color-primary);
        box-shadow: var(--j-focus-ring);
      }

      .j-password.is-invalid {
        border-color: var(--j-color-danger);
      }

      .j-password.is-disabled {
        opacity: var(--j-disabled-opacity);
      }

      .j-password__field {
        background: transparent;
        border: 0;
        color: var(--j-color-text);
        flex: 1;
        font: inherit;
        min-width: 0;
        outline: none;
      }

      .j-password__toggle {
        background: transparent;
        border: 0;
        color: var(--j-color-primary);
        cursor: pointer;
        font: inherit;
        font-size: var(--j-font-size-sm);
        padding: 0;
      }

      .j-password__meter {
        background: var(--j-color-surface-subtle);
        border-radius: var(--j-radius-full);
        height: 0.25rem;
        margin-top: var(--j-spacing-sm);
        overflow: hidden;
      }

      .j-password__meter span {
        background: var(--j-color-primary);
        display: block;
        height: 100%;
      }

      .j-password__message {
        color: var(--j-color-text-muted);
        font-size: var(--j-font-size-xs);
        margin: var(--j-spacing-sm) 0 0;
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => JPasswordComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JPasswordComponent implements ControlValueAccessor {
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  @Input() id = jCreateId('j-password');
  @Input() name = '';
  @Input() label = '';
  @Input() placeholder = '';
  @Input() hint = '';
  @Input() error = '';
  @Input() styleClass = '';
  @Input({ alias: 'aria-describedby' }) ariaDescribedby = '';
  @Input() size: JSize = 'md';
  @Input() variant: JInputVariant = 'outlined';
  @Input({ transform: booleanAttribute }) readonly = false;
  @Input({ transform: booleanAttribute }) invalid = false;
  @Input({ transform: booleanAttribute }) required = false;
  @Input({ transform: booleanAttribute }) toggleMask = true;
  @Input({ transform: booleanAttribute }) feedback = false;
  @Input({ transform: booleanAttribute }) fluid = false;
  @Input({ transform: booleanAttribute }) fullWidth = false;

  @Output() valueChange = new EventEmitter<string>();

  readonly hintId = jCreateId('j-password-hint');
  readonly errorId = jCreateId('j-password-error');
  value = '';
  visible = false;
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

  get controlClasses(): string {
    return [
      'j-password',
      `j-password--${this.size}`,
      `j-password--${this.variant}`,
      this.hasError ? 'is-invalid' : '',
      this.isDisabled ? 'is-disabled' : '',
      this.fluid || this.fullWidth ? 'j-password--fluid' : '',
      this.styleClass,
    ]
      .filter(Boolean)
      .join(' ');
  }

  get strength(): number {
    let score = Math.min(40, this.value.length * 5);
    if (/[A-Z]/.test(this.value)) score += 20;
    if (/[0-9]/.test(this.value)) score += 20;
    if (/[^A-Za-z0-9]/.test(this.value)) score += 20;
    return Math.min(score, 100);
  }

  writeValue(value: string | null | undefined): void {
    this.value = value ?? '';
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
