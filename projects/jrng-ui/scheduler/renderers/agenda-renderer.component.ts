import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  TemplateRef,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { JTooltipDirective } from 'jrng-ui/tooltip';
import { jSchedulerDatesInRange, jSchedulerAddDays } from '../engine/date-engine';
import { jSchedulerVirtualWindow } from '../engine/timeline-engine';
import {
  JSchedulerDateRange,
  JSchedulerDateInteraction,
  JSchedulerEventTemplateContext,
  JSchedulerEventInteraction,
  JSchedulerId,
  JSchedulerSelection,
  JSchedulerView,
  JSchedulerVisibleEvent,
} from '../scheduler.models';

@Component({
  selector: 'j-scheduler-agenda-renderer',
  imports: [JTooltipDirective, NgTemplateOutlet],
  template: `
    <div class="j-scheduler-agenda" role="list" data-j-slot="agenda">
      @if (window().before) {
        <div aria-hidden="true" [style.height.px]="window().before"></div>
      }
      @for (group of window().items; track group.date.getTime()) {
        <section
          class="j-scheduler-agenda__day"
          [class.j-scheduler-agenda__day--selected]="dateSelected(group.date)"
          role="listitem"
          [attr.data-date]="dateKey(group.date)"
        >
          <header>
            <button
              type="button"
              [disabled]="disabled()"
              [jTooltip]="dateLabel(group.date)"
              (click)="activateDate($event, group.date)"
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
                [class.j-scheduler-event--milestone]="event.source.milestone"
                [class.j-scheduler-event-selected]="eventSelected(event)"
                [disabled]="disabled() || event.source.disabled"
                [attr.data-event-id]="event.source.id"
                [attr.data-milestone]="event.source.milestone || null"
                [attr.data-selected]="eventSelected(event) || null"
                [attr.aria-pressed]="eventSelected(event)"
                [jTooltip]="eventLabel(event)"
                (click)="
                  eventActivate.emit({
                    event: event.source,
                    occurrenceStart: event.start,
                    nativeEvent: $event,
                  })
                "
              >
                @if (eventTemplate()) {
                  <ng-container
                    [ngTemplateOutlet]="eventTemplate()!"
                    [ngTemplateOutletContext]="eventContext(event)"
                  />
                } @else {
                  <time>{{ event.allDay ? 'All day' : eventTime(event) }}</time
                  ><strong>{{ event.source.title }}</strong
                  ><span>{{ event.source.location || '' }}</span>
                }
              </button>
            } @empty {
              <p>No events</p>
            }
          </div>
        </section>
      } @empty {
        <p class="j-scheduler-empty">No events in this range.</p>
      }
      @if (window().after) {
        <div aria-hidden="true" [style.height.px]="window().after"></div>
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
        min-height: var(--j-scheduler-agenda-row-height, 7rem);
        box-sizing: border-box;
      }
      .j-scheduler-agenda__day--selected {
        background: color-mix(in srgb, var(--j-color-primary) 8%, transparent);
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
      .j-scheduler-event--milestone {
        border-inline-start: 0.35rem solid var(--j-color-primary);
      }
      .j-scheduler-event-selected {
        box-shadow: 0 0 0 2px var(--j-color-primary);
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
  readonly view = input<JSchedulerView>('agenda');
  readonly events = input<readonly JSchedulerVisibleEvent[]>([]);
  readonly selectedEventIds = input<readonly JSchedulerId[]>([]);
  readonly selectedRange = input<JSchedulerSelection | null>(null);
  readonly locale = input('en-US');
  readonly showEmptyDays = input(false);
  readonly disabled = input(false);
  readonly virtual = input(false);
  readonly virtualThreshold = input(100);
  readonly rowHeight = input(112);
  readonly overscan = input(4);
  readonly scrollOffset = input(0);
  readonly viewportHeight = input(600);
  readonly eventTemplate = input<TemplateRef<JSchedulerEventTemplateContext> | undefined>();
  readonly dateActivate = output<JSchedulerDateInteraction>();
  readonly eventActivate = output<JSchedulerEventInteraction>();
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
  readonly window = computed(() =>
    this.virtual() && this.groups().length >= this.virtualThreshold()
      ? jSchedulerVirtualWindow(
          this.groups(),
          this.rowHeight(),
          this.scrollOffset(),
          this.viewportHeight(),
          this.overscan(),
        )
      : {
          items: this.groups(),
          startIndex: 0,
          endIndex: this.groups().length,
          before: 0,
          after: 0,
          totalSize: this.groups().length * this.rowHeight(),
        },
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
  eventContext(event: JSchedulerVisibleEvent): JSchedulerEventTemplateContext {
    return {
      $implicit: event,
      event: event.source,
      view: this.view(),
      selected: this.eventSelected(event),
      dragging: false,
      resizing: false,
      conflict: false,
    };
  }

  eventSelected(event: JSchedulerVisibleEvent): boolean {
    return this.selectedEventIds().some((id) => String(id) === String(event.source.id));
  }
  dateKey(date: Date) {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  }
  dateSelected(date: Date): boolean {
    const selection = this.selectedRange();
    if (!selection) return false;
    const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const end = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    return selection.start < end && (selection.end ?? selection.start) > start;
  }
  activateDate(nativeEvent: MouseEvent, date: Date): void {
    this.dateActivate.emit({
      start: new Date(date),
      end: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
      allDay: true,
      view: this.view(),
      nativeEvent,
    });
  }
}
