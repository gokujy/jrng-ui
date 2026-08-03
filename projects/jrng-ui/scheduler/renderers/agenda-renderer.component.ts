import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { JTooltipDirective } from 'jrng-ui/tooltip';
import { jSchedulerDatesInRange, jSchedulerAddDays } from '../engine/date-engine';
import { JSchedulerDateRange, JSchedulerVisibleEvent } from '../scheduler.models';

@Component({
  selector: 'j-scheduler-agenda-renderer',
  imports: [JTooltipDirective],
  template: `
    <div class="j-scheduler-agenda" role="list" data-j-slot="agenda">
      @for (group of groups(); track group.date.getTime()) {
        <section
          class="j-scheduler-agenda__day"
          role="listitem"
          [attr.data-date]="dateKey(group.date)"
        >
          <header>
            <button
              type="button"
              [disabled]="disabled()"
              [jTooltip]="dateLabel(group.date)"
              (click)="dateActivate.emit(group.date)"
            >
              {{ dateLabel(group.date) }}</button
            ><span
              >{{ group.events.length }} {{ group.events.length === 1 ? 'event' : 'events' }}</span
            >
          </header>
          <div>
            @for (event of group.events; track event.occurrenceId) {
              <button
                type="button"
                class="j-scheduler-agenda__event"
                [disabled]="disabled() || event.source.disabled"
                [attr.data-event-id]="event.source.id"
                [jTooltip]="eventLabel(event)"
                (click)="eventActivate.emit(event)"
              >
                <time>{{ event.allDay ? 'All day' : eventTime(event) }}</time
                ><strong>{{ event.source.title }}</strong
                ><span>{{ event.source.location || '' }}</span>
              </button>
            } @empty {
              <p>No events</p>
            }
          </div>
        </section>
      } @empty {
        <p class="j-scheduler-empty">No events in this range.</p>
      }
    </div>
  `,
  styles: [
    `
      .j-scheduler-agenda {
        display: grid;
        padding: var(--j-spacing-4);
      }
      .j-scheduler-agenda__day {
        border-block-end: 1px solid var(--j-color-border);
        display: grid;
        gap: var(--j-spacing-4);
        grid-template-columns: minmax(10rem, 14rem) 1fr;
        padding: var(--j-spacing-4) 0;
      }
      .j-scheduler-agenda__day header {
        display: grid;
        align-content: start;
        gap: var(--j-spacing-1);
      }
      .j-scheduler-agenda__day header button {
        background: transparent;
        border: 0;
        color: inherit;
        font: inherit;
        font-weight: var(--j-font-weight-semibold);
        text-align: start;
      }
      .j-scheduler-agenda__day header span,
      .j-scheduler-agenda__event time,
      .j-scheduler-agenda__event span {
        color: var(--j-color-muted-foreground);
        font-size: var(--j-font-size-sm);
      }
      .j-scheduler-agenda__day > div {
        display: grid;
        gap: var(--j-spacing-2);
      }
      .j-scheduler-agenda__event {
        align-items: center;
        background: var(--j-color-surface-subtle);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-md);
        color: inherit;
        display: grid;
        gap: var(--j-spacing-3);
        grid-template-columns: 8rem 1fr minmax(0, 12rem);
        padding: var(--j-spacing-3);
        text-align: start;
      }
      @media (max-width: 40rem) {
        .j-scheduler-agenda__day,
        .j-scheduler-agenda__event {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JSchedulerAgendaRendererComponent {
  readonly range = input.required<JSchedulerDateRange>();
  readonly events = input<readonly JSchedulerVisibleEvent[]>([]);
  readonly locale = input('en-US');
  readonly showEmptyDays = input(false);
  readonly disabled = input(false);
  readonly dateActivate = output<Date>();
  readonly eventActivate = output<JSchedulerVisibleEvent>();
  readonly groups = computed(() =>
    jSchedulerDatesInRange(this.range())
      .map((date) => {
        const end = jSchedulerAddDays(date, 1);
        return {
          date,
          events: this.events().filter((event) => event.start < end && event.end > date),
        };
      })
      .filter((group) => this.showEmptyDays() || group.events.length),
  );
  dateLabel(date: Date) {
    return new Intl.DateTimeFormat(this.locale(), { dateStyle: 'full' }).format(date);
  }
  eventTime(event: JSchedulerVisibleEvent) {
    return new Intl.DateTimeFormat(this.locale(), {
      hour: 'numeric',
      minute: '2-digit',
    }).formatRange(event.start, event.end);
  }
  eventLabel(event: JSchedulerVisibleEvent) {
    return `${event.source.title}, ${event.allDay ? 'all day' : this.eventTime(event)}`;
  }
  dateKey(date: Date) {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  }
}
