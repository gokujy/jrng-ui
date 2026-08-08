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
import { JButtonComponent } from 'jrng-ui/button';
import { JTooltipDirective } from 'jrng-ui/tooltip';
import {
  jSchedulerFlattenResources,
  jSchedulerResourceMatchesEvent,
  JSchedulerResourceRow,
} from '../engine/resource-engine';
import { jSchedulerTimelineSlots, jSchedulerVirtualWindow } from '../engine/timeline-engine';
import {
  JSchedulerDateRange,
  JSchedulerEventInteraction,
  JSchedulerEventTemplateContext,
  JSchedulerId,
  JSchedulerHeaderTemplateContext,
  JSchedulerResource,
  JSchedulerResourceMoveRequest,
  JSchedulerSelection,
  JSchedulerTimelineHeaderLevel,
  JSchedulerTimelineHeaderUnit,
  JSchedulerResourceTemplateContext,
  JSchedulerView,
  JSchedulerVisibleEvent,
} from '../scheduler.models';

export interface JSchedulerTimelineGesture {
  readonly event: JSchedulerVisibleEvent;
  readonly start: Date;
  readonly end: Date;
  readonly nativeEvent: PointerEvent | KeyboardEvent;
  readonly resourceId?: JSchedulerId;
  readonly resourceIds?: readonly JSchedulerId[];
  readonly edge?: 'start' | 'end';
}

interface JSchedulerTimelineActiveGesture {
  readonly mode: 'drag' | 'resize';
  readonly edge: 'start' | 'end';
  readonly event: JSchedulerVisibleEvent;
  readonly pointerId: number;
  readonly originX: number;
  readonly originY: number;
  readonly originScrollTop: number;
  readonly sourceRowIndex: number;
  readonly readyAt: number;
  readonly resourceId?: JSchedulerId;
  readonly resourceIds?: readonly JSchedulerId[];
  moved: boolean;
}

interface JSchedulerTimelineHeaderGroup {
  readonly key: string;
  readonly label: string;
  readonly startIndex: number;
  readonly span: number;
  readonly start: Date;
  readonly end: Date;
}

@Component({
  selector: 'j-scheduler-timeline-renderer',
  imports: [JButtonComponent, JTooltipDirective, NgTemplateOutlet],
  template: `
    <div
      class="j-scheduler-timeline"
      [style.--j-resource-width]="resourceWidth()"
      [style.--j-timeline-width.px]="totalWidth()"
      [style.--j-resource-row-height.px]="resourceRowHeight()"
      [style.--j-timeline-header-rows]="headerRows().length"
      [attr.aria-rowcount]="rows().length"
      data-j-slot="timeline"
    >
      <div class="j-scheduler-timeline__resource-heading">Resources</div>
      <div class="j-scheduler-timeline__viewport" (scroll)="handleScroll($event)">
        <div class="j-scheduler-timeline__canvas" [style.width.px]="totalWidth()">
          <div
            class="j-scheduler-timeline__header"
            [style.width.px]="totalWidth()"
            [style.height]="'calc(' + headerRows().length + ' * 2.5rem)'"
          >
            @for (row of headerRows(); track row.unit; let rowIndex = $index) {
              <div
                class="j-scheduler-timeline__header-row"
                [attr.data-header-unit]="row.unit"
                [style.inset-block-start]="'calc(' + rowIndex + ' * 2.5rem)'"
              >
                @for (group of row.groups; track group.key) {
                  <div
                    class="j-scheduler-timeline__header-cell"
                    [style.inset-inline-start.px]="group.startIndex * slotWidth()"
                    [style.width.px]="group.span * slotWidth()"
                    data-j-slot="timeline-header"
                  >
                    @if (headerTemplate()) {
                      <ng-container
                        [ngTemplateOutlet]="headerTemplate()!"
                        [ngTemplateOutletContext]="headerContext(group, row.unit)"
                      />
                    } @else {
                      {{ group.label }}
                    }
                  </div>
                }
              </div>
            }
          </div>
          @if (nowOffset() !== null) {
            <div
              class="j-scheduler-timeline__now-indicator"
              [style.inset-inline-start.px]="nowOffset()"
              [style.height.px]="railHeight()"
              role="presentation"
              data-j-slot="now-indicator"
            ></div>
          }
          @if (rowWindow().before) {
            <div
              class="j-scheduler-timeline__row-spacer"
              [style.height.px]="rowWindow().before"
            ></div>
          }
          @for (row of rowWindow().items; track row.resource.id; let firstRow = $first) {
            <div
              class="j-scheduler-timeline__lane"
              [class.j-scheduler-timeline__lane--aggregate]="row.parent"
              [attr.data-resource-id]="row.resource.id"
              [attr.data-aggregate]="row.parent || null"
              data-j-slot="resource-lane"
            >
              @for (slot of window().items; track slot.index; let firstSlot = $first) {
                <button
                  type="button"
                  class="j-scheduler-timeline__cell"
                  [class.j-scheduler-timeline__cell--selected]="cellSelected(slot, row.resource)"
                  [style.inset-inline-start.px]="slot.index * slotWidth()"
                  [style.width.px]="slotWidth()"
                  [attr.tabindex]="
                    timelineCellKey(row.resource, slot.index) === focusedCellKey() ||
                    (!focusedCellKey() && firstRow && firstSlot)
                      ? 0
                      : -1
                  "
                  [attr.data-focus-key]="timelineCellKey(row.resource, slot.index)"
                  [disabled]="disabled() || row.resource.disabled"
                  [attr.aria-label]="row.resource.name + ', ' + slot.label"
                  [attr.data-date]="dateKey(slot.start)"
                  [attr.data-resource-id]="row.resource.id"
                  [attr.data-selected]="cellSelected(slot, row.resource) || null"
                  [attr.aria-selected]="cellSelected(slot, row.resource)"
                  [attr.draggable]="externalDraggable() ? true : null"
                  (click)="
                    cellActivate.emit({
                      date: slot.start,
                      resourceId: row.resource.id,
                      nativeEvent: $event,
                    })
                  "
                  (focus)="focusedCellKey.set(timelineCellKey(row.resource, slot.index))"
                  (keydown)="handleCellKeydown($event, row.resource, slot.index)"
                ></button>
              }
              @for (event of eventsFor(row); track event.occurrenceId) {
                <button
                  type="button"
                  class="j-scheduler-timeline-event"
                  [class.j-scheduler-event--milestone]="event.source.milestone"
                  [class.j-scheduler-event-selected]="eventSelected(event)"
                  [class.j-scheduler-timeline-event--aggregate]="row.parent"
                  [class.j-scheduler-event-dragging]="
                    activeGesture()?.event?.occurrenceId === event.occurrenceId &&
                    activeGesture()?.mode === 'drag'
                  "
                  [class.j-scheduler-event-resizing]="
                    activeGesture()?.event?.occurrenceId === event.occurrenceId &&
                    activeGesture()?.mode === 'resize'
                  "
                  [style.inset-inline-start.px]="eventLeft(event)"
                  [style.width.px]="eventWidth(event)"
                  [style.--j-event-color]="event.source.color || row.resource.color || null"
                  [disabled]="disabled() || event.source.disabled"
                  [attr.data-event-id]="event.source.id"
                  [attr.data-milestone]="event.source.milestone || null"
                  [attr.data-selected]="eventSelected(event) || null"
                  [attr.aria-pressed]="eventSelected(event)"
                  [attr.data-resource-id]="row.resource.id"
                  [jTooltip]="eventLabel(event)"
                  (click)="
                    eventActivate.emit({
                      event: event.source,
                      occurrenceStart: event.start,
                      nativeEvent: $event,
                    })
                  "
                  (pointerdown)="startEventGesture($event, event, row.resource, 'drag')"
                  (pointermove)="moveEventGesture($event)"
                  (pointerup)="finishEventGesture($event)"
                  (pointercancel)="cancelEventGesture($event)"
                  (keydown)="moveEventWithKeyboard($event, event, row.resource)"
                >
                  @if (resizable() && resizeFromStart() && !disabled() && !row.parent) {
                    <span
                      class="j-scheduler-timeline-event__resize j-scheduler-timeline-event__resize--start"
                      aria-hidden="true"
                      (pointerdown)="
                        startEventGesture($event, event, row.resource, 'resize', 'start')
                      "
                    ></span>
                  }
                  @if (eventTemplate()) {
                    <ng-container
                      [ngTemplateOutlet]="eventTemplate()!"
                      [ngTemplateOutletContext]="eventContext(event, row.resource)"
                    />
                  } @else {
                    {{ event.source.title }}
                  }
                  @if (resizable() && !disabled() && !row.parent) {
                    <span
                      class="j-scheduler-timeline-event__resize"
                      aria-hidden="true"
                      (pointerdown)="
                        startEventGesture($event, event, row.resource, 'resize', 'end')
                      "
                    ></span>
                  }
                </button>
              }
            </div>
          }
          @if (rowWindow().after) {
            <div
              class="j-scheduler-timeline__row-spacer"
              [style.height.px]="rowWindow().after"
            ></div>
          }
        </div>
      </div>
      <div
        class="j-scheduler-timeline__rail"
        data-j-slot="resource-rail"
        [style.height.px]="railHeight()"
      >
        <div
          class="j-scheduler-timeline__rail-window"
          [style.transform]="'translateY(' + railOffset() + 'px)'"
        >
          @for (row of rowWindow().items; track row.resource.id) {
            <div
              class="j-scheduler-timeline__resource"
              [style.padding-inline-start.rem]="0.75 + row.depth"
              [attr.data-resource-id]="row.resource.id"
            >
              @if (row.parent && expandable()) {
                <j-button
                  [icon]="row.expanded ? 'chevron-down' : 'chevron-right'"
                  [ariaLabel]="(row.expanded ? 'Collapse ' : 'Expand ') + row.resource.name"
                  variant="text"
                  size="sm"
                  [disabled]="disabled()"
                  [jTooltip]="row.expanded ? 'Collapse resource' : 'Expand resource'"
                  (onClick)="toggle.emit(row)"
                />
              }
              <button
                type="button"
                class="j-scheduler-timeline__resource-name"
                [disabled]="disabled() || row.resource.disabled"
                [jTooltip]="row.resource.name"
                [attr.draggable]="resourceDraggable() && !disabled() && !row.resource.disabled"
                (click)="resourceActivate.emit(row.resource)"
                (dragstart)="startResourceDrag($event, row)"
                (dragend)="draggedResource.set(null)"
                (dragover)="allowResourceDrop($event)"
                (drop)="dropResource($event, row)"
                (keydown)="moveResourceWithKeyboard($event, row)"
              >
                @if (resourceTemplate()) {
                  <ng-container
                    [ngTemplateOutlet]="resourceTemplate()!"
                    [ngTemplateOutletContext]="resourceContext(row)"
                  />
                } @else {
                  {{ row.resource.name }}
                }
              </button>
              <span>{{ row.eventCount }}</span>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styleUrl: './timeline-renderer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JSchedulerTimelineRendererComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly view = input.required<JSchedulerView>();
  readonly range = input.required<JSchedulerDateRange>();
  readonly events = input<readonly JSchedulerVisibleEvent[]>([]);
  readonly selectedEventIds = input<readonly JSchedulerId[]>([]);
  readonly selectedRange = input<JSchedulerSelection | null>(null);
  readonly resources = input<readonly JSchedulerResource[]>([]);
  readonly expandedIds = input<readonly JSchedulerId[] | boolean>(true);
  readonly resourceAreaWidth = input<number | string>(240);
  readonly expandable = input(true);
  readonly slotWidth = input(72);
  readonly durationMinutes = input(60);
  readonly headerLevels = input<readonly JSchedulerTimelineHeaderLevel[] | 'auto'>('auto');
  readonly headerTemplate = input<TemplateRef<JSchedulerHeaderTemplateContext> | undefined>();
  readonly virtual = input(true);
  readonly virtualThreshold = input(200);
  readonly overscan = input(4);
  readonly resourceVirtual = input(true);
  readonly resourceVirtualThreshold = input(100);
  readonly resourceRowHeight = input(52);
  readonly externalDraggable = input(false);
  readonly resourceDraggable = input(false);
  readonly draggable = input(false);
  readonly resizable = input(false);
  readonly resizeFromStart = input(false);
  readonly snapMinutes = input(15);
  readonly minimumDragDistance = input(5);
  readonly touchLongPressDelay = input(350);
  readonly rtl = input(false);
  readonly now = input<Date>(new Date());
  readonly showNowIndicator = input(true);
  readonly eventTemplate = input<TemplateRef<JSchedulerEventTemplateContext> | undefined>();
  readonly resourceTemplate = input<TemplateRef<JSchedulerResourceTemplateContext> | undefined>();
  readonly locale = input('en-US');
  readonly disabled = input(false);
  readonly eventActivate = output<JSchedulerEventInteraction>();
  readonly resourceActivate = output<JSchedulerResource>();
  readonly toggle = output<JSchedulerResourceRow>();
  readonly resourceMove = output<JSchedulerResourceMoveRequest>();
  readonly dragStart = output<JSchedulerTimelineGesture>();
  readonly dragProgress = output<JSchedulerTimelineGesture>();
  readonly dragStop = output<JSchedulerTimelineGesture>();
  readonly resizeStart = output<JSchedulerTimelineGesture>();
  readonly resizeProgress = output<JSchedulerTimelineGesture>();
  readonly resizeStop = output<JSchedulerTimelineGesture>();
  readonly cellActivate = output<{
    readonly date: Date;
    readonly resourceId: JSchedulerId;
    readonly nativeEvent?: Event;
  }>();
  readonly scrollLeft = signal(0);
  readonly viewportWidth = signal(800);
  readonly scrollTop = signal(0);
  readonly viewportHeight = signal(520);
  readonly draggedResource = signal<JSchedulerResourceRow | null>(null);
  readonly activeGesture = signal<JSchedulerTimelineActiveGesture | null>(null);
  readonly focusedCellKey = signal('');
  readonly slots = computed(() =>
    jSchedulerTimelineSlots(this.range(), this.view(), this.locale(), this.durationMinutes()),
  );
  readonly totalWidth = computed(() => this.slots().length * this.slotWidth());
  readonly resolvedHeaderLevels = computed<readonly JSchedulerTimelineHeaderLevel[]>(() => {
    const configured = this.headerLevels();
    if (configured !== 'auto' && configured.length) return configured;
    const view = this.view().toLocaleLowerCase();
    if (view.includes('year')) return [{ unit: 'year' }, { unit: 'quarter' }, { unit: 'month' }];
    if (view.includes('quarter')) return [{ unit: 'year' }, { unit: 'quarter' }, { unit: 'month' }];
    if (view.includes('month'))
      return [{ unit: 'year' }, { unit: 'month' }, { unit: 'week' }, { unit: 'day' }];
    if (view.includes('week')) return [{ unit: 'month' }, { unit: 'week' }, { unit: 'day' }];
    return [{ unit: 'day' }, { unit: 'hour' }];
  });
  readonly headerRows = computed(() =>
    this.resolvedHeaderLevels().map((level) => ({
      unit: level.unit,
      groups: timelineHeaderGroups(this.window().items, level, this.locale()),
    })),
  );
  readonly headerHeight = computed(() => Math.max(1, this.headerRows().length) * 40);
  readonly nowOffset = computed<number | null>(() => {
    if (!this.showNowIndicator()) return null;
    const now = this.now().getTime();
    const range = this.range();
    if (now < range.start.getTime() || now >= range.end.getTime()) return null;
    return (
      ((now - range.start.getTime()) / (range.end.getTime() - range.start.getTime())) *
      this.totalWidth()
    );
  });
  readonly window = computed(() =>
    this.virtual() && this.slots().length >= this.virtualThreshold()
      ? jSchedulerVirtualWindow(
          this.slots(),
          this.slotWidth(),
          this.scrollLeft(),
          this.viewportWidth(),
          this.overscan(),
        )
      : {
          items: this.slots(),
          startIndex: 0,
          endIndex: this.slots().length,
          before: 0,
          after: 0,
          totalSize: this.totalWidth(),
        },
  );
  readonly rows = computed(() =>
    this.resources().length
      ? jSchedulerFlattenResources(
          this.resources(),
          this.expandedIds(),
          this.events().map((item) => item.source),
        )
      : [
          {
            resource: { id: '__schedule', name: 'Schedule' },
            depth: 0,
            parent: false,
            expanded: true,
            eventCount: this.events().length,
          },
        ],
  );
  readonly rowWindow = computed(() =>
    this.resourceVirtual() && this.rows().length >= this.resourceVirtualThreshold()
      ? jSchedulerVirtualWindow(
          this.rows(),
          this.resourceRowHeight(),
          this.scrollTop(),
          this.viewportHeight(),
          this.overscan(),
        )
      : {
          items: this.rows(),
          startIndex: 0,
          endIndex: this.rows().length,
          before: 0,
          after: 0,
          totalSize: this.rows().length * this.resourceRowHeight(),
        },
  );
  readonly railOffset = computed(() => this.rowWindow().before - this.scrollTop());
  readonly railHeight = computed(() =>
    Math.min(this.rowWindow().totalSize, Math.max(this.resourceRowHeight(), this.viewportHeight())),
  );
  resourceWidth() {
    return typeof this.resourceAreaWidth() === 'number'
      ? `${this.resourceAreaWidth()}px`
      : this.resourceAreaWidth();
  }
  handleScroll(event: Event) {
    const element = event.currentTarget as HTMLElement;
    this.scrollLeft.set(Math.abs(element.scrollLeft));
    this.viewportWidth.set(element.clientWidth);
    this.scrollTop.set(Math.max(0, element.scrollTop - this.headerHeight()));
    this.viewportHeight.set(
      Math.max(this.resourceRowHeight(), element.clientHeight - this.headerHeight()),
    );
  }
  eventsFor(row: JSchedulerResourceRow) {
    if (row.resource.id === '__schedule') return this.events();
    if (row.resource.dimensionValues)
      return this.events().filter((event) =>
        jSchedulerResourceMatchesEvent(row.resource, event.source),
      );
    const ids = new Set(resourceIds(row.resource).map(String));
    return this.events().filter((event) =>
      [event.source.resourceId, ...(event.source.resourceIds ?? [])].some(
        (id) => id != null && ids.has(String(id)),
      ),
    );
  }
  eventLeft(event: JSchedulerVisibleEvent) {
    return Math.max(
      0,
      ((event.start.getTime() - this.range().start.getTime()) /
        (this.range().end.getTime() - this.range().start.getTime())) *
        this.totalWidth(),
    );
  }
  eventWidth(event: JSchedulerVisibleEvent) {
    return Math.max(
      16,
      ((event.end.getTime() - event.start.getTime()) /
        (this.range().end.getTime() - this.range().start.getTime())) *
        this.totalWidth(),
    );
  }
  eventLabel(event: JSchedulerVisibleEvent) {
    return `${event.source.title}, ${new Intl.DateTimeFormat(this.locale(), { dateStyle: 'medium', timeStyle: 'short' }).formatRange(event.start, event.end)}`;
  }
  cellSelected(
    slot: { readonly start: Date; readonly end: Date },
    resource: JSchedulerResource,
  ): boolean {
    const selection = this.selectedRange();
    if (!selection) return false;
    if (selection.resourceId != null && String(selection.resourceId) !== String(resource.id))
      return false;
    return selection.start < slot.end && (selection.end ?? selection.start) > slot.start;
  }
  eventContext(
    event: JSchedulerVisibleEvent,
    resource: JSchedulerResource,
  ): JSchedulerEventTemplateContext {
    return {
      $implicit: event,
      event: event.source,
      view: this.view(),
      resource,
      selected: this.eventSelected(event),
      dragging: false,
      resizing: false,
      conflict: false,
    };
  }
  eventSelected(event: JSchedulerVisibleEvent): boolean {
    return this.selectedEventIds().some((id) => String(id) === String(event.source.id));
  }
  resourceContext(row: JSchedulerResourceRow): JSchedulerResourceTemplateContext {
    return {
      $implicit: row.resource,
      resource: row.resource,
      depth: row.depth,
      parent: row.parent,
      expanded: row.expanded,
      eventCount: row.eventCount,
    };
  }
  startResourceDrag(event: DragEvent, row: JSchedulerResourceRow) {
    if (!this.resourceDraggable() || this.disabled() || row.resource.disabled) {
      event.preventDefault();
      return;
    }
    this.draggedResource.set(row);
    event.dataTransfer?.setData('text/plain', String(row.resource.id));
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
  }
  allowResourceDrop(event: DragEvent) {
    if (!this.draggedResource() || !this.resourceDraggable() || this.disabled()) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
  }
  dropResource(event: DragEvent, target: JSchedulerResourceRow) {
    const source = this.draggedResource();
    this.draggedResource.set(null);
    if (!source || source.resource.id === target.resource.id || this.disabled()) return;
    event.preventDefault();
    this.emitResourceMove(source.resource, target.resource, 'before', event);
  }
  moveResourceWithKeyboard(event: KeyboardEvent, row: JSchedulerResourceRow) {
    if (!event.altKey || !this.resourceDraggable() || this.disabled()) return;
    const direction = event.key === 'ArrowUp' ? -1 : event.key === 'ArrowDown' ? 1 : 0;
    if (!direction) return;
    const rows = this.rows();
    const index = rows.findIndex((item) => item.resource.id === row.resource.id);
    const target = rows[index + direction];
    if (!target) return;
    event.preventDefault();
    this.emitResourceMove(row.resource, target.resource, direction < 0 ? 'before' : 'after', event);
  }
  private emitResourceMove(
    resource: JSchedulerResource,
    target: JSchedulerResource,
    position: JSchedulerResourceMoveRequest['position'],
    nativeEvent: DragEvent | KeyboardEvent,
  ) {
    this.resourceMove.emit({
      resource,
      target,
      position,
      view: this.view(),
      nativeEvent,
      revert: () => undefined,
    });
  }
  startEventGesture(
    event: PointerEvent,
    visibleEvent: JSchedulerVisibleEvent,
    resource: JSchedulerResource,
    mode: 'drag' | 'resize',
    edge: 'start' | 'end' = 'end',
  ) {
    if (
      this.disabled() ||
      !!resource.children?.length ||
      visibleEvent.source.disabled ||
      visibleEvent.source.readonly ||
      visibleEvent.source.editable === false ||
      event.button !== 0 ||
      (mode === 'drag' && !this.eventCanDrag(visibleEvent)) ||
      (mode === 'resize' && !this.eventCanResize(visibleEvent)) ||
      (mode === 'resize' && edge === 'start' && !this.resizeFromStart())
    )
      return;
    event.preventDefault();
    event.stopPropagation();
    capturePointer(event.currentTarget, event.pointerId);
    this.activeGesture.set({
      mode,
      edge,
      event: visibleEvent,
      pointerId: event.pointerId,
      originX: event.clientX,
      originY: event.clientY,
      originScrollTop: this.scrollTop(),
      sourceRowIndex: this.rows().findIndex((row) => row.resource.id === resource.id),
      readyAt: event.pointerType === 'touch' ? Date.now() + this.touchLongPressDelay() : 0,
      ...resourceAssignment(resource),
      moved: false,
    });
    const payload = this.timelineGesture(
      visibleEvent,
      0,
      resourceAssignment(resource),
      event,
      mode,
      edge,
    );
    mode === 'drag' ? this.dragStart.emit(payload) : this.resizeStart.emit(payload);
  }
  moveEventGesture(event: PointerEvent) {
    const gesture = this.activeGesture();
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    if (Date.now() < gesture.readyAt) return;
    const distance = Math.abs(event.clientX - gesture.originX);
    if (!gesture.moved && distance < this.minimumDragDistance()) return;
    gesture.moved = true;
    const delta = this.pointerDeltaMinutes(event.clientX - gesture.originX);
    const assignment = this.pointerResourceAssignment(gesture, event.clientY);
    const payload = this.timelineGesture(
      gesture.event,
      delta,
      assignment,
      event,
      gesture.mode,
      gesture.edge,
    );
    gesture.mode === 'drag' ? this.dragProgress.emit(payload) : this.resizeProgress.emit(payload);
  }
  finishEventGesture(event: PointerEvent) {
    const gesture = this.activeGesture();
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    if (!gesture.moved && Date.now() < gesture.readyAt) {
      this.activeGesture.set(null);
      return;
    }
    const delta = gesture.moved ? this.pointerDeltaMinutes(event.clientX - gesture.originX) : 0;
    const assignment = this.pointerResourceAssignment(gesture, event.clientY);
    const payload = this.timelineGesture(
      gesture.event,
      delta,
      assignment,
      event,
      gesture.mode,
      gesture.edge,
    );
    this.activeGesture.set(null);
    gesture.mode === 'drag' ? this.dragStop.emit(payload) : this.resizeStop.emit(payload);
  }
  cancelEventGesture(event: PointerEvent) {
    if (this.activeGesture()?.pointerId === event.pointerId) this.activeGesture.set(null);
  }
  moveEventWithKeyboard(
    event: KeyboardEvent,
    visibleEvent: JSchedulerVisibleEvent,
    resource: JSchedulerResource,
  ) {
    if (!event.altKey || this.disabled() || resource.children?.length) return;
    const logical = this.rtl() ? -1 : 1;
    const horizontalDirection =
      event.key === 'ArrowLeft' ? -logical : event.key === 'ArrowRight' ? logical : 0;
    const verticalDirection = event.key === 'ArrowUp' ? -1 : event.key === 'ArrowDown' ? 1 : 0;
    if (!horizontalDirection && !verticalDirection) return;
    const resize = event.shiftKey;
    if (resize && verticalDirection) return;
    if (
      (resize && !this.eventCanResize(visibleEvent)) ||
      (!resize && !this.eventCanDrag(visibleEvent))
    )
      return;
    event.preventDefault();
    const mode = resize ? 'resize' : 'drag';
    const assignment = verticalDirection
      ? this.keyboardResourceAssignment(resource, verticalDirection)
      : resourceAssignment(resource);
    if (verticalDirection && assignment === null) return;
    const payload = this.timelineGesture(
      visibleEvent,
      horizontalDirection * this.snapMinutes(),
      assignment ?? {},
      event,
      mode,
    );
    if (resize) {
      const edge: 'start' | 'end' =
        (event.ctrlKey || event.metaKey) && this.resizeFromStart() ? 'start' : 'end';
      const resizePayload = this.timelineGesture(
        visibleEvent,
        horizontalDirection * this.snapMinutes(),
        assignment ?? {},
        event,
        mode,
        edge,
      );
      this.resizeStart.emit(
        this.timelineGesture(visibleEvent, 0, resourceAssignment(resource), event, mode, edge),
      );
      this.resizeStop.emit(resizePayload);
    } else {
      this.dragStart.emit(
        this.timelineGesture(visibleEvent, 0, resourceAssignment(resource), event, mode),
      );
      this.dragStop.emit(payload);
    }
  }
  private pointerDeltaMinutes(deltaX: number): number {
    const durationMinutes = (this.range().end.getTime() - this.range().start.getTime()) / 60_000;
    const raw = (deltaX / Math.max(1, this.totalWidth())) * durationMinutes * (this.rtl() ? -1 : 1);
    return Math.round(raw / Math.max(1, this.snapMinutes())) * this.snapMinutes();
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
  private timelineGesture(
    event: JSchedulerVisibleEvent,
    deltaMinutes: number,
    assignment: Pick<JSchedulerTimelineGesture, 'resourceId' | 'resourceIds'>,
    nativeEvent: PointerEvent | KeyboardEvent,
    mode: 'drag' | 'resize',
    edge: 'start' | 'end' = 'end',
  ): JSchedulerTimelineGesture {
    const delta = deltaMinutes * 60_000;
    return {
      event,
      start:
        mode === 'drag' || edge === 'start' ? new Date(event.start.getTime() + delta) : event.start,
      end: mode === 'drag' || edge === 'end' ? new Date(event.end.getTime() + delta) : event.end,
      ...assignment,
      nativeEvent,
      edge: mode === 'resize' ? edge : undefined,
    };
  }
  private pointerResourceAssignment(
    gesture: JSchedulerTimelineActiveGesture,
    clientY: number,
  ): Pick<JSchedulerTimelineGesture, 'resourceId' | 'resourceIds'> {
    if (gesture.sourceRowIndex < 0 || this.rows().length <= 1)
      return gesture.resourceId == null
        ? {}
        : { resourceId: gesture.resourceId, resourceIds: gesture.resourceIds };
    const contentDelta = clientY - gesture.originY + (this.scrollTop() - gesture.originScrollTop);
    const rowDelta = Math.round(contentDelta / Math.max(1, this.resourceRowHeight()));
    const target = this.nearestEditableRow(gesture.sourceRowIndex + rowDelta, Math.sign(rowDelta));
    return target
      ? resourceAssignment(target.resource)
      : resourceAssignment(this.rows()[gesture.sourceRowIndex]!.resource);
  }
  private keyboardResourceAssignment(
    resource: JSchedulerResource,
    direction: number,
  ): Pick<JSchedulerTimelineGesture, 'resourceId' | 'resourceIds'> | null {
    const index = this.rows().findIndex((row) => row.resource.id === resource.id);
    if (index < 0) return null;
    const target = this.nearestEditableRow(index + direction, direction);
    return target && target.resource.id !== resource.id
      ? resourceAssignment(target.resource)
      : null;
  }
  private nearestEditableRow(index: number, direction: number): JSchedulerResourceRow | null {
    const rows = this.rows();
    if (!rows.length) return null;
    let candidate = Math.max(0, Math.min(rows.length - 1, index));
    const step = direction < 0 ? -1 : 1;
    while (candidate >= 0 && candidate < rows.length) {
      const row = rows[candidate]!;
      if (!row.parent && !row.resource.disabled) return row;
      candidate += step;
    }
    return null;
  }
  dateKey(date: Date) {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  }
  timelineCellKey(resource: JSchedulerResource, slotIndex: number): string {
    return `${String(resource.id)}|${slotIndex}`;
  }
  handleCellKeydown(
    nativeEvent: KeyboardEvent,
    resource: JSchedulerResource,
    slotIndex: number,
  ): void {
    if (nativeEvent.altKey) return;
    const slots = this.slots();
    const rows = this.rows();
    let targetSlot = slotIndex;
    let rowIndex = rows.findIndex((row) => String(row.resource.id) === String(resource.id));
    if (nativeEvent.key === 'Enter' || nativeEvent.key === ' ') {
      const slot = slots[slotIndex];
      if (!slot) return;
      nativeEvent.preventDefault();
      this.cellActivate.emit({ date: slot.start, resourceId: resource.id, nativeEvent });
      return;
    }
    const logical = this.rtl() ? -1 : 1;
    if (nativeEvent.key === 'ArrowLeft') targetSlot -= logical;
    else if (nativeEvent.key === 'ArrowRight') targetSlot += logical;
    else if (nativeEvent.key === 'ArrowUp') rowIndex -= 1;
    else if (nativeEvent.key === 'ArrowDown') rowIndex += 1;
    else if (nativeEvent.key === 'Home') targetSlot = 0;
    else if (nativeEvent.key === 'End') targetSlot = slots.length - 1;
    else if (nativeEvent.key === 'PageUp') targetSlot -= 5;
    else if (nativeEvent.key === 'PageDown') targetSlot += 5;
    else return;
    targetSlot = Math.max(0, Math.min(slots.length - 1, targetSlot));
    rowIndex = Math.max(0, Math.min(rows.length - 1, rowIndex));
    const targetResource = rows[rowIndex]!.resource;
    const key = this.timelineCellKey(targetResource, targetSlot);
    nativeEvent.preventDefault();
    this.focusedCellKey.set(key);
    this.scrollLeft.set(Math.max(0, targetSlot * this.slotWidth() - this.viewportWidth() / 2));
    this.scrollTop.set(
      Math.max(0, rowIndex * this.resourceRowHeight() - this.viewportHeight() / 2),
    );
    queueMicrotask(() =>
      Array.from(this.host.nativeElement.querySelectorAll<HTMLButtonElement>('[data-focus-key]'))
        .find((button) => button.dataset['focusKey'] === key)
        ?.focus({ preventScroll: true }),
    );
  }
  headerContext(
    group: JSchedulerTimelineHeaderGroup,
    unit: JSchedulerTimelineHeaderUnit,
  ): JSchedulerHeaderTemplateContext {
    return {
      $implicit: group.label,
      label: group.label,
      start: group.start,
      end: group.end,
      date: group.start,
      unit,
      view: this.view(),
    };
  }
}

function capturePointer(target: EventTarget | null, pointerId: number): void {
  if (!(target instanceof HTMLElement)) return;
  try {
    target.setPointerCapture?.(pointerId);
  } catch {
    // Synthetic events and older engines may not have an active native pointer.
  }
}

function resourceIds(resource: JSchedulerResource): readonly JSchedulerId[] {
  return [resource.id, ...(resource.children ?? []).flatMap(resourceIds)];
}

function resourceAssignment(
  resource: JSchedulerResource,
): Pick<JSchedulerTimelineGesture, 'resourceId' | 'resourceIds'> {
  if (resource.id === '__schedule') return {};
  const values = Object.values(resource.dimensionValues ?? {});
  return values.length
    ? { resourceId: values.at(-1), resourceIds: values }
    : { resourceId: resource.id };
}

function timelineHeaderGroups(
  slots: readonly {
    readonly index: number;
    readonly start: Date;
    readonly end: Date;
    readonly label: string;
  }[],
  level: JSchedulerTimelineHeaderLevel,
  locale: string,
): readonly JSchedulerTimelineHeaderGroup[] {
  const groups: JSchedulerTimelineHeaderGroup[] = [];
  for (const slot of slots) {
    const key = timelineHeaderKey(slot.start, level.unit);
    const previous = groups.at(-1);
    if (previous?.key === key && previous.startIndex + previous.span === slot.index) {
      groups[groups.length - 1] = {
        ...previous,
        span: previous.span + 1,
        end: slot.end,
      };
      continue;
    }
    groups.push({
      key: `${level.unit}:${key}:${slot.index}`,
      label: timelineHeaderLabel(slot.start, level, locale),
      startIndex: slot.index,
      span: 1,
      start: slot.start,
      end: slot.end,
    });
  }
  return groups;
}

function timelineHeaderKey(date: Date, unit: JSchedulerTimelineHeaderUnit): string {
  const year = date.getFullYear();
  const month = date.getMonth();
  switch (unit) {
    case 'hour':
      return `${year}-${month}-${date.getDate()}-${date.getHours()}`;
    case 'day':
      return `${year}-${month}-${date.getDate()}`;
    case 'week': {
      const week = isoWeek(date);
      return `${week.year}-${week.week}`;
    }
    case 'month':
      return `${year}-${month}`;
    case 'quarter':
      return `${year}-${Math.floor(month / 3) + 1}`;
    case 'year':
      return String(year);
  }
}

function timelineHeaderLabel(
  date: Date,
  level: JSchedulerTimelineHeaderLevel,
  locale: string,
): string {
  if (level.format) return new Intl.DateTimeFormat(locale, level.format).format(date);
  switch (level.unit) {
    case 'hour':
      return new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' }).format(date);
    case 'day':
      return new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric' }).format(date);
    case 'week':
      return `Week ${isoWeek(date).week}`;
    case 'month':
      return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(date);
    case 'quarter':
      return `Q${Math.floor(date.getMonth() / 3) + 1} ${date.getFullYear()}`;
    case 'year':
      return new Intl.DateTimeFormat(locale, { year: 'numeric' }).format(date);
  }
}

function isoWeek(date: Date): { readonly year: number; readonly week: number } {
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const weekday = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - weekday);
  const year = utc.getUTCFullYear();
  const yearStart = new Date(Date.UTC(year, 0, 1));
  return { year, week: Math.ceil(((utc.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7) };
}
