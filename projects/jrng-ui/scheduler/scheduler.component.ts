import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ContentChild,
  ElementRef,
  inject,
  input,
  model,
  output,
  PLATFORM_ID,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { isPlatformBrowser, NgTemplateOutlet } from '@angular/common';
import { JButtonComponent } from 'jrng-ui/button';
import { JTooltipDirective } from 'jrng-ui/tooltip';
import {
  jSchedulerNavigateDate,
  jSchedulerVisibleRange,
  JSchedulerDateEngineOptions,
} from './engine/date-engine';
import { jSchedulerNormalizeEvents, jSchedulerValidateEvent } from './engine/event-engine';
import { jSchedulerViewDefinition } from './engine/view-registry';
import { jSchedulerParseTime } from './engine/layout-engine';
import {
  jSchedulerMoveEvent,
  jSchedulerProposal,
  jSchedulerResizeEvent,
  jSchedulerValidateMove,
} from './interaction/interaction-engine';
import { JSchedulerAgendaRendererComponent } from './renderers/agenda-renderer.component';
import { JSchedulerMonthRendererComponent } from './renderers/month-renderer.component';
import {
  JSchedulerRendererGesture,
  JSchedulerTimeGridRendererComponent,
} from './renderers/time-grid-renderer.component';
import { JSchedulerYearRendererComponent } from './renderers/year-renderer.component';
import {
  JSchedulerAppointmentSlot,
  JSchedulerBlockedInterval,
  JSchedulerBusinessHours,
  JSchedulerCategory,
  JSchedulerDateRange,
  JSchedulerEvent,
  JSchedulerEventChangeRequest,
  JSchedulerEventChangeGuard,
  JSchedulerEventInteraction,
  JSchedulerEventMoveProposal,
  JSchedulerEventResizeProposal,
  JSchedulerFilterState,
  JSchedulerHeight,
  JSchedulerId,
  JSchedulerPrintOptions,
  JSchedulerResource,
  JSchedulerSelection,
  JSchedulerGestureProgress,
  JSchedulerSelectionMode,
  JSchedulerTimeZone,
  JSchedulerToolbarAction,
  JSchedulerToolbarConfig,
  JSchedulerView,
  JSchedulerVisibleEvent,
} from './scheduler.models';

const DEFAULT_VIEWS: readonly JSchedulerView[] = ['month', 'week', 'day', 'agenda'];
const DEFAULT_TOOLBAR: Required<JSchedulerToolbarConfig> = {
  start: ['prev', 'next', 'today'],
  center: ['title'],
  end: ['month', 'week', 'day', 'agenda'],
};

@Component({
  selector: 'j-scheduler',
  imports: [
    JButtonComponent,
    JTooltipDirective,
    NgTemplateOutlet,
    JSchedulerMonthRendererComponent,
    JSchedulerTimeGridRendererComponent,
    JSchedulerAgendaRendererComponent,
    JSchedulerYearRendererComponent,
  ],
  templateUrl: './scheduler.component.html',
  styleUrl: './scheduler.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JSchedulerComponent {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  @ContentChild('jSchedulerToolbar') toolbarTemplate?: TemplateRef<unknown>;
  @ContentChild('jSchedulerToolbarStart') toolbarStartTemplate?: TemplateRef<unknown>;
  @ContentChild('jSchedulerToolbarCenter') toolbarCenterTemplate?: TemplateRef<unknown>;
  @ContentChild('jSchedulerToolbarEnd') toolbarEndTemplate?: TemplateRef<unknown>;
  @ViewChild('scrollSurface') private scrollSurface?: ElementRef<HTMLElement>;

  readonly events = input<readonly JSchedulerEvent[]>([]);
  readonly resources = input<readonly JSchedulerResource[]>([]);
  readonly categories = input<readonly JSchedulerCategory[]>([]);
  readonly date = model<Date>(new Date());
  readonly view = model<JSchedulerView>('month');
  readonly views = input<readonly JSchedulerView[]>(DEFAULT_VIEWS);
  readonly locale = input('en-US');
  readonly calendar = input<string | undefined>(undefined);
  readonly numberingSystem = input<string | undefined>(undefined);
  readonly timezone = input<JSchedulerTimeZone>('local');
  readonly displayTimezone = input<JSchedulerTimeZone>('local');
  readonly rtl = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly editable = input(false, { transform: booleanAttribute });
  readonly selectable = input(false, { transform: booleanAttribute });
  readonly selectionMode = input<JSchedulerSelectionMode>('disabled');
  readonly firstDayOfWeek = input<0 | 1 | 2 | 3 | 4 | 5 | 6>(0);
  readonly daysOfWeek = input<readonly number[]>([0, 1, 2, 3, 4, 5, 6]);
  readonly weekNumbers = input(false, { transform: booleanAttribute });
  readonly minDate = input<Date | undefined>(undefined);
  readonly maxDate = input<Date | undefined>(undefined);
  readonly slotDuration = input('00:30');
  readonly slotMinTime = input('00:00');
  readonly slotMaxTime = input('24:00');
  readonly snapDuration = input('00:15');
  readonly minimumEventDuration = input(15 * 60_000);
  readonly maximumEventDuration = input(Number.POSITIVE_INFINITY);
  readonly minimumDragDistance = input(5);
  readonly eventChangeGuard = input<JSchedulerEventChangeGuard | null>(null);
  readonly businessHours = input<readonly JSchedulerBusinessHours[]>([]);
  readonly blockedIntervals = input<readonly JSchedulerBlockedInterval[]>([]);
  readonly appointmentSlots = input<readonly JSchedulerAppointmentSlot[]>([]);
  readonly maxEventsVisible = input(3);
  readonly showMorePopover = input(true, { transform: booleanAttribute });
  readonly showBusinessHours = input(true, { transform: booleanAttribute });
  readonly nowIndicator = input(true, { transform: booleanAttribute });
  readonly headerToolbar = input<boolean | JSchedulerToolbarConfig>(true);
  readonly height = input<JSchedulerHeight>('auto');
  readonly autoHeight = input(false, { transform: booleanAttribute });
  readonly eventOverlap = input(true, { transform: booleanAttribute });
  readonly eventStartEditable = input(true, { transform: booleanAttribute });
  readonly eventDurationEditable = input(true, { transform: booleanAttribute });
  readonly eventSelection = input(false, { transform: booleanAttribute });
  readonly eventPopover = input(false, { transform: booleanAttribute });
  readonly quickInfo = input(false, { transform: booleanAttribute });
  readonly inlineEdit = input(false, { transform: booleanAttribute });
  readonly recurrenceEdit = input(false, { transform: booleanAttribute });
  readonly groupByResource = input(false, { transform: booleanAttribute });
  readonly groupByDate = input(false, { transform: booleanAttribute });
  readonly resourceAreaWidth = input<number | string>(240);
  readonly resourcesExpandable = input(true, { transform: booleanAttribute });
  readonly resourcesInitiallyExpanded = input<readonly JSchedulerId[] | boolean>(true);
  readonly adaptiveMode = input<'auto' | 'always' | 'never'>('auto');
  readonly selectedResourceId = model<JSchedulerId | null>(null);
  readonly rowAutoHeight = input(true, { transform: booleanAttribute });
  readonly timelineSlotDuration = input('01:00');
  readonly timelineSlotWidth = input(72);
  readonly timelineVirtualScroll = input(true, { transform: booleanAttribute });
  readonly timelineVirtualThreshold = input(200);
  readonly timelineVirtualOverscan = input(4);
  readonly ariaLabel = input('Scheduler');
  readonly selectedRange = input<JSchedulerSelection | null>(null);
  readonly selectedEventIds = input<readonly JSchedulerId[]>([]);
  readonly filters = input<JSchedulerFilterState>({});
  readonly expandedResourceIds = input<readonly JSchedulerId[]>([]);
  readonly styleClass = input('');
  readonly agendaDays = input(30);

  readonly dateClick = output<Date>();
  readonly eventClick = output<JSchedulerEventInteraction>();
  readonly eventDoubleClick = output<JSchedulerEventInteraction>();
  readonly eventAdd = output<JSchedulerEventChangeRequest>();
  readonly eventChange = output<JSchedulerEventChangeRequest>();
  readonly eventRemove = output<JSchedulerEventChangeRequest>();
  readonly selectionChange = output<JSchedulerSelection | null>();
  readonly eventSelectionChange = output<readonly JSchedulerEvent[]>();
  readonly filtersChange = output<JSchedulerFilterState>();
  readonly expandedResourceIdsChange = output<readonly JSchedulerId[]>();
  readonly dateSelect = output<JSchedulerSelection>();
  readonly dateUnselect = output<void>();
  readonly eventDragStart = output<JSchedulerGestureProgress>();
  readonly eventDrag = output<JSchedulerGestureProgress>();
  readonly eventDragStop = output<JSchedulerGestureProgress>();
  readonly eventDrop = output<JSchedulerEventMoveProposal>();
  readonly eventResizeStart = output<JSchedulerGestureProgress>();
  readonly eventResize = output<JSchedulerGestureProgress>();
  readonly eventResizeStop = output<JSchedulerGestureProgress>();
  readonly conflictDetected = output<JSchedulerEventMoveProposal | JSchedulerEventResizeProposal>();

  readonly dateOptions = computed<JSchedulerDateEngineOptions>(() => ({
    firstDayOfWeek: this.firstDayOfWeek(),
    daysOfWeek: this.daysOfWeek(),
    agendaDays: this.agendaDays(),
  }));
  readonly visibleRange = computed(() =>
    jSchedulerVisibleRange(this.validDate(), this.view(), this.dateOptions()),
  );
  readonly visibleEvents = computed(() =>
    jSchedulerNormalizeEvents(this.events(), this.visibleRange()),
  );
  readonly viewDefinition = computed(() => jSchedulerViewDefinition(this.view()));
  readonly title = computed(() => this.formatRangeTitle(this.visibleRange()));
  readonly toolbar = computed<Required<JSchedulerToolbarConfig>>(() => {
    const config = this.headerToolbar();
    if (config === false) return { start: [], center: [], end: [] };
    if (config === true) return DEFAULT_TOOLBAR;
    return {
      start: config.start ?? DEFAULT_TOOLBAR.start,
      center: config.center ?? DEFAULT_TOOLBAR.center,
      end: config.end ?? DEFAULT_TOOLBAR.end,
    };
  });
  readonly rootStyle = computed(() => {
    const value = this.autoHeight() ? 'auto' : this.height();
    if (typeof value === 'number') return `${value}px`;
    if (value === 'parent') return '100%';
    return value;
  });
  readonly selectedEvents = computed(() => {
    const ids = new Set(this.selectedEventIds().map(String));
    return this.events().filter((event) => ids.has(String(event.id)));
  });

  today(): void {
    if (this.disabled()) return;
    this.date.set(new Date());
  }

  previous(): void {
    if (this.disabled()) return;
    this.date.set(jSchedulerNavigateDate(this.validDate(), this.view(), -1, this.agendaDays()));
  }

  next(): void {
    if (this.disabled()) return;
    this.date.set(jSchedulerNavigateDate(this.validDate(), this.view(), 1, this.agendaDays()));
  }

  goToDate(date: Date): void {
    if (!this.disabled() && !Number.isNaN(date.getTime())) this.date.set(new Date(date.getTime()));
  }

  changeView(view: JSchedulerView): void {
    if (!this.disabled() && this.views().includes(view)) this.view.set(view);
  }

  getDate(): Date {
    return new Date(this.validDate().getTime());
  }

  getVisibleRange(): JSchedulerDateRange {
    const range = this.visibleRange();
    return { start: new Date(range.start), end: new Date(range.end) };
  }

  select(start: Date, end?: Date, resourceId?: JSchedulerId): void {
    if (this.disabled() || this.readonly() || !this.selectable()) return;
    this.selectionChange.emit({
      start: new Date(start),
      end: end ? new Date(end) : undefined,
      allDay: this.viewDefinition().family !== 'timeGrid',
      view: this.view(),
      resourceId,
    });
  }

  clearSelection(): void {
    if (!this.disabled()) {
      this.selectionChange.emit(null);
      this.dateUnselect.emit();
    }
  }

  getEvents(): readonly JSchedulerEvent[] {
    return this.events();
  }

  getEventById(id: JSchedulerId): JSchedulerEvent | undefined {
    return this.events().find((event) => String(event.id) === String(id));
  }

  addEvent(event: JSchedulerEvent): void {
    if (this.cannotEdit() || jSchedulerValidateEvent(event).length) return;
    this.eventAdd.emit(this.changeRequest(event, 'add'));
  }

  updateEvent(event: JSchedulerEvent): void {
    if (this.cannotEdit() || jSchedulerValidateEvent(event).length) return;
    this.eventChange.emit(this.changeRequest(event, 'update', this.getEventById(event.id)));
  }

  removeEvent(id: JSchedulerId): void {
    if (this.cannotEdit()) return;
    const event = this.getEventById(id);
    if (event) this.eventRemove.emit(this.changeRequest(event, 'remove', event));
  }

  getSelectedEvents(): readonly JSchedulerEvent[] {
    return this.selectedEvents();
  }

  clearEventSelection(): void {
    if (!this.disabled()) this.eventSelectionChange.emit([]);
  }

  getResources(): readonly JSchedulerResource[] {
    return this.resources();
  }

  getResourceById(id: JSchedulerId): JSchedulerResource | undefined {
    const visit = (items: readonly JSchedulerResource[]): JSchedulerResource | undefined => {
      for (const item of items) {
        if (String(item.id) === String(id)) return item;
        const nested = item.children ? visit(item.children) : undefined;
        if (nested) return nested;
      }
      return undefined;
    };
    return visit(this.resources());
  }

  expandResource(id: JSchedulerId): void {
    if (this.disabled()) return;
    const ids = new Set(this.expandedResourceIds());
    ids.add(id);
    this.expandedResourceIdsChange.emit([...ids]);
  }

  collapseResource(id: JSchedulerId): void {
    if (this.disabled()) return;
    this.expandedResourceIdsChange.emit(
      this.expandedResourceIds().filter((value) => String(value) !== String(id)),
    );
  }

  scrollToTime(time: string): void {
    if (!this.isBrowser) return;
    const target = this.scrollSurface?.nativeElement.querySelector<HTMLElement>(
      `[data-j-time="${CSS.escape(time)}"]`,
    );
    target?.scrollIntoView({ block: 'start' });
  }

  scrollToResource(id: JSchedulerId): void {
    if (!this.isBrowser) return;
    const target = this.scrollSurface?.nativeElement.querySelector<HTMLElement>(
      `[data-resource-id="${CSS.escape(String(id))}"]`,
    );
    target?.scrollIntoView({ block: 'nearest' });
  }

  refreshLayout(): void {
    if (this.isBrowser) this.scrollSurface?.nativeElement.getBoundingClientRect();
  }

  print(options: JSchedulerPrintOptions = {}): void {
    if (!this.isBrowser || !['month', 'week', 'day', 'agenda'].includes(this.view())) return;
    const root = this.scrollSurface?.nativeElement.closest<HTMLElement>('.j-scheduler');
    if (root) root.dataset['printTitle'] = options.title ?? this.title();
    window.print();
  }

  isToolbarActionVisible(action: JSchedulerToolbarAction): boolean {
    return !this.isViewAction(action) || this.views().includes(action);
  }

  isViewAction(action: JSchedulerToolbarAction): action is JSchedulerView {
    return (
      jSchedulerViewDefinition(action as JSchedulerView).view === action &&
      ![
        'prev',
        'next',
        'today',
        'title',
        'resourceFilter',
        'categoryFilter',
        'timezone',
        'addEvent',
      ].includes(action)
    );
  }

  viewLabel(view: JSchedulerView): string {
    return jSchedulerViewDefinition(view).label;
  }

  handleDateActivate(date: Date): void {
    if (!this.disabled()) this.dateClick.emit(new Date(date));
  }

  handleEventActivate(event: JSchedulerVisibleEvent): void {
    if (!this.disabled())
      this.eventClick.emit({ event: event.source, occurrenceStart: event.start });
  }

  handleEventDoubleActivate(event: JSchedulerVisibleEvent): void {
    if (!this.disabled())
      this.eventDoubleClick.emit({ event: event.source, occurrenceStart: event.start });
  }

  handleSlotActivate(value: { readonly date: Date; readonly minutes: number }): void {
    if (this.disabled() || this.readonly() || !this.selectable()) return;
    const start = new Date(
      value.date.getFullYear(),
      value.date.getMonth(),
      value.date.getDate(),
      0,
      value.minutes,
    );
    const end = new Date(start.getTime() + this.slotMinutes() * 60_000);
    const selection: JSchedulerSelection = {
      start,
      end,
      allDay: false,
      view: this.view(),
      resourceId: this.selectedResourceId() ?? undefined,
    };
    this.selectionChange.emit(selection);
    this.dateSelect.emit(selection);
  }

  handleGestureStart(value: JSchedulerRendererGesture, resize: boolean): void {
    const payload = this.gestureProgress(value, true);
    resize ? this.eventResizeStart.emit(payload) : this.eventDragStart.emit(payload);
  }

  handleGestureProgress(value: JSchedulerRendererGesture, resize: boolean): void {
    const payload = this.gestureProgress(value, this.validateGesture(value).valid);
    resize ? this.eventResize.emit(payload) : this.eventDrag.emit(payload);
  }

  handleGestureStop(value: JSchedulerRendererGesture, resize: boolean): void {
    if (this.cannotEdit()) return;
    const updated = resize
      ? jSchedulerResizeEvent(
          value.event.source,
          'end',
          value.end,
          this.minimumEventDuration(),
          this.maximumEventDuration(),
        )
      : jSchedulerMoveEvent(value.event.source, value.start, value.end);
    const validation = jSchedulerValidateMove(updated, this.events(), {
      allowOverlap: this.eventOverlap(),
      minDate: this.minDate(),
      maxDate: this.maxDate(),
    });
    let valid = validation.valid;
    let reason = validation.reason;
    const base = jSchedulerProposal(
      updated,
      value.event.source,
      this.view(),
      valid,
      () => undefined,
      reason,
      value.nativeEvent,
    );
    const guard = this.eventChangeGuard()?.(resize ? { ...base, edge: 'end' } : base);
    if (guard === false || typeof guard === 'string') {
      valid = false;
      reason = typeof guard === 'string' ? guard : 'Change rejected.';
    }
    const proposal = jSchedulerProposal(
      updated,
      value.event.source,
      this.view(),
      valid,
      () => undefined,
      reason,
      value.nativeEvent,
    );
    const progress = this.gestureProgress(value, valid);
    if (resize) {
      this.eventResizeStop.emit(progress);
      const resizeProposal: JSchedulerEventResizeProposal = { ...proposal, edge: 'end' };
      if (valid) this.eventChange.emit(this.changeRequest(updated, 'resize', value.event.source));
      else this.conflictDetected.emit(resizeProposal);
    } else {
      this.eventDragStop.emit(progress);
      this.eventDrop.emit(proposal);
      if (valid) this.eventChange.emit(this.changeRequest(updated, 'drag', value.event.source));
      else this.conflictDetected.emit(proposal);
    }
  }

  slotMinutes(): number {
    return Math.max(1, jSchedulerParseTime(this.slotDuration(), 30));
  }

  snapMinutes(): number {
    return Math.max(1, jSchedulerParseTime(this.snapDuration(), 15));
  }

  private validateGesture(value: JSchedulerRendererGesture) {
    return jSchedulerValidateMove(
      jSchedulerMoveEvent(value.event.source, value.start, value.end),
      this.events(),
      { allowOverlap: this.eventOverlap(), minDate: this.minDate(), maxDate: this.maxDate() },
    );
  }

  private gestureProgress(
    value: JSchedulerRendererGesture,
    valid: boolean,
  ): JSchedulerGestureProgress {
    return {
      event: value.event.source,
      start: value.start,
      end: value.end,
      view: this.view(),
      valid,
      nativeEvent: value.nativeEvent,
    };
  }

  private validDate(): Date {
    const value = this.date();
    return Number.isNaN(value.getTime()) ? new Date() : value;
  }

  private cannotEdit(): boolean {
    return this.disabled() || this.readonly() || !this.editable();
  }

  private changeRequest(
    event: JSchedulerEvent,
    reason: JSchedulerEventChangeRequest['reason'],
    previousEvent?: JSchedulerEvent,
  ): JSchedulerEventChangeRequest {
    return {
      event: { ...event },
      previousEvent,
      reason,
      view: this.view(),
      revert: () => undefined,
    };
  }

  private formatRangeTitle(range: JSchedulerDateRange): string {
    const locale = this.locale();
    const options: Intl.DateTimeFormatOptions = {
      calendar: this.calendar(),
      numberingSystem: this.numberingSystem(),
      timeZone: this.displayTimezone() === 'local' ? undefined : this.displayTimezone(),
      month: 'long',
      day: this.view() === 'month' ? undefined : 'numeric',
      year: 'numeric',
    };
    const formatter = new Intl.DateTimeFormat(locale, options);
    if (this.viewDefinition().family === 'month') return formatter.format(this.validDate());
    const inclusiveEnd = new Date(range.end.getTime() - 1);
    return formatter.formatRange
      ? formatter.formatRange(range.start, inclusiveEnd)
      : formatter.format(range.start);
  }
}
