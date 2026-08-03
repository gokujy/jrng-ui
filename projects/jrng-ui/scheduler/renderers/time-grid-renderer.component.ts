import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { JTooltipDirective } from 'jrng-ui/tooltip';
import { jSchedulerDatesInRange } from '../engine/date-engine';
import { jSchedulerLayoutTimedEvents, jSchedulerParseTime } from '../engine/layout-engine';
import { JSchedulerDateRange, JSchedulerVisibleEvent } from '../scheduler.models';

export interface JSchedulerRendererGesture {
  readonly event: JSchedulerVisibleEvent;
  readonly start: Date;
  readonly end: Date;
  readonly nativeEvent: PointerEvent;
}

interface JSchedulerActiveGesture {
  readonly mode: 'drag' | 'resize';
  readonly event: JSchedulerVisibleEvent;
  readonly pointerId: number;
  readonly originX: number;
  readonly originY: number;
  readonly sourceDayIndex: number;
  readonly sourceStartMinutes: number;
  readonly duration: number;
  moved: boolean;
}

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
                <div
                  class="j-scheduler-event j-scheduler-time-event"
                  [class.is-dragging]="
                    activeGesture()?.mode === 'drag' &&
                    activeGesture()?.event?.occurrenceId === placement.event.occurrenceId
                  "
                  [class.is-resizing]="
                    activeGesture()?.mode === 'resize' &&
                    activeGesture()?.event?.occurrenceId === placement.event.occurrenceId
                  "
                  [style.top.%]="placement.topPercent"
                  [style.height.%]="placement.heightPercent"
                  [style.inset-inline-start.%]="placement.insetPercent"
                  [style.width.%]="placement.widthPercent"
                  [style.--j-event-color]="
                    placement.event.source.color || placement.event.source.backgroundColor || null
                  "
                  [attr.data-event-id]="placement.event.source.id"
                  [attr.data-dragging]="activeGesture()?.mode === 'drag' || null"
                  [attr.data-resizing]="activeGesture()?.mode === 'resize' || null"
                >
                  <button
                    type="button"
                    class="j-scheduler-time-event__content"
                    [disabled]="disabled() || placement.event.source.disabled"
                    [jTooltip]="eventLabel(placement.event)"
                    (click)="handleEventClick($event, placement.event)"
                    (dblclick)="eventDoubleActivate.emit(placement.event)"
                    (pointerdown)="startGesture($event, placement.event, 'drag')"
                    (pointermove)="moveGesture($event)"
                    (pointerup)="finishGesture($event)"
                    (pointercancel)="cancelGesture($event)"
                  >
                    <strong>{{ placement.event.source.title }}</strong
                    ><span>{{ eventTime(placement.event) }}</span>
                  </button>
                  @if (resizable() && !disabled() && !placement.event.source.disabled) {
                    <button
                      type="button"
                      class="j-scheduler-time-event__resize"
                      aria-label="Resize event end"
                      jTooltip="Resize event"
                      (pointerdown)="startGesture($event, placement.event, 'resize')"
                      (pointermove)="moveGesture($event)"
                      (pointerup)="finishGesture($event)"
                      (pointercancel)="cancelGesture($event)"
                    ></button>
                  }
                </div>
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
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly range = input.required<JSchedulerDateRange>();
  readonly events = input<readonly JSchedulerVisibleEvent[]>([]);
  readonly daysOfWeek = input<readonly number[]>([0, 1, 2, 3, 4, 5, 6]);
  readonly locale = input('en-US');
  readonly slotDuration = input('00:30');
  readonly slotMinTime = input('00:00');
  readonly slotMaxTime = input('24:00');
  readonly disabled = input(false);
  readonly draggable = input(false);
  readonly resizable = input(false);
  readonly snapMinutes = input(15);
  readonly minimumDragDistance = input(5);
  readonly dateActivate = output<Date>();
  readonly eventActivate = output<JSchedulerVisibleEvent>();
  readonly eventDoubleActivate = output<JSchedulerVisibleEvent>();
  readonly slotActivate = output<{ readonly date: Date; readonly minutes: number }>();
  readonly dragStart = output<JSchedulerRendererGesture>();
  readonly dragProgress = output<JSchedulerRendererGesture>();
  readonly dragStop = output<JSchedulerRendererGesture>();
  readonly resizeStart = output<JSchedulerRendererGesture>();
  readonly resizeProgress = output<JSchedulerRendererGesture>();
  readonly resizeStop = output<JSchedulerRendererGesture>();
  readonly activeGesture = signal<JSchedulerActiveGesture | null>(null);
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

  handleEventClick(nativeEvent: MouseEvent, event: JSchedulerVisibleEvent): void {
    if (this.activeGesture()?.moved) {
      nativeEvent.preventDefault();
      return;
    }
    this.eventActivate.emit(event);
  }

  startGesture(
    nativeEvent: PointerEvent,
    event: JSchedulerVisibleEvent,
    mode: 'drag' | 'resize',
  ): void {
    if (
      this.disabled() ||
      nativeEvent.button !== 0 ||
      (mode === 'drag' && !this.draggable()) ||
      (mode === 'resize' && !this.resizable())
    )
      return;
    nativeEvent.preventDefault();
    nativeEvent.stopPropagation();
    (nativeEvent.currentTarget as HTMLElement).setPointerCapture(nativeEvent.pointerId);
    const sourceDayIndex = this.days().findIndex(
      (day) => day.toDateString() === event.start.toDateString(),
    );
    this.activeGesture.set({
      mode,
      event,
      pointerId: nativeEvent.pointerId,
      originX: nativeEvent.clientX,
      originY: nativeEvent.clientY,
      sourceDayIndex: Math.max(0, sourceDayIndex),
      sourceStartMinutes: event.start.getHours() * 60 + event.start.getMinutes(),
      duration: event.end.getTime() - event.start.getTime(),
      moved: false,
    });
    const payload = { event, start: event.start, end: event.end, nativeEvent };
    mode === 'drag' ? this.dragStart.emit(payload) : this.resizeStart.emit(payload);
  }

  moveGesture(nativeEvent: PointerEvent): void {
    const gesture = this.activeGesture();
    if (!gesture || nativeEvent.pointerId !== gesture.pointerId) return;
    const distance = Math.hypot(
      nativeEvent.clientX - gesture.originX,
      nativeEvent.clientY - gesture.originY,
    );
    if (!gesture.moved && distance < this.minimumDragDistance()) return;
    gesture.moved = true;
    const payload = this.gestureValue(gesture, nativeEvent);
    gesture.mode === 'drag' ? this.dragProgress.emit(payload) : this.resizeProgress.emit(payload);
  }

  finishGesture(nativeEvent: PointerEvent): void {
    const gesture = this.activeGesture();
    if (!gesture || nativeEvent.pointerId !== gesture.pointerId) return;
    const payload = gesture.moved
      ? this.gestureValue(gesture, nativeEvent)
      : { event: gesture.event, start: gesture.event.start, end: gesture.event.end, nativeEvent };
    this.activeGesture.set(null);
    gesture.mode === 'drag' ? this.dragStop.emit(payload) : this.resizeStop.emit(payload);
  }

  cancelGesture(nativeEvent: PointerEvent): void {
    if (this.activeGesture()?.pointerId === nativeEvent.pointerId) this.activeGesture.set(null);
  }

  private gestureValue(
    gesture: JSchedulerActiveGesture,
    nativeEvent: PointerEvent,
  ): JSchedulerRendererGesture {
    const columns = this.host.nativeElement.querySelector<HTMLElement>(
      '.j-scheduler-time-grid__columns',
    );
    if (!columns) {
      return {
        event: gesture.event,
        start: gesture.event.start,
        end: gesture.event.end,
        nativeEvent,
      };
    }
    const rect = columns.getBoundingClientRect();
    const dayWidth = rect.width / Math.max(1, this.days().length);
    const dayDelta = Math.round((nativeEvent.clientX - gesture.originX) / dayWidth);
    const minuteDelta = Math.round(
      ((nativeEvent.clientY - gesture.originY) / Math.max(1, rect.height)) *
        (this.maxMinutes() - this.minMinutes()),
    );
    const snappedDelta =
      Math.round(minuteDelta / Math.max(1, this.snapMinutes())) * this.snapMinutes();
    if (gesture.mode === 'resize') {
      return {
        event: gesture.event,
        start: gesture.event.start,
        end: new Date(gesture.event.end.getTime() + snappedDelta * 60_000),
        nativeEvent,
      };
    }
    const targetDay =
      this.days()[Math.max(0, Math.min(this.days().length - 1, gesture.sourceDayIndex + dayDelta))];
    const start = new Date(
      targetDay?.getFullYear() ?? gesture.event.start.getFullYear(),
      targetDay?.getMonth() ?? gesture.event.start.getMonth(),
      targetDay?.getDate() ?? gesture.event.start.getDate(),
      0,
      gesture.sourceStartMinutes + snappedDelta,
    );
    return {
      event: gesture.event,
      start,
      end: new Date(start.getTime() + gesture.duration),
      nativeEvent,
    };
  }
}
