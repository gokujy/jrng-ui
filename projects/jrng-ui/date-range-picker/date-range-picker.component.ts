import { isPlatformBrowser } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  forwardRef,
  inject,
  input,
  PLATFORM_ID,
  ViewChild,
  output,
  signal,
  untracked,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { jAriaDescribedBy } from 'jrng-ui/core';
import { JAppendTo, JClickOutsideDirective, JOverlayHandle, JOverlayService } from 'jrng-ui/core';
import { JRNG_LOCALE } from 'jrng-ui/core';
import { JPassThrough } from 'jrng-ui/core';
import { JSize } from 'jrng-ui/core';
import { jCreateId } from 'jrng-ui/core';

export interface JDateRangeValue {
  readonly start: string | Date | null;
  readonly end: string | Date | null;
}

export type JDateRangeInputValue =
  JDateRangeValue | readonly [string | Date | null, string | Date | null];

interface JRangeDay {
  readonly date: Date;
  readonly label: number;
  readonly inMonth: boolean;
  readonly today: boolean;
  readonly start: boolean;
  readonly end: boolean;
  readonly inRange: boolean;
  readonly preview: boolean;
  readonly focused: boolean;
  readonly disabled: boolean;
}

interface JRangePreset {
  readonly label: string;
  readonly start: Date;
  readonly end: Date;
}

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
      [attr.data-j-disabled]="isDisabled() ? 'true' : null"
      [attr.data-j-invalid]="hasError ? 'true' : null"
      [attr.data-j-open]="isOpen ? 'true' : null"
    >
      @if (label()) {
        <span class="j-date-range-picker__label" [id]="labelId">
          <span>{{ label() }}</span>
          @if (required()) {
            <span class="j-date-range-picker__required" aria-hidden="true">*</span>
          }
        </span>
      }

      <div class="j-date-range-picker__control-wrapper">
        <button
          class="j-date-range-picker__control"
          type="button"
          [disabled]="isDisabled() || readonly()"
        [attr.aria-labelledby]="label() ? labelId : null"
        [attr.aria-describedby]="describedBy"
        [attr.aria-invalid]="hasError ? 'true' : null"
        [attr.aria-expanded]="isOpen"
        [attr.aria-controls]="isOpen ? panelId : null"
        (click)="toggle()"
        (keydown)="handleTriggerKeydown($event)"
        >
          <span class="j-date-range-picker__value" [class.is-placeholder]="!startDate && !endDate">
            {{ displayValue || placeholder() }}
          </span>
          <span class="j-date-range-picker__icon" aria-hidden="true">cal</span>
        </button>
        @if (canClear) {
          <button
            type="button"
            class="j-date-range-picker__clear"
            (click)="clearValue($event)"
            [attr.aria-label]="locale.clear"
          >
            x
          </button>
        }
      </div>

      @if (isOpen) {
        <div
          #panel
          class="j-date-range-picker__panel"
          [id]="panelId"
          role="dialog"
          data-jc-section="panel"
        >
          <div class="j-date-range-picker__presets" aria-label="Date range presets">
            @for (preset of presets; track preset.label) {
              <button
                type="button"
                class="j-date-range-picker__preset"
                (click)="applyPreset(preset)"
              >
                {{ preset.label }}
              </button>
            }
          </div>

          <div class="j-date-range-picker__calendar">
            <div class="j-date-range-picker__header">
              <button
                type="button"
                class="j-date-range-picker__nav"
                aria-label="Previous month"
                (click)="previousMonth()"
              >
                &lt;
              </button>
              <span class="j-date-range-picker__heading"
                >{{ monthNames[viewDate.getMonth()] }} {{ viewDate.getFullYear() }}</span
              >
              <button
                type="button"
                class="j-date-range-picker__nav"
                aria-label="Next month"
                (click)="nextMonth()"
              >
                &gt;
              </button>
            </div>

            <div
              #grid
              class="j-date-range-picker__grid"
              role="grid"
              tabindex="0"
              [attr.aria-label]="monthNames[viewDate.getMonth()] + ' ' + viewDate.getFullYear()"
              (keydown)="handleGridKeydown($event)"
            >
              <div class="j-date-range-picker__row" role="row">
                @for (dayName of dayNames; track dayName) {
                  <span class="j-date-range-picker__weekday" role="columnheader">{{
                    dayName
                  }}</span>
                }
              </div>
              @for (week of calendarWeeks; track $index) {
                <div class="j-date-range-picker__row" role="row">
                  @for (day of week; track day.date.getTime()) {
                    <button
                      type="button"
                      role="gridcell"
                      [class]="dayClasses(day)"
                      [disabled]="day.disabled"
                      [attr.tabindex]="day.focused ? '0' : '-1'"
                      [attr.aria-selected]="day.start || day.end || day.inRange"
                      [attr.aria-current]="day.today ? 'date' : null"
                      [attr.data-j-selected]="day.start || day.end || day.inRange ? 'true' : null"
                      [attr.data-j-focused]="day.focused ? 'true' : null"
                      [attr.data-j-disabled]="day.disabled ? 'true' : null"
                      (mouseenter)="hoverDate = clone(day.date)"
                      (focus)="onDayFocus(day.date)"
                      (click)="selectDate(day.date)"
                    >
                      {{ day.label }}
                    </button>
                  }
                </div>
              }
            </div>
          </div>

          <div class="j-date-range-picker__bar">
            <span class="j-date-range-picker__selection">{{ displayValue || placeholder() }}</span>
            <button
              type="button"
              class="j-date-range-picker__bar-button"
              [disabled]="!startDate && !endDate"
              (click)="clearValue()"
            >
              {{ locale.clear }}
            </button>
          </div>
        </div>
      }

      @if (hasError && error()) {
        <p class="j-date-range-picker__message j-date-range-picker__message--error" [id]="errorId">
          {{ error() }}
        </p>
      }
      @if (hint() && !hasError) {
        <p class="j-date-range-picker__message" [id]="hintId">{{ hint() }}</p>
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

      .j-date-range-picker__control-wrapper {
        align-items: center;
        display: flex;
        position: relative;
      }

      .j-date-range-picker__control-wrapper .j-date-range-picker__control {
        padding-inline-end: 4rem;
      }

      .j-date-range-picker__clear {
        background: transparent;
        border: 0;
        cursor: pointer;
        inset-inline-end: 2.5rem;
        position: absolute;
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

      /* Rows exist for ARIA grid semantics only; keep cells in the CSS grid. */
      .j-date-range-picker__row {
        display: contents;
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
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly overlay = inject(JOverlayService);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild('grid') private gridRef?: ElementRef<HTMLElement>;
  @ViewChild('panel') private panelRef?: ElementRef<HTMLElement>;
  private overlayHandle?: JOverlayHandle;

  readonly locale = inject(JRNG_LOCALE);
  readonly labelId = jCreateId('j-date-range-picker-label');
  readonly hintId = jCreateId('j-date-range-picker-hint');
  readonly errorId = jCreateId('j-date-range-picker-error');
  readonly panelId = jCreateId('j-date-range-picker-panel');

  /** First day of week from the active locale (0 = Sunday, 1 = Monday). */
  get firstDayOfWeek(): number {
    return this.locale.firstDayOfWeek;
  }

  /** Localized full month names. */
  get monthNames(): readonly string[] {
    return this.locale.monthNames;
  }

  /** Localized weekday headers, ordered by the locale's first day of week. */
  get dayNames(): readonly string[] {
    const short = this.locale.dayNamesShort;
    return Array.from({ length: 7 }, (_, index) => short[(this.firstDayOfWeek + index) % 7]);
  }

  /** Today, recomputed on read so it never goes stale after midnight. */
  get today(): Date {
    return startOfDay(new Date());
  }

  readonly label = input('');
  readonly placeholder = input('Select date range');
  readonly hint = input('');
  readonly error = input('');
  readonly styleClass = input('');
  readonly variant = input<'outlined' | 'filled'>('outlined');
  readonly size = input<JSize>('md');
  readonly dataType = input<'date' | 'string'>('string');
  readonly appendTo = input<JAppendTo | undefined>(undefined);
  readonly pt = input<JPassThrough | null>(null);
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly showClear = input(true, { transform: booleanAttribute });

  readonly valueChange = output<JDateRangeValue>();
  readonly select = output<JDateRangeValue>();
  readonly clear = output<void>();
  readonly opened = output<void>();
  readonly closed = output<void>();

  startDate: Date | null = null;
  endDate: Date | null = null;
  hoverDate: Date | null = null;
  /** Day that owns the roving tabindex / keyboard focus within the grid. */
  focusedDate = startOfDay(new Date());
  viewDate = startOfMonth(new Date());
  readonly formDisabled = signal(false);
  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  isOpen = false;

  private onChange: (value: JDateRangeValue) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  readonly value = input<JDateRangeInputValue | null>();
  readonly minDate = input<Date | string | null>();
  readonly maxDate = input<Date | string | null>();
  readonly disabled = input(false, { transform: booleanAttribute });

  constructor() {
    this.destroyRef.onDestroy(() => this.overlayHandle?.detach());
    effect(() => {
      const value = this.value();
      if (value !== undefined) {
        untracked(() => this.writeValue(value));
      }
    });
  }

  get hasError(): boolean {
    return this.invalid() || this.error().trim().length > 0;
  }

  get describedBy(): string | null {
    return jAriaDescribedBy(this.hasError ? this.errorId : null, this.hint() ? this.hintId : null);
  }

  get canClear(): boolean {
    return (
      this.showClear() &&
      (this.startDate != null || this.endDate != null) &&
      !this.isDisabled() &&
      !this.readonly()
    );
  }

  get rootClasses(): string {
    return [
      'j-date-range-picker',
      `j-date-range-picker--${this.size()}`,
      `j-date-range-picker--${this.variant()}`,
      this.hasError ? 'is-invalid' : '',
      this.isDisabled() ? 'is-disabled' : '',
      this.isOpen ? 'is-open' : '',
      this.styleClass(),
      this.pt()?.['root']?.['class'] ?? '',
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
    const offset = (first.getDay() - this.firstDayOfWeek + 7) % 7;
    const gridStart = addDays(first, -offset);
    const today = this.today;
    return Array.from({ length: 42 }, (_, index) => {
      const date = addDays(gridStart, index);
      return {
        date,
        label: date.getDate(),
        inMonth: date.getMonth() === this.viewDate.getMonth(),
        today: sameDate(date, today),
        start: !!this.startDate && sameDate(date, this.startDate),
        end: !!this.endDate && sameDate(date, this.endDate),
        inRange: this.isBetween(date, this.startDate, this.endDate),
        preview: this.isPreview(date),
        focused: sameDate(date, this.focusedDate),
        disabled: this.isDateDisabled(date),
      };
    });
  }

  /** The 42 day cells grouped into six ARIA rows of seven days. */
  get calendarWeeks(): readonly (readonly JRangeDay[])[] {
    const days = this.calendarDays;
    return Array.from({ length: 6 }, (_, index) => days.slice(index * 7, index * 7 + 7));
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

    const anchor = this.startDate ?? this.today;
    this.viewDate = startOfMonth(anchor);
    this.focusedDate = cloneDate(anchor);
    this.changeDetectorRef.markForCheck();
  }

  registerOnChange(fn: (value: JDateRangeValue) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
    if (isDisabled) {
      this.close();
    }
    this.changeDetectorRef.markForCheck();
  }

  toggle(): void {
    this.isOpen ? this.close() : this.open();
  }

  open(): void {
    if (this.isDisabled() || this.readonly() || this.isOpen) {
      return;
    }
    this.isOpen = true;
    const anchor = this.startDate ?? this.today;
    this.viewDate = startOfMonth(anchor);
    this.focusedDate = cloneDate(anchor);
    this.opened.emit();
    this.changeDetectorRef.markForCheck();
    queueMicrotask(() => {
      const panel = this.panelRef?.nativeElement;
      if (panel) {
        this.overlayHandle = this.overlay.attach(this.hostRef.nativeElement, panel, {
          appendTo: this.appendTo(),
          matchWidth: false,
        });
      }
    });
  }

  close(): void {
    if (!this.isOpen) {
      return;
    }
    this.overlayHandle?.detach();
    this.overlayHandle = undefined;
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

  /** Keep hover-preview and roving focus in sync when a cell is focused. */
  onDayFocus(date: Date): void {
    this.hoverDate = cloneDate(date);
    this.focusedDate = cloneDate(date);
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
      const toWeekStart = (this.focusedDate.getDay() - this.firstDayOfWeek + 7) % 7;
      this.focusDate(addDays(this.focusedDate, -toWeekStart));
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      const toWeekEnd = 6 - ((this.focusedDate.getDay() - this.firstDayOfWeek + 7) % 7);
      this.focusDate(addDays(this.focusedDate, toWeekEnd));
      return;
    }

    if (event.key === 'PageUp') {
      event.preventDefault();
      // addMonths pins to the 1st, so re-apply the focused day within that month.
      this.focusDate(clampToMonth(this.focusedDate, addMonths(this.focusedDate, -1)));
      return;
    }

    if (event.key === 'PageDown') {
      event.preventDefault();
      this.focusDate(clampToMonth(this.focusedDate, addMonths(this.focusedDate, 1)));
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.selectDate(this.focusedDate);
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
    }
  }

  /** Move the roving focus, shift the visible month, and follow with DOM focus. */
  private focusDate(date: Date): void {
    this.focusedDate = startOfDay(date);
    this.viewDate = startOfMonth(this.focusedDate);
    this.changeDetectorRef.markForCheck();
    this.focusActiveCell();
  }

  private focusActiveCell(): void {
    if (!this.isBrowser) {
      return;
    }
    queueMicrotask(() => {
      const cell =
        this.gridRef?.nativeElement.querySelector<HTMLButtonElement>('[data-j-focused="true"]');
      cell?.focus();
    });
  }

  previousMonth(): void {
    this.viewDate = addMonths(this.viewDate, -1);
    this.focusedDate = clampToMonth(this.focusedDate, this.viewDate);
    this.changeDetectorRef.markForCheck();
  }

  nextMonth(): void {
    this.viewDate = addMonths(this.viewDate, 1);
    this.focusedDate = clampToMonth(this.focusedDate, this.viewDate);
    this.changeDetectorRef.markForCheck();
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
    if (this.isDisabled() || this.readonly()) {
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
      day.focused ? 'is-focused' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  isDateDisabled(date: Date): boolean {
    const normalized = startOfDay(date);
    const min = normalizeDate(this.minDate());
    const max = normalizeDate(this.maxDate());
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
      start:
        this.dataType() === 'string' && this.startDate
          ? formatDate(this.startDate)
          : this.startDate,
      end: this.dataType() === 'string' && this.endDate ? formatDate(this.endDate) : this.endDate,
    };
  }

  private isPreview(date: Date): boolean {
    return (
      !!this.startDate && !this.endDate && this.isBetween(date, this.startDate, this.hoverDate)
    );
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
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function cloneDate(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Keep the focused day-of-month within `monthDate`, clamped to its last valid day. */
function clampToMonth(date: Date, monthDate: Date): Date {
  const lastDay = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
  return new Date(monthDate.getFullYear(), monthDate.getMonth(), Math.min(date.getDate(), lastDay));
}
