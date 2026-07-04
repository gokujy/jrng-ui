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
import { jAriaDescribedBy } from '../core/aria';
import { jCreateId } from '../core/id';

export type JDatePickerDataType = 'date' | 'string';
export type JDatePickerSelectionMode = 'single' | 'multiple' | 'range';
export type JDatePickerView = 'date' | 'month' | 'year';
export type JDatePickerValue = Date | string | null;

@Component({
  selector: 'j-date-picker',
  imports: [],
  template: `
    <div [class]="rootClasses">
      @if (label) {
        <label class="j-date-picker__label" [for]="id">
          <span>{{ label }}</span>
          @if (required) {
            <span class="j-date-picker__required" aria-hidden="true">*</span>
          }
        </label>
      }

      <div class="j-date-picker__control">
        <input
          #input
          class="j-date-picker__input"
          type="date"
          [id]="id"
          [placeholder]="placeholder"
          [disabled]="isDisabled"
          [readOnly]="readonly"
          [required]="required"
          [min]="minDateValue"
          [max]="maxDateValue"
          [value]="inputValue"
          [attr.aria-invalid]="hasError ? 'true' : null"
          [attr.aria-describedby]="describedBy"
          (input)="handleInput($event)"
          (focus)="open()"
          (blur)="handleBlur()"
        />
        @if (showIcon) {
          <button
            class="j-date-picker__icon"
            type="button"
            [disabled]="isDisabled || readonly"
            (click)="focusInput()"
          >
            <span aria-hidden="true">cal</span>
          </button>
        }
        @if (showClear && inputValue) {
          <button
            class="j-date-picker__clear"
            type="button"
            [disabled]="isDisabled || readonly"
            (click)="clearValue()"
          >
            x
          </button>
        }
      </div>

      @if (showButtonBar) {
        <div class="j-date-picker__bar">
          <button type="button" [disabled]="isDisabled || readonly" (click)="selectToday()">
            Today
          </button>
          <button
            type="button"
            [disabled]="isDisabled || readonly || !inputValue"
            (click)="clearValue()"
          >
            Clear
          </button>
        </div>
      }

      @if (hasError && error) {
        <p class="j-date-picker__message j-date-picker__message--error" [id]="errorId">
          {{ error }}
        </p>
      }
      @if (hint && !hasError) {
        <p class="j-date-picker__message" [id]="hintId">{{ hint }}</p>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .j-date-picker {
        color: var(--j-color-text);
        display: block;
      }

      .j-date-picker__label {
        display: inline-flex;
        font-size: var(--j-font-size-sm);
        font-weight: var(--j-font-weight-semibold);
        gap: var(--j-spacing-xs);
        margin-bottom: var(--j-spacing-sm);
      }

      .j-date-picker__control {
        align-items: center;
        background: var(--j-color-surface);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-md);
        display: flex;
        min-height: 2.5rem;
        transition: var(--j-transition-colors), var(--j-transition-shadow);
      }

      .j-date-picker__control:focus-within {
        border-color: var(--j-color-primary);
        box-shadow: var(--j-focus-ring);
      }

      .j-date-picker--filled .j-date-picker__control {
        background: var(--j-color-surface-muted);
      }

      .j-date-picker.is-invalid .j-date-picker__control {
        border-color: var(--j-color-danger);
      }

      .j-date-picker.is-disabled {
        opacity: var(--j-disabled-opacity);
      }

      .j-date-picker__input {
        background: transparent;
        border: 0;
        color: var(--j-color-text);
        flex: 1;
        font: inherit;
        min-height: 2.375rem;
        min-width: 0;
        outline: none;
        padding: 0 var(--j-spacing-md);
      }

      .j-date-picker__icon,
      .j-date-picker__clear,
      .j-date-picker__bar button {
        background: transparent;
        border: 0;
        color: var(--j-color-primary);
        cursor: pointer;
        font: inherit;
      }

      .j-date-picker__icon,
      .j-date-picker__clear {
        min-height: 2rem;
        min-width: 2rem;
      }

      .j-date-picker__bar {
        display: flex;
        gap: var(--j-spacing-sm);
        margin-top: var(--j-spacing-sm);
      }

      .j-date-picker__required,
      .j-date-picker__message--error {
        color: var(--j-color-danger);
      }

      .j-date-picker__message {
        color: var(--j-color-text-muted);
        font-size: var(--j-font-size-xs);
        margin: var(--j-spacing-sm) 0 0;
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => JDatePickerComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JDatePickerComponent implements ControlValueAccessor {
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  @ViewChild('input') private inputRef?: ElementRef<HTMLInputElement>;

  @Input() id = jCreateId('j-date-picker');
  @Input() label = '';
  @Input() placeholder = '';
  @Input() error = '';
  @Input() hint = '';
  @Input() dateFormat = 'yyyy-MM-dd';
  @Input() dataType: JDatePickerDataType = 'date';
  @Input() selectionMode: JDatePickerSelectionMode = 'single';
  @Input() view: JDatePickerView = 'date';
  @Input() appendTo: 'self' | 'body' | string = 'self';
  @Input() styleClass = '';
  @Input() variant: 'outlined' | 'filled' = 'outlined';
  @Input({ transform: booleanAttribute }) readonly = false;
  @Input({ transform: booleanAttribute }) invalid = false;
  @Input({ transform: booleanAttribute }) required = false;
  @Input({ transform: booleanAttribute }) showIcon = false;
  @Input({ transform: booleanAttribute }) showButtonBar = false;
  @Input({ transform: booleanAttribute }) showClear = false;

  @Output() valueChange = new EventEmitter<JDatePickerValue>();
  @Output() select = new EventEmitter<JDatePickerValue>();
  @Output() clear = new EventEmitter<void>();
  @Output() opened = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  readonly hintId = jCreateId('j-date-picker-hint');
  readonly errorId = jCreateId('j-date-picker-error');

  inputValue = '';
  isDisabled = false;
  isOpen = false;

  private onChange: (value: JDatePickerValue) => void = () => undefined;
  private onTouched: () => void = () => undefined;
  private minDateInternal: Date | string | null = null;
  private maxDateInternal: Date | string | null = null;

  @Input()
  set value(value: Date | string | null | undefined) {
    this.inputValue = this.toInputDate(value);
    this.changeDetectorRef.markForCheck();
  }

  get value(): JDatePickerValue {
    return this.fromInputDate(this.inputValue);
  }

  @Input()
  set minDate(value: Date | string | null | undefined) {
    this.minDateInternal = value ?? null;
  }

  get minDateValue(): string | null {
    return this.toInputDate(this.minDateInternal) || null;
  }

  @Input()
  set maxDate(value: Date | string | null | undefined) {
    this.maxDateInternal = value ?? null;
  }

  get maxDateValue(): string | null {
    return this.toInputDate(this.maxDateInternal) || null;
  }

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
      'j-date-picker',
      `j-date-picker--${this.variant}`,
      this.hasError ? 'is-invalid' : '',
      this.isDisabled ? 'is-disabled' : '',
      this.styleClass,
    ]
      .filter(Boolean)
      .join(' ');
  }

  writeValue(value: Date | string | null | undefined): void {
    this.value = value ?? null;
  }

  registerOnChange(fn: (value: JDatePickerValue) => void): void {
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
    this.inputValue = target.value;
    const nextValue = this.fromInputDate(this.inputValue);
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

  focusInput(): void {
    this.inputRef?.nativeElement.focus();
    this.inputRef?.nativeElement.showPicker?.();
  }

  selectToday(): void {
    const today = this.toInputDate(new Date());
    this.inputValue = today;
    const nextValue = this.fromInputDate(today);
    this.onChange(nextValue);
    this.valueChange.emit(nextValue);
    this.select.emit(nextValue);
    this.changeDetectorRef.markForCheck();
  }

  clearValue(): void {
    this.inputValue = '';
    this.onChange(null);
    this.valueChange.emit(null);
    this.clear.emit();
    this.changeDetectorRef.markForCheck();
  }

  private fromInputDate(value: string): JDatePickerValue {
    if (!value) {
      return null;
    }

    if (this.dataType === 'string') {
      return value;
    }

    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  private toInputDate(value: Date | string | null | undefined): string {
    if (!value) {
      return '';
    }

    if (value instanceof Date) {
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, '0');
      const day = String(value.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    return value.slice(0, 10);
  }
}
