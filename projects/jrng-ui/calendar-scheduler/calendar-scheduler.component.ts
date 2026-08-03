import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';

export type JCalendarSchedulerView = 'day' | 'week' | 'month' | 'agenda';

export interface JCalendarSchedulerEvent {
  readonly id: string;
  readonly title: string;
  readonly start: Date | string;
  readonly end?: Date | string;
  readonly color?: string;
  readonly allDay?: boolean;
  readonly description?: string;
  readonly location?: string;
  readonly category?: string;
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
  readonly weekday: string;
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
        <div class="j-calendar-scheduler__heading">
          <span class="j-calendar-scheduler__eyebrow">{{ viewLabel() }}</span>
          <strong aria-live="polite">{{ title() }}</strong>
        </div>

        <div class="j-calendar-scheduler__controls">
          <div class="j-calendar-scheduler__navigation" aria-label="Calendar navigation">
            <button
              type="button"
              aria-label="Previous period"
              title="Previous period"
              (click)="previous()"
            >
              &#8249;
            </button>
            <button type="button" (click)="today()">Today</button>
            <button type="button" aria-label="Next period" title="Next period" (click)="next()">
              &#8250;
            </button>
          </div>
          <div class="j-calendar-scheduler__views" aria-label="Scheduler view">
            @for (option of viewOptions; track option.value) {
              <button
                type="button"
                [class.is-active]="view() === option.value"
                [attr.aria-pressed]="view() === option.value"
                (click)="selectView(option.value)"
              >
                {{ option.label }}
              </button>
            }
          </div>
        </div>
      </header>

      @if (view() === 'agenda') {
        <div class="j-calendar-scheduler__agenda" role="list" aria-label="Upcoming events">
          @for (day of agendaDays(); track day.date.toISOString()) {
            <section class="j-calendar-scheduler__agenda-day" role="listitem">
              <div class="j-calendar-scheduler__agenda-date">
                <strong>{{ day.date.getDate() }}</strong>
                <span>{{ day.weekday }}</span>
              </div>
              <div class="j-calendar-scheduler__agenda-events">
                @for (event of day.events; track event.id) {
                  <button
                    type="button"
                    class="j-calendar-scheduler__agenda-event"
                    [style.--j-event-color]="event.color || null"
                    [attr.aria-label]="eventLabel(event)"
                    (click)="handleEventClick($event, event, day.date)"
                  >
                    <span class="j-calendar-scheduler__event-time">{{ eventTime(event) }}</span>
                    <span
                      ><strong>{{ event.title }}</strong>
                      @if (event.location) {
                        <small>{{ event.location }}</small>
                      }
                    </span>
                    @if (event.category) {
                      <span class="j-calendar-scheduler__category">{{ event.category }}</span>
                    }
                  </button>
                }
              </div>
            </section>
          } @empty {
            <p class="j-calendar-scheduler__empty">No upcoming events in this period.</p>
          }
        </div>
      } @else {
        <div class="j-calendar-scheduler__calendar" role="grid" [attr.aria-label]="title()">
          <div class="j-calendar-scheduler__weekdays" role="row">
            @for (day of calendarWeekdayLabels(); track day) {
              <span role="columnheader">{{ day }}</span>
            }
          </div>

          <div
            class="j-calendar-scheduler__grid"
            [class.j-calendar-scheduler__grid--day]="view() === 'day'"
            [class.j-calendar-scheduler__grid--week]="view() === 'week'"
            [style.--j-calendar-columns]="calendarWeekdayLabels().length"
          >
            @for (day of visibleDays(); track day.date.toISOString()) {
              <div
                class="j-calendar-scheduler__day"
                [class.is-muted]="day.muted"
                [class.is-today]="day.today"
                role="gridcell"
                [attr.aria-current]="day.today ? 'date' : null"
              >
                <button
                  type="button"
                  class="j-calendar-scheduler__date"
                  [attr.aria-label]="day.label"
                  (click)="dateClick.emit({ date: day.date, view: view() })"
                >
                  @if (view() !== 'month') {
                    <span>{{ day.weekday }}</span>
                  }
                  <strong>{{ day.date.getDate() }}</strong>
                </button>
                <div class="j-calendar-scheduler__events">
                  @for (event of visibleEvents(day); track event.id) {
                    <button
                      type="button"
                      class="j-calendar-scheduler__event"
                      [style.--j-event-color]="event.color || null"
                      [attr.aria-label]="eventLabel(event)"
                      [title]="eventLabel(event)"
                      (click)="handleEventClick($event, event, day.date)"
                    >
                      @if (view() !== 'month') {
                        <span>{{ eventTime(event) }}</span>
                      }
                      <strong>{{ event.title }}</strong>
                    </button>
                  }
                  @if (hiddenEventCount(day) > 0) {
                    <button
                      type="button"
                      class="j-calendar-scheduler__more"
                      (click)="dateClick.emit({ date: day.date, view: view() })"
                    >
                      +{{ hiddenEventCount(day) }} more
                    </button>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      }
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }
      .j-calendar-scheduler {
        background: var(--j-color-card);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-xl);
        box-sizing: border-box;
        color: var(--j-color-card-foreground);
        overflow: hidden;
        width: 100%;
      }
      .j-calendar-scheduler__toolbar {
        align-items: center;
        border-bottom: 1px solid var(--j-color-border);
        display: flex;
        gap: var(--j-spacing-4);
        justify-content: space-between;
        padding: var(--j-spacing-4);
      }
      .j-calendar-scheduler__heading {
        display: grid;
        gap: var(--j-spacing-1);
      }
      .j-calendar-scheduler__heading strong {
        font-size: var(--j-font-size-lg);
      }
      .j-calendar-scheduler__eyebrow {
        color: var(--j-color-muted-foreground);
        font-size: var(--j-font-size-xs);
        font-weight: var(--j-font-weight-semibold);
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .j-calendar-scheduler__controls,
      .j-calendar-scheduler__navigation,
      .j-calendar-scheduler__views {
        align-items: center;
        display: flex;
        gap: var(--j-spacing-1);
      }
      .j-calendar-scheduler__navigation,
      .j-calendar-scheduler__views {
        background: var(--j-color-muted);
        border-radius: var(--j-radius-md);
        padding: 3px;
      }
      .j-calendar-scheduler button {
        color: inherit;
        font: inherit;
      }
      .j-calendar-scheduler__navigation button,
      .j-calendar-scheduler__views button {
        background: transparent;
        border: 0;
        border-radius: calc(var(--j-radius-md) - 2px);
        cursor: pointer;
        min-height: 2rem;
        padding: 0 var(--j-spacing-3);
      }
      .j-calendar-scheduler__navigation button:hover,
      .j-calendar-scheduler__views button:hover {
        background: color-mix(in srgb, var(--j-color-card) 70%, transparent);
      }
      .j-calendar-scheduler__views button.is-active {
        background: var(--j-color-card);
        box-shadow: var(--j-shadow-sm);
        color: var(--j-color-primary);
        font-weight: var(--j-font-weight-semibold);
      }
      .j-calendar-scheduler__calendar {
        overflow-x: auto;
      }
      .j-calendar-scheduler__weekdays,
      .j-calendar-scheduler__grid {
        display: grid;
        grid-template-columns: repeat(var(--j-calendar-columns, 7), minmax(7.5rem, 1fr));
        min-width: 48rem;
      }
      .j-calendar-scheduler__weekdays {
        background: var(--j-color-surface-subtle);
        color: var(--j-color-muted-foreground);
        font-size: var(--j-font-size-xs);
        font-weight: var(--j-font-weight-semibold);
        text-align: center;
        text-transform: uppercase;
      }
      .j-calendar-scheduler__weekdays span {
        border-inline-end: 1px solid var(--j-color-border);
        padding: var(--j-spacing-2);
      }
      .j-calendar-scheduler__grid--day {
        grid-template-columns: 1fr;
        min-width: 0;
      }
      .j-calendar-scheduler__grid--week {
        min-width: 56rem;
      }
      .j-calendar-scheduler__day {
        background: var(--j-color-card);
        border-block-start: 1px solid var(--j-color-border);
        border-inline-end: 1px solid var(--j-color-border);
        display: grid;
        grid-template-rows: auto 1fr;
        min-height: 8.5rem;
        padding: var(--j-spacing-2);
      }
      .j-calendar-scheduler__day.is-muted {
        background: var(--j-color-surface-subtle);
        color: var(--j-color-muted-foreground);
      }
      .j-calendar-scheduler__day.is-today {
        background: color-mix(in srgb, var(--j-color-primary) 6%, var(--j-color-card));
        box-shadow: inset 0 3px var(--j-color-primary);
      }
      .j-calendar-scheduler__date {
        align-items: center;
        background: transparent;
        border: 0;
        cursor: pointer;
        display: flex;
        gap: var(--j-spacing-2);
        justify-self: start;
        min-height: 2rem;
        padding: 0 var(--j-spacing-1);
      }
      .j-calendar-scheduler__date span {
        color: var(--j-color-muted-foreground);
        font-size: var(--j-font-size-sm);
      }
      .j-calendar-scheduler__date strong {
        align-items: center;
        border-radius: 999px;
        display: inline-flex;
        height: 1.8rem;
        justify-content: center;
        width: 1.8rem;
      }
      .is-today .j-calendar-scheduler__date strong {
        background: var(--j-color-primary);
        color: var(--j-color-primary-foreground);
      }
      .j-calendar-scheduler__events {
        align-content: start;
        display: grid;
        gap: var(--j-spacing-1);
      }
      .j-calendar-scheduler__event {
        background: color-mix(
          in srgb,
          var(--j-event-color, var(--j-color-primary)) 14%,
          var(--j-color-card)
        );
        border: 0;
        border-inline-start: 3px solid var(--j-event-color, var(--j-color-primary));
        border-radius: var(--j-radius-sm);
        cursor: pointer;
        display: flex;
        gap: var(--j-spacing-1);
        overflow: hidden;
        padding: var(--j-spacing-1) var(--j-spacing-2);
        text-align: start;
        white-space: nowrap;
        width: 100%;
      }
      .j-calendar-scheduler__event span {
        color: var(--j-color-muted-foreground);
        font-size: var(--j-font-size-xs);
      }
      .j-calendar-scheduler__event strong {
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .j-calendar-scheduler__more {
        background: transparent;
        border: 0;
        color: var(--j-color-primary);
        cursor: pointer;
        font-size: var(--j-font-size-xs);
        font-weight: var(--j-font-weight-semibold);
        justify-self: start;
        padding: var(--j-spacing-1);
      }
      .j-calendar-scheduler__agenda {
        display: grid;
        padding: var(--j-spacing-2) var(--j-spacing-4) var(--j-spacing-4);
      }
      .j-calendar-scheduler__agenda-day {
        border-bottom: 1px solid var(--j-color-border);
        display: grid;
        gap: var(--j-spacing-4);
        grid-template-columns: 4rem 1fr;
        padding: var(--j-spacing-4) 0;
      }
      .j-calendar-scheduler__agenda-date {
        display: grid;
        place-content: start center;
        text-align: center;
      }
      .j-calendar-scheduler__agenda-date strong {
        color: var(--j-color-primary);
        font-size: var(--j-font-size-2xl);
      }
      .j-calendar-scheduler__agenda-date span {
        color: var(--j-color-muted-foreground);
        font-size: var(--j-font-size-xs);
        text-transform: uppercase;
      }
      .j-calendar-scheduler__agenda-events {
        display: grid;
        gap: var(--j-spacing-2);
      }
      .j-calendar-scheduler__agenda-event {
        align-items: center;
        background: var(--j-color-surface-subtle);
        border: 0;
        border-inline-start: 3px solid var(--j-event-color, var(--j-color-primary));
        border-radius: var(--j-radius-md);
        cursor: pointer;
        display: grid;
        gap: var(--j-spacing-3);
        grid-template-columns: 6rem 1fr auto;
        padding: var(--j-spacing-3);
        text-align: start;
      }
      .j-calendar-scheduler__agenda-event > span:nth-child(2) {
        display: grid;
        gap: 2px;
      }
      .j-calendar-scheduler__agenda-event small,
      .j-calendar-scheduler__event-time {
        color: var(--j-color-muted-foreground);
      }
      .j-calendar-scheduler__category {
        background: var(--j-color-card);
        border: 1px solid var(--j-color-border);
        border-radius: 999px;
        font-size: var(--j-font-size-xs);
        padding: var(--j-spacing-1) var(--j-spacing-2);
      }
      .j-calendar-scheduler__empty {
        color: var(--j-color-muted-foreground);
        padding: var(--j-spacing-8);
        text-align: center;
      }
      .j-calendar-scheduler button:focus-visible {
        box-shadow: var(--j-focus-ring);
        outline: none;
      }
      @media (max-width: 48rem) {
        .j-calendar-scheduler__toolbar {
          align-items: stretch;
          flex-direction: column;
        }
        .j-calendar-scheduler__controls {
          align-items: stretch;
          flex-direction: column;
        }
        .j-calendar-scheduler__navigation,
        .j-calendar-scheduler__views {
          justify-content: space-between;
          overflow-x: auto;
        }
        .j-calendar-scheduler__agenda-event {
          grid-template-columns: 1fr;
        }
        .j-calendar-scheduler__category {
          justify-self: start;
        }
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
  readonly locale = input('en-US');
  readonly firstDayOfWeek = input<0 | 1 | 2 | 3 | 4 | 5 | 6>(0);
  readonly showWeekends = input(true);
  readonly maxEventsPerDay = input(3);
  readonly hour12 = input(true);
  readonly styleClass = input('');

  readonly eventClick = output<JCalendarSchedulerEventClick>();
  readonly dateClick = output<JCalendarSchedulerDateClick>();

  readonly viewOptions: readonly { value: JCalendarSchedulerView; label: string }[] = [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'agenda', label: 'Agenda' },
  ];
  readonly resolvedActiveDate = computed(() =>
    isValidDate(this.activeDate()) ? this.activeDate() : new Date(),
  );
  readonly viewLabel = computed(
    () => this.viewOptions.find((item) => item.value === this.view())?.label ?? 'Month',
  );
  readonly orderedWeekdays = computed(() =>
    Array.from({ length: 7 }, (_, index) => (this.firstDayOfWeek() + index) % 7),
  );
  readonly visibleWeekdays = computed(() =>
    this.showWeekends()
      ? this.orderedWeekdays()
      : this.orderedWeekdays().filter((day) => day !== 0 && day !== 6),
  );
  readonly visibleWeekdayLabels = computed(() =>
    this.visibleWeekdays().map((day) =>
      new Intl.DateTimeFormat(this.locale(), { weekday: 'short' }).format(
        new Date(2026, 7, 2 + day),
      ),
    ),
  );
  readonly calendarWeekdayLabels = computed(() =>
    this.view() === 'day'
      ? [this.formatDate(this.resolvedActiveDate(), { weekday: 'short' })]
      : this.visibleWeekdayLabels(),
  );

  readonly title = computed(() => {
    const date = this.resolvedActiveDate();
    if (this.view() === 'day') return this.formatDate(date, { dateStyle: 'full' });
    if (this.view() === 'week') {
      const start = startOfWeek(date, this.firstDayOfWeek());
      return `${this.formatDate(start, { month: 'short', day: 'numeric' })} – ${this.formatDate(addDays(start, 6), { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    if (this.view() === 'agenda')
      return `Agenda · ${this.formatDate(date, { month: 'long', year: 'numeric' })}`;
    return this.formatDate(date, { month: 'long', year: 'numeric' });
  });

  readonly visibleDays = computed<readonly JCalendarDay[]>(() => {
    const active = this.resolvedActiveDate();
    if (this.view() === 'day') return [this.dayView(active, false)];
    if (this.view() === 'week') {
      const start = startOfWeek(active, this.firstDayOfWeek());
      return Array.from({ length: 7 }, (_, index) => addDays(start, index))
        .filter((date) => this.showWeekends() || !isWeekend(date))
        .map((date) => this.dayView(date, false));
    }
    const monthStart = new Date(active.getFullYear(), active.getMonth(), 1);
    const gridStart = startOfWeek(monthStart, this.firstDayOfWeek());
    return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index))
      .filter((date) => this.showWeekends() || !isWeekend(date))
      .map((date) => this.dayView(date, date.getMonth() !== active.getMonth()));
  });
  readonly agendaDays = computed(() =>
    this.visibleDaysForAgenda().filter((day) => day.events.length),
  );

  today(): void {
    this.activeDate.set(new Date());
  }
  next(): void {
    this.activeDate.set(addByView(this.resolvedActiveDate(), this.view(), 1));
  }
  previous(): void {
    this.activeDate.set(addByView(this.resolvedActiveDate(), this.view(), -1));
  }
  selectView(value: JCalendarSchedulerView): void {
    this.view.set(value);
  }
  setView(event: Event): void {
    const value = (event.target as HTMLSelectElement | null)?.value as
      JCalendarSchedulerView | undefined;
    if (value && this.viewOptions.some((option) => option.value === value)) this.selectView(value);
  }
  handleEventClick(event: Event, schedulerEvent: JCalendarSchedulerEvent, date: Date): void {
    event.stopPropagation();
    this.eventClick.emit({ event: schedulerEvent, date });
  }
  visibleEvents(day: JCalendarDay): readonly JCalendarSchedulerEvent[] {
    return day.events.slice(0, Math.max(0, this.maxEventsPerDay()));
  }
  hiddenEventCount(day: JCalendarDay): number {
    return Math.max(0, day.events.length - Math.max(0, this.maxEventsPerDay()));
  }
  eventTime(event: JCalendarSchedulerEvent): string {
    return event.allDay
      ? 'All day'
      : this.formatDate(toDate(event.start), {
          hour: 'numeric',
          minute: '2-digit',
          hour12: this.hour12(),
        });
  }
  eventLabel(event: JCalendarSchedulerEvent): string {
    return [event.title, this.eventTime(event), event.location].filter(Boolean).join(', ');
  }

  private visibleDaysForAgenda(): readonly JCalendarDay[] {
    const active = this.resolvedActiveDate();
    const monthStart = new Date(active.getFullYear(), active.getMonth(), 1);
    const monthEnd = new Date(active.getFullYear(), active.getMonth() + 1, 0);
    return Array.from({ length: monthEnd.getDate() }, (_, index) => addDays(monthStart, index))
      .filter((date) => this.showWeekends() || !isWeekend(date))
      .map((date) => this.dayView(date, false));
  }
  private dayView(date: Date, muted: boolean): JCalendarDay {
    return {
      date,
      label: this.formatDate(date, { dateStyle: 'full' }),
      weekday: this.formatDate(date, { weekday: 'short' }),
      muted,
      today: isSameDay(date, new Date()),
      events: this.events()
        .filter((event) => eventOccursOn(event, date))
        .sort((a, b) => toDate(a.start).getTime() - toDate(b.start).getTime()),
    };
  }
  private formatDate(date: Date, options: Intl.DateTimeFormatOptions): string {
    return isValidDate(date) ? new Intl.DateTimeFormat(this.locale(), options).format(date) : '';
  }
}

function startOfWeek(date: Date, firstDay = 0): Date {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  next.setDate(next.getDate() - ((next.getDay() - firstDay + 7) % 7));
  return next;
}
function addDays(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}
function addByView(date: Date, view: JCalendarSchedulerView, direction: number): Date {
  const next = new Date(date);
  if (view === 'day') next.setDate(next.getDate() + direction);
  else if (view === 'week') next.setDate(next.getDate() + direction * 7);
  else {
    next.setDate(1);
    next.setMonth(next.getMonth() + direction);
  }
  return next;
}
function eventOccursOn(event: JCalendarSchedulerEvent, date: Date): boolean {
  const rawStart = toDate(event.start);
  const rawEnd = toDate(event.end ?? event.start);
  if (!isValidDate(rawStart) || !isValidDate(rawEnd)) return false;
  const start = startOfDay(rawStart);
  const end = startOfDay(rawEnd);
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
function isWeekend(date: Date): boolean {
  return date.getDay() === 0 || date.getDay() === 6;
}
function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}
function isValidDate(value: Date): boolean {
  return Number.isFinite(value.getTime());
}
