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
import { jAriaDescribedBy } from '../core/aria';
import { JClickOutsideDirective } from '../core/click-outside.directive';
import { JRNG_LOCALE } from '../core/locale';
import { JPassThrough } from '../core/pass-through';
import { JSize } from '../core/types';
import { jCreateId } from '../core/id';

export interface JDateRangeValue {
  readonly start: string | Date | null;
  readonly end: string | Date | null;
}

export type JDateRangeInputValue =
  | JDateRangeValue
  | readonly [string | Date | null, string | Date | null];

interface JRangeDay {
  readonly date: Date;
  readonly label: number;
  readonly inMonth: boolean;
  readonly today: boolean;
  readonly start: boolean;
  readonly end: boolean;
  readonly inRange: boolean;
  readonly preview: boolean;
  readonly disabled: boolean;
}

interface JRangePreset {
  readonly label: string;
  readonly start: Date;
  readonly end: Date;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

@Component({
  selector: 'j-date-range-picker',
  imports: [JClickOutsideDirective],
  template: `
    <div
      [class]="rootClasses"
      jClickOutside
      (jClickOutside)="close()"
      data-jc-name="date-range-picker"
      data-jc-section="root"
      [attr.data-j-disabled]="isDisabled ? 'true' : null"
      [attr.data-j-invalid]="hasError ? 'true' : null"
      [attr.data-j-open]="isOpen ? 'true' : null"
    >
      @if (label) {
        <label class="j-date-range-picker__label" [id]="labelId">
          <span>{{ label }}</span>
          @if (required) {
            <span class="j-date-range-picker__required" aria-hidden="true">*</span>
          }
        </label>
      }

      <button
        class="j-date-range-picker__control"
        type="button"
        [disabled]="isDisabled || readonly"
        [attr.aria-labelledby]="label ? labelId : null"
        [attr.aria-describedby]="describedBy"
        [attr.aria-invalid]="hasError ? 'true' : null"
        [attr.aria-expanded]="isOpen"
        [attr.aria-controls]="isOpen ? panelId : null"
        (click)="toggle()"
        (keydown)="handleTriggerKeydown($event)"
      >
        <span class="j-date-range-picker__value" [class.is-placeholder]="!startDate && !endDate">
          {{ displayValue || placeholder }}
        </span>
        @if (canClear) {
          <span class="j-date-range-picker__clear" role="button" tabindex="-1" (click)="clearValue($event)" aria-hidden="true">
            x
          </span>
        }
        <span class="j-date-range-picker__icon" aria-hidden="true">cal</span>
      </button>

      @if (isOpen) {
        <div class="j-date-range-picker__panel" [id]="panelId" role="dialog" data-jc-section="panel">
          <div class="j-date-range-picker__presets" aria-label="Date range presets">
            @for (preset of presets; track preset.label) {
              <button type="button" class="j-date-range-picker__preset" (click)="applyPreset(preset)">
                {{ preset.label }}
              </button>
            }
          </div>

          <div class="j-date-range-picker__calendar">
            <div class="j-date-range-picker__header">
              <button type="button" class="j-date-range-picker__nav" aria-label="Previous month" (click)="previousMonth()">
                &lt;
              </button>
              <span class="j-date-range-picker__heading">{{ monthNames[viewDate.getMonth()] }} {{ viewDate.getFullYear() }}</span>
              <button type="button" class="j-date-range-picker__nav" aria-label="Next month" (click)="nextMonth()">
                &gt;
              </button>
            </div>

            <div class="j-date-range-picker__grid" role="grid" [attr.aria-label]="monthNames[viewDate.getMonth()] + ' ' + viewDate.getFullYear()">
              @for (dayName of dayNames; track dayName) {
                <span class="j-date-range-picker__weekday" role="columnheader">{{ dayName }}</span>
              }
              @for (day of calendarDays; track day.date.getTime()) {
                <button
                  type="button"
                  role="gridcell"
                  [class]="dayClasses(day)"
                  [disabled]="day.disabled"
                  [attr.aria-selected]="day.start || day.end || day.inRange"
                  [attr.aria-current]="day.today ? 'date' : null"
                  [attr.data-j-selected]="day.start || day.end || day.inRange ? 'true' : null"
                  [attr.data-j-disabled]="day.disabled ? 'true' : null"
                  (mouseenter)="hoverDate = clone(day.date)"
                  (focus)="hoverDate = clone(day.date)"
                  (click)="selectDate(day.date)"
                  (keydown)="handleDayKeydown($event, day.date)"
                >
                  {{ day.label }}
                </button>
              }
            </div>
          </div>

          <div class="j-date-range-picker__bar">
            <span class="j-date-range-picker__selection">{{ displayValue || placeholder }}</span>
            <button type="button" class="j-date-range-picker__bar-button" [disabled]="!startDate && !endDate" (click)="clearValue()">
              {{ locale.clear }}
            </button>
          </div>
        </div>
      }

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
        color: var(--j-color-foreground);
        display: block;
        position: relative;
      }

      .j-date-range-picker__label {
        display: inline-flex;
        font-size: var(--j-font-size-sm);
        font-weight: var(--j-font-weight-semibold);
        gap: var(--j-spacing-1);
        margin-bottom: var(--j-spacing-2);
      }

      .j-date-range-picker__control {
        align-items: center;
        background: var(--j-color-card);
        border: 1px solid var(--j-input-border-color, var(--j-color-border));
        border-radius: var(--j-input-radius, var(--j-radius-md));
        color: inherit;
        cursor: pointer;
        display: flex;
        font: inherit;
        gap: var(--j-spacing-2);
        min-height: var(--j-input-height-md, 2.5rem);
        padding: 0 var(--j-spacing-3);
        text-align: left;
        width: 100%;
      }

      .j-date-range-picker__control:focus-visible {
        border-color: var(--j-color-ring);
        box-shadow: var(--j-focus-ring);
        outline: 2px solid transparent;
      }

      .j-date-range-picker--filled .j-date-range-picker__control {
        background: var(--j-color-muted);
      }

      .j-date-range-picker--sm .j-date-range-picker__control {
        min-height: var(--j-input-height-sm, 2.125rem);
      }

      .j-date-range-picker--lg .j-date-range-picker__control {
        min-height: var(--j-input-height-lg, 2.875rem);
      }

      .j-date-range-picker.is-invalid .j-date-range-picker__control {
        border-color: var(--j-color-danger);
      }

      .j-date-range-picker.is-disabled {
        opacity: var(--j-disabled-opacity);
      }

      .j-date-range-picker__value {
        flex: 1;
        min-width: 0;
      }

      .j-date-range-picker__value.is-placeholder,
      .j-date-range-picker__icon,
      .j-date-range-picker__clear,
      .j-date-range-picker__selection {
        color: var(--j-color-muted-foreground);
      }

      .j-date-range-picker__panel {
        background: var(--j-color-popover);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-lg);
        box-shadow: var(--j-shadow-lg, 0 18px 45px rgb(15 23 42 / 0.14));
        color: var(--j-color-popover-foreground);
        display: grid;
        gap: var(--j-spacing-3);
        grid-template-columns: 8rem minmax(18rem, 1fr);
        margin-top: var(--j-spacing-2);
        padding: var(--j-spacing-3);
        position: absolute;
        width: min(32rem, calc(100vw - 2rem));
        z-index: var(--j-z-index-overlay, 1000);
      }

      .j-date-range-picker__presets {
        display: flex;
        flex-direction: column;
        gap: var(--j-spacing-1);
      }

      .j-date-range-picker__preset,
      .j-date-range-picker__nav,
      .j-date-range-picker__bar-button,
      .j-date-range-picker__day {
        border: 0;
        border-radius: var(--j-radius-sm);
        cursor: pointer;
        font: inherit;
      }

      .j-date-range-picker__preset,
      .j-date-range-picker__bar-button {
        background: transparent;
        color: var(--j-color-primary);
        min-height: 2rem;
        padding: 0 var(--j-spacing-2);
        text-align: left;
      }

      .j-date-range-picker__header,
      .j-date-range-picker__bar {
        align-items: center;
        display: flex;
        gap: var(--j-spacing-2);
        justify-content: space-between;
      }

      .j-date-range-picker__header {
        margin-bottom: var(--j-spacing-3);
      }

      .j-date-range-picker__heading {
        font-weight: var(--j-font-weight-semibold);
      }

      .j-date-range-picker__nav {
        background: var(--j-color-muted);
        color: var(--j-color-muted-foreground);
        min-height: 2rem;
        min-width: 2rem;
      }

      .j-date-range-picker__grid {
        display: grid;
        gap: var(--j-spacing-1);
        grid-template-columns: repeat(7, minmax(0, 1fr));
      }

      .j-date-range-picker__weekday {
        color: var(--j-color-muted-foreground);
        font-size: var(--j-font-size-xs);
        font-weight: var(--j-font-weight-semibold);
        text-align: center;
      }

      .j-date-range-picker__day {
        aspect-ratio: 1;
        background: transparent;
        color: inherit;
      }

      .j-date-range-picker__day.is-outside {
        color: var(--j-color-muted-foreground);
      }

      .j-date-range-picker__day.is-preview,
      .j-date-range-picker__day.is-in-range {
        background: color-mix(in srgb, var(--j-color-primary) 12%, transparent);
      }

      .j-date-range-picker__day.is-start,
      .j-date-range-picker__day.is-end {
        background: var(--j-color-primary);
        color: var(--j-color-primary-foreground);
      }

      .j-date-range-picker__day.is-today {
        box-shadow: inset 0 0 0 1px var(--j-color-ring);
      }

      .j-date-range-picker__preset:hover,
      .j-date-range-picker__nav:hover,
      .j-date-range-picker__bar-button:hover,
      .j-date-range-picker__day:hover:not(:disabled) {
        background: var(--j-color-muted);
      }

      .j-date-range-picker__preset:focus-visible,
      .j-date-range-picker__nav:focus-visible,
      .j-date-range-picker__bar-button:focus-visible,
      .j-date-range-picker__day:focus-visible {
        box-shadow: var(--j-focus-ring);
        outline: 2px solid transparent;
      }

      .j-date-range-picker__bar {
        border-top: 1px solid var(--j-color-border);
        grid-column: 1 / -1;
        padding-top: var(--j-spacing-3);
      }

      .j-date-range-picker__required,
      .j-date-range-picker__message--error {
        color: var(--j-color-danger);
      }

      .j-date-range-picker__message {
        color: var(--j-color-muted-foreground);
        font-size: var(--j-font-size-xs);
        margin: var(--j-spacing-2) 0 0;
      }

      @media (max-width: 560px) {
        .j-date-range-picker__panel {
          grid-template-columns: 1fr;
          width: min(100%, calc(100vw - 2rem));
        }

        .j-date-range-picker__presets {
          flex-flow: row wrap;
        }

        .j-date-range-picker__bar {
          grid-column: auto;
        }
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

  readonly locale = inject(JRNG_LOCALE);
  readonly labelId = jCreateId('j-date-range-picker-label');
  readonly hintId = jCreateId('j-date-range-picker-hint');
  readonly errorId = jCreateId('j-date-range-picker-error');
  readonly panelId = jCreateId('j-date-range-picker-panel');
  readonly dayNames = DAY_NAMES;
  readonly monthNames = MONTH_NAMES;
  readonly today = startOfDay(new Date());

  @Input() label = '';
  @Input() placeholder = 'Select date range';
  @Input() hint = '';
  @Input() error = '';
  @Input() styleClass = '';
  @Input() variant: 'outlined' | 'filled' = 'outlined';
  @Input() size: JSize = 'md';
  @Input() dataType: 'date' | 'string' = 'string';
  @Input() appendTo: 'self' | 'body' | string = 'self';
  @Input() pt: JPassThrough | null = null;
  @Input({ transform: booleanAttribute }) readonly = false;
  @Input({ transform: booleanAttribute }) invalid = false;
  @Input({ transform: booleanAttribute }) required = false;
  @Input({ transform: booleanAttribute }) showClear = true;

  readonly valueChange = output<JDateRangeValue>();
  readonly select = output<JDateRangeValue>();
  readonly clear = output<void>();
  readonly opened = output<void>();
  readonly closed = output<void>();

  startDate: Date | null = null;
  endDate: Date | null = null;
  hoverDate: Date | null = null;
  viewDate = startOfMonth(new Date());
  isDisabled = false;
  isOpen = false;

  private minDateInternal: Date | string | null = null;
  private maxDateInternal: Date | string | null = null;
  private onChange: (value: JDateRangeValue) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  @Input()
  set value(value: JDateRangeInputValue | null | undefined) {
    this.writeValue(value);
  }

  @Input()
  set minDate(value: Date | string | null | undefined) {
    this.minDateInternal = value ?? null;
  }

  @Input()
  set maxDate(value: Date | string | null | undefined) {
    this.maxDateInternal = value ?? null;
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

  get canClear(): boolean {
    return this.showClear && (this.startDate != null || this.endDate != null) && !this.isDisabled && !this.readonly;
  }

  get rootClasses(): string {
    return [
      'j-date-range-picker',
      `j-date-range-picker--${this.size}`,
      `j-date-range-picker--${this.variant}`,
      this.hasError ? 'is-invalid' : '',
      this.isDisabled ? 'is-disabled' : '',
      this.isOpen ? 'is-open' : '',
      this.styleClass,
      this.pt?.['root']?.['class'] ?? '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  get displayValue(): string {
    if (!this.startDate && !this.endDate) {
      return '';
    }
    const start = this.startDate ? formatDate(this.startDate) : '';
    const end = this.endDate ? formatDate(this.endDate) : '';
    return `${start} - ${end}`.trim();
  }

  get presets(): readonly JRangePreset[] {
    const today = this.today;
    const yesterday = addDays(today, -1);
    const thisMonth = startOfMonth(today);
    const lastMonth = addMonths(thisMonth, -1);
    return [
      { label: this.locale.today, start: today, end: today },
      { label: 'Yesterday', start: yesterday, end: yesterday },
      { label: 'Last 7 days', start: addDays(today, -6), end: today },
      { label: 'This month', start: thisMonth, end: endOfMonth(today) },
      { label: 'Last month', start: lastMonth, end: endOfMonth(lastMonth) },
    ];
  }

  get calendarDays(): readonly JRangeDay[] {
    const first = startOfMonth(this.viewDate);
    const gridStart = addDays(first, -first.getDay());
    return Array.from({ length: 42 }, (_, index) => {
      const date = addDays(gridStart, index);
      return {
        date,
        label: date.getDate(),
        inMonth: date.getMonth() === this.viewDate.getMonth(),
        today: sameDate(date, this.today),
        start: !!this.startDate && sameDate(date, this.startDate),
        end: !!this.endDate && sameDate(date, this.endDate),
        inRange: this.isBetween(date, this.startDate, this.endDate),
        preview: this.isPreview(date),
        disabled: this.isDateDisabled(date),
      };
    });
  }

  writeValue(value: JDateRangeInputValue | null | undefined): void {
    if (Array.isArray(value)) {
      this.startDate = normalizeDate(value[0]);
      this.endDate = normalizeDate(value[1]);
    } else if (value) {
      const range = value as JDateRangeValue;
      this.startDate = normalizeDate(range.start);
      this.endDate = normalizeDate(range.end);
    } else {
      this.startDate = null;
      this.endDate = null;
    }

    this.viewDate = startOfMonth(this.startDate ?? this.today);
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
    if (isDisabled) {
      this.close();
    }
    this.changeDetectorRef.markForCheck();
  }

  toggle(): void {
    this.isOpen ? this.close() : this.open();
  }

  open(): void {
    if (this.isDisabled || this.readonly || this.isOpen) {
      return;
    }
    this.isOpen = true;
    this.viewDate = startOfMonth(this.startDate ?? this.today);
    this.opened.emit();
    this.changeDetectorRef.markForCheck();
  }

  close(): void {
    if (!this.isOpen) {
      return;
    }
    this.isOpen = false;
    this.hoverDate = null;
    this.onTouched();
    this.closed.emit();
    this.changeDetectorRef.markForCheck();
  }

  handleTriggerKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.open();
    }
  }

  handleDayKeydown(event: KeyboardEvent, date: Date): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.selectDate(date);
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
    }
  }

  previousMonth(): void {
    this.viewDate = addMonths(this.viewDate, -1);
  }

  nextMonth(): void {
    this.viewDate = addMonths(this.viewDate, 1);
  }

  selectDate(date: Date): void {
    if (this.isDateDisabled(date)) {
      return;
    }

    const next = startOfDay(date);
    if (!this.startDate || this.endDate) {
      this.startDate = next;
      this.endDate = null;
      this.hoverDate = null;
      this.commit(false);
      return;
    }

    if (next.getTime() < this.startDate.getTime()) {
      this.endDate = this.startDate;
      this.startDate = next;
    } else {
      this.endDate = next;
    }

    this.commit(true);
    this.close();
  }

  applyPreset(preset: JRangePreset): void {
    this.startDate = preset.start;
    this.endDate = preset.end;
    this.viewDate = startOfMonth(preset.start);
    this.commit(true);
    this.close();
  }

  clearValue(event?: Event): void {
    event?.stopPropagation();
    if (this.isDisabled || this.readonly) {
      return;
    }
    this.startDate = null;
    this.endDate = null;
    this.hoverDate = null;
    this.commit(true);
    this.clear.emit();
  }

  dayClasses(day: JRangeDay): string {
    return [
      'j-date-range-picker__day',
      day.inMonth ? '' : 'is-outside',
      day.today ? 'is-today' : '',
      day.start ? 'is-start' : '',
      day.end ? 'is-end' : '',
      day.inRange ? 'is-in-range' : '',
      day.preview ? 'is-preview' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  isDateDisabled(date: Date): boolean {
    const normalized = startOfDay(date);
    const min = normalizeDate(this.minDateInternal);
    const max = normalizeDate(this.maxDateInternal);
    return (min ? normalized < min : false) || (max ? normalized > max : false);
  }

  clone(date: Date): Date {
    return cloneDate(date);
  }

  private commit(emitSelect: boolean): void {
    const value = this.currentValue();
    this.onChange(value);
    this.valueChange.emit(value);
    if (emitSelect) {
      this.select.emit(value);
    }
    this.changeDetectorRef.markForCheck();
  }

  private currentValue(): JDateRangeValue {
    return {
      start: this.dataType === 'string' && this.startDate ? formatDate(this.startDate) : this.startDate,
      end: this.dataType === 'string' && this.endDate ? formatDate(this.endDate) : this.endDate,
    };
  }

  private isPreview(date: Date): boolean {
    return !!this.startDate && !this.endDate && this.isBetween(date, this.startDate, this.hoverDate);
  }

  private isBetween(date: Date, start: Date | null, end: Date | null): boolean {
    if (!start || !end) {
      return false;
    }
    const time = date.getTime();
    const startTime = Math.min(start.getTime(), end.getTime());
    const endTime = Math.max(start.getTime(), end.getTime());
    return time > startTime && time < endTime;
  }
}

function normalizeDate(value: Date | string | null | undefined): Date | null {
  if (!value) {
    return null;
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : startOfDay(value);
  }
  const match = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(value.trim());
  if (!match) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : startOfDay(parsed);
  }
  return startOfDay(new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
}

function formatDate(date: Date): string {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function addDays(date: Date, amount: number): Date {
  const next = cloneDate(date);
  next.setDate(next.getDate() + amount);
  return startOfDay(next);
}

function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function sameDate(left: Date, right: Date): boolean {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate();
}

function cloneDate(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
