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

export interface JDateRangeValue {
  readonly start: string | Date | null;
  readonly end: string | Date | null;
}

export type JDateRangeInputValue =
  JDateRangeValue | readonly [string | Date | null, string | Date | null];

@Component({
  selector: 'j-date-range-picker',
  imports: [],
  template: `
    <div [class]="rootClasses">
      @if (label) {
        <label class="j-date-range-picker__label" [id]="labelId">
          <span>{{ label }}</span>
          @if (required) {
            <span class="j-date-range-picker__required" aria-hidden="true">*</span>
          }
        </label>
      }
      <div class="j-date-range-picker__inputs">
        <input
          class="j-date-range-picker__input"
          type="date"
          [id]="startId"
          [placeholder]="startPlaceholder"
          [disabled]="isDisabled"
          [readOnly]="readonly"
          [required]="required"
          [min]="minDateValue"
          [max]="endValue || maxDateValue"
          [value]="startValue"
          [attr.aria-labelledby]="label ? labelId : null"
          [attr.aria-describedby]="describedBy"
          [attr.aria-invalid]="hasError ? 'true' : null"
          (input)="handleStartInput($event)"
          (focus)="open()"
          (blur)="handleBlur()"
        />
        <span class="j-date-range-picker__separator" aria-hidden="true">to</span>
        <input
          class="j-date-range-picker__input"
          type="date"
          [id]="endId"
          [placeholder]="endPlaceholder"
          [disabled]="isDisabled"
          [readOnly]="readonly"
          [required]="required"
          [min]="startValue || minDateValue"
          [max]="maxDateValue"
          [value]="endValue"
          [attr.aria-label]="label ? label + ' end date' : 'End date'"
          [attr.aria-describedby]="describedBy"
          [attr.aria-invalid]="hasError ? 'true' : null"
          (input)="handleEndInput($event)"
          (focus)="open()"
          (blur)="handleBlur()"
        />
        @if (showClear && (startValue || endValue)) {
          <button
            class="j-date-range-picker__clear"
            type="button"
            [disabled]="isDisabled || readonly"
            (click)="clearValue()"
          >
            x
          </button>
        }
      </div>
      @if (hasError && error) {
        <p class="j-date-range-picker__message j-date-range-picker__message--error" [id]="errorId">
          {{ error }}
        </p>
      }
      @if (hint && !hasError) {
        <p class="j-date-range-picker__message" [id]="hintId">{{ hint }}</p>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .j-date-range-picker {
        color: var(--j-color-text);
        display: block;
      }

      .j-date-range-picker__label {
        display: inline-flex;
        font-size: var(--j-font-size-sm);
        font-weight: var(--j-font-weight-semibold);
        gap: var(--j-spacing-xs);
        margin-bottom: var(--j-spacing-sm);
      }

      .j-date-range-picker__inputs {
        align-items: center;
        background: var(--j-color-surface);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-md);
        display: flex;
        gap: var(--j-spacing-sm);
        min-height: 2.5rem;
        padding: 0 var(--j-spacing-sm);
      }

      .j-date-range-picker__inputs:focus-within {
        border-color: var(--j-color-primary);
        box-shadow: var(--j-focus-ring);
      }

      .j-date-range-picker--filled .j-date-range-picker__inputs {
        background: var(--j-color-surface-muted);
      }

      .j-date-range-picker.is-invalid .j-date-range-picker__inputs {
        border-color: var(--j-color-danger);
      }

      .j-date-range-picker.is-disabled {
        opacity: var(--j-disabled-opacity);
      }

      .j-date-range-picker__input {
        background: transparent;
        border: 0;
        color: var(--j-color-text);
        flex: 1;
        font: inherit;
        min-height: 2.375rem;
        min-width: 0;
        outline: none;
      }

      .j-date-range-picker__separator {
        color: var(--j-color-text-muted);
        font-size: var(--j-font-size-xs);
      }

      .j-date-range-picker__clear {
        background: transparent;
        border: 0;
        color: var(--j-color-primary);
        cursor: pointer;
        font: inherit;
      }

      .j-date-range-picker__required,
      .j-date-range-picker__message--error {
        color: var(--j-color-danger);
      }

      .j-date-range-picker__message {
        color: var(--j-color-text-muted);
        font-size: var(--j-font-size-xs);
        margin: var(--j-spacing-sm) 0 0;
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => JDateRangePickerComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JDateRangePickerComponent implements ControlValueAccessor {
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  @Input() label = '';
  @Input() startPlaceholder = 'Start date';
  @Input() endPlaceholder = 'End date';
  @Input() hint = '';
  @Input() error = '';
  @Input() styleClass = '';
  @Input() variant: 'outlined' | 'filled' = 'outlined';
  @Input() dataType: 'date' | 'string' = 'string';
  @Input({ transform: booleanAttribute }) readonly = false;
  @Input({ transform: booleanAttribute }) invalid = false;
  @Input({ transform: booleanAttribute }) required = false;
  @Input({ transform: booleanAttribute }) showClear = true;

  @Output() valueChange = new EventEmitter<JDateRangeValue>();
  @Output() select = new EventEmitter<JDateRangeValue>();
  @Output() clear = new EventEmitter<void>();
  @Output() opened = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  readonly labelId = jCreateId('j-date-range-picker-label');
  readonly startId = jCreateId('j-date-range-picker-start');
  readonly endId = jCreateId('j-date-range-picker-end');
  readonly hintId = jCreateId('j-date-range-picker-hint');
  readonly errorId = jCreateId('j-date-range-picker-error');

  startValue = '';
  endValue = '';
  isDisabled = false;
  isOpen = false;

  private minDateInternal: Date | string | null = null;
  private maxDateInternal: Date | string | null = null;
  private onChange: (value: JDateRangeValue) => void = () => undefined;
  private onTouched: () => void = () => undefined;

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
      'j-date-range-picker',
      `j-date-range-picker--${this.variant}`,
      this.hasError ? 'is-invalid' : '',
      this.isDisabled ? 'is-disabled' : '',
      this.styleClass,
    ]
      .filter(Boolean)
      .join(' ');
  }

  writeValue(value: JDateRangeInputValue | null | undefined): void {
    if (this.isRangeTuple(value)) {
      this.startValue = this.toInputDate(value[0]);
      this.endValue = this.toInputDate(value[1]);
    } else if (value) {
      this.startValue = this.toInputDate(value.start);
      this.endValue = this.toInputDate(value.end);
    } else {
      this.startValue = '';
      this.endValue = '';
    }
    this.changeDetectorRef.markForCheck();
  }

  registerOnChange(fn: (value: JDateRangeValue) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    this.changeDetectorRef.markForCheck();
  }

  handleStartInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.startValue = target.value;
    this.commit();
  }

  handleEndInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.endValue = target.value;
    this.commit();
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

  clearValue(): void {
    this.startValue = '';
    this.endValue = '';
    this.commit();
    this.clear.emit();
  }

  private commit(): void {
    const value = this.currentValue();
    this.onChange(value);
    this.valueChange.emit(value);
    this.select.emit(value);
  }

  private currentValue(): JDateRangeValue {
    return {
      start: this.fromInputDate(this.startValue),
      end: this.fromInputDate(this.endValue),
    };
  }

  private fromInputDate(value: string): string | Date | null {
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

  private isRangeTuple(
    value: JDateRangeInputValue | null | undefined,
  ): value is readonly [string | Date | null, string | Date | null] {
    return Array.isArray(value);
  }
}
