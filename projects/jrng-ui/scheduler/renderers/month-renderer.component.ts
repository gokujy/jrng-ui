import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { JTooltipDirective } from 'jrng-ui/tooltip';
import { jSchedulerMonthCells } from '../engine/date-engine';
import { jSchedulerLayoutMonthEvents } from '../engine/layout-engine';
import { JSchedulerDateRange, JSchedulerVisibleEvent } from '../scheduler.models';

@Component({
  selector: 'j-scheduler-month-renderer',
  imports: [JTooltipDirective],
  template: `
    <div class="j-scheduler-month" role="grid" aria-label="Month calendar" data-j-slot="month">
      <div class="j-scheduler-month__weekdays" role="row">
        @if (weekNumbers()) {
          <span role="columnheader">Week</span>
        }
        @for (label of weekdayLabels(); track $index) {
          <span role="columnheader">{{ label }}</span>
        }
      </div>
      @for (week of weeks(); track $index; let row = $index) {
        <div class="j-scheduler-month__week" role="row" data-j-slot="month-week">
          @if (weekNumbers()) {
            <span
              class="j-scheduler-month__week-number"
              aria-label="Week {{ week[0]?.weekNumber }}"
              >{{ week[0]?.weekNumber }}</span
            >
          }
          <div class="j-scheduler-month__cells">
            @for (cell of week; track cell.date.getTime()) {
              <div
                class="j-scheduler-month__cell"
                [class.j-scheduler-month__cell--outside]="!cell.inMonth"
                [class.j-scheduler-month__cell--today]="cell.today"
                role="gridcell"
                [attr.aria-current]="cell.today ? 'date' : null"
                [attr.data-date]="dateKey(cell.date)"
                [attr.data-today]="cell.today || null"
                data-j-slot="month-cell"
              >
                <button
                  type="button"
                  class="j-scheduler-month__date"
                  [disabled]="disabled()"
                  [attr.tabindex]="cell.today ? 0 : -1"
                  [attr.aria-label]="dateLabel(cell.date)"
                  [jTooltip]="dateLabel(cell.date)"
                  (click)="dateActivate.emit(cell.date)"
                >
                  {{ cell.date.getDate() }}
                </button>
                @if (hiddenCount(cell.date, row) > 0) {
                  <button
                    type="button"
                    class="j-scheduler-month__more"
                    [disabled]="disabled()"
                    [attr.aria-label]="
                      hiddenCount(cell.date, row) + ' more events on ' + dateLabel(cell.date)
                    "
                    [jTooltip]="hiddenCount(cell.date, row) + ' more events'"
                    (click)="moreActivate.emit(cell.date)"
                  >
                    +{{ hiddenCount(cell.date, row) }} more
                  </button>
                }
              </div>
            }
            <div class="j-scheduler-month__segments" aria-label="Events">
              @for (
                segment of visibleSegmentsForRow(row);
                track segment.event.occurrenceId + ':' + segment.row
              ) {
                <button
                  type="button"
                  class="j-scheduler-event j-scheduler-month-event"
                  [class.j-scheduler-month-event--continues-before]="segment.continuesBefore"
                  [class.j-scheduler-month-event--continues-after]="segment.continuesAfter"
                  [style.--j-event-column]="segment.startColumn + 1"
                  [style.--j-event-span]="segment.span"
                  [style.--j-event-level]="segment.level"
                  [style.--j-event-color]="
                    segment.event.source.color || segment.event.source.backgroundColor || null
                  "
                  [disabled]="disabled() || segment.event.source.disabled"
                  [attr.data-event-id]="segment.event.source.id"
                  [attr.data-all-day]="segment.event.allDay || null"
                  [attr.aria-label]="eventLabel(segment.event)"
                  [jTooltip]="eventLabel(segment.event)"
                  (click)="eventActivate.emit(segment.event)"
                >
                  @if (segment.continuesBefore) {
                    <span aria-hidden="true">‹</span>
                  }
                  <span class="j-scheduler-event__title">{{ segment.event.source.title }}</span>
                  @if (segment.continuesAfter) {
                    <span aria-hidden="true">›</span>
                  }
                </button>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styleUrl: './month-renderer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JSchedulerMonthRendererComponent {
  readonly activeDate = input.required<Date>();
  readonly range = input.required<JSchedulerDateRange>();
  readonly events = input<readonly JSchedulerVisibleEvent[]>([]);
  readonly locale = input('en-US');
  readonly firstDayOfWeek = input(0);
  readonly maxEventsVisible = input(3);
  readonly weekNumbers = input(false);
  readonly disabled = input(false);
  readonly dateActivate = output<Date>();
  readonly eventActivate = output<JSchedulerVisibleEvent>();
  readonly moreActivate = output<Date>();

  readonly cells = computed(() => jSchedulerMonthCells(this.activeDate(), this.firstDayOfWeek()));
  readonly weeks = computed(() =>
    Array.from({ length: 6 }, (_, index) => this.cells().slice(index * 7, index * 7 + 7)),
  );
  readonly segments = computed(() => jSchedulerLayoutMonthEvents(this.events(), this.range()));
  readonly weekdayLabels = computed(() => {
    const formatter = new Intl.DateTimeFormat(this.locale(), { weekday: 'short' });
    return Array.from({ length: 7 }, (_, index) => {
      const weekday = (this.firstDayOfWeek() + index) % 7;
      return formatter.format(new Date(2026, 7, 2 + weekday));
    });
  });

  visibleSegmentsForRow(row: number) {
    return this.segments().filter(
      (segment) => segment.row === row && segment.level < this.maxEventsVisible(),
    );
  }

  hiddenCount(date: Date, row: number): number {
    const column =
      this.weeks()[row]?.findIndex((cell) => cell.date.getTime() === date.getTime()) ?? -1;
    if (column < 0) return 0;
    return this.segments().filter(
      (segment) =>
        segment.row === row &&
        segment.level >= this.maxEventsVisible() &&
        column >= segment.startColumn &&
        column < segment.startColumn + segment.span,
    ).length;
  }

  dateKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  dateLabel(date: Date): string {
    return new Intl.DateTimeFormat(this.locale(), { dateStyle: 'full' }).format(date);
  }

  eventLabel(event: JSchedulerVisibleEvent): string {
    return `${event.source.title}, ${this.dateLabel(event.start)}`;
  }
}
