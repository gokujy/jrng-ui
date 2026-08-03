import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { JTooltipDirective } from 'jrng-ui/tooltip';
import { jSchedulerMonthCells } from '../engine/date-engine';
import { JSchedulerVisibleEvent } from '../scheduler.models';

@Component({
  selector: 'j-scheduler-year-renderer',
  imports: [JTooltipDirective],
  template: `
    <div class="j-scheduler-year" data-j-slot="year">
      @for (month of months(); track month.month) {
        <section class="j-scheduler-year__month">
          <h3>{{ month.label }}</h3>
          <div class="j-scheduler-year__weekdays">
            @for (label of weekdayLabels(); track $index) {
              <span>{{ label }}</span>
            }
          </div>
          <div class="j-scheduler-year__days" role="grid" [attr.aria-label]="month.label">
            @for (cell of month.cells; track cell.date.getTime()) {
              <button
                type="button"
                [class.is-outside]="!cell.inMonth"
                [class.is-today]="cell.today"
                [class.has-events]="eventCount(cell.date) > 0"
                [disabled]="disabled() || !cell.inMonth"
                [attr.aria-current]="cell.today ? 'date' : null"
                [attr.aria-label]="
                  dateLabel(cell.date) +
                  (eventCount(cell.date) ? ', ' + eventCount(cell.date) + ' events' : '')
                "
                [attr.data-date]="dateKey(cell.date)"
                [attr.data-today]="cell.today || null"
                [jTooltip]="dateLabel(cell.date)"
                (click)="dateActivate.emit(cell.date)"
              >
                {{ cell.date.getDate() }}
              </button>
            }
          </div>
        </section>
      }
    </div>
  `,
  styles: [
    `
      .j-scheduler-year {
        display: grid;
        gap: var(--j-spacing-6);
        grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
        padding: var(--j-spacing-5);
      }
      .j-scheduler-year__month {
        min-width: 0;
      }
      .j-scheduler-year__month h3 {
        font-size: var(--j-font-size-base);
        margin: 0 0 var(--j-spacing-2);
      }
      .j-scheduler-year__weekdays,
      .j-scheduler-year__days {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
      }
      .j-scheduler-year__weekdays span {
        color: var(--j-color-muted-foreground);
        font-size: var(--j-font-size-xs);
        text-align: center;
      }
      .j-scheduler-year__days button {
        aspect-ratio: 1;
        background: transparent;
        border: 0;
        border-radius: 999px;
        color: inherit;
        font: inherit;
        position: relative;
      }
      .j-scheduler-year__days button.is-outside {
        visibility: hidden;
      }
      .j-scheduler-year__days button.is-today {
        background: var(--j-color-primary);
        color: var(--j-color-primary-foreground);
      }
      .j-scheduler-year__days button.has-events::after {
        background: currentColor;
        border-radius: 50%;
        bottom: 2px;
        content: '';
        height: 3px;
        left: calc(50% - 1.5px);
        position: absolute;
        width: 3px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JSchedulerYearRendererComponent {
  readonly activeDate = input.required<Date>();
  readonly events = input<readonly JSchedulerVisibleEvent[]>([]);
  readonly locale = input('en-US');
  readonly firstDayOfWeek = input(0);
  readonly disabled = input(false);
  readonly dateActivate = output<Date>();
  readonly months = computed(() =>
    Array.from({ length: 12 }, (_, month) => {
      const date = new Date(this.activeDate().getFullYear(), month, 1);
      return {
        month,
        label: new Intl.DateTimeFormat(this.locale(), { month: 'long' }).format(date),
        cells: jSchedulerMonthCells(date, this.firstDayOfWeek()),
      };
    }),
  );
  readonly weekdayLabels = computed(() =>
    Array.from({ length: 7 }, (_, index) =>
      new Intl.DateTimeFormat(this.locale(), { weekday: 'narrow' }).format(
        new Date(2026, 7, 2 + ((this.firstDayOfWeek() + index) % 7)),
      ),
    ),
  );
  eventCount(date: Date) {
    const end = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    return this.events().filter((event) => event.start < end && event.end > date).length;
  }
  dateLabel(date: Date) {
    return new Intl.DateTimeFormat(this.locale(), { dateStyle: 'full' }).format(date);
  }
  dateKey(date: Date) {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  }
}
