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
import { jSchedulerMonthCells } from '../engine/date-engine';
import {
  JSchedulerCellTemplateContext,
  JSchedulerDateInteraction,
  JSchedulerSelection,
  JSchedulerView,
  JSchedulerVisibleEvent,
} from '../scheduler.models';

@Component({
  selector: 'j-scheduler-year-renderer',
  imports: [JTooltipDirective, NgTemplateOutlet],
  template: `
    <div
      class="j-scheduler-year"
      [class.j-scheduler-year--stack]="layout() === 'stack'"
      [style.--j-multi-month-columns]="maxColumns()"
      [style.--j-multi-month-min-width]="minMonthWidth()"
      data-j-slot="year"
    >
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
                [class.is-selected]="dateSelected(cell.date)"
                [class.has-events]="eventCount(cell.date) > 0"
                [disabled]="disabled() || !cell.inMonth"
                [attr.aria-current]="cell.today ? 'date' : null"
                [attr.aria-label]="
                  dateLabel(cell.date) +
                  (eventCount(cell.date) ? ', ' + eventCount(cell.date) + ' events' : '')
                "
                [attr.data-date]="dateKey(cell.date)"
                [attr.data-today]="cell.today || null"
                [attr.data-selected]="dateSelected(cell.date) || null"
                [attr.aria-selected]="dateSelected(cell.date)"
                [jTooltip]="dateLabel(cell.date)"
                (click)="activateDate($event, cell.date)"
              >
                @if (cellTemplate()) {
                  <ng-container
                    [ngTemplateOutlet]="cellTemplate()!"
                    [ngTemplateOutletContext]="cellContext(cell.date, cell.today, !cell.inMonth)"
                  />
                } @else {
                  {{ cell.date.getDate() }}
                }
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
        grid-template-columns: repeat(
          auto-fit,
          minmax(min(var(--j-multi-month-min-width, 15rem), 100%), 1fr)
        );
        padding: var(--j-spacing-5);
      }
      .j-scheduler-year:not(.j-scheduler-year--stack) {
        grid-template-columns: repeat(
          var(--j-multi-month-columns, 4),
          minmax(min(var(--j-multi-month-min-width, 15rem), 100%), 1fr)
        );
      }
      .j-scheduler-year--stack {
        grid-template-columns: minmax(0, 1fr);
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
      .j-scheduler-year__days button.is-selected {
        box-shadow: 0 0 0 2px var(--j-color-primary);
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
  readonly selectedRange = input<JSchedulerSelection | null>(null);
  readonly locale = input('en-US');
  readonly firstDayOfWeek = input(0);
  readonly startMonth = input<number | null>(null);
  readonly monthCount = input(12);
  readonly layout = input<'grid' | 'stack'>('grid');
  readonly maxColumns = input(4);
  readonly minMonthWidth = input('15rem');
  readonly view = input<JSchedulerView>('year');
  readonly cellTemplate = input<TemplateRef<JSchedulerCellTemplateContext> | undefined>();
  readonly disabled = input(false);
  readonly dateActivate = output<JSchedulerDateInteraction>();
  readonly months = computed(() =>
    Array.from({ length: Math.max(1, this.monthCount()) }, (_, month) => {
      const date = new Date(this.activeDate().getFullYear(), (this.startMonth() ?? 0) + month, 1);
      return {
        month: date.getTime(),
        label: new Intl.DateTimeFormat(this.locale(), {
          month: 'long',
          year: this.monthCount() > 12 || this.startMonth() !== null ? 'numeric' : undefined,
        }).format(date),
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
  activateDate(nativeEvent: MouseEvent, date: Date): void {
    this.dateActivate.emit({
      start: new Date(date),
      end: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
      allDay: true,
      view: this.view(),
      nativeEvent,
    });
  }
  dateKey(date: Date) {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  }
  dateSelected(date: Date): boolean {
    const selection = this.selectedRange();
    if (!selection) return false;
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    return selection.start < dayEnd && (selection.end ?? selection.start) > dayStart;
  }
  cellContext(date: Date, today: boolean, outside: boolean): JSchedulerCellTemplateContext {
    return {
      $implicit: date,
      date,
      view: this.view(),
      selected: this.dateSelected(date),
      today,
      disabled: this.disabled() || outside,
    };
  }
}
