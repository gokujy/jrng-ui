import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  inject,
  output,
} from '@angular/core';

interface JCalendarCell {
  readonly date: Date;
  readonly label: number;
  readonly inMonth: boolean;
  readonly today: boolean;
  readonly selected: boolean;
  readonly disabled: boolean;
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
        class="j-calendar__grid"
        role="grid"
        [attr.aria-label]="monthNames[viewDate.getMonth()] + ' ' + viewDate.getFullYear()"
      >
        @for (dayName of dayNames; track dayName) {
          <span class="j-calendar__weekday" role="columnheader">{{ dayName }}</span>
        }
        @for (cell of cells; track cell.date.getTime()) {
          <button
            type="button"
            role="gridcell"
            [class]="cellClasses(cell)"
            [disabled]="cell.disabled"
            [attr.aria-selected]="cell.selected"
            [attr.aria-current]="cell.today ? 'date' : null"
            [attr.data-j-selected]="cell.selected ? 'true' : null"
            [attr.data-j-disabled]="cell.disabled ? 'true' : null"
            (click)="selectDate(cell.date)"
            (keydown)="handleKeydown($event, cell.date)"
          >
            {{ cell.label }}
          </button>
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

  @Input() minDate: Date | string | null = null;
  @Input() maxDate: Date | string | null = null;
  @Input() disabledDates: readonly (Date | string)[] = [];

  readonly dateSelect = output<Date>();
  readonly monthChange = output<Date>();

  readonly dayNames = DAY_NAMES;
  readonly monthNames = MONTH_NAMES;
  readonly today = startOfDay(new Date());

  viewDate = startOfMonth(new Date());
  selectedDate: Date | null = null;

  @Input()
  set value(value: Date | string | null | undefined) {
    this.selectedDate = normalizeDate(value);
    this.viewDate = startOfMonth(this.selectedDate ?? this.today);
    this.changeDetectorRef.markForCheck();
  }

  @Input()
  set activeDate(value: Date | string | null | undefined) {
    const active = normalizeDate(value);
    if (active) {
      this.viewDate = startOfMonth(active);
      this.changeDetectorRef.markForCheck();
    }
  }

  get cells(): readonly JCalendarCell[] {
    const first = startOfMonth(this.viewDate);
    const gridStart = addDays(first, -first.getDay());
    return Array.from({ length: 42 }, (_, index) => {
      const date = addDays(gridStart, index);
      return {
        date,
        label: date.getDate(),
        inMonth: date.getMonth() === this.viewDate.getMonth(),
        today: sameDate(date, this.today),
        selected: !!this.selectedDate && sameDate(date, this.selectedDate),
        disabled: this.isDisabled(date),
      };
    });
  }

  previousMonth(): void {
    this.viewDate = addMonths(this.viewDate, -1);
    this.monthChange.emit(this.viewDate);
  }

  nextMonth(): void {
    this.viewDate = addMonths(this.viewDate, 1);
    this.monthChange.emit(this.viewDate);
  }

  selectDate(date: Date): void {
    if (this.isDisabled(date)) {
      return;
    }
    this.selectedDate = startOfDay(date);
    this.dateSelect.emit(this.selectedDate);
    this.changeDetectorRef.markForCheck();
  }

  handleKeydown(event: KeyboardEvent, date: Date): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.selectDate(date);
    }
  }

  cellClasses(cell: JCalendarCell): string {
    return [
      'j-calendar__cell',
      cell.inMonth ? '' : 'is-outside',
      cell.today ? 'is-today' : '',
      cell.selected ? 'is-selected' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  private isDisabled(date: Date): boolean {
    const normalized = startOfDay(date);
    const min = normalizeDate(this.minDate);
    const max = normalizeDate(this.maxDate);
    return (
      (min ? normalized < min : false) ||
      (max ? normalized > max : false) ||
      this.disabledDates.some((disabledDate) => {
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
