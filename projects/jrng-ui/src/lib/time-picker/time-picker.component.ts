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

export type JTimePickerHourFormat = 12 | 24;

@Component({
  selector: 'j-time-picker',
  imports: [],
  template: `
    <div [class]="rootClasses">
      @if (label) {
        <label class="j-time-picker__label" [for]="id">
          <span>{{ label }}</span>
          @if (required) {
            <span class="j-time-picker__required" aria-hidden="true">*</span>
          }
        </label>
      }
      <input
        class="j-time-picker__input"
        type="time"
        [id]="id"
        [placeholder]="placeholder"
        [disabled]="isDisabled"
        [readOnly]="readonly"
        [required]="required"
        [step]="stepSeconds"
        [value]="value"
        [attr.aria-invalid]="hasError ? 'true' : null"
        [attr.aria-describedby]="describedBy"
        (input)="handleInput($event)"
        (focus)="open()"
        (blur)="handleBlur()"
      />
      @if (hasError && error) {
        <p class="j-time-picker__message j-time-picker__message--error" [id]="errorId">
          {{ error }}
        </p>
      }
      @if (hint && !hasError) {
        <p class="j-time-picker__message" [id]="hintId">{{ hint }}</p>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .j-time-picker {
        color: var(--j-color-text);
        display: block;
      }

      .j-time-picker__label {
        display: inline-flex;
        font-size: var(--j-font-size-sm);
        font-weight: var(--j-font-weight-semibold);
        gap: var(--j-spacing-xs);
        margin-bottom: var(--j-spacing-sm);
      }

      .j-time-picker__input {
        background: var(--j-color-surface);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-md);
        color: var(--j-color-text);
        font: inherit;
        min-height: 2.5rem;
        outline: none;
        padding: 0 var(--j-spacing-md);
        width: 100%;
      }

      .j-time-picker__input:focus {
        border-color: var(--j-color-primary);
        box-shadow: var(--j-focus-ring);
      }

      .j-time-picker--filled .j-time-picker__input {
        background: var(--j-color-surface-muted);
      }

      .j-time-picker.is-invalid .j-time-picker__input {
        border-color: var(--j-color-danger);
      }

      .j-time-picker.is-disabled {
        opacity: var(--j-disabled-opacity);
      }

      .j-time-picker__required,
      .j-time-picker__message--error {
        color: var(--j-color-danger);
      }

      .j-time-picker__message {
        color: var(--j-color-text-muted);
        font-size: var(--j-font-size-xs);
        margin: var(--j-spacing-sm) 0 0;
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => JTimePickerComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JTimePickerComponent implements ControlValueAccessor {
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  @Input() id = jCreateId('j-time-picker');
  @Input() label = '';
  @Input() placeholder = '';
  @Input() hint = '';
  @Input() error = '';
  @Input() styleClass = '';
  @Input() variant: 'outlined' | 'filled' = 'outlined';
  @Input() hourFormat: JTimePickerHourFormat = 24;
  @Input({ transform: numberAttribute }) stepMinute = 1;
  @Input({ transform: booleanAttribute }) timeOnly = true;
  @Input({ transform: booleanAttribute }) readonly = false;
  @Input({ transform: booleanAttribute }) invalid = false;
  @Input({ transform: booleanAttribute }) required = false;

  @Output() valueChange = new EventEmitter<string | null>();
  @Output() select = new EventEmitter<string | null>();
  @Output() opened = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  readonly hintId = jCreateId('j-time-picker-hint');
  readonly errorId = jCreateId('j-time-picker-error');
  value = '';
  isDisabled = false;
  isOpen = false;

  private onChange: (value: string | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  @Input({ transform: booleanAttribute })
  set disabled(value: boolean) {
    this.isDisabled = value;
    this.changeDetectorRef.markForCheck();
  }

  get stepSeconds(): number {
    return Math.max(1, this.stepMinute) * 60;
  }

  get hasError(): boolean {
    return this.invalid || this.error.trim().length > 0;
  }

  get describedBy(): string | null {
    return jAriaDescribedBy(this.hasError ? this.errorId : null, this.hint ? this.hintId : null);
  }

  get rootClasses(): string {
    return [
      'j-time-picker',
      `j-time-picker--${this.variant}`,
      this.hasError ? 'is-invalid' : '',
      this.isDisabled ? 'is-disabled' : '',
      this.styleClass,
    ]
      .filter(Boolean)
      .join(' ');
  }

  writeValue(value: string | null | undefined): void {
    this.value = value ?? '';
    this.changeDetectorRef.markForCheck();
  }

  registerOnChange(fn: (value: string | null) => void): void {
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
    const nextValue = this.value || null;
    this.onChange(nextValue);
    this.valueChange.emit(nextValue);
    this.select.emit(nextValue);
  }

  handleBlur(): void {
    this.onTouched();
    this.close();
  }

  open(): void {
    if (this.isOpen) {
      return;
    }
    this.isOpen = true;
    this.opened.emit();
  }

  close(): void {
    if (!this.isOpen) {
      return;
    }
    this.isOpen = false;
    this.closed.emit();
  }
}
