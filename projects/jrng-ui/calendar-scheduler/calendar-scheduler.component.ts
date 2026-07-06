import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';

export type JCalendarSchedulerView = 'day' | 'week' | 'month';

export interface JCalendarSchedulerEvent {
  readonly id: string;
  readonly title: string;
  readonly start: Date | string;
  readonly end?: Date | string;
  readonly color?: string;
  readonly data?: unknown;
}

export interface JCalendarSchedulerEventClick {
  readonly event: JCalendarSchedulerEvent;
  readonly date: Date;
}

export interface JCalendarSchedulerDateClick {
  readonly date: Date;
  readonly view: JCalendarSchedulerView;
}

interface JCalendarDay {
  readonly date: Date;
  readonly label: string;
  readonly muted: boolean;
  readonly today: boolean;
  readonly events: readonly JCalendarSchedulerEvent[];
}

@Component({
  selector: 'j-calendar-scheduler',
  imports: [],
  template: `
    <section
      class="j-calendar-scheduler"
      [class]="styleClass()"
      data-jc-name="calendar-scheduler"
      data-jc-section="root"
      [attr.aria-label]="ariaLabel()"
    >
      <header class="j-calendar-scheduler__toolbar" data-jc-section="toolbar">
        <div>
          <strong>{{ title() }}</strong>
          <span>{{ view() }}</span>
        </div>
        <div class="j-calendar-scheduler__actions">
          <button type="button" (click)="previous()">Previous</button>
          <button type="button" (click)="today()">Today</button>
          <button type="button" (click)="next()">Next</button>
          <select [value]="view()" (change)="setView($event)" aria-label="Scheduler view">
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
          </select>
        </div>
      </header>

      <div class="j-calendar-scheduler__weekdays" aria-hidden="true">
        @for (day of weekdayLabels; track day) {
          <span>{{ day }}</span>
        }
      </div>

      <div
        class="j-calendar-scheduler__grid"
        [class.j-calendar-scheduler__grid--day]="view() === 'day'"
        [class.j-calendar-scheduler__grid--week]="view() === 'week'"
      >
        @for (day of visibleDays(); track day.date.toISOString()) {
          <button
            type="button"
            class="j-calendar-scheduler__day"
            [class.is-muted]="day.muted"
            [class.is-today]="day.today"
            [attr.aria-label]="day.label"
            (click)="dateClick.emit({ date: day.date, view: view() })"
          >
            <span class="j-calendar-scheduler__date">{{ day.date.getDate() }}</span>
            <span class="j-calendar-scheduler__events">
              @for (event of day.events; track event.id) {
                <span
                  class="j-calendar-scheduler__event"
                  [style.--j-event-color]="event.color || null"
                  (click)="handleEventClick($event, event, day.date)"
                >
                  {{ event.title }}
                </span>
              }
            </span>
          </button>
        }
      </div>
    </section>
  `,
  styles: [
    `
      .j-calendar-scheduler {
        background: var(--j-color-card);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-lg);
        color: var(--j-color-card-foreground);
        display: grid;
        gap: var(--j-spacing-3);
        padding: var(--j-spacing-4);
      }

      .j-calendar-scheduler__toolbar {
        align-items: center;
        display: flex;
        gap: var(--j-spacing-3);
        justify-content: space-between;
      }

      .j-calendar-scheduler__toolbar span {
        color: var(--j-color-muted-foreground);
        display: block;
        font-size: var(--j-font-size-sm);
        text-transform: capitalize;
      }

      .j-calendar-scheduler__actions {
        display: flex;
        flex-wrap: wrap;
        gap: var(--j-spacing-2);
      }

      .j-calendar-scheduler__actions button,
      .j-calendar-scheduler__actions select {
        background: var(--j-color-card);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-md);
        color: inherit;
        cursor: pointer;
        font: inherit;
        min-height: 2.25rem;
        padding: 0 var(--j-spacing-3);
      }

      .j-calendar-scheduler__weekdays,
      .j-calendar-scheduler__grid {
        display: grid;
        grid-template-columns: repeat(7, minmax(0, 1fr));
      }

      .j-calendar-scheduler__weekdays {
        color: var(--j-color-muted-foreground);
        font-size: var(--j-font-size-sm);
        font-weight: var(--j-font-weight-semibold);
        gap: var(--j-spacing-2);
      }

      .j-calendar-scheduler__grid {
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-lg);
        overflow: hidden;
      }

      .j-calendar-scheduler__grid--day {
        grid-template-columns: 1fr;
      }

      .j-calendar-scheduler__grid--week {
        grid-template-columns: repeat(7, minmax(9rem, 1fr));
        overflow-x: auto;
      }

      .j-calendar-scheduler__day {
        background: var(--j-color-card);
        border: 0;
        border-right: 1px solid var(--j-color-border);
        border-bottom: 1px solid var(--j-color-border);
        color: inherit;
        cursor: pointer;
        display: grid;
        gap: var(--j-spacing-2);
        min-height: 7rem;
        padding: var(--j-spacing-2);
        text-align: start;
      }

      .j-calendar-scheduler__day.is-muted {
        background: var(--j-color-muted);
        color: var(--j-color-muted-foreground);
      }

      .j-calendar-scheduler__day.is-today {
        box-shadow: inset 0 0 0 2px var(--j-color-primary);
      }

      .j-calendar-scheduler__date {
        font-weight: var(--j-font-weight-semibold);
      }

      .j-calendar-scheduler__events {
        display: grid;
        gap: var(--j-spacing-1);
        align-content: start;
      }

      .j-calendar-scheduler__event {
        background: var(--j-event-color, var(--j-color-primary));
        border-radius: var(--j-radius-sm);
        color: var(--j-color-primary-foreground);
        overflow: hidden;
        padding: var(--j-spacing-1) var(--j-spacing-2);
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .j-calendar-scheduler__actions button:focus-visible,
      .j-calendar-scheduler__actions select:focus-visible,
      .j-calendar-scheduler__day:focus-visible {
        box-shadow: var(--j-focus-ring);
        outline: none;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JCalendarSchedulerComponent {
  readonly events = input<readonly JCalendarSchedulerEvent[]>([]);
  readonly view = model<JCalendarSchedulerView>('month');
  readonly activeDate = model<Date>(new Date());
  readonly ariaLabel = input('Calendar scheduler');
  readonly styleClass = input('');

  readonly eventClick = output<JCalendarSchedulerEventClick>();
  readonly dateClick = output<JCalendarSchedulerDateClick>();
  readonly viewChange = output<JCalendarSchedulerView>();

  readonly weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

  readonly title = computed(() => {
    const date = this.activeDate();
    if (this.view() === 'day') {
      return formatDate(date);
    }
    if (this.view() === 'week') {
      const start = startOfWeek(date);
      const end = addDays(start, 6);
      return `${formatDate(start)} - ${formatDate(end)}`;
    }
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  });

  readonly visibleDays = computed<readonly JCalendarDay[]>(() => {
    const active = this.activeDate();
    if (this.view() === 'day') {
      return [this.dayView(active, false)];
    }
    if (this.view() === 'week') {
      const start = startOfWeek(active);
      return Array.from({ length: 7 }, (_, index) => this.dayView(addDays(start, index), false));
    }
    const monthStart = new Date(active.getFullYear(), active.getMonth(), 1);
    const gridStart = startOfWeek(monthStart);
    return Array.from({ length: 42 }, (_, index) => {
      const date = addDays(gridStart, index);
      return this.dayView(date, date.getMonth() !== active.getMonth());
    });
  });

  today(): void {
    this.activeDate.set(new Date());
  }

  next(): void {
    this.activeDate.set(addByView(this.activeDate(), this.view(), 1));
  }

  previous(): void {
    this.activeDate.set(addByView(this.activeDate(), this.view(), -1));
  }

  setView(event: Event): void {
    const value = (event.target as HTMLSelectElement | null)?.value as
      JCalendarSchedulerView | undefined;
    if (!value) {
      return;
    }
    this.view.set(value);
    this.viewChange.emit(value);
  }

  handleEventClick(event: Event, schedulerEvent: JCalendarSchedulerEvent, date: Date): void {
    event.stopPropagation();
    this.eventClick.emit({ event: schedulerEvent, date });
  }

  private dayView(date: Date, muted: boolean): JCalendarDay {
    return {
      date,
      label: formatDate(date),
      muted,
      today: isSameDay(date, new Date()),
      events: this.events().filter((event) => eventOccursOn(event, date)),
    };
  }
}

function startOfWeek(date: Date): Date {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  next.setDate(next.getDate() - next.getDay());
  return next;
}

function addDays(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function addByView(date: Date, view: JCalendarSchedulerView, direction: number): Date {
  const next = new Date(date);
  if (view === 'day') {
    next.setDate(next.getDate() + direction);
  } else if (view === 'week') {
    next.setDate(next.getDate() + direction * 7);
  } else {
    next.setMonth(next.getMonth() + direction);
  }
  return next;
}

function eventOccursOn(event: JCalendarSchedulerEvent, date: Date): boolean {
  const start = startOfDay(toDate(event.start));
  const end = startOfDay(toDate(event.end ?? event.start));
  const day = startOfDay(date);
  return day >= start && day <= end;
}

function isSameDay(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

function formatDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
