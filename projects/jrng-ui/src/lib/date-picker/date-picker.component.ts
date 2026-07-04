import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ElementRef,
  TemplateRef,
  ViewChild,
  forwardRef,
  inject,
  input,
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

export type JDatePickerDataType = 'date' | 'string';
export type JDatePickerSelectionMode = 'single' | 'multiple' | 'range';
export type JDatePickerView = 'date' | 'month' | 'year';
export type JDatePickerValue = Date | string | null;

interface JCalendarDay {
  readonly date: Date;
  readonly label: number;
  readonly inMonth: boolean;
  readonly today: boolean;
  readonly selected: boolean;
  readonly focused: boolean;
  readonly disabled: boolean;
}

export interface JDatePickerDayContext {
  readonly $implicit: Date;
  readonly date: Date;
  readonly label: number;
  readonly selected: boolean;
  readonly today: boolean;
  readonly disabled: boolean;
  readonly inMonth: boolean;
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
  selector: 'j-date-picker',
  imports: [NgTemplateOutlet, JClickOutsideDirective],
  template: `
    <div
      [class]="rootClasses"
      jClickOutside
      (jClickOutside)="close()"
      data-jc-name="date-picker"
      data-jc-section="root"
      [attr.data-j-disabled]="isDisabled ? 'true' : null"
      [attr.data-j-invalid]="hasError ? 'true' : null"
      [attr.data-j-open]="isOpen ? 'true' : null"
    >
      @if (label()) {
        <label class="j-date-picker__label" [for]="id()">
          <span>{{ label() }}</span>
          @if (required()) {
            <span class="j-date-picker__required" aria-hidden="true">*</span>
          }
        </label>
      }

      <div class="j-date-picker__control" data-jc-section="control">
        <input
          #input
          class="j-date-picker__input"
          type="text"
          inputmode="numeric"
          autocomplete="off"
          role="combobox"
          [id]="id()"
          [placeholder]="placeholder()"
          [disabled]="isDisabled"
          [readOnly]="readonly()"
          [required]="required()"
          [value]="inputValue"
          [attr.aria-expanded]="isOpen"
          [attr.aria-controls]="isOpen ? panelId : null"
          [attr.aria-invalid]="hasError ? 'true' : null"
          [attr.aria-describedby]="describedBy"
          (input)="handleTextInput($event)"
          (focus)="open()"
          (blur)="handleBlur()"
          (keydown)="handleInputKeydown($event)"
        />

        @if (canClear) {
          <button
            class="j-date-picker__clear"
            type="button"
            [attr.aria-label]="locale.clear"
            (click)="clearValue($event)"
          >
            <span aria-hidden="true">x</span>
          </button>
        }

        @if (showIcon()) {
          <button
            class="j-date-picker__trigger"
            type="button"
            [disabled]="isDisabled || readonly()"
            [attr.aria-label]="locale.choose"
            (click)="toggle()"
          >
            <span aria-hidden="true">cal</span>
          </button>
        }
      </div>

      @if (isOpen) {
        <div
          #panel
          class="j-date-picker__panel"
          [id]="panelId"
          role="dialog"
          aria-modal="false"
          data-jc-section="panel"
        >
          <div class="j-date-picker__panel-header">
            <button type="button" class="j-date-picker__nav" aria-label="Previous month" (click)="previous()">
              <span aria-hidden="true">&lt;</span>
            </button>
            <button type="button" class="j-date-picker__heading" (click)="showMonthView()">
              {{ monthNames[viewDate.getMonth()] }}
            </button>
            <button type="button" class="j-date-picker__heading" (click)="showYearView()">
              {{ viewDate.getFullYear() }}
            </button>
            <button type="button" class="j-date-picker__nav" aria-label="Next month" (click)="next()">
              <span aria-hidden="true">&gt;</span>
            </button>
          </div>

          @switch (currentView) {
            @case ('date') {
              <div
                class="j-date-picker__grid"
                role="grid"
                [attr.aria-label]="monthNames[viewDate.getMonth()] + ' ' + viewDate.getFullYear()"
                (keydown)="handleGridKeydown($event)"
              >
                @for (dayName of dayNames; track dayName) {
                  <span class="j-date-picker__weekday" role="columnheader">{{ dayName }}</span>
                }
                @for (day of calendarDays; track day.date.getTime()) {
                  <button
                    type="button"
                    role="gridcell"
                    [class]="dayClasses(day)"
                    [disabled]="day.disabled"
                    [attr.tabindex]="day.focused ? '0' : '-1'"
                    [attr.aria-selected]="day.selected"
                    [attr.aria-current]="day.today ? 'date' : null"
                    [attr.data-j-selected]="day.selected ? 'true' : null"
                    [attr.data-j-focused]="day.focused ? 'true' : null"
                    [attr.data-j-disabled]="day.disabled ? 'true' : null"
                    (mouseenter)="focusedDate = cloneDate(day.date)"
                    (focus)="focusedDate = cloneDate(day.date)"
                    (click)="selectDate(day.date)"
                  >
                    @if (dayTemplate) {
                      <ng-container
                        [ngTemplateOutlet]="dayTemplate"
                        [ngTemplateOutletContext]="dayContext(day)"
                      />
                    } @else {
                      {{ day.label }}
                    }
                  </button>
                }
              </div>
            }

            @case ('month') {
              <div class="j-date-picker__month-grid" role="grid" aria-label="Choose month">
                @for (month of monthNames; track month; let index = $index) {
                  <button
                    type="button"
                    class="j-date-picker__month"
                    [class.is-active]="index === viewDate.getMonth()"
                    [attr.aria-selected]="index === viewDate.getMonth()"
                    (click)="selectMonth(index)"
                  >
                    {{ month.slice(0, 3) }}
                  </button>
                }
              </div>
            }

            @case ('year') {
              <div class="j-date-picker__year-tools">
                <button type="button" class="j-date-picker__nav" (click)="shiftYearPage(-12)" aria-label="Previous years">
                  &lt;
                </button>
                <span>{{ yearOptions[0] }} - {{ yearOptions[yearOptions.length - 1] }}</span>
                <button type="button" class="j-date-picker__nav" (click)="shiftYearPage(12)" aria-label="Next years">
                  &gt;
                </button>
              </div>
              <div class="j-date-picker__year-grid" role="grid" aria-label="Choose year">
                @for (year of yearOptions; track year) {
                  <button
                    type="button"
                    class="j-date-picker__year"
                    [class.is-active]="year === viewDate.getFullYear()"
                    [attr.aria-selected]="year === viewDate.getFullYear()"
                    (click)="selectYear(year)"
                  >
                    {{ year }}
                  </button>
                }
              </div>
            }
          }

          @if (showButtonBar()) {
            <div class="j-date-picker__bar">
            <button type="button" class="j-date-picker__bar-button" [disabled]="isDateDisabled(todayDate)" (click)="selectToday()">
              {{ locale.today }}
            </button>
            <button type="button" class="j-date-picker__bar-button" [disabled]="!selectedValue" (click)="clearValue()">
              {{ locale.clear }}
            </button>
            </div>
          }
        </div>
      }

      @if (hasError && error()) {
        <p class="j-date-picker__message j-date-picker__message--error" [id]="errorId">
          {{ error() }}
        </p>
      }
      @if (hint() && !hasError) {
        <p class="j-date-picker__message" [id]="hintId">{{ hint() }}</p>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .j-date-picker {
        color: var(--j-color-foreground);
        display: block;
        position: relative;
      }

      .j-date-picker__label {
        display: inline-flex;
        font-size: var(--j-font-size-sm);
        font-weight: var(--j-font-weight-semibold);
        gap: var(--j-spacing-1);
        margin-bottom: var(--j-spacing-2);
      }

      .j-date-picker__control {
        align-items: center;
        background: var(--j-color-card);
        border: 1px solid var(--j-input-border-color, var(--j-color-border));
        border-radius: var(--j-input-radius, var(--j-radius-md));
        display: flex;
        min-height: var(--j-input-height-md, 2.5rem);
        transition:
          border-color 140ms ease,
          box-shadow 140ms ease,
          background-color 140ms ease;
      }

      .j-date-picker__control:focus-within {
        border-color: var(--j-color-ring);
        box-shadow: var(--j-focus-ring);
      }

      .j-date-picker--filled .j-date-picker__control {
        background: var(--j-color-muted);
      }

      .j-date-picker--sm .j-date-picker__control {
        min-height: var(--j-input-height-sm, 2.125rem);
      }

      .j-date-picker--lg .j-date-picker__control {
        min-height: var(--j-input-height-lg, 2.875rem);
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
        color: inherit;
        flex: 1;
        font: inherit;
        min-height: inherit;
        min-width: 0;
        outline: none;
        padding: 0 var(--j-spacing-3);
      }

      .j-date-picker__trigger,
      .j-date-picker__clear,
      .j-date-picker__nav,
      .j-date-picker__heading,
      .j-date-picker__bar-button,
      .j-date-picker__month,
      .j-date-picker__year,
      .j-date-picker__day {
        align-items: center;
        border: 0;
        border-radius: var(--j-radius-sm);
        cursor: pointer;
        display: inline-flex;
        font: inherit;
        justify-content: center;
      }

      .j-date-picker__trigger,
      .j-date-picker__clear {
        background: transparent;
        color: var(--j-color-muted-foreground);
        min-height: 2rem;
        min-width: 2rem;
      }

      .j-date-picker__trigger:hover,
      .j-date-picker__clear:hover {
        color: var(--j-color-foreground);
      }

      .j-date-picker__panel {
        background: var(--j-color-popover);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-lg);
        box-shadow: var(--j-shadow-lg, 0 18px 45px rgb(15 23 42 / 0.14));
        color: var(--j-color-popover-foreground);
        margin-top: var(--j-spacing-2);
        padding: var(--j-spacing-3);
        position: absolute;
        width: min(21rem, calc(100vw - 2rem));
        z-index: var(--j-z-index-overlay, 1000);
      }

      .j-date-picker__panel-header,
      .j-date-picker__year-tools,
      .j-date-picker__bar {
        align-items: center;
        display: flex;
        gap: var(--j-spacing-2);
      }

      .j-date-picker__panel-header {
        margin-bottom: var(--j-spacing-3);
      }

      .j-date-picker__heading {
        background: transparent;
        color: inherit;
        font-weight: var(--j-font-weight-semibold);
        min-height: 2rem;
        padding: 0 var(--j-spacing-2);
      }

      .j-date-picker__heading:nth-of-type(2) {
        margin-left: auto;
      }

      .j-date-picker__nav {
        background: var(--j-color-muted);
        color: var(--j-color-muted-foreground);
        min-height: 2rem;
        min-width: 2rem;
      }

      .j-date-picker__grid {
        display: grid;
        gap: var(--j-spacing-1);
        grid-template-columns: repeat(7, minmax(0, 1fr));
      }

      .j-date-picker__weekday {
        color: var(--j-color-muted-foreground);
        font-size: var(--j-font-size-xs);
        font-weight: var(--j-font-weight-semibold);
        padding: var(--j-spacing-1) 0;
        text-align: center;
      }

      .j-date-picker__day {
        aspect-ratio: 1;
        background: transparent;
        color: inherit;
        min-width: 0;
      }

      .j-date-picker__day.is-outside {
        color: var(--j-color-muted-foreground);
      }

      .j-date-picker__day.is-today {
        box-shadow: inset 0 0 0 1px var(--j-color-ring);
      }

      .j-date-picker__day.is-selected {
        background: var(--j-color-primary);
        color: var(--j-color-primary-foreground);
      }

      .j-date-picker__day:hover:not(:disabled),
      .j-date-picker__month:hover,
      .j-date-picker__year:hover,
      .j-date-picker__heading:hover,
      .j-date-picker__nav:hover,
      .j-date-picker__bar-button:hover {
        background: var(--j-color-muted);
      }

      .j-date-picker__day:focus-visible,
      .j-date-picker__month:focus-visible,
      .j-date-picker__year:focus-visible,
      .j-date-picker__heading:focus-visible,
      .j-date-picker__nav:focus-visible,
      .j-date-picker__bar-button:focus-visible,
      .j-date-picker__trigger:focus-visible,
      .j-date-picker__clear:focus-visible {
        box-shadow: var(--j-focus-ring);
        outline: 2px solid transparent;
      }

      .j-date-picker__month-grid,
      .j-date-picker__year-grid {
        display: grid;
        gap: var(--j-spacing-2);
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }

      .j-date-picker__month,
      .j-date-picker__year {
        background: transparent;
        color: inherit;
        min-height: 2.5rem;
      }

      .j-date-picker__month.is-active,
      .j-date-picker__year.is-active {
        background: var(--j-color-primary);
        color: var(--j-color-primary-foreground);
      }

      .j-date-picker__year-tools {
        justify-content: space-between;
        margin-bottom: var(--j-spacing-3);
      }

      .j-date-picker__bar {
        border-top: 1px solid var(--j-color-border);
        justify-content: space-between;
        margin-top: var(--j-spacing-3);
        padding-top: var(--j-spacing-3);
      }

      .j-date-picker__bar-button {
        background: transparent;
        color: var(--j-color-primary);
        min-height: 2rem;
        padding: 0 var(--j-spacing-2);
      }

      .j-date-picker__required,
      .j-date-picker__message--error {
        color: var(--j-color-danger);
      }

      .j-date-picker__message {
        color: var(--j-color-muted-foreground);
        font-size: var(--j-font-size-xs);
        margin: var(--j-spacing-2) 0 0;
      }

      @media (max-width: 480px) {
        .j-date-picker__panel {
          left: 0;
          width: min(100%, calc(100vw - 2rem));
        }
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

  readonly locale = inject(JRNG_LOCALE);

  @ViewChild('input') private inputRef?: ElementRef<HTMLInputElement>;
  @ContentChild('jDateCell', { read: TemplateRef }) dayTemplate?: TemplateRef<JDatePickerDayContext>;

  readonly id = input(jCreateId('j-date-picker'));
  readonly label = input('');
  readonly placeholder = input('');
  readonly error = input('');
  readonly hint = input('');
  readonly dateFormat = input('yyyy-MM-dd');
  readonly dataType = input<JDatePickerDataType>('date');
  readonly selectionMode = input<JDatePickerSelectionMode>('single');
  readonly view = input<JDatePickerView>('date');
  readonly appendTo = input<'self' | 'body' | string>('self');
  readonly styleClass = input('');
  readonly size = input<JSize>('md');
  readonly variant = input<'outlined' | 'filled'>('outlined');
  readonly pt = input<JPassThrough | null>(null);
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly showIcon = input(true, { transform: booleanAttribute });
  readonly showButtonBar = input(true, { transform: booleanAttribute });
  readonly showClear = input(true, { transform: booleanAttribute });
  readonly disabledDates = input<readonly (Date | string)[]>([]);

  readonly valueChange = output<JDatePickerValue>();
  readonly select = output<JDatePickerValue>();
  readonly clear = output<void>();
  readonly opened = output<void>();
  readonly closed = output<void>();

  readonly hintId = jCreateId('j-date-picker-hint');
  readonly errorId = jCreateId('j-date-picker-error');
  readonly panelId = jCreateId('j-date-picker-panel');
  readonly dayNames = DAY_NAMES;
  readonly monthNames = MONTH_NAMES;
  readonly todayDate = startOfDay(new Date());

  inputValue = '';
  selectedValue: Date | string | null = null;
  isDisabled = false;
  isOpen = false;
  currentView: JDatePickerView = 'date';
  viewDate = startOfMonth(new Date());
  focusedDate = startOfDay(new Date());
  yearPageStart = new Date().getFullYear() - 5;

  private minDateInternal: Date | string | null = null;
  private maxDateInternal: Date | string | null = null;
  private onChange: (value: JDatePickerValue) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  get hasError(): boolean {
    return this.invalid() || this.error().trim().length > 0;
  }

  get describedBy(): string | null {
    return jAriaDescribedBy(this.hasError ? this.errorId : null, this.hint() ? this.hintId : null);
  }

  get canClear(): boolean {
    return this.showClear() && !!this.selectedValue && !this.isDisabled && !this.readonly();
  }

  get rootClasses(): string {
    return [
      'j-date-picker',
      `j-date-picker--${this.size()}`,
      `j-date-picker--${this.variant()}`,
      this.hasError ? 'is-invalid' : '',
      this.isDisabled ? 'is-disabled' : '',
      this.isOpen ? 'is-open' : '',
      this.styleClass(),
      this.pt()?.['root']?.['class'] ?? '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  get minDateValue(): Date | null {
    return normalizeDate(this.minDateInternal);
  }

  get maxDateValue(): Date | null {
    return normalizeDate(this.maxDateInternal);
  }

  get calendarDays(): readonly JCalendarDay[] {
    const first = startOfMonth(this.viewDate);
    const start = addDays(first, -first.getDay());
    const selectedDate = normalizeDate(this.selectedValue);

    return Array.from({ length: 42 }, (_, index) => {
      const date = addDays(start, index);
      return {
        date,
        label: date.getDate(),
        inMonth: date.getMonth() === this.viewDate.getMonth(),
        today: sameDate(date, this.todayDate),
        selected: !!selectedDate && sameDate(date, selectedDate),
        focused: sameDate(date, this.focusedDate),
        disabled: this.isDateDisabled(date),
      };
    });
  }

  get yearOptions(): readonly number[] {
    return Array.from({ length: 12 }, (_, index) => this.yearPageStart + index);
  }

  @Input()
  set value(value: Date | string | null | undefined) {
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

  writeValue(value: Date | string | null | undefined): void {
    this.selectedValue = value ?? null;
    const date = normalizeDate(this.selectedValue);
    if (date) {
      this.viewDate = startOfMonth(date);
      this.focusedDate = cloneDate(date);
      this.yearPageStart = date.getFullYear() - 5;
    }
    this.inputValue = date ? formatDate(date, this.dateFormat()) : '';
    this.changeDetectorRef.markForCheck();
  }

  registerOnChange(fn: (value: JDatePickerValue) => void): void {
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
    this.isOpen ? this.close(true) : this.open();
  }

  open(): void {
    if (this.isDisabled || this.readonly() || this.isOpen) {
      return;
    }

    const selected = normalizeDate(this.selectedValue);
    this.currentView = this.view();
    this.focusedDate = selected ? cloneDate(selected) : cloneDate(this.todayDate);
    this.viewDate = startOfMonth(this.focusedDate);
    this.isOpen = true;
    this.opened.emit();
    this.changeDetectorRef.markForCheck();
  }

  close(restoreFocus = false): void {
    if (!this.isOpen) {
      return;
    }

    this.isOpen = false;
    this.currentView = 'date';
    this.closed.emit();
    this.changeDetectorRef.markForCheck();

    if (restoreFocus) {
      queueMicrotask(() => this.inputRef?.nativeElement.focus());
    }
  }

  handleTextInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.inputValue = target.value;
  }

  handleBlur(): void {
    this.onTouched();
    const parsed = parseDate(this.inputValue);
    if (!this.inputValue.trim()) {
      this.commit(null, false);
    } else if (parsed && !this.isDateDisabled(parsed)) {
      this.commit(parsed, false);
    }
  }

  handleInputKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.open();
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const parsed = parseDate(this.inputValue);
      if (parsed && !this.isDateDisabled(parsed)) {
        this.selectDate(parsed);
      }
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      this.close(true);
    }
  }

  handleGridKeydown(event: KeyboardEvent): void {
    const keyMap: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    };

    if (event.key in keyMap) {
      event.preventDefault();
      this.focusDate(addDays(this.focusedDate, keyMap[event.key]));
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      this.focusDate(addDays(this.focusedDate, -this.focusedDate.getDay()));
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      this.focusDate(addDays(this.focusedDate, 6 - this.focusedDate.getDay()));
      return;
    }

    if (event.key === 'PageUp') {
      event.preventDefault();
      this.focusDate(addMonths(this.focusedDate, -1));
      return;
    }

    if (event.key === 'PageDown') {
      event.preventDefault();
      this.focusDate(addMonths(this.focusedDate, 1));
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.selectDate(this.focusedDate);
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      this.close(true);
    }
  }

  previous(): void {
    if (this.currentView === 'year') {
      this.shiftYearPage(-12);
      return;
    }
    this.viewDate = addMonths(this.viewDate, -1);
    this.changeDetectorRef.markForCheck();
  }

  next(): void {
    if (this.currentView === 'year') {
      this.shiftYearPage(12);
      return;
    }
    this.viewDate = addMonths(this.viewDate, 1);
    this.changeDetectorRef.markForCheck();
  }

  showMonthView(): void {
    this.currentView = 'month';
  }

  showYearView(): void {
    this.currentView = 'year';
    this.yearPageStart = this.viewDate.getFullYear() - 5;
  }

  selectMonth(month: number): void {
    this.viewDate = new Date(this.viewDate.getFullYear(), month, 1);
    this.focusedDate = clampToMonth(this.focusedDate, this.viewDate);
    this.currentView = 'date';
  }

  selectYear(year: number): void {
    this.viewDate = new Date(year, this.viewDate.getMonth(), 1);
    this.focusedDate = clampToMonth(this.focusedDate, this.viewDate);
    this.currentView = 'month';
  }

  shiftYearPage(offset: number): void {
    this.yearPageStart += offset;
  }

  selectToday(): void {
    this.selectDate(this.todayDate);
  }

  selectDate(date: Date): void {
    const nextDate = startOfDay(date);
    if (this.isDateDisabled(nextDate)) {
      return;
    }
    this.commit(nextDate, true);
    this.close(true);
  }

  clearValue(event?: Event): void {
    event?.stopPropagation();
    if (this.isDisabled || this.readonly()) {
      return;
    }
    this.commit(null, true);
    this.clear.emit();
    this.close(true);
  }

  isDateDisabled(date: Date): boolean {
    const normalized = startOfDay(date);
    const min = this.minDateValue;
    const max = this.maxDateValue;

    return (
      (min ? normalized.getTime() < min.getTime() : false) ||
      (max ? normalized.getTime() > max.getTime() : false) ||
      this.disabledDates().some((disabledDate) => {
        const candidate = normalizeDate(disabledDate);
        return !!candidate && sameDate(candidate, normalized);
      })
    );
  }

  dayClasses(day: JCalendarDay): string {
    return [
      'j-date-picker__day',
      day.inMonth ? '' : 'is-outside',
      day.today ? 'is-today' : '',
      day.selected ? 'is-selected' : '',
      day.focused ? 'is-focused' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  dayContext(day: JCalendarDay): JDatePickerDayContext {
    return {
      $implicit: day.date,
      date: day.date,
      label: day.label,
      selected: day.selected,
      today: day.today,
      disabled: day.disabled,
      inMonth: day.inMonth,
    };
  }

  cloneDate(date: Date): Date {
    return cloneDate(date);
  }

  private focusDate(date: Date): void {
    this.focusedDate = startOfDay(date);
    this.viewDate = startOfMonth(this.focusedDate);
    this.changeDetectorRef.markForCheck();
  }

  private commit(date: Date | null, emitSelect: boolean): void {
    this.selectedValue = this.dataType() === 'string' && date ? toInputDate(date) : date;
    this.inputValue = date ? formatDate(date, this.dateFormat()) : '';
    this.onChange(this.selectedValue);
    this.valueChange.emit(this.selectedValue);
    if (emitSelect) {
      this.select.emit(this.selectedValue);
    }
    this.changeDetectorRef.markForCheck();
  }
}

function normalizeDate(value: Date | string | null | undefined): Date | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : startOfDay(value);
  }

  return parseDate(value);
}

function parseDate(value: string): Date | null {
  const trimmed = value.trim();
  const match = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(trimmed);

  if (!match) {
    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? null : startOfDay(parsed);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? startOfDay(date)
    : null;
}

function formatDate(date: Date, format: string): string {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return format.replace(/yyyy/g, year).replace(/MM/g, month).replace(/dd/g, day);
}

function toInputDate(date: Date): string {
  return formatDate(date, 'yyyy-MM-dd');
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addDays(date: Date, amount: number): Date {
  const next = cloneDate(date);
  next.setDate(next.getDate() + amount);
  return startOfDay(next);
}

function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, Math.min(date.getDate(), 28));
}

function sameDate(left: Date, right: Date): boolean {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate();
}

function cloneDate(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function clampToMonth(date: Date, monthDate: Date): Date {
  return new Date(monthDate.getFullYear(), monthDate.getMonth(), Math.min(date.getDate(), 28));
}
