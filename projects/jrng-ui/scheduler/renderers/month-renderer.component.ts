import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
  PLATFORM_ID,
  signal,
  TemplateRef,
} from '@angular/core';
import { isPlatformBrowser, NgTemplateOutlet } from '@angular/common';
import { JTooltipDirective } from 'jrng-ui/tooltip';
import { jSchedulerMonthCells } from '../engine/date-engine';
import { jSchedulerLayoutMonthEvents } from '../engine/layout-engine';
import {
  JSchedulerCellTemplateContext,
  JSchedulerDateRange,
  JSchedulerDateInteraction,
  JSchedulerEventTemplateContext,
  JSchedulerEventInteraction,
  JSchedulerId,
  JSchedulerHeaderTemplateContext,
  JSchedulerMoreTemplateContext,
  JSchedulerSelection,
  JSchedulerVisibleEvent,
} from '../scheduler.models';

export interface JSchedulerMonthRendererGesture {
  readonly event: JSchedulerVisibleEvent;
  readonly start: Date;
  readonly end: Date;
  readonly nativeEvent: PointerEvent | KeyboardEvent;
  readonly edge?: 'start' | 'end';
}

interface JSchedulerMonthActiveGesture {
  readonly event: JSchedulerVisibleEvent;
  readonly mode: 'drag' | 'resize';
  readonly edge: 'start' | 'end';
  readonly pointerId: number;
  readonly originX: number;
  readonly originY: number;
  readonly readyAt: number;
  moved: boolean;
}

interface JSchedulerMonthActiveSelection {
  readonly pointerId: number;
  readonly originX: number;
  readonly originY: number;
  readonly date: Date;
  moved: boolean;
}

@Component({
  selector: 'j-scheduler-month-renderer',
  imports: [JTooltipDirective, NgTemplateOutlet],
  template: `
    <div class="j-scheduler-month" role="grid" aria-label="Month calendar" data-j-slot="month">
      <div class="j-scheduler-month__weekdays" role="row">
        @if (weekNumbers()) {
          <span role="columnheader">Week</span>
        }
        @for (label of weekdayLabels(); track $index; let column = $index) {
          <span role="columnheader">
            @if (weekdayTemplate()) {
              <ng-container
                [ngTemplateOutlet]="weekdayTemplate()!"
                [ngTemplateOutletContext]="weekdayContext(label, column)"
              />
            } @else {
              {{ label }}
            }
          </span>
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
                [class.j-scheduler-month__cell--selected]="dateSelected(cell.date)"
                role="gridcell"
                [attr.aria-current]="cell.today ? 'date' : null"
                [attr.aria-selected]="dateSelected(cell.date)"
                [attr.data-date]="dateKey(cell.date)"
                [attr.data-today]="cell.today || null"
                [attr.data-selected]="dateSelected(cell.date) || null"
                data-j-slot="month-cell"
              >
                <button
                  type="button"
                  class="j-scheduler-month__date"
                  [disabled]="disabled()"
                  [attr.tabindex]="
                    dateKey(cell.date) === (focusedDateKey() || dateKey(activeDate())) ? 0 : -1
                  "
                  [attr.aria-label]="dateLabel(cell.date)"
                  [jTooltip]="dateLabel(cell.date)"
                  (click)="activateDate($event, cell.date)"
                  (focus)="focusedDateKey.set(dateKey(cell.date))"
                  (pointerdown)="startDateSelection($event, cell.date)"
                  (pointermove)="moveDateSelection($event)"
                  (pointerup)="finishDateSelection($event)"
                  (pointercancel)="cancelDateSelection($event)"
                  (keydown)="handleDateKeydown($event, cell.date)"
                >
                  @if (dateNumberTemplate()) {
                    <ng-container
                      [ngTemplateOutlet]="dateNumberTemplate()!"
                      [ngTemplateOutletContext]="dateNumberContext(cell.date)"
                    />
                  } @else {
                    {{ cell.date.getDate() }}
                  }
                </button>
                @if (cellTemplate()) {
                  <ng-container
                    [ngTemplateOutlet]="cellTemplate()!"
                    [ngTemplateOutletContext]="cellContext(cell.date, cell.today)"
                  />
                }
                @if (hiddenCount(cell.date, row) > 0) {
                  <button
                    type="button"
                    class="j-scheduler-month__more"
                    [disabled]="disabled()"
                    [attr.aria-label]="
                      hiddenCount(cell.date, row) + ' more events on ' + dateLabel(cell.date)
                    "
                    [jTooltip]="hiddenCount(cell.date, row) + ' more events'"
                    (click)="activateMore($event, cell.date)"
                  >
                    @if (moreTemplate()) {
                      <ng-container
                        [ngTemplateOutlet]="moreTemplate()!"
                        [ngTemplateOutletContext]="moreContext(cell.date, row)"
                      />
                    } @else {
                      +{{ hiddenCount(cell.date, row) }} more
                    }
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
                  [class.j-scheduler-event--milestone]="segment.event.source.milestone"
                  [class.j-scheduler-event-selected]="eventSelected(segment.event)"
                  [class.j-scheduler-month-event--continues-before]="segment.continuesBefore"
                  [class.j-scheduler-month-event--continues-after]="segment.continuesAfter"
                  [class.j-scheduler-event-dragging]="
                    activeGesture()?.event?.occurrenceId === segment.event.occurrenceId
                  "
                  [style.--j-event-column]="segment.startColumn + 1"
                  [style.--j-event-span]="segment.span"
                  [style.--j-event-level]="segment.level"
                  [style.--j-event-color]="
                    segment.event.source.color || segment.event.source.backgroundColor || null
                  "
                  [disabled]="disabled() || segment.event.source.disabled"
                  [attr.data-event-id]="segment.event.source.id"
                  [attr.data-milestone]="segment.event.source.milestone || null"
                  [attr.data-selected]="eventSelected(segment.event) || null"
                  [attr.aria-pressed]="eventSelected(segment.event)"
                  [attr.data-date]="segmentDateKey(segment.row, segment.startColumn)"
                  [attr.data-dragging]="
                    activeGesture()?.event?.occurrenceId === segment.event.occurrenceId || null
                  "
                  [attr.data-all-day]="segment.event.allDay || null"
                  [attr.draggable]="externalDraggable() ? true : null"
                  [attr.aria-label]="eventLabel(segment.event)"
                  [jTooltip]="eventLabel(segment.event)"
                  (click)="activateEvent($event, segment.event)"
                  (pointerdown)="startDrag($event, segment.event)"
                  (pointermove)="moveDrag($event)"
                  (pointerup)="finishDrag($event)"
                  (pointercancel)="cancelDrag($event)"
                  (keydown)="moveWithKeyboard($event, segment.event)"
                >
                  @if (segment.continuesBefore) {
                    <span aria-hidden="true">‹</span>
                  }
                  @if (
                    resizable() &&
                    resizeFromStart() &&
                    !disabled() &&
                    segment.event.source.resizable !== false &&
                    !segment.continuesBefore
                  ) {
                    <span
                      class="j-scheduler-month-event__resize j-scheduler-month-event__resize--start"
                      aria-hidden="true"
                      data-j-slot="month-resize-start-handle"
                      (pointerdown)="startResize($event, segment.event, 'start')"
                    ></span>
                  }
                  @if (eventTemplate()) {
                    <ng-container
                      [ngTemplateOutlet]="eventTemplate()!"
                      [ngTemplateOutletContext]="eventContext(segment.event)"
                    />
                  } @else {
                    <span class="j-scheduler-event__title">{{ segment.event.source.title }}</span>
                  }
                  @if (
                    resizable() &&
                    !disabled() &&
                    segment.event.source.resizable !== false &&
                    !segment.continuesAfter
                  ) {
                    <span
                      class="j-scheduler-month-event__resize"
                      aria-hidden="true"
                      data-j-slot="month-resize-handle"
                      (pointerdown)="startResize($event, segment.event, 'end')"
                    ></span>
                  }
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
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private resizeObserver?: ResizeObserver;
  readonly activeDate = input.required<Date>();
  readonly range = input.required<JSchedulerDateRange>();
  readonly events = input<readonly JSchedulerVisibleEvent[]>([]);
  readonly selectedEventIds = input<readonly JSchedulerId[]>([]);
  readonly selectedRange = input<JSchedulerSelection | null>(null);
  readonly locale = input('en-US');
  readonly firstDayOfWeek = input(0);
  readonly maxEventsVisible = input<number | 'auto'>(3);
  readonly expandedDateKeys = input<ReadonlySet<string>>(new Set());
  readonly weekNumbers = input(false);
  readonly disabled = input(false);
  readonly selectable = input(false);
  readonly draggable = input(false);
  readonly resizable = input(false);
  readonly resizeFromStart = input(false);
  readonly minimumDragDistance = input(5);
  readonly touchLongPressDelay = input(350);
  readonly externalDraggable = input(false);
  readonly eventTemplate = input<TemplateRef<JSchedulerEventTemplateContext> | undefined>();
  readonly cellTemplate = input<TemplateRef<JSchedulerCellTemplateContext> | undefined>();
  readonly dateNumberTemplate = input<TemplateRef<JSchedulerHeaderTemplateContext> | undefined>();
  readonly weekdayTemplate = input<TemplateRef<JSchedulerHeaderTemplateContext> | undefined>();
  readonly moreTemplate = input<TemplateRef<JSchedulerMoreTemplateContext> | undefined>();
  readonly dateActivate = output<JSchedulerDateInteraction>();
  readonly navigate = output<Date>();
  readonly rangeActivate = output<JSchedulerDateInteraction>();
  readonly eventActivate = output<JSchedulerEventInteraction>();
  readonly moreActivate = output<{
    readonly date: Date;
    readonly trigger: HTMLElement;
  }>();
  readonly dragStart = output<JSchedulerMonthRendererGesture>();
  readonly dragStop = output<JSchedulerMonthRendererGesture>();
  readonly resizeStart = output<JSchedulerMonthRendererGesture>();
  readonly resizeStop = output<JSchedulerMonthRendererGesture>();
  readonly activeGesture = signal<JSchedulerMonthActiveGesture | null>(null);
  readonly focusedDateKey = signal('');
  readonly suppressedClickOccurrence = signal<string | null>(null);
  readonly activeDateSelection = signal<JSchedulerMonthActiveSelection | null>(null);
  readonly suppressDateClick = signal(false);
  readonly autoEventLimit = signal(3);
  readonly effectiveMaxEventsVisible = computed(() => {
    const value = this.maxEventsVisible();
    return value === 'auto' ? this.autoEventLimit() : Math.max(0, Math.floor(value));
  });

  constructor() {
    afterNextRender(() => {
      if (!this.isBrowser) return;
      this.refreshAutoEventLimit();
      if (typeof ResizeObserver === 'undefined') return;
      this.resizeObserver = new ResizeObserver(() => this.refreshAutoEventLimit());
      this.resizeObserver.observe(this.host.nativeElement);
    });
    this.destroyRef.onDestroy(() => this.resizeObserver?.disconnect());
  }

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
      (segment) =>
        segment.row === row &&
        (this.rowExpanded(row) || segment.level < this.effectiveMaxEventsVisible()),
    );
  }

  hiddenCount(date: Date, row: number): number {
    if (this.rowExpanded(row)) return 0;
    const column =
      this.weeks()[row]?.findIndex((cell) => cell.date.getTime() === date.getTime()) ?? -1;
    if (column < 0) return 0;
    return this.segments().filter(
      (segment) =>
        segment.row === row &&
        segment.level >= this.effectiveMaxEventsVisible() &&
        column >= segment.startColumn &&
        column < segment.startColumn + segment.span,
    ).length;
  }

  private rowExpanded(row: number): boolean {
    return !!this.weeks()[row]?.some((cell) =>
      this.expandedDateKeys().has(this.dateKey(cell.date)),
    );
  }

  refreshAutoEventLimit(): void {
    if (!this.isBrowser || this.maxEventsVisible() !== 'auto') return;
    const week = this.host.nativeElement.querySelector<HTMLElement>('.j-scheduler-month__week');
    if (!week) return;
    const weekHeight = week.getBoundingClientRect().height || week.clientHeight;
    if (weekHeight <= 0) return;
    const event = week.querySelector<HTMLElement>('.j-scheduler-month-event');
    const eventHeight = event?.getBoundingClientRect().height || 24;
    const availableHeight = Math.max(0, weekHeight - 34);
    this.autoEventLimit.set(Math.max(1, Math.floor(availableHeight / Math.max(1, eventHeight))));
  }

  dateKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  segmentDateKey(row: number, column: number): string {
    const date = new Date(this.range().start);
    date.setDate(date.getDate() + row * 7 + column);
    return this.dateKey(date);
  }

  dateLabel(date: Date): string {
    return new Intl.DateTimeFormat(this.locale(), { dateStyle: 'full' }).format(date);
  }
  dateSelected(date: Date): boolean {
    const selection = this.selectedRange();
    if (!selection) return false;
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    const selectionEnd = selection.end ?? selection.start;
    return selection.start < dayEnd && selectionEnd > dayStart;
  }

  activateDate(nativeEvent: MouseEvent, date: Date): void {
    this.focusedDateKey.set(this.dateKey(date));
    if (this.suppressDateClick()) {
      nativeEvent.preventDefault();
      this.suppressDateClick.set(false);
      return;
    }
    this.dateActivate.emit({
      start: new Date(date),
      end: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
      allDay: true,
      view: 'month',
      nativeEvent,
    });
  }

  handleDateKeydown(nativeEvent: KeyboardEvent, date: Date): void {
    if (nativeEvent.key === 'Escape') {
      this.cancelDateSelection();
      return;
    }
    if (nativeEvent.key === 'Enter' || nativeEvent.key === ' ') {
      nativeEvent.preventDefault();
      this.dateActivate.emit({
        start: new Date(date),
        end: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
        allDay: true,
        view: 'month',
        nativeEvent,
      });
      return;
    }
    let target: Date | null = null;
    if (nativeEvent.key === 'ArrowLeft')
      target = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
    if (nativeEvent.key === 'ArrowRight')
      target = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    if (nativeEvent.key === 'ArrowUp')
      target = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 7);
    if (nativeEvent.key === 'ArrowDown')
      target = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 7);
    if (nativeEvent.key === 'Home')
      target = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() - ((date.getDay() - this.firstDayOfWeek() + 7) % 7),
      );
    if (nativeEvent.key === 'End')
      target = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() + (6 - ((date.getDay() - this.firstDayOfWeek() + 7) % 7)),
      );
    if (nativeEvent.key === 'PageUp')
      target = new Date(date.getFullYear(), date.getMonth() - 1, date.getDate());
    if (nativeEvent.key === 'PageDown')
      target = new Date(date.getFullYear(), date.getMonth() + 1, date.getDate());
    if (!target) return;
    nativeEvent.preventDefault();
    this.focusedDateKey.set(this.dateKey(target));
    if (target < this.range().start || target >= this.range().end) this.navigate.emit(target);
    queueMicrotask(() => this.focusDate(target!));
  }

  private focusDate(date: Date): void {
    const key = this.dateKey(date);
    const buttons = this.host.nativeElement.querySelectorAll<HTMLButtonElement>(
      '.j-scheduler-month__date',
    );
    Array.from(buttons)
      .find((button) => button.closest<HTMLElement>('[data-date]')?.dataset['date'] === key)
      ?.focus({ preventScroll: true });
  }

  startDateSelection(nativeEvent: PointerEvent, date: Date): void {
    if (!this.selectable() || this.disabled() || nativeEvent.button !== 0) return;
    capturePointer(nativeEvent.currentTarget, nativeEvent.pointerId);
    this.activeDateSelection.set({
      pointerId: nativeEvent.pointerId,
      originX: nativeEvent.clientX,
      originY: nativeEvent.clientY,
      date: new Date(date),
      moved: false,
    });
  }

  moveDateSelection(nativeEvent: PointerEvent): void {
    const active = this.activeDateSelection();
    if (!active || active.pointerId !== nativeEvent.pointerId) return;
    if (Math.hypot(nativeEvent.clientX - active.originX, nativeEvent.clientY - active.originY) >= 3)
      active.moved = true;
  }

  finishDateSelection(nativeEvent: PointerEvent): void {
    const active = this.activeDateSelection();
    if (!active || active.pointerId !== nativeEvent.pointerId) return;
    this.activeDateSelection.set(null);
    if (!active.moved) return;
    const value = (nativeEvent.currentTarget as HTMLElement).ownerDocument
      .elementFromPoint(nativeEvent.clientX, nativeEvent.clientY)
      ?.closest<HTMLElement>('[data-date]')?.dataset['date'];
    if (!value) return;
    const [year, month, day] = value.split('-').map(Number);
    if (!year || !month || !day) return;
    const target = new Date(year, month - 1, day);
    const start = new Date(Math.min(active.date.getTime(), target.getTime()));
    const last = new Date(Math.max(active.date.getTime(), target.getTime()));
    this.suppressDateClick.set(true);
    this.rangeActivate.emit({
      start,
      end: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1),
      allDay: true,
      view: 'month',
      nativeEvent,
    });
  }

  cancelDateSelection(nativeEvent?: PointerEvent): void {
    const active = this.activeDateSelection();
    if (!active || (nativeEvent && active.pointerId !== nativeEvent.pointerId)) return;
    this.activeDateSelection.set(null);
  }

  eventLabel(event: JSchedulerVisibleEvent): string {
    return `${event.source.title}, ${this.dateLabel(event.start)}`;
  }

  eventContext(event: JSchedulerVisibleEvent): JSchedulerEventTemplateContext {
    return {
      $implicit: event,
      event: event.source,
      view: 'month',
      selected: this.eventSelected(event),
      dragging: this.activeGesture()?.event.occurrenceId === event.occurrenceId,
      resizing:
        this.activeGesture()?.mode === 'resize' &&
        this.activeGesture()?.event.occurrenceId === event.occurrenceId,
      conflict: false,
    };
  }

  cellContext(date: Date, today: boolean): JSchedulerCellTemplateContext {
    return {
      $implicit: date,
      date,
      view: 'month',
      selected: this.dateSelected(date),
      today,
      disabled: this.disabled(),
    };
  }

  weekdayContext(label: string, column: number): JSchedulerHeaderTemplateContext {
    const date = new Date(this.range().start);
    date.setDate(date.getDate() + column);
    return { $implicit: label, label, date, view: 'month' };
  }

  dateNumberContext(date: Date): JSchedulerHeaderTemplateContext {
    const label = String(date.getDate());
    return { $implicit: label, label, date, view: 'month' };
  }

  moreContext(date: Date, row: number): JSchedulerMoreTemplateContext {
    const hiddenCount = this.hiddenCount(date, row);
    return { $implicit: hiddenCount, hiddenCount, date, view: 'month' };
  }

  activateMore(nativeEvent: MouseEvent, date: Date): void {
    const trigger = nativeEvent.currentTarget;
    if (trigger instanceof HTMLElement) this.moreActivate.emit({ date, trigger });
  }

  activateEvent(nativeEvent: MouseEvent, event: JSchedulerVisibleEvent): void {
    if (this.suppressedClickOccurrence() === event.occurrenceId) {
      nativeEvent.preventDefault();
      this.suppressedClickOccurrence.set(null);
      return;
    }
    this.eventActivate.emit({
      event: event.source,
      occurrenceStart: event.start,
      nativeEvent,
    });
  }

  eventSelected(event: JSchedulerVisibleEvent): boolean {
    return this.selectedEventIds().some((id) => String(id) === String(event.source.id));
  }

  startDrag(nativeEvent: PointerEvent, event: JSchedulerVisibleEvent): void {
    if (
      !this.draggable() ||
      this.disabled() ||
      event.source.disabled ||
      event.source.readonly ||
      event.source.editable === false ||
      event.source.startEditable === false ||
      event.source.draggable === false
    )
      return;
    const target = nativeEvent.currentTarget;
    capturePointer(target, nativeEvent.pointerId);
    this.activeGesture.set({
      event,
      mode: 'drag',
      edge: 'end',
      pointerId: nativeEvent.pointerId,
      originX: nativeEvent.clientX,
      originY: nativeEvent.clientY,
      readyAt: nativeEvent.pointerType === 'touch' ? Date.now() + this.touchLongPressDelay() : 0,
      moved: false,
    });
    this.dragStart.emit(this.gestureFor(event, nativeEvent));
  }

  startResize(
    nativeEvent: PointerEvent,
    event: JSchedulerVisibleEvent,
    edge: 'start' | 'end' = 'end',
  ): void {
    nativeEvent.stopPropagation();
    if (
      !this.resizable() ||
      this.disabled() ||
      event.source.disabled ||
      event.source.readonly ||
      event.source.editable === false ||
      event.source.resizable === false ||
      event.source.durationEditable === false ||
      (edge === 'start' && !this.resizeFromStart())
    )
      return;
    const target = nativeEvent.currentTarget;
    capturePointer(target, nativeEvent.pointerId);
    this.activeGesture.set({
      event,
      mode: 'resize',
      edge,
      pointerId: nativeEvent.pointerId,
      originX: nativeEvent.clientX,
      originY: nativeEvent.clientY,
      readyAt: nativeEvent.pointerType === 'touch' ? Date.now() + this.touchLongPressDelay() : 0,
      moved: false,
    });
    this.resizeStart.emit(this.gestureFor(event, nativeEvent, edge));
  }

  moveDrag(nativeEvent: PointerEvent): void {
    const gesture = this.activeGesture();
    if (!gesture || gesture.pointerId !== nativeEvent.pointerId) return;
    if (Date.now() < gesture.readyAt) return;
    if (
      Math.hypot(nativeEvent.clientX - gesture.originX, nativeEvent.clientY - gesture.originY) >=
      this.minimumDragDistance()
    )
      gesture.moved = true;
  }

  finishDrag(nativeEvent: PointerEvent): void {
    const gesture = this.activeGesture();
    if (!gesture || gesture.pointerId !== nativeEvent.pointerId) return;
    this.activeGesture.set(null);
    if (Date.now() < gesture.readyAt) return;
    if (!gesture.moved) return;
    this.suppressedClickOccurrence.set(gesture.event.occurrenceId);
    const target = (nativeEvent.currentTarget as HTMLElement).ownerDocument
      .elementFromPoint(nativeEvent.clientX, nativeEvent.clientY)
      ?.closest<HTMLElement>('[data-date]');
    const date = target?.dataset['date'];
    if (!date) return;
    const [year, month, day] = date.split('-').map(Number);
    if (!year || !month || !day) return;
    const targetDay = new Date(year, month - 1, day);
    if (gesture.mode === 'resize') {
      const start =
        gesture.edge === 'start'
          ? this.resizeStartForDay(gesture.event, targetDay)
          : new Date(gesture.event.start);
      const end =
        gesture.edge === 'end'
          ? this.resizeEndForDay(gesture.event, targetDay)
          : new Date(gesture.event.end);
      this.resizeStop.emit({
        event: gesture.event,
        start,
        end,
        nativeEvent,
        edge: gesture.edge,
      });
      return;
    }
    const sourceDay = new Date(
      gesture.event.start.getFullYear(),
      gesture.event.start.getMonth(),
      gesture.event.start.getDate(),
    );
    const dayDelta = Math.round((targetDay.getTime() - sourceDay.getTime()) / 86_400_000);
    const start = new Date(gesture.event.start);
    const end = new Date(gesture.event.end);
    start.setDate(start.getDate() + dayDelta);
    end.setDate(end.getDate() + dayDelta);
    this.dragStop.emit({ event: gesture.event, start, end, nativeEvent });
  }

  cancelDrag(nativeEvent: PointerEvent): void {
    if (this.activeGesture()?.pointerId === nativeEvent.pointerId) this.activeGesture.set(null);
  }

  moveWithKeyboard(nativeEvent: KeyboardEvent, event: JSchedulerVisibleEvent): void {
    const resizing = nativeEvent.shiftKey;
    if (
      this.disabled() ||
      !nativeEvent.altKey ||
      event.source.disabled ||
      event.source.readonly ||
      event.source.editable === false ||
      (resizing
        ? !this.resizable() ||
          event.source.resizable === false ||
          event.source.durationEditable === false
        : !this.draggable() ||
          event.source.draggable === false ||
          event.source.startEditable === false)
    )
      return;
    const target = nativeEvent.currentTarget as HTMLElement;
    const rtlDirection =
      target.ownerDocument.defaultView?.getComputedStyle(target).direction === 'rtl' ? -1 : 1;
    const delta =
      nativeEvent.key === 'ArrowUp'
        ? -7
        : nativeEvent.key === 'ArrowDown'
          ? 7
          : nativeEvent.key === 'ArrowLeft'
            ? -rtlDirection
            : nativeEvent.key === 'ArrowRight'
              ? rtlDirection
              : 0;
    if (!delta) return;
    if (
      resizing &&
      (!this.resizable() ||
        event.source.resizable === false ||
        event.source.durationEditable === false)
    )
      return;
    nativeEvent.preventDefault();
    const start = new Date(event.start);
    const end = new Date(event.end);
    if (resizing && this.resizable()) {
      const edge: 'start' | 'end' =
        (nativeEvent.ctrlKey || nativeEvent.metaKey) && this.resizeFromStart() ? 'start' : 'end';
      if (edge === 'start') {
        start.setDate(start.getDate() + delta);
        if (start >= end) start.setTime(end.getTime() - 86_400_000);
      } else {
        end.setDate(end.getDate() + delta);
        if (end <= start) end.setTime(start.getTime() + 86_400_000);
      }
      this.resizeStart.emit(this.gestureFor(event, nativeEvent, edge));
      this.resizeStop.emit({ event, start, end, nativeEvent, edge });
    } else {
      start.setDate(start.getDate() + delta);
      end.setDate(end.getDate() + delta);
      this.dragStart.emit(this.gestureFor(event, nativeEvent));
      this.dragStop.emit({ event, start, end, nativeEvent });
    }
  }

  private resizeEndForDay(event: JSchedulerVisibleEvent, targetDay: Date): Date {
    const endsAtMidnight =
      event.end.getHours() === 0 &&
      event.end.getMinutes() === 0 &&
      event.end.getSeconds() === 0 &&
      event.end.getMilliseconds() === 0;
    if (event.allDay || endsAtMidnight)
      return new Date(targetDay.getFullYear(), targetDay.getMonth(), targetDay.getDate() + 1);
    return new Date(
      targetDay.getFullYear(),
      targetDay.getMonth(),
      targetDay.getDate(),
      event.end.getHours(),
      event.end.getMinutes(),
      event.end.getSeconds(),
      event.end.getMilliseconds(),
    );
  }

  private resizeStartForDay(event: JSchedulerVisibleEvent, targetDay: Date): Date {
    if (event.allDay)
      return new Date(targetDay.getFullYear(), targetDay.getMonth(), targetDay.getDate());
    return new Date(
      targetDay.getFullYear(),
      targetDay.getMonth(),
      targetDay.getDate(),
      event.start.getHours(),
      event.start.getMinutes(),
      event.start.getSeconds(),
      event.start.getMilliseconds(),
    );
  }

  private gestureFor(
    event: JSchedulerVisibleEvent,
    nativeEvent: PointerEvent | KeyboardEvent,
    edge?: 'start' | 'end',
  ): JSchedulerMonthRendererGesture {
    return { event, start: new Date(event.start), end: new Date(event.end), nativeEvent, edge };
  }
}

function capturePointer(target: EventTarget | null, pointerId: number): void {
  if (!(target instanceof HTMLElement)) return;
  try {
    target.setPointerCapture(pointerId);
  } catch {
    // Synthetic events and older engines may not have an active native pointer.
  }
}
