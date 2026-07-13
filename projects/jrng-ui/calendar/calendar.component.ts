import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  PLATFORM_ID,
  ViewChild,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { JRNG_LOCALE } from 'jrng-ui/core';

interface JCalendarCell {
  readonly date: Date;
  readonly label: number;
  readonly inMonth: boolean;
  readonly today: boolean;
  readonly selected: boolean;
  readonly focused: boolean;
  readonly disabled: boolean;
}

@Component({
  selector: 'j-calendar',
  template: `
    <section class="j-calendar" data-jc-name="calendar" data-jc-section="root">
      <header class="j-calendar__header" data-jc-section="header">
        <button
          type="button"
          class="j-calendar__nav"
          aria-label="Previous month"
          (click)="previousMonth()"
        >
          &lt;
        </button>
        <span class="j-calendar__heading"
          >{{ monthNames[viewDate.getMonth()] }} {{ viewDate.getFullYear() }}</span
        >
        <button type="button" class="j-calendar__nav" aria-label="Next month" (click)="nextMonth()">
          &gt;
        </button>
      </header>

      <div
        #grid
        class="j-calendar__grid"
        role="grid"
        tabindex="-1"
        [attr.aria-label]="monthNames[viewDate.getMonth()] + ' ' + viewDate.getFullYear()"
        (keydown)="handleGridKeydown($event)"
      >
        <div class="j-calendar__row" role="row">
          @for (dayName of dayNames; track dayName) {
            <span class="j-calendar__weekday" role="columnheader">{{ dayName }}</span>
          }
        </div>
        @for (week of weeks; track $index) {
          <div class="j-calendar__row" role="row">
            @for (cell of week; track cell.date.getTime()) {
              <button
                type="button"
                role="gridcell"
                [class]="cellClasses(cell)"
                [disabled]="cell.disabled"
                [attr.tabindex]="cell.focused ? '0' : '-1'"
                [attr.aria-selected]="cell.selected"
                [attr.aria-current]="cell.today ? 'date' : null"
                [attr.data-j-selected]="cell.selected ? 'true' : null"
                [attr.data-j-focused]="cell.focused ? 'true' : null"
                [attr.data-j-disabled]="cell.disabled ? 'true' : null"
                (focus)="focusedDate = cloneDate(cell.date)"
                (click)="selectDate(cell.date)"
              >
                {{ cell.label }}
              </button>
            }
          </div>
        }
      </div>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .j-calendar {
        background: var(--j-color-card);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-card-radius, var(--j-radius-lg));
        color: var(--j-color-card-foreground);
        padding: var(--j-spacing-3);
      }

      .j-calendar__header {
        align-items: center;
        display: flex;
        justify-content: space-between;
        margin-bottom: var(--j-spacing-3);
      }

      .j-calendar__heading {
        font-weight: var(--j-font-weight-semibold);
      }

      .j-calendar__nav,
      .j-calendar__cell {
        border: 0;
        border-radius: var(--j-radius-sm);
        cursor: pointer;
        font: inherit;
      }

      .j-calendar__nav {
        background: var(--j-color-muted);
        color: var(--j-color-muted-foreground);
        min-height: 2rem;
        min-width: 2rem;
      }

      .j-calendar__grid {
        display: grid;
        gap: var(--j-spacing-1);
        grid-template-columns: repeat(7, minmax(0, 1fr));
      }

      /* Rows exist for ARIA grid semantics only; keep cells in the CSS grid. */
      .j-calendar__row {
        display: contents;
      }

      .j-calendar__weekday {
        color: var(--j-color-muted-foreground);
        font-size: var(--j-font-size-xs);
        font-weight: var(--j-font-weight-semibold);
        text-align: center;
      }

      .j-calendar__cell {
        aspect-ratio: 1;
        background: transparent;
        color: inherit;
      }

      .j-calendar__cell.is-outside {
        color: var(--j-color-muted-foreground);
      }

      .j-calendar__cell.is-today {
        box-shadow: inset 0 0 0 1px var(--j-color-ring);
      }

      .j-calendar__cell.is-selected {
        background: var(--j-color-primary);
        color: var(--j-color-primary-foreground);
      }

      .j-calendar__cell:hover:not(:disabled):not(.is-selected),
      .j-calendar__nav:hover {
        background: var(--j-color-muted);
      }

      .j-calendar__cell.is-selected:hover:not(:disabled) {
        background: var(--j-color-primary);
        color: var(--j-color-primary-foreground);
      }

      .j-calendar__cell:focus-visible,
      .j-calendar__nav:focus-visible {
        box-shadow: var(--j-focus-ring);
        outline: 2px solid transparent;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JCalendarComponent {
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly locale = inject(JRNG_LOCALE);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  @ViewChild('grid') private gridRef?: ElementRef<HTMLElement>;

  readonly minDate = input<Date | string | null>(null);
  readonly maxDate = input<Date | string | null>(null);
  readonly disabledDates = input<readonly (Date | string)[]>([]);

  readonly dateSelect = output<Date>();
  readonly monthChange = output<Date>();

  viewDate = startOfMonth(new Date());
  selectedDate: Date | null = null;
  /** Day that owns the roving tabindex / keyboard focus within the grid. */
  focusedDate = startOfDay(new Date());

  constructor() {
    effect(() => {
      this.selectedDate = normalizeDate(this.value());
      const anchor = this.selectedDate ?? this.today;
      this.viewDate = startOfMonth(anchor);
      this.focusedDate = cloneDate(anchor);
      this.changeDetectorRef.markForCheck();
    });
    effect(() => {
      const active = normalizeDate(this.activeDate());
      if (active) {
        this.viewDate = startOfMonth(active);
        this.focusedDate = cloneDate(active);
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  /** Today, recomputed on read so it never goes stale after midnight. */
  get today(): Date {
    return startOfDay(new Date());
  }

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

  readonly value = input<Date | string | null | undefined>(undefined);
  readonly activeDate = input<Date | string | null | undefined>(undefined);

  get cells(): readonly JCalendarCell[] {
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
        selected: !!this.selectedDate && sameDate(date, this.selectedDate),
        focused: sameDate(date, this.focusedDate),
        disabled: this.isDisabled(date),
      };
    });
  }

  /** The 42 cells grouped into six ARIA rows of seven days. */
  get weeks(): readonly (readonly JCalendarCell[])[] {
    const cells = this.cells;
    return Array.from({ length: 6 }, (_, index) => cells.slice(index * 7, index * 7 + 7));
  }

  previousMonth(): void {
    this.viewDate = addMonths(this.viewDate, -1);
    this.focusedDate = clampToMonth(this.focusedDate, this.viewDate);
    this.monthChange.emit(this.viewDate);
    this.changeDetectorRef.markForCheck();
  }

  nextMonth(): void {
    this.viewDate = addMonths(this.viewDate, 1);
    this.focusedDate = clampToMonth(this.focusedDate, this.viewDate);
    this.monthChange.emit(this.viewDate);
    this.changeDetectorRef.markForCheck();
  }

  selectDate(date: Date): void {
    if (this.isDisabled(date)) {
      return;
    }
    this.selectedDate = startOfDay(date);
    this.dateSelect.emit(this.selectedDate);
    this.changeDetectorRef.markForCheck();
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

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.selectDate(this.focusedDate);
    }
  }

  cellClasses(cell: JCalendarCell): string {
    return [
      'j-calendar__cell',
      cell.inMonth ? '' : 'is-outside',
      cell.today ? 'is-today' : '',
      cell.selected ? 'is-selected' : '',
      cell.focused ? 'is-focused' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  cloneDate(date: Date): Date {
    return cloneDate(date);
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

  private isDisabled(date: Date): boolean {
    const normalized = startOfDay(date);
    const min = normalizeDate(this.minDate());
    const max = normalizeDate(this.maxDate());
    return (
      (min ? normalized < min : false) ||
      (max ? normalized > max : false) ||
      this.disabledDates().some((disabledDate) => {
        const candidate = normalizeDate(disabledDate);
        return !!candidate && sameDate(candidate, normalized);
      })
    );
  }
}

function normalizeDate(value: Date | string | null | undefined): Date | null {
  if (!value) {
    return null;
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : startOfDay(value);
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : startOfDay(parsed);
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addDays(date: Date, amount: number): Date {
  const next = new Date(date);
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
