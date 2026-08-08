import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  output,
  signal,
  TemplateRef,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { JTooltipDirective } from 'jrng-ui/tooltip';
import { jSchedulerDatesInRange } from '../engine/date-engine';
import { jSchedulerResourceMatchesEvent } from '../engine/resource-engine';
import { jSchedulerLayoutTimedEvents, jSchedulerParseTime } from '../engine/layout-engine';
import {
  JSchedulerAppointmentSlot,
  JSchedulerAppointmentDisplay,
  JSchedulerAppointmentTemplateContext,
  JSchedulerAvailabilityRule,
  JSchedulerBlockedInterval,
  JSchedulerBlockedTemplateContext,
  JSchedulerBusinessHours,
  JSchedulerDateRange,
  JSchedulerDateInteraction,
  JSchedulerCellTemplateContext,
  JSchedulerEventTemplateContext,
  JSchedulerEventInteraction,
  JSchedulerId,
  JSchedulerHeaderTemplateContext,
  JSchedulerResource,
  JSchedulerSelection,
  JSchedulerVisibleEvent,
  JSchedulerView,
} from '../scheduler.models';

export interface JSchedulerRendererGesture {
  readonly event: JSchedulerVisibleEvent;
  readonly start: Date;
  readonly end: Date;
  readonly nativeEvent: PointerEvent | KeyboardEvent;
  readonly resourceId?: JSchedulerId;
  readonly resourceIds?: readonly JSchedulerId[];
  readonly edge?: 'start' | 'end';
}

interface JSchedulerTimeGridLane {
  readonly key: string;
  readonly date: Date;
  readonly resource: JSchedulerResource | null;
}

interface JSchedulerActiveGesture {
  readonly mode: 'drag' | 'resize';
  readonly edge: 'start' | 'end';
  readonly event: JSchedulerVisibleEvent;
  readonly pointerId: number;
  readonly originX: number;
  readonly originY: number;
  readonly sourceLaneIndex: number;
  readonly sourceStartMinutes: number;
  readonly duration: number;
  readonly readyAt: number;
  moved: boolean;
}

interface JSchedulerActiveSlotSelection {
  readonly pointerId: number;
  readonly originX: number;
  readonly originY: number;
  readonly date: Date;
  readonly minutes: number;
  readonly resourceId?: JSchedulerId;
  moved: boolean;
}

@Component({
  selector: 'j-scheduler-time-grid-renderer',
  imports: [JTooltipDirective, NgTemplateOutlet],
  template: `
    <div
      class="j-scheduler-time-grid"
      [style.--j-day-count]="lanes().length"
      data-j-slot="time-grid"
    >
      <div class="j-scheduler-time-grid__header" role="row">
        <span aria-hidden="true"></span>
        @for (lane of lanes(); track lane.key) {
          <button
            type="button"
            [disabled]="disabled()"
            [attr.aria-label]="laneLabel(lane)"
            [jTooltip]="laneLabel(lane)"
            [attr.data-resource-id]="lane.resource?.id ?? null"
            [attr.data-aggregate]="lane.resource?.children?.length ? true : null"
            (click)="activateDate($event, lane)"
          >
            @if (dayHeaderTemplate()) {
              <ng-container
                [ngTemplateOutlet]="dayHeaderTemplate()!"
                [ngTemplateOutletContext]="dayHeaderContext(lane)"
              />
            } @else {
              <span>{{ weekdayLabel(lane.date) }}</span
              ><strong>{{ lane.date.getDate() }}</strong>
              @if (lane.resource) {
                <small>{{ lane.resource.name }}</small>
              }
            }
          </button>
        }
      </div>
      <div class="j-scheduler-time-grid__all-day" role="row">
        <span>All day</span>
        @for (lane of lanes(); track lane.key) {
          <div
            role="gridcell"
            [attr.data-date]="dateKey(lane.date)"
            [attr.data-resource-id]="lane.resource?.id ?? null"
            [attr.data-aggregate]="lane.resource?.children?.length ? true : null"
          >
            @for (event of allDayEvents(lane); track event.occurrenceId) {
              <button
                type="button"
                class="j-scheduler-event"
                [class.j-scheduler-event-selected]="eventSelected(event)"
                [disabled]="disabled() || event.source.disabled"
                [attr.data-event-id]="event.source.id"
                [attr.data-selected]="eventSelected(event) || null"
                [attr.aria-pressed]="eventSelected(event)"
                data-all-day="true"
                [jTooltip]="eventLabel(event)"
                (click)="handleEventClick($event, event)"
              >
                @if (allDayEventTemplate() || eventTemplate()) {
                  <ng-container
                    [ngTemplateOutlet]="(allDayEventTemplate() || eventTemplate())!"
                    [ngTemplateOutletContext]="eventContext(event, lane.resource)"
                  />
                } @else {
                  {{ event.source.title }}
                }
              </button>
            }
          </div>
        }
      </div>
      @if (appointmentDisplay() === 'lane' || appointmentDisplay() === 'separateLane') {
        <div
          class="j-scheduler-time-grid__availability-lanes"
          role="row"
          aria-label="Appointment availability"
          data-j-slot="appointment-lane"
        >
          <span>Availability</span>
          @for (lane of lanes(); track lane.key) {
            <div role="gridcell" [attr.data-resource-id]="lane.resource?.id ?? null">
              @for (slot of appointmentsForLane(lane); track slot.id) {
                <button
                  type="button"
                  class="j-scheduler-time-grid__appointment-lane-slot"
                  [class.is-full]="slot.status === 'full'"
                  [class.is-blocked]="slot.status === 'blocked'"
                  [disabled]="disabled() || slot.status === 'blocked'"
                  [attr.data-slot-id]="slot.id"
                  [attr.aria-label]="slotLabel(slot)"
                  [jTooltip]="slotLabel(slot)"
                  (click)="appointmentActivate.emit(slot)"
                >
                  @if (appointmentTemplate()) {
                    <ng-container
                      [ngTemplateOutlet]="appointmentTemplate()!"
                      [ngTemplateOutletContext]="appointmentContext(slot, lane.resource)"
                    />
                  } @else {
                    <time>{{ appointmentTime(slot) }}</time>
                    <span>{{ slot.status }}</span>
                  }
                </button>
              }
            </div>
          }
        </div>
      }
      <div class="j-scheduler-time-grid__body" role="grid" aria-label="Time grid">
        <div class="j-scheduler-time-grid__labels" aria-hidden="true">
          @for (slot of slots(); track slot) {
            @if ((slot - minMinutes()) % labelMinutes() === 0) {
              <span [style.top.%]="slotTop(slot)">
                @if (timeLabelTemplate()) {
                  <ng-container
                    [ngTemplateOutlet]="timeLabelTemplate()!"
                    [ngTemplateOutletContext]="timeHeaderContext(slot)"
                  />
                } @else {
                  {{ timeLabel(slot) }}
                }
              </span>
            }
          }
        </div>
        <div class="j-scheduler-time-grid__columns" [style.--j-day-count]="lanes().length">
          @for (lane of lanes(); track lane.key; let firstLane = $first) {
            <div
              class="j-scheduler-time-grid__day"
              [class.j-scheduler-time-grid__day--working-calendar]="
                showBusinessHours() &&
                (businessHoursForLane(lane).length || availabilityForLane(lane).length)
              "
              role="gridcell"
              [attr.data-date]="dateKey(lane.date)"
              [attr.data-resource-id]="lane.resource?.id ?? null"
              [attr.data-aggregate]="lane.resource?.children?.length ? true : null"
            >
              @if (showBusinessHours()) {
                @for (hours of businessHoursForLane(lane); track hours.start.getTime()) {
                  <div
                    class="j-scheduler-business-hours"
                    [style.top.%]="rangeTop(hours.start)"
                    [style.height.%]="rangeHeight(hours.start, hours.end)"
                    aria-label="Business hours"
                    data-j-slot="business-hours"
                  ></div>
                }
                @for (available of availabilityForLane(lane); track available.start.getTime()) {
                  <div
                    class="j-scheduler-availability"
                    [style.top.%]="rangeTop(available.start)"
                    [style.height.%]="rangeHeight(available.start, available.end)"
                    [attr.aria-label]="available.label || 'Available'"
                    data-j-slot="availability"
                  ></div>
                }
              }
              @if (nowForLane(lane); as current) {
                <div
                  class="j-scheduler-now-indicator"
                  [style.top.%]="rangeTop(current)"
                  role="presentation"
                  data-j-slot="now-indicator"
                >
                  <span aria-hidden="true"></span>
                </div>
              }
              @for (slot of slots(); track slot) {
                <button
                  type="button"
                  class="j-scheduler-time-grid__slot"
                  [class.j-scheduler-time-grid__slot--hour]="slot % 60 === 0"
                  [class.j-scheduler-time-grid__slot--selected]="slotSelected(lane, slot)"
                  [style.top.%]="slotTop(slot)"
                  [attr.tabindex]="
                    slotFocusKey(lane, slot) === focusedSlotKey() ||
                    (!focusedSlotKey() && firstLane && slot === minMinutes())
                      ? 0
                      : -1
                  "
                  [attr.data-focus-key]="slotFocusKey(lane, slot)"
                  [disabled]="disabled()"
                  [attr.data-j-time]="timeKey(slot)"
                  [attr.data-selected]="slotSelected(lane, slot) || null"
                  [attr.aria-selected]="slotSelected(lane, slot)"
                  [attr.aria-label]="laneLabel(lane) + ' ' + timeLabel(slot)"
                  (click)="activateSlot($event, lane, slot)"
                  (focus)="focusedSlotKey.set(slotFocusKey(lane, slot))"
                  (keydown)="handleSlotKeydown($event, lane, slot)"
                  (pointerdown)="startSlotSelection($event, lane, slot)"
                  (pointermove)="moveSlotSelection($event)"
                  (pointerup)="finishSlotSelection($event)"
                  (pointercancel)="cancelSlotSelection($event)"
                >
                  @if (slotTemplate()) {
                    <ng-container
                      [ngTemplateOutlet]="slotTemplate()!"
                      [ngTemplateOutletContext]="cellContext(lane, slot)"
                    />
                  }
                </button>
              }
              @for (event of backgroundEventsForLane(lane); track event.occurrenceId) {
                <div
                  class="j-scheduler-time-grid__background"
                  [class.j-scheduler-time-grid__background--inverse]="
                    event.source.display === 'inverse-background'
                  "
                  [style.top.%]="rangeTop(event.start)"
                  [style.height.%]="rangeHeight(event.start, event.end)"
                  [style.--j-event-color]="
                    event.source.color || event.source.backgroundColor || null
                  "
                  [attr.aria-label]="eventLabel(event)"
                  [attr.data-event-id]="event.source.id"
                  data-j-slot="background-event"
                ></div>
              }
              @for (block of blocksForLane(lane); track block.id ?? $index) {
                <div
                  class="j-scheduler-time-grid__blocked"
                  [style.top.%]="rangeTop(block.start)"
                  [style.height.%]="rangeHeight(block.start, block.end)"
                  [attr.aria-label]="block.reason || block.label || 'Blocked'"
                  data-j-slot="blocked-interval"
                >
                  @if (blockedTemplate()) {
                    <ng-container
                      [ngTemplateOutlet]="blockedTemplate()!"
                      [ngTemplateOutletContext]="blockedContext(block, lane.resource)"
                    />
                  } @else {
                    <span>{{ block.label || block.reason || 'Blocked' }}</span>
                  }
                </div>
              }
              @if (appointmentDisplay() !== 'lane' && appointmentDisplay() !== 'separateLane') {
                @for (slot of appointmentsForLane(lane); track slot.id) {
                  <button
                    type="button"
                    class="j-scheduler-time-grid__appointment"
                    [class.j-scheduler-time-grid__appointment--grid]="
                      appointmentDisplay() === 'grid'
                    "
                    [class.j-scheduler-time-grid__appointment--indicator]="
                      appointmentDisplay() === 'indicator'
                    "
                    [class.is-full]="slot.status === 'full'"
                    [class.is-blocked]="slot.status === 'blocked'"
                    [style.top.%]="rangeTop(slot.start)"
                    [style.height.%]="
                      appointmentDisplay() === 'indicator'
                        ? null
                        : rangeHeight(slot.start, slot.end)
                    "
                    [disabled]="disabled() || slot.status === 'blocked'"
                    [attr.data-slot-id]="slot.id"
                    [attr.data-display]="appointmentDisplay()"
                    [attr.aria-label]="slotLabel(slot)"
                    [jTooltip]="slotLabel(slot)"
                    (click)="appointmentActivate.emit(slot)"
                  >
                    @if (appointmentTemplate()) {
                      <ng-container
                        [ngTemplateOutlet]="appointmentTemplate()!"
                        [ngTemplateOutletContext]="appointmentContext(slot, lane.resource)"
                      />
                    } @else {
                      <span>{{ slot.status || 'available' }}</span>
                    }
                  </button>
                }
              }
              @for (placement of placementsForLane(lane); track placement.event.occurrenceId) {
                <div
                  class="j-scheduler-event j-scheduler-time-event"
                  [class.j-scheduler-event--milestone]="placement.event.source.milestone"
                  [class.j-scheduler-event-selected]="eventSelected(placement.event)"
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
                  [attr.data-milestone]="placement.event.source.milestone || null"
                  [attr.data-selected]="eventSelected(placement.event) || null"
                  [attr.data-dragging]="activeGesture()?.mode === 'drag' || null"
                  [attr.data-resizing]="activeGesture()?.mode === 'resize' || null"
                >
                  @if (
                    resizable() &&
                    resizeFromStart() &&
                    !disabled() &&
                    !placement.event.source.disabled
                  ) {
                    <button
                      type="button"
                      class="j-scheduler-time-event__resize j-scheduler-time-event__resize--start"
                      aria-label="Resize event start"
                      jTooltip="Resize event start"
                      (pointerdown)="startGesture($event, placement.event, 'resize', 'start')"
                      (pointermove)="moveGesture($event)"
                      (pointerup)="finishGesture($event)"
                      (pointercancel)="cancelGesture($event)"
                    ></button>
                  }
                  <button
                    type="button"
                    class="j-scheduler-time-event__content"
                    [disabled]="disabled() || placement.event.source.disabled"
                    [attr.aria-pressed]="eventSelected(placement.event)"
                    [attr.draggable]="externalDraggable() ? true : null"
                    [jTooltip]="eventLabel(placement.event)"
                    (click)="handleEventClick($event, placement.event)"
                    (dblclick)="eventDoubleActivate.emit(placement.event)"
                    (pointerdown)="startGesture($event, placement.event, 'drag')"
                    (pointermove)="moveGesture($event)"
                    (pointerup)="finishGesture($event)"
                    (pointercancel)="cancelGesture($event)"
                    (keydown)="moveEventWithKeyboard($event, placement.event)"
                  >
                    @if (eventTemplate()) {
                      <ng-container
                        [ngTemplateOutlet]="eventTemplate()!"
                        [ngTemplateOutletContext]="eventContext(placement.event, lane.resource)"
                      />
                    } @else {
                      <strong>{{ placement.event.source.title }}</strong
                      ><span>{{ eventTime(placement.event) }}</span>
                    }
                  </button>
                  @if (resizable() && !disabled() && !placement.event.source.disabled) {
                    <button
                      type="button"
                      class="j-scheduler-time-event__resize"
                      aria-label="Resize event end"
                      jTooltip="Resize event"
                      (pointerdown)="startGesture($event, placement.event, 'resize', 'end')"
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
  readonly view = input<JSchedulerView>('week');
  readonly events = input<readonly JSchedulerVisibleEvent[]>([]);
  readonly selectedEventIds = input<readonly JSchedulerId[]>([]);
  readonly selectedRange = input<JSchedulerSelection | null>(null);
  readonly daysOfWeek = input<readonly number[]>([0, 1, 2, 3, 4, 5, 6]);
  readonly locale = input('en-US');
  readonly slotDuration = input('00:30');
  readonly slotLabelInterval = input('00:30');
  readonly slotMinTime = input('00:00');
  readonly slotMaxTime = input('24:00');
  readonly disabled = input(false);
  readonly selectable = input(false);
  readonly rtl = input(false);
  readonly now = input<Date>(new Date());
  readonly showNowIndicator = input(true);
  readonly blockedIntervals = input<readonly JSchedulerBlockedInterval[]>([]);
  readonly businessHours = input<readonly JSchedulerBusinessHours[]>([]);
  readonly availability = input<readonly JSchedulerAvailabilityRule[]>([]);
  readonly showBusinessHours = input(true);
  readonly appointmentSlots = input<readonly JSchedulerAppointmentSlot[]>([]);
  readonly appointmentDisplay = input<JSchedulerAppointmentDisplay>('overlay');
  readonly resources = input<readonly JSchedulerResource[]>([]);
  readonly resourceAggregateColumns = input(false);
  readonly groupBy = input<'resource' | 'date'>('resource');
  readonly draggable = input(false);
  readonly resizable = input(false);
  readonly resizeFromStart = input(false);
  readonly snapMinutes = input(15);
  readonly minimumDragDistance = input(5);
  readonly touchLongPressDelay = input(350);
  readonly externalDraggable = input(false);
  readonly eventTemplate = input<TemplateRef<JSchedulerEventTemplateContext> | undefined>();
  readonly allDayEventTemplate = input<TemplateRef<JSchedulerEventTemplateContext> | undefined>();
  readonly slotTemplate = input<TemplateRef<JSchedulerCellTemplateContext> | undefined>();
  readonly dayHeaderTemplate = input<TemplateRef<JSchedulerHeaderTemplateContext> | undefined>();
  readonly timeLabelTemplate = input<TemplateRef<JSchedulerHeaderTemplateContext> | undefined>();
  readonly appointmentTemplate = input<
    TemplateRef<JSchedulerAppointmentTemplateContext> | undefined
  >();
  readonly blockedTemplate = input<TemplateRef<JSchedulerBlockedTemplateContext> | undefined>();
  readonly dateActivate = output<JSchedulerDateInteraction>();
  readonly eventActivate = output<JSchedulerEventInteraction>();
  readonly eventDoubleActivate = output<JSchedulerVisibleEvent>();
  readonly slotActivate = output<{
    readonly date: Date;
    readonly minutes: number;
    readonly resourceId?: JSchedulerId;
    readonly nativeEvent?: Event;
  }>();
  readonly rangeActivate = output<JSchedulerDateInteraction>();
  readonly appointmentActivate = output<JSchedulerAppointmentSlot>();
  readonly dragStart = output<JSchedulerRendererGesture>();
  readonly dragProgress = output<JSchedulerRendererGesture>();
  readonly dragStop = output<JSchedulerRendererGesture>();
  readonly resizeStart = output<JSchedulerRendererGesture>();
  readonly resizeProgress = output<JSchedulerRendererGesture>();
  readonly resizeStop = output<JSchedulerRendererGesture>();
  readonly activeGesture = signal<JSchedulerActiveGesture | null>(null);
  readonly activeSlotSelection = signal<JSchedulerActiveSlotSelection | null>(null);
  readonly suppressSlotClick = signal(false);
  readonly focusedSlotKey = signal('');
  readonly minMinutes = computed(() => jSchedulerParseTime(this.slotMinTime(), 0));
  readonly maxMinutes = computed(() => jSchedulerParseTime(this.slotMaxTime(), 1440));
  readonly slotMinutes = computed(() => Math.max(5, jSchedulerParseTime(this.slotDuration(), 30)));
  readonly labelMinutes = computed(() =>
    Math.max(this.slotMinutes(), jSchedulerParseTime(this.slotLabelInterval(), 30)),
  );
  readonly days = computed(() => jSchedulerDatesInRange(this.range(), this.daysOfWeek()));
  readonly leafResources = computed(() =>
    flattenResources(this.resources(), this.resourceAggregateColumns()),
  );
  readonly lanes = computed<readonly JSchedulerTimeGridLane[]>(() => {
    const resources = this.leafResources();
    if (!resources.length)
      return this.days().map((date) => ({ key: String(date.getTime()), date, resource: null }));
    const make = (date: Date, resource: JSchedulerResource): JSchedulerTimeGridLane => ({
      key: `${date.getTime()}:${resource.id}`,
      date,
      resource,
    });
    return this.groupBy() === 'date'
      ? this.days().flatMap((date) => resources.map((resource) => make(date, resource)))
      : resources.flatMap((resource) => this.days().map((date) => make(date, resource)));
  });
  readonly slots = computed(() =>
    Array.from(
      { length: Math.ceil((this.maxMinutes() - this.minMinutes()) / this.slotMinutes()) },
      (_, index) => this.minMinutes() + index * this.slotMinutes(),
    ),
  );
  placementsForLane(lane: JSchedulerTimeGridLane) {
    return jSchedulerLayoutTimedEvents(
      this.eventsForLane(lane).filter(
        (event) =>
          !['background', 'inverse-background', 'hidden'].includes(event.source.display ?? 'auto'),
      ),
      [lane.date],
      this.minMinutes(),
      this.maxMinutes(),
    );
  }
  backgroundEventsForLane(lane: JSchedulerTimeGridLane) {
    return this.eventsForLane(lane).filter((event) =>
      ['background', 'inverse-background'].includes(event.source.display ?? ''),
    );
  }
  allDayEvents(lane: JSchedulerTimeGridLane) {
    return this.eventsForLane(lane).filter((event) => event.allDay);
  }
  blocksForLane(lane: JSchedulerTimeGridLane) {
    const end = new Date(lane.date.getFullYear(), lane.date.getMonth(), lane.date.getDate() + 1);
    return [...this.blockedIntervals(), ...(lane.resource?.blockedIntervals ?? [])].filter(
      (block) =>
        block.start < end &&
        block.end > lane.date &&
        matchesOptionalResource(block.resourceId, lane.resource),
    );
  }
  businessHoursForLane(lane: JSchedulerTimeGridLane) {
    return [...this.businessHours(), ...(lane.resource?.businessHours ?? [])]
      .filter(
        (rule) =>
          matchesOptionalResource(rule.resourceId, lane.resource) &&
          (!rule.daysOfWeek?.length || rule.daysOfWeek.includes(lane.date.getDay())),
      )
      .map((rule) => this.timeRange(lane.date, rule.startTime, rule.endTime));
  }
  availabilityForLane(lane: JSchedulerTimeGridLane) {
    return [...this.availability(), ...(lane.resource?.availability ?? [])]
      .filter(
        (rule) =>
          matchesOptionalResource(rule.resourceId, lane.resource) &&
          (!rule.daysOfWeek?.length || rule.daysOfWeek.includes(lane.date.getDay())) &&
          (!rule.effectiveStart || lane.date >= startOfDay(rule.effectiveStart)) &&
          (!rule.effectiveEnd || lane.date <= startOfDay(rule.effectiveEnd)) &&
          !rule.excludedDates?.some(
            (date) => startOfDay(date).getTime() === startOfDay(lane.date).getTime(),
          ),
      )
      .map((rule) => ({
        ...this.timeRange(lane.date, rule.startTime, rule.endTime),
        label: rule.label,
      }));
  }
  appointmentsForLane(lane: JSchedulerTimeGridLane) {
    const end = new Date(lane.date.getFullYear(), lane.date.getMonth(), lane.date.getDate() + 1);
    return this.appointmentSlots().filter(
      (slot) =>
        slot.start < end &&
        slot.end > lane.date &&
        matchesOptionalResource(slot.resourceId, lane.resource),
    );
  }
  laneLabel(lane: JSchedulerTimeGridLane) {
    return lane.resource
      ? `${dateLabelFor(this.locale(), lane.date)}, ${lane.resource.name}`
      : dateLabelFor(this.locale(), lane.date);
  }
  nowForLane(lane: JSchedulerTimeGridLane): Date | null {
    if (!this.showNowIndicator()) return null;
    const now = this.now();
    if (
      now.getFullYear() !== lane.date.getFullYear() ||
      now.getMonth() !== lane.date.getMonth() ||
      now.getDate() !== lane.date.getDate()
    )
      return null;
    const minutes = now.getHours() * 60 + now.getMinutes();
    return minutes >= this.minMinutes() && minutes <= this.maxMinutes() ? now : null;
  }
  rangeTop(start: Date) {
    return (
      ((start.getHours() * 60 + start.getMinutes() - this.minMinutes()) /
        (this.maxMinutes() - this.minMinutes())) *
      100
    );
  }
  rangeHeight(start: Date, end: Date) {
    return Math.max(
      0.5,
      ((end.getTime() - start.getTime()) / 60_000 / (this.maxMinutes() - this.minMinutes())) * 100,
    );
  }
  slotLabel(slot: JSchedulerAppointmentSlot) {
    return `Appointment slot, ${new Intl.DateTimeFormat(this.locale(), { hour: 'numeric', minute: '2-digit' }).formatRange(slot.start, slot.end)}, ${slot.status ?? 'available'}`;
  }
  appointmentTime(slot: JSchedulerAppointmentSlot): string {
    return new Intl.DateTimeFormat(this.locale(), {
      hour: 'numeric',
      minute: '2-digit',
    }).formatRange(new Date(slot.start), new Date(slot.end));
  }
  private timeRange(date: Date, startTime: string, endTime: string): JSchedulerDateRange {
    const startMinutes = jSchedulerParseTime(startTime, 0);
    const endMinutes = jSchedulerParseTime(endTime, 1440);
    return {
      start: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, startMinutes),
      end: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, endMinutes),
    };
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

  eventContext(
    event: JSchedulerVisibleEvent,
    resource: JSchedulerResource | null,
  ): JSchedulerEventTemplateContext {
    return {
      $implicit: event,
      event: event.source,
      view: this.view(),
      resource: resource ?? undefined,
      selected: this.eventSelected(event),
      dragging: this.activeGesture()?.event.occurrenceId === event.occurrenceId,
      resizing:
        this.activeGesture()?.mode === 'resize' &&
        this.activeGesture()?.event.occurrenceId === event.occurrenceId,
      conflict: false,
    };
  }

  cellContext(lane: JSchedulerTimeGridLane, minutes?: number): JSchedulerCellTemplateContext {
    return {
      $implicit: lane.date,
      date: lane.date,
      view: this.view(),
      resource: lane.resource ?? undefined,
      selected: minutes === undefined ? false : this.slotSelected(lane, minutes),
      today: lane.date.toDateString() === new Date().toDateString(),
      disabled: this.disabled(),
    };
  }

  dayHeaderContext(lane: JSchedulerTimeGridLane): JSchedulerHeaderTemplateContext {
    const label = this.laneLabel(lane);
    return {
      $implicit: label,
      label,
      date: lane.date,
      view: this.view(),
      resource: lane.resource ?? undefined,
    };
  }

  timeHeaderContext(minutes: number): JSchedulerHeaderTemplateContext {
    const label = this.timeLabel(minutes);
    return { $implicit: label, label, view: this.view() };
  }

  appointmentContext(
    slot: JSchedulerAppointmentSlot,
    resource: JSchedulerResource | null,
  ): JSchedulerAppointmentTemplateContext {
    return { $implicit: slot, slot, view: this.view(), resource: resource ?? undefined };
  }

  blockedContext(
    interval: JSchedulerBlockedInterval,
    resource: JSchedulerResource | null,
  ): JSchedulerBlockedTemplateContext {
    return {
      $implicit: interval,
      interval,
      view: this.view(),
      resource: resource ?? undefined,
    };
  }

  slotSelected(lane: JSchedulerTimeGridLane, minutes: number): boolean {
    const selection = this.selectedRange();
    if (!selection) return false;
    if (
      selection.resourceId != null &&
      String(selection.resourceId) !== String(lane.resource?.id ?? '')
    )
      return false;
    const start = new Date(
      lane.date.getFullYear(),
      lane.date.getMonth(),
      lane.date.getDate(),
      0,
      minutes,
    );
    const end = new Date(start.getTime() + this.slotMinutes() * 60_000);
    const selectionEnd = selection.end ?? selection.start;
    return selection.start < end && selectionEnd > start;
  }

  activateSlot(nativeEvent: MouseEvent, lane: JSchedulerTimeGridLane, minutes: number): void {
    this.focusedSlotKey.set(this.slotFocusKey(lane, minutes));
    if (this.suppressSlotClick()) {
      nativeEvent.preventDefault();
      this.suppressSlotClick.set(false);
      return;
    }
    this.slotActivate.emit({
      date: lane.date,
      minutes,
      resourceId: lane.resource?.id,
      nativeEvent,
    });
  }

  slotFocusKey(lane: JSchedulerTimeGridLane, minutes: number): string {
    return `${lane.key}|${minutes}`;
  }

  handleSlotKeydown(
    nativeEvent: KeyboardEvent,
    lane: JSchedulerTimeGridLane,
    minutes: number,
  ): void {
    if (nativeEvent.altKey) return;
    if (nativeEvent.key === 'Escape') {
      this.cancelSlotSelection();
      return;
    }
    if (nativeEvent.key === 'Enter' || nativeEvent.key === ' ') {
      nativeEvent.preventDefault();
      this.slotActivate.emit({
        date: lane.date,
        minutes,
        resourceId: lane.resource?.id,
        nativeEvent,
      });
      return;
    }
    const lanes = this.lanes();
    let laneIndex = lanes.findIndex((candidate) => candidate.key === lane.key);
    let targetMinutes = minutes;
    const logical = this.rtl() ? -1 : 1;
    if (nativeEvent.key === 'ArrowLeft') laneIndex -= logical;
    else if (nativeEvent.key === 'ArrowRight') laneIndex += logical;
    else if (nativeEvent.key === 'ArrowUp') targetMinutes -= this.slotMinutes();
    else if (nativeEvent.key === 'ArrowDown') targetMinutes += this.slotMinutes();
    else if (nativeEvent.key === 'Home') targetMinutes = this.minMinutes();
    else if (nativeEvent.key === 'End') targetMinutes = this.maxMinutes() - this.slotMinutes();
    else if (nativeEvent.key === 'PageUp') targetMinutes -= 60;
    else if (nativeEvent.key === 'PageDown') targetMinutes += 60;
    else return;
    laneIndex = Math.max(0, Math.min(lanes.length - 1, laneIndex));
    targetMinutes = Math.max(
      this.minMinutes(),
      Math.min(this.maxMinutes() - this.slotMinutes(), targetMinutes),
    );
    targetMinutes =
      this.minMinutes() +
      Math.round((targetMinutes - this.minMinutes()) / this.slotMinutes()) * this.slotMinutes();
    const key = this.slotFocusKey(lanes[laneIndex]!, targetMinutes);
    nativeEvent.preventDefault();
    this.focusedSlotKey.set(key);
    queueMicrotask(() =>
      Array.from(this.host.nativeElement.querySelectorAll<HTMLButtonElement>('[data-focus-key]'))
        .find((button) => button.dataset['focusKey'] === key)
        ?.focus({ preventScroll: true }),
    );
  }

  startSlotSelection(
    nativeEvent: PointerEvent,
    lane: JSchedulerTimeGridLane,
    minutes: number,
  ): void {
    if (!this.selectable() || this.disabled() || nativeEvent.button !== 0) return;
    capturePointer(nativeEvent.currentTarget, nativeEvent.pointerId);
    this.activeSlotSelection.set({
      pointerId: nativeEvent.pointerId,
      originX: nativeEvent.clientX,
      originY: nativeEvent.clientY,
      date: new Date(lane.date),
      minutes,
      resourceId: lane.resource?.id,
      moved: false,
    });
  }

  moveSlotSelection(nativeEvent: PointerEvent): void {
    const active = this.activeSlotSelection();
    if (!active || active.pointerId !== nativeEvent.pointerId) return;
    if (Math.hypot(nativeEvent.clientX - active.originX, nativeEvent.clientY - active.originY) >= 3)
      active.moved = true;
  }

  finishSlotSelection(nativeEvent: PointerEvent): void {
    const active = this.activeSlotSelection();
    if (!active || active.pointerId !== nativeEvent.pointerId) return;
    this.activeSlotSelection.set(null);
    if (!active.moved) return;
    const target = (nativeEvent.currentTarget as HTMLElement).ownerDocument
      .elementFromPoint(nativeEvent.clientX, nativeEvent.clientY)
      ?.closest<HTMLElement>('[data-j-time]');
    const targetTime = target?.dataset['jTime'];
    const targetDay = target?.closest<HTMLElement>('[data-date]')?.dataset['date'];
    if (!targetTime || !targetDay) return;
    const [year, month, day] = targetDay.split('-').map(Number);
    const [hour, minute] = targetTime.split(':').map(Number);
    if (!year || !month || !day || hour === undefined || minute === undefined) return;
    const origin = new Date(
      active.date.getFullYear(),
      active.date.getMonth(),
      active.date.getDate(),
      0,
      active.minutes,
    );
    const destination = new Date(year, month - 1, day, hour, minute);
    const start = new Date(Math.min(origin.getTime(), destination.getTime()));
    const end = new Date(
      Math.max(origin.getTime(), destination.getTime()) + this.slotMinutes() * 60_000,
    );
    this.suppressSlotClick.set(true);
    this.rangeActivate.emit({
      start,
      end,
      allDay: false,
      view: this.view(),
      resourceId: active.resourceId,
      nativeEvent,
    });
  }

  cancelSlotSelection(nativeEvent?: PointerEvent): void {
    const active = this.activeSlotSelection();
    if (!active || (nativeEvent && active.pointerId !== nativeEvent.pointerId)) return;
    this.activeSlotSelection.set(null);
  }

  activateDate(nativeEvent: MouseEvent, lane: JSchedulerTimeGridLane): void {
    this.dateActivate.emit({
      start: new Date(lane.date),
      end: new Date(lane.date.getFullYear(), lane.date.getMonth(), lane.date.getDate() + 1),
      allDay: true,
      view: this.view(),
      resourceId: lane.resource?.id,
      nativeEvent,
    });
  }

  handleEventClick(nativeEvent: MouseEvent, event: JSchedulerVisibleEvent): void {
    if (this.activeGesture()?.moved) {
      nativeEvent.preventDefault();
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

  startGesture(
    nativeEvent: PointerEvent,
    event: JSchedulerVisibleEvent,
    mode: 'drag' | 'resize',
    edge: 'start' | 'end' = 'end',
  ): void {
    if (
      this.disabled() ||
      event.source.disabled ||
      event.source.readonly ||
      event.source.editable === false ||
      nativeEvent.button !== 0 ||
      (mode === 'drag' && !this.eventCanDrag(event)) ||
      (mode === 'resize' && !this.eventCanResize(event)) ||
      (mode === 'resize' && edge === 'start' && !this.resizeFromStart())
    )
      return;
    nativeEvent.preventDefault();
    nativeEvent.stopPropagation();
    capturePointer(nativeEvent.currentTarget, nativeEvent.pointerId);
    const sourceLaneIndex = this.lanes().findIndex(
      (lane) =>
        lane.date.toDateString() === event.start.toDateString() &&
        (!lane.resource ||
          jSchedulerResourceMatchesEvent(
            lane.resource,
            event.source,
            !!lane.resource.children?.length,
          )),
    );
    this.activeGesture.set({
      mode,
      edge,
      event,
      pointerId: nativeEvent.pointerId,
      originX: nativeEvent.clientX,
      originY: nativeEvent.clientY,
      sourceLaneIndex: Math.max(0, sourceLaneIndex),
      sourceStartMinutes: event.start.getHours() * 60 + event.start.getMinutes(),
      duration: event.end.getTime() - event.start.getTime(),
      readyAt: nativeEvent.pointerType === 'touch' ? Date.now() + this.touchLongPressDelay() : 0,
      moved: false,
    });
    const payload = { event, start: event.start, end: event.end, nativeEvent, edge };
    mode === 'drag' ? this.dragStart.emit(payload) : this.resizeStart.emit(payload);
  }

  moveGesture(nativeEvent: PointerEvent): void {
    const gesture = this.activeGesture();
    if (!gesture || nativeEvent.pointerId !== gesture.pointerId) return;
    if (Date.now() < gesture.readyAt) return;
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
    if (!gesture.moved && Date.now() < gesture.readyAt) {
      this.activeGesture.set(null);
      return;
    }
    const payload = gesture.moved
      ? this.gestureValue(gesture, nativeEvent)
      : {
          event: gesture.event,
          start: gesture.event.start,
          end: gesture.event.end,
          nativeEvent,
          edge: gesture.edge,
        };
    this.activeGesture.set(null);
    gesture.mode === 'drag' ? this.dragStop.emit(payload) : this.resizeStop.emit(payload);
  }

  cancelGesture(nativeEvent: PointerEvent): void {
    if (this.activeGesture()?.pointerId === nativeEvent.pointerId) this.activeGesture.set(null);
  }

  moveEventWithKeyboard(nativeEvent: KeyboardEvent, event: JSchedulerVisibleEvent): void {
    if (!nativeEvent.altKey || this.disabled()) return;
    const resize = nativeEvent.shiftKey;
    const logical = this.rtl() ? -1 : 1;
    const laneDelta =
      nativeEvent.key === 'ArrowLeft' ? -logical : nativeEvent.key === 'ArrowRight' ? logical : 0;
    const minuteDelta =
      nativeEvent.key === 'ArrowUp'
        ? -this.snapMinutes()
        : nativeEvent.key === 'ArrowDown'
          ? this.snapMinutes()
          : 0;
    if (
      (!laneDelta && !minuteDelta) ||
      (resize ? !this.eventCanResize(event) : !this.eventCanDrag(event))
    )
      return;
    nativeEvent.preventDefault();
    if (resize) {
      if (laneDelta) return;
      const edge: 'start' | 'end' =
        (nativeEvent.ctrlKey || nativeEvent.metaKey) && this.resizeFromStart() ? 'start' : 'end';
      const start =
        edge === 'start'
          ? new Date(
              Math.min(
                event.end.getTime() - this.snapMinutes() * 60_000,
                event.start.getTime() + minuteDelta * 60_000,
              ),
            )
          : event.start;
      const end =
        edge === 'end'
          ? new Date(
              Math.max(
                event.start.getTime() + this.snapMinutes() * 60_000,
                event.end.getTime() + minuteDelta * 60_000,
              ),
            )
          : event.end;
      const startPayload = { event, start: event.start, end: event.end, nativeEvent, edge };
      this.resizeStart.emit(startPayload);
      this.resizeStop.emit({ ...startPayload, start, end });
      return;
    }
    const sourceIndex = this.lanes().findIndex(
      (lane) =>
        lane.date.toDateString() === event.start.toDateString() &&
        (!lane.resource || jSchedulerResourceMatchesEvent(lane.resource, event.source)),
    );
    const targetLane =
      this.lanes()[
        Math.max(0, Math.min(this.lanes().length - 1, Math.max(0, sourceIndex) + laneDelta))
      ];
    const start = new Date(event.start.getTime() + minuteDelta * 60_000);
    if (targetLane)
      start.setFullYear(
        targetLane.date.getFullYear(),
        targetLane.date.getMonth(),
        targetLane.date.getDate(),
      );
    const payload: JSchedulerRendererGesture = {
      event,
      start,
      end: new Date(start.getTime() + (event.end.getTime() - event.start.getTime())),
      nativeEvent,
      resourceId: targetLane?.resource?.id,
      resourceIds: targetLane?.resource ? [targetLane.resource.id] : undefined,
    };
    this.dragStart.emit({ event, start: event.start, end: event.end, nativeEvent });
    this.dragStop.emit(payload);
  }

  private eventCanDrag(event: JSchedulerVisibleEvent): boolean {
    return (
      this.draggable() &&
      event.source.draggable !== false &&
      event.source.startEditable !== false &&
      event.source.editable !== false &&
      !event.source.readonly
    );
  }

  private eventCanResize(event: JSchedulerVisibleEvent): boolean {
    return (
      this.resizable() &&
      event.source.resizable !== false &&
      event.source.durationEditable !== false &&
      event.source.editable !== false &&
      !event.source.readonly
    );
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
    const laneWidth = rect.width / Math.max(1, this.lanes().length);
    const laneDelta =
      Math.round((nativeEvent.clientX - gesture.originX) / laneWidth) * (this.rtl() ? -1 : 1);
    const minuteDelta = Math.round(
      ((nativeEvent.clientY - gesture.originY) / Math.max(1, rect.height)) *
        (this.maxMinutes() - this.minMinutes()),
    );
    const snappedDelta =
      Math.round(minuteDelta / Math.max(1, this.snapMinutes())) * this.snapMinutes();
    if (gesture.mode === 'resize') {
      return {
        event: gesture.event,
        start:
          gesture.edge === 'start'
            ? new Date(gesture.event.start.getTime() + snappedDelta * 60_000)
            : gesture.event.start,
        end:
          gesture.edge === 'end'
            ? new Date(gesture.event.end.getTime() + snappedDelta * 60_000)
            : gesture.event.end,
        nativeEvent,
        edge: gesture.edge,
      };
    }
    const targetLane =
      this.lanes()[
        Math.max(0, Math.min(this.lanes().length - 1, gesture.sourceLaneIndex + laneDelta))
      ];
    const targetDay = targetLane?.date;
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
      ...resourceAssignment(targetLane?.resource),
      nativeEvent,
    };
  }

  private eventsForLane(lane: JSchedulerTimeGridLane): readonly JSchedulerVisibleEvent[] {
    const end = new Date(lane.date.getFullYear(), lane.date.getMonth(), lane.date.getDate() + 1);
    return this.events().filter(
      (event) =>
        event.start < end &&
        event.end > lane.date &&
        (!lane.resource ||
          jSchedulerResourceMatchesEvent(
            lane.resource,
            event.source,
            !!lane.resource.children?.length,
          )),
    );
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

function flattenResources(
  resources: readonly JSchedulerResource[],
  includeParents: boolean,
): readonly JSchedulerResource[] {
  return resources.flatMap((resource) => {
    if (resource.hidden || resource.disabled) return [];
    if (!resource.children?.length) return [resource];
    const children = flattenResources(resource.children, includeParents);
    return includeParents ? [resource, ...children] : children;
  });
}
function matchesResource(
  resourceId: JSchedulerId | undefined,
  resource: JSchedulerResource | null,
  resourceIds: readonly JSchedulerId[] = [],
): boolean {
  if (!resource) return true;
  const dimensionIds = Object.values(resource.dimensionValues ?? {}).map(String);
  if (dimensionIds.length)
    return [resourceId, ...resourceIds].some(
      (id) => id != null && dimensionIds.includes(String(id)),
    );
  return [resourceId, ...resourceIds].some(
    (id) => id != null && String(id) === String(resource.id),
  );
}
function matchesOptionalResource(
  resourceId: JSchedulerId | undefined,
  resource: JSchedulerResource | null,
): boolean {
  return resourceId == null || matchesResource(resourceId, resource);
}
function resourceAssignment(
  resource: JSchedulerResource | null | undefined,
): Pick<JSchedulerRendererGesture, 'resourceId' | 'resourceIds'> {
  if (!resource) return {};
  const values = Object.values(resource.dimensionValues ?? {});
  return values.length
    ? { resourceId: values.at(-1), resourceIds: values }
    : { resourceId: resource.id };
}
function dateLabelFor(locale: string, date: Date): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'full' }).format(date);
}
function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
