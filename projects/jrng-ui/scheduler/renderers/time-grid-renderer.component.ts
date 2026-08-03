import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { JTooltipDirective } from 'jrng-ui/tooltip';
import { jSchedulerDatesInRange } from '../engine/date-engine';
import { jSchedulerLayoutTimedEvents, jSchedulerParseTime } from '../engine/layout-engine';
import { JSchedulerDateRange, JSchedulerVisibleEvent } from '../scheduler.models';

@Component({
  selector: 'j-scheduler-time-grid-renderer',
  imports: [JTooltipDirective],
  template: `
    <div
      class="j-scheduler-time-grid"
      [style.--j-day-count]="days().length"
      data-j-slot="time-grid"
    >
      <div class="j-scheduler-time-grid__header" role="row">
        <span aria-hidden="true"></span>
        @for (day of days(); track day.getTime()) {
          <button
            type="button"
            [disabled]="disabled()"
            [attr.aria-label]="dateLabel(day)"
            [jTooltip]="dateLabel(day)"
            (click)="dateActivate.emit(day)"
          >
            <span>{{ weekdayLabel(day) }}</span
            ><strong>{{ day.getDate() }}</strong>
          </button>
        }
      </div>
      <div class="j-scheduler-time-grid__all-day" role="row">
        <span>All day</span>
        @for (day of days(); track day.getTime()) {
          <div role="gridcell" [attr.data-date]="dateKey(day)">
            @for (event of allDayEvents(day); track event.occurrenceId) {
              <button
                type="button"
                class="j-scheduler-event"
                [disabled]="disabled() || event.source.disabled"
                [attr.data-event-id]="event.source.id"
                data-all-day="true"
                [jTooltip]="eventLabel(event)"
                (click)="eventActivate.emit(event)"
              >
                {{ event.source.title }}
              </button>
            }
          </div>
        }
      </div>
      <div class="j-scheduler-time-grid__body" role="grid" aria-label="Time grid">
        <div class="j-scheduler-time-grid__labels" aria-hidden="true">
          @for (slot of slots(); track slot) {
            <span [style.top.%]="slotTop(slot)">{{ timeLabel(slot) }}</span>
          }
        </div>
        <div class="j-scheduler-time-grid__columns" [style.--j-day-count]="days().length">
          @for (day of days(); track day.getTime()) {
            <div class="j-scheduler-time-grid__day" role="gridcell" [attr.data-date]="dateKey(day)">
              @for (slot of slots(); track slot) {
                <button
                  type="button"
                  class="j-scheduler-time-grid__slot"
                  [style.top.%]="slotTop(slot)"
                  [disabled]="disabled()"
                  [attr.data-j-time]="timeKey(slot)"
                  [attr.aria-label]="dateLabel(day) + ' ' + timeLabel(slot)"
                  (click)="slotActivate.emit({ date: day, minutes: slot })"
                ></button>
              }
              @for (placement of placementsForDay(day); track placement.event.occurrenceId) {
                <button
                  type="button"
                  class="j-scheduler-event j-scheduler-time-event"
                  [style.top.%]="placement.topPercent"
                  [style.height.%]="placement.heightPercent"
                  [style.inset-inline-start.%]="placement.insetPercent"
                  [style.width.%]="placement.widthPercent"
                  [style.--j-event-color]="
                    placement.event.source.color || placement.event.source.backgroundColor || null
                  "
                  [disabled]="disabled() || placement.event.source.disabled"
                  [attr.data-event-id]="placement.event.source.id"
                  [jTooltip]="eventLabel(placement.event)"
                  (click)="eventActivate.emit(placement.event)"
                >
                  <strong>{{ placement.event.source.title }}</strong
                  ><span>{{ eventTime(placement.event) }}</span>
                </button>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styleUrl: './time-grid-renderer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JSchedulerTimeGridRendererComponent {
  readonly range = input.required<JSchedulerDateRange>();
  readonly events = input<readonly JSchedulerVisibleEvent[]>([]);
  readonly daysOfWeek = input<readonly number[]>([0, 1, 2, 3, 4, 5, 6]);
  readonly locale = input('en-US');
  readonly slotDuration = input('00:30');
  readonly slotMinTime = input('00:00');
  readonly slotMaxTime = input('24:00');
  readonly disabled = input(false);
  readonly dateActivate = output<Date>();
  readonly eventActivate = output<JSchedulerVisibleEvent>();
  readonly slotActivate = output<{ readonly date: Date; readonly minutes: number }>();
  readonly minMinutes = computed(() => jSchedulerParseTime(this.slotMinTime(), 0));
  readonly maxMinutes = computed(() => jSchedulerParseTime(this.slotMaxTime(), 1440));
  readonly slotMinutes = computed(() => Math.max(5, jSchedulerParseTime(this.slotDuration(), 30)));
  readonly days = computed(() => jSchedulerDatesInRange(this.range(), this.daysOfWeek()));
  readonly slots = computed(() =>
    Array.from(
      { length: Math.ceil((this.maxMinutes() - this.minMinutes()) / this.slotMinutes()) },
      (_, index) => this.minMinutes() + index * this.slotMinutes(),
    ),
  );
  readonly placements = computed(() =>
    jSchedulerLayoutTimedEvents(this.events(), this.days(), this.minMinutes(), this.maxMinutes()),
  );
  placementsForDay(day: Date) {
    return this.placements().filter((item) => item.day.getTime() === day.getTime());
  }
  allDayEvents(day: Date) {
    const end = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1);
    return this.events().filter((event) => event.allDay && event.start < end && event.end > day);
  }
  slotTop(slot: number) {
    return ((slot - this.minMinutes()) / (this.maxMinutes() - this.minMinutes())) * 100;
  }
  timeKey(minutes: number) {
    return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
  }
  timeLabel(minutes: number) {
    const date = new Date(2026, 0, 1, Math.floor(minutes / 60), minutes % 60);
    return new Intl.DateTimeFormat(this.locale(), { hour: 'numeric', minute: '2-digit' }).format(
      date,
    );
  }
  weekdayLabel(date: Date) {
    return new Intl.DateTimeFormat(this.locale(), { weekday: 'short' }).format(date);
  }
  dateLabel(date: Date) {
    return new Intl.DateTimeFormat(this.locale(), { dateStyle: 'full' }).format(date);
  }
  dateKey(date: Date) {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  }
  eventTime(event: JSchedulerVisibleEvent) {
    return new Intl.DateTimeFormat(this.locale(), {
      hour: 'numeric',
      minute: '2-digit',
    }).formatRange(event.start, event.end);
  }
  eventLabel(event: JSchedulerVisibleEvent) {
    return `${event.source.title}, ${this.eventTime(event)}`;
  }
}
