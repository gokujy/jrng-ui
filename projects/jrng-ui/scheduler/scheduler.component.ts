import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ContentChild,
  DestroyRef,
  ElementRef,
  effect,
  inject,
  input,
  model,
  output,
  PLATFORM_ID,
  TemplateRef,
  ViewChild,
  signal,
} from '@angular/core';
import { DatePipe, isPlatformBrowser, NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JButtonComponent } from 'jrng-ui/button';
import { JTooltipDirective } from 'jrng-ui/tooltip';
import { JSelectComponent } from 'jrng-ui/select';
import { JPopoverComponent } from 'jrng-ui/popover';
import { JDialogComponent } from 'jrng-ui/dialog';
import { JDrawerComponent } from 'jrng-ui/drawer';
import { JDatePickerComponent } from 'jrng-ui/date-picker';
import { JInputComponent } from 'jrng-ui/input';
import { JTimePickerComponent } from 'jrng-ui/time-picker';
import {
  JSchedulerEventEditorComponent,
  JSchedulerEventEditorSave,
} from './event-editor.component';
import {
  jSchedulerNavigateDate,
  jSchedulerAddDuration,
  jSchedulerDurationToMs,
  jSchedulerVisibleRange,
  JSchedulerDateEngineOptions,
} from './engine/date-engine';
import { jSchedulerNormalizeEvents, jSchedulerValidateEvent } from './engine/event-engine';
import { jSchedulerViewDefinition } from './engine/view-registry';
import { jSchedulerParseTime } from './engine/layout-engine';
import {
  jSchedulerAppointmentAvailability,
  jSchedulerBlockedConflict,
  jSchedulerIsWithinBusinessHours,
  jSchedulerIsWithinAvailability,
} from './engine/availability-engine';
import { jSchedulerExpandRecurrence } from './engine/recurrence-engine';
import { jSchedulerValidateBooking, jSchedulerValidateConflicts } from './engine/conflict-engine';
import {
  jSchedulerMoveEvent,
  jSchedulerProposal,
  jSchedulerResizeEvent,
  jSchedulerValidateMove,
} from './interaction/interaction-engine';
import {
  jSchedulerCreateClipboardPayload,
  jSchedulerPasteClipboard,
  JSchedulerClipboardPayload,
} from './interaction/clipboard-engine';
import {
  J_SCHEDULER_DRAG_MIME,
  jSchedulerCreateExternalDragPayload,
  jSchedulerParseExternalDragPayload,
  jSchedulerProjectExternalDrop,
  jSchedulerSerializeExternalDragPayload,
} from './interaction/external-drag-engine';
import {
  jSchedulerAdjacentRanges,
  jSchedulerRangeKey,
  JSchedulerRangeCache,
} from './remote/range-controller';
import { JSchedulerAgendaRendererComponent } from './renderers/agenda-renderer.component';
import { JSchedulerMonthRendererComponent } from './renderers/month-renderer.component';
import {
  JSchedulerRendererGesture,
  JSchedulerTimeGridRendererComponent,
} from './renderers/time-grid-renderer.component';
import { JSchedulerYearRendererComponent } from './renderers/year-renderer.component';
import { JSchedulerTimelineRendererComponent } from './renderers/timeline-renderer.component';
import {
  jSchedulerComposeResourceDimensions,
  JSchedulerResourceRow,
} from './engine/resource-engine';
import {
  jSchedulerExportCsv,
  jSchedulerExportIcs,
  jSchedulerExportExcelXml,
  jSchedulerExportXlsx,
  jSchedulerExportPdf,
  jSchedulerExportJson,
  jSchedulerImportCsv,
  jSchedulerImportIcs,
  jSchedulerImportJson,
  jSchedulerReviewImport,
  JSchedulerCsvOptions,
  JSchedulerImportResult,
  JSchedulerPdfOptions,
  JSchedulerXlsxOptions,
} from './serialization/scheduler-serialization';
import {
  JSchedulerAppointmentSlot,
  JSchedulerAppointmentDisplay,
  JSchedulerAppointmentTemplateContext,
  JSchedulerAvailabilityRule,
  JSchedulerBlockedInterval,
  JSchedulerBlockedTemplateContext,
  JSchedulerBusinessHours,
  JSchedulerCategory,
  JSchedulerCustomView,
  JSchedulerDateRange,
  JSchedulerDateInteraction,
  JSchedulerDateSelectionMode,
  JSchedulerDuration,
  JSchedulerEditableSettings,
  JSchedulerEvent,
  JSchedulerEventAdapter,
  JSchedulerEventTemplateContext,
  JSchedulerCellTemplateContext,
  JSchedulerEventChangeRequest,
  JSchedulerEventChangeGuard,
  JSchedulerEventInteraction,
  JSchedulerEventSelectionMode,
  JSchedulerEventMoveProposal,
  JSchedulerEventResizeProposal,
  JSchedulerFilterState,
  JSchedulerHeight,
  JSchedulerHeaderTemplateContext,
  JSchedulerId,
  JSchedulerMoreEventsMode,
  JSchedulerMoreTemplateContext,
  JSchedulerPrintOptions,
  JSchedulerResource,
  JSchedulerResourceDimension,
  JSchedulerResourceMoveRequest,
  JSchedulerResourceTemplateContext,
  JSchedulerResourceSort,
  JSchedulerSelection,
  JSchedulerSelectionGuard,
  JSchedulerGestureProgress,
  JSchedulerSelectionMode,
  JSchedulerTimeZone,
  JSchedulerTimelineHeaderLevel,
  JSchedulerToolbarAction,
  JSchedulerToolbarButton,
  JSchedulerToolbarButtonGroup,
  JSchedulerToolbarConfig,
  JSchedulerView,
  JSchedulerVisibleEvent,
  JSchedulerInlineEditEvent,
  JSchedulerContextMenuEvent,
  JSchedulerImportOptions,
  JSchedulerState,
  JSchedulerPasteTarget,
  JSchedulerVisibleRangeRequest,
  JSchedulerConflictResult,
  JSchedulerExternalDragPayload,
  JSchedulerExternalDropRequest,
} from './scheduler.models';

const DEFAULT_VIEWS: readonly JSchedulerView[] = ['month', 'week', 'day', 'agenda'];
const SCHEDULER_INSTANCES = new WeakMap<HTMLElement, JSchedulerComponent>();
const DEFAULT_TOOLBAR: Required<JSchedulerToolbarConfig> = {
  start: ['prev', 'next', 'today'],
  center: ['title'],
  end: ['month', 'week', 'day', 'agenda'],
};

interface JSchedulerHistoryEntry {
  readonly before?: JSchedulerEvent;
  readonly after?: JSchedulerEvent;
}

@Component({
  selector: 'j-scheduler',
  imports: [
    JButtonComponent,
    JTooltipDirective,
    NgTemplateOutlet,
    DatePipe,
    FormsModule,
    JSelectComponent,
    JPopoverComponent,
    JDialogComponent,
    JDrawerComponent,
    JDatePickerComponent,
    JInputComponent,
    JTimePickerComponent,
    JSchedulerEventEditorComponent,
    JSchedulerMonthRendererComponent,
    JSchedulerTimeGridRendererComponent,
    JSchedulerAgendaRendererComponent,
    JSchedulerYearRendererComponent,
    JSchedulerTimelineRendererComponent,
  ],
  templateUrl: './scheduler.component.html',
  styleUrl: './scheduler.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JSchedulerComponent {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  readonly validatingChange = signal(false);
  private validationSequence = 0;

  @ContentChild('jSchedulerToolbar') toolbarTemplate?: TemplateRef<unknown>;
  @ContentChild('jSchedulerToolbarStart') toolbarStartTemplate?: TemplateRef<unknown>;
  @ContentChild('jSchedulerToolbarCenter') toolbarCenterTemplate?: TemplateRef<unknown>;
  @ContentChild('jSchedulerToolbarEnd') toolbarEndTemplate?: TemplateRef<unknown>;
  @ContentChild('jSchedulerFooterToolbar') footerToolbarTemplate?: TemplateRef<unknown>;
  @ContentChild('jSchedulerFooterToolbarStart')
  footerToolbarStartTemplate?: TemplateRef<unknown>;
  @ContentChild('jSchedulerFooterToolbarCenter')
  footerToolbarCenterTemplate?: TemplateRef<unknown>;
  @ContentChild('jSchedulerFooterToolbarEnd')
  footerToolbarEndTemplate?: TemplateRef<unknown>;
  @ContentChild('jSchedulerEvent') eventTemplate?: TemplateRef<JSchedulerEventTemplateContext>;
  @ContentChild('jSchedulerMonthEvent')
  monthEventTemplate?: TemplateRef<JSchedulerEventTemplateContext>;
  @ContentChild('jSchedulerTimeGridEvent')
  timeGridEventTemplate?: TemplateRef<JSchedulerEventTemplateContext>;
  @ContentChild('jSchedulerAllDayEvent')
  allDayEventTemplate?: TemplateRef<JSchedulerEventTemplateContext>;
  @ContentChild('jSchedulerTimelineEvent')
  timelineEventTemplate?: TemplateRef<JSchedulerEventTemplateContext>;
  @ContentChild('jSchedulerAgendaEvent')
  agendaEventTemplate?: TemplateRef<JSchedulerEventTemplateContext>;
  @ContentChild('jSchedulerMonthCell')
  monthCellTemplate?: TemplateRef<JSchedulerCellTemplateContext>;
  @ContentChild('jSchedulerDateNumber')
  dateNumberTemplate?: TemplateRef<JSchedulerHeaderTemplateContext>;
  @ContentChild('jSchedulerWeekdayHeader')
  weekdayHeaderTemplate?: TemplateRef<JSchedulerHeaderTemplateContext>;
  @ContentChild('jSchedulerDayHeader')
  dayHeaderTemplate?: TemplateRef<JSchedulerHeaderTemplateContext>;
  @ContentChild('jSchedulerTimeLabel')
  timeLabelTemplate?: TemplateRef<JSchedulerHeaderTemplateContext>;
  @ContentChild('jSchedulerTimelineHeader')
  timelineHeaderTemplate?: TemplateRef<JSchedulerHeaderTemplateContext>;
  @ContentChild('jSchedulerAppointmentSlot')
  appointmentSlotTemplate?: TemplateRef<JSchedulerAppointmentTemplateContext>;
  @ContentChild('jSchedulerBlockedInterval')
  blockedIntervalTemplate?: TemplateRef<JSchedulerBlockedTemplateContext>;
  @ContentChild('jSchedulerMoreTrigger')
  moreTriggerTemplate?: TemplateRef<JSchedulerMoreTemplateContext>;
  @ContentChild('jSchedulerTimeSlot')
  timeSlotTemplate?: TemplateRef<JSchedulerCellTemplateContext>;
  @ContentChild('jSchedulerResourceRow')
  resourceRowTemplate?: TemplateRef<JSchedulerResourceTemplateContext>;
  @ContentChild('jSchedulerEmpty') emptyTemplate?: TemplateRef<unknown>;
  @ViewChild('scrollSurface') private scrollSurface?: ElementRef<HTMLElement>;
  @ViewChild('quickInfoPopover') private quickInfoPopover?: JPopoverComponent;
  @ViewChild('morePopover') private morePopover?: JPopoverComponent;

  readonly events = input<readonly JSchedulerEvent[]>([]);
  readonly eventData = input<readonly object[]>([]);
  readonly eventAdapter = input<JSchedulerEventAdapter | null>(null);
  readonly resources = input<readonly JSchedulerResource[]>([]);
  readonly resourceDimensions = input<readonly JSchedulerResourceDimension[]>([]);
  readonly resourceEditable = input(false, { transform: booleanAttribute });
  readonly resourceAggregateColumns = input(false, { transform: booleanAttribute });
  readonly categories = input<readonly JSchedulerCategory[]>([]);
  readonly date = model<Date>(new Date());
  readonly view = model<JSchedulerView>('month');
  readonly views = input<readonly JSchedulerView[]>(DEFAULT_VIEWS);
  readonly customViews = input<readonly JSchedulerCustomView[]>([]);
  readonly customViewId = input<string | null>(null);
  readonly controlledVisibleRange = input<JSchedulerDateRange | null>(null, {
    alias: 'visibleRange',
  });
  readonly locale = input('en-US');
  readonly calendar = input<string | undefined>(undefined);
  readonly numberingSystem = input<string | undefined>(undefined);
  readonly timezone = input<JSchedulerTimeZone>('local');
  readonly displayTimezone = input<JSchedulerTimeZone>('local');
  readonly rtl = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly editable = input(false, { transform: booleanAttribute });
  readonly editableSettings = input<JSchedulerEditableSettings>({});
  readonly selectable = input(false, { transform: booleanAttribute });
  readonly selectionMode = input<JSchedulerSelectionMode>('disabled');
  readonly dateSelectionMode = input<JSchedulerDateSelectionMode | null>(null);
  readonly minimumSelectionDuration = input(0);
  readonly maximumSelectionDuration = input(Number.POSITIVE_INFINITY);
  readonly selectionGuard = input<JSchedulerSelectionGuard | null>(null);
  readonly firstDayOfWeek = input<0 | 1 | 2 | 3 | 4 | 5 | 6>(0);
  readonly daysOfWeek = input<readonly number[]>([0, 1, 2, 3, 4, 5, 6]);
  readonly weekNumbers = input(false, { transform: booleanAttribute });
  readonly minDate = input<Date | undefined>(undefined);
  readonly maxDate = input<Date | undefined>(undefined);
  readonly slotDuration = input<JSchedulerDuration>('00:30');
  readonly slotLabelInterval = input<JSchedulerDuration>('00:30');
  readonly slotMinTime = input('00:00');
  readonly slotMaxTime = input('24:00');
  readonly snapDuration = input('00:15');
  readonly minimumEventDuration = input(15 * 60_000);
  readonly maximumEventDuration = input(Number.POSITIVE_INFINITY);
  readonly minimumDragDistance = input(5);
  readonly touchLongPressDelay = input(350);
  readonly eventChangeGuard = input<JSchedulerEventChangeGuard | null>(null);
  readonly businessHours = input<readonly JSchedulerBusinessHours[]>([]);
  readonly availability = input<readonly JSchedulerAvailabilityRule[]>([]);
  readonly constrainToAvailability = input(true, { transform: booleanAttribute });
  readonly blockedIntervals = input<readonly JSchedulerBlockedInterval[]>([]);
  readonly appointmentSlots = input<readonly JSchedulerAppointmentSlot[]>([]);
  readonly appointmentDisplay = input<JSchedulerAppointmentDisplay>('overlay');
  readonly maxEventsVisible = input<number | 'auto'>(3);
  readonly showMorePopover = input(true, { transform: booleanAttribute });
  readonly moreEventsMode = input<JSchedulerMoreEventsMode>('popover');
  readonly showBusinessHours = input(true, { transform: booleanAttribute });
  readonly constrainToBusinessHours = input(false, { transform: booleanAttribute });
  readonly nowIndicator = input(true, { transform: booleanAttribute });
  readonly headerToolbar = input<boolean | JSchedulerToolbarConfig>(true);
  readonly footerToolbar = input<boolean | JSchedulerToolbarConfig>(false);
  readonly height = input<JSchedulerHeight>('auto');
  readonly autoHeight = input(false, { transform: booleanAttribute });
  readonly eventOverlap = input(true, { transform: booleanAttribute });
  readonly eventStartEditable = input(true, { transform: booleanAttribute });
  readonly eventDurationEditable = input(true, { transform: booleanAttribute });
  readonly eventSelection = input<boolean | JSchedulerEventSelectionMode>(false);
  readonly eventSelectionLimit = input(Number.POSITIVE_INFINITY);
  readonly eventPopover = input(false, { transform: booleanAttribute });
  readonly quickInfo = input(false, { transform: booleanAttribute });
  readonly inlineEdit = input(false, { transform: booleanAttribute });
  readonly recurrenceEdit = input(false, { transform: booleanAttribute });
  readonly groupByResource = input(false, { transform: booleanAttribute });
  readonly groupByDate = input(false, { transform: booleanAttribute });
  readonly resourceAreaWidth = input<number | string>(240);
  readonly resourcesExpandable = input(true, { transform: booleanAttribute });
  readonly resourcesInitiallyExpanded = input<readonly JSchedulerId[] | boolean>(true);
  readonly resourceSearch = input('');
  readonly resourceSort = input<JSchedulerResourceSort>('input');
  readonly resourceFilter = input<((resource: JSchedulerResource) => boolean) | null>(null);
  readonly adaptiveMode = input<'auto' | 'always' | 'never'>('auto');
  readonly selectedResourceId = model<JSchedulerId | null>(null);
  readonly rowAutoHeight = input(true, { transform: booleanAttribute });
  readonly timelineSlotDuration = input<JSchedulerDuration>('01:00');
  readonly timelineSlotWidth = input(72);
  readonly timelineHeaderLevels = input<readonly JSchedulerTimelineHeaderLevel[] | 'auto'>('auto');
  readonly timelineZoom = model(1);
  readonly timelineMinZoom = input(0.5);
  readonly timelineMaxZoom = input(3);
  readonly timelineZoomStep = input(0.25);
  readonly timelineVirtualScroll = input(true, { transform: booleanAttribute });
  readonly timelineVirtualThreshold = input(200);
  readonly timelineVirtualOverscan = input(4);
  readonly resourceVirtualScroll = input(true, { transform: booleanAttribute });
  readonly resourceVirtualThreshold = input(100);
  readonly resourceRowHeight = input(52);
  readonly agendaVirtualScroll = input(true, { transform: booleanAttribute });
  readonly agendaVirtualThreshold = input(100);
  readonly agendaVirtualOverscan = input(4);
  readonly agendaRowHeight = input(112);
  readonly ariaLabel = input('Scheduler');
  readonly selectedRange = model<JSchedulerSelection | null>(null);
  readonly selectedEventIds = model<readonly JSchedulerId[]>([]);
  readonly filters = input<JSchedulerFilterState>({});
  readonly expandedResourceIds = input<readonly JSchedulerId[]>([]);
  readonly styleClass = input('');
  readonly agendaDays = input(30);
  readonly multiMonthLayout = input<'grid' | 'stack'>('grid');
  readonly multiMonthCount = input(12);
  readonly multiMonthMaxColumns = input(4);
  readonly multiMonthMinWidth = input('15rem');
  readonly clipboardEnabled = input(false, { transform: booleanAttribute });
  readonly historyEnabled = input(false, { transform: booleanAttribute });
  readonly historyLimit = input(50);
  readonly remoteData = input(false, { transform: booleanAttribute });
  readonly remotePrefetch = input(false, { transform: booleanAttribute });
  readonly remoteCursor = input<string | undefined>(undefined);
  readonly remotePageSize = input<number | undefined>(undefined);
  readonly loading = input(false, { transform: booleanAttribute });
  readonly loadError = input<string | null>(null);
  readonly schedulerId = input('scheduler');
  readonly externalDrag = input(false, { transform: booleanAttribute });
  readonly externalDropEnabled = input(false, { transform: booleanAttribute });
  readonly builtInEditor = input(false, { transform: booleanAttribute });
  readonly editorTimezones = input<readonly string[]>(['local', 'UTC']);

  readonly dateClick = output<Date>();
  readonly eventClick = output<JSchedulerEventInteraction>();
  readonly eventDoubleClick = output<JSchedulerEventInteraction>();
  readonly eventAdd = output<JSchedulerEventChangeRequest>();
  readonly eventAddRequest = output<JSchedulerEventChangeRequest>();
  readonly eventChange = output<JSchedulerEventChangeRequest>();
  readonly eventChangeRequest = output<JSchedulerEventChangeRequest>();
  readonly eventRemove = output<JSchedulerEventChangeRequest>();
  readonly eventRemoveRequest = output<JSchedulerEventChangeRequest>();
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
  readonly conflictResult = output<JSchedulerConflictResult>();
  readonly slotClick = output<JSchedulerAppointmentSlot>();
  readonly slotBook = output<JSchedulerAppointmentSlot>();
  readonly slotCancel = output<JSchedulerAppointmentSlot>();
  readonly capacityExceeded = output<JSchedulerAppointmentSlot>();
  readonly resourceClick = output<JSchedulerResource>();
  readonly resourceMoveRequest = output<JSchedulerResourceMoveRequest>();
  readonly resourceExpand = output<JSchedulerResource>();
  readonly resourceCollapse = output<JSchedulerResource>();
  readonly quickInfoShow = output<JSchedulerEvent>();
  readonly quickInfoHide = output<JSchedulerEvent | null>();
  readonly quickInfoEdit = output<JSchedulerEvent>();
  readonly quickInfoDelete = output<JSchedulerEvent>();
  readonly inlineEditStart = output<JSchedulerInlineEditEvent>();
  readonly inlineEditSave = output<JSchedulerInlineEditEvent>();
  readonly inlineEditCancel = output<JSchedulerInlineEditEvent>();
  readonly contextMenuShow = output<JSchedulerContextMenuEvent>();
  readonly importPreview = output<JSchedulerImportResult>();
  readonly clipboardChange = output<readonly JSchedulerEvent[]>();
  readonly visibleRangeRequest = output<JSchedulerVisibleRangeRequest>();
  readonly retryRequest = output<void>();
  readonly externalDragStart = output<JSchedulerExternalDragPayload>();
  readonly externalDrop = output<JSchedulerExternalDropRequest>();
  readonly externalDragEnd = output<JSchedulerExternalDragPayload | null>();
  readonly eventEditRequest = output<JSchedulerEvent | null>();
  readonly exportRequest = output<'json'>();
  readonly toolbarButtonClick = output<string>();

  readonly canAddEvents = computed(() => this.editOperationAllowed('add'));
  readonly canEditEvents = computed(() => this.editOperationAllowed('edit'));
  readonly canRemoveEvents = computed(() => this.editOperationAllowed('remove'));
  readonly canDragEvents = computed(() => this.editOperationAllowed('drag'));
  readonly canResizeEvents = computed(() => this.editOperationAllowed('resize'));
  readonly canResizeEventsFromStart = computed(
    () => this.canResizeEvents() && this.editableSettings().resizeFromStart === true,
  );
  readonly effectiveEventSelectionMode = computed<JSchedulerEventSelectionMode>(() => {
    const value = this.eventSelection();
    if (value === false || value === 'none') return 'none';
    if (value === 'single') return 'single';
    return 'multiple';
  });
  readonly effectiveDateSelectionMode = computed<JSchedulerDateSelectionMode>(() => {
    const explicit = this.dateSelectionMode();
    if (explicit) return explicit;
    if (!this.selectable()) return 'none';
    switch (this.selectionMode()) {
      case 'multiple':
        return 'multiple';
      case 'range':
        return 'dateRange';
      case 'timeRange':
        return 'timeRange';
      case 'single':
      case 'disabled':
      default:
        return 'single';
    }
  });
  readonly canMoveEventsBetweenResources = computed(
    () => this.canDragEvents() && this.editableSettings().moveBetweenResources !== false,
  );
  readonly canMoveEventsBetweenSchedulers = computed(
    () => this.canDragEvents() && this.editableSettings().moveBetweenSchedulers !== false,
  );

  readonly dateOptions = computed<JSchedulerDateEngineOptions>(() => ({
    firstDayOfWeek: this.firstDayOfWeek(),
    daysOfWeek: this.daysOfWeek(),
    agendaDays: this.agendaDays(),
  }));
  readonly activeCustomView = computed(() =>
    this.customViews().find((definition) => definition.id === this.customViewId()),
  );
  readonly effectiveSlotDuration = computed(() => {
    const custom = this.view() === 'custom' ? this.activeCustomView()?.slotDuration : undefined;
    return durationTime(custom ?? this.slotDuration());
  });
  readonly effectiveSlotLabelInterval = computed(() => durationTime(this.slotLabelInterval()));
  readonly effectiveTimelineSlotDuration = computed(() => {
    const custom = this.view() === 'custom' ? this.activeCustomView()?.slotDuration : undefined;
    return durationTime(custom ?? this.timelineSlotDuration());
  });
  readonly effectiveTimelineSlotWidth = computed(() =>
    Math.max(12, this.timelineSlotWidth() * this.timelineZoom()),
  );
  readonly visibleRange = computed(() => {
    const controlled = this.controlledVisibleRange();
    if (controlled) return { start: new Date(controlled.start), end: new Date(controlled.end) };
    const definition = this.view() === 'custom' ? this.activeCustomView() : undefined;
    if (definition?.visibleRange) return definition.visibleRange(new Date(this.validDate()));
    if (definition?.duration) {
      const start = new Date(
        this.validDate().getFullYear(),
        this.validDate().getMonth(),
        this.validDate().getDate(),
      );
      return { start, end: jSchedulerAddDuration(start, definition.duration) };
    }
    return jSchedulerVisibleRange(this.validDate(), this.view(), this.dateOptions());
  });
  readonly scheduleEvents = computed<readonly JSchedulerEvent[]>(() => {
    const adapter = this.eventAdapter();
    const data = this.eventData();
    if (!adapter || !data.length) return this.events();
    return data.map((source, index) => ({ ...adapter.fromSource(source, index) }));
  });
  readonly visibleEvents = computed(() =>
    jSchedulerNormalizeEvents(
      jSchedulerExpandRecurrence(this.scheduleEvents(), this.visibleRange()),
      this.visibleRange(),
    ),
  );
  readonly displayedEvents = computed(() => {
    const resourceId = this.selectedResourceId();
    const filters = this.filters();
    const resourceIds = new Set((filters.resourceIds ?? []).map(String));
    const categoryIds = new Set((filters.categoryIds ?? []).map(String));
    const query = filters.query?.trim().toLocaleLowerCase() ?? '';
    return this.visibleEvents().filter((event) => {
      const assignedResources = [event.source.resourceId, ...(event.source.resourceIds ?? [])]
        .filter((id): id is JSchedulerId => id != null)
        .map(String);
      const assignedCategories = [event.source.categoryId, ...(event.source.categoryIds ?? [])]
        .filter((id): id is JSchedulerId => id != null)
        .map(String);
      if (
        resourceId != null &&
        this.viewDefinition().supportsResources &&
        !assignedResources.includes(String(resourceId))
      )
        return false;
      if (resourceIds.size && !assignedResources.some((id) => resourceIds.has(id))) return false;
      if (categoryIds.size && !assignedCategories.some((id) => categoryIds.has(id))) return false;
      return (
        !query ||
        [event.source.title, event.source.description, event.source.location]
          .filter((value): value is string => !!value)
          .some((value) => value.toLocaleLowerCase().includes(query))
      );
    });
  });
  readonly effectiveResources = computed(() =>
    this.resourceDimensions().length
      ? jSchedulerComposeResourceDimensions(this.resourceDimensions())
      : this.resources(),
  );
  readonly filteredResources = computed(() =>
    filterAndSortResources(
      this.effectiveResources(),
      this.resourceSearch(),
      this.resourceSort(),
      this.resourceFilter(),
      this.filters().resourceIds,
    ),
  );
  readonly visibleDaysOfWeek = computed(() =>
    this.view().includes('WorkWeek') || this.view() === 'workWeek'
      ? this.daysOfWeek().filter((day) => day >= 1 && day <= 5)
      : this.daysOfWeek(),
  );
  readonly viewDefinition = computed(() => {
    const standard = jSchedulerViewDefinition(this.view());
    const custom = this.view() === 'custom' ? this.activeCustomView() : undefined;
    if (!custom) return standard;
    const timeline = custom.type === 'timeline' || custom.type === 'resourceTimeline';
    const resource = custom.type === 'resourceTimeline' || custom.type === 'resourceTimeGrid';
    return {
      ...standard,
      label: custom.label,
      family:
        custom.type === 'agenda'
          ? ('agenda' as const)
          : custom.type === 'dayGrid'
            ? ('month' as const)
            : timeline
              ? ('timeline' as const)
              : ('timeGrid' as const),
      timeline,
      supportsResources: resource,
    };
  });
  readonly title = computed(() => this.formatRangeTitle(this.visibleRange()));
  readonly toolbar = computed<Required<JSchedulerToolbarConfig>>(() => {
    return this.resolveToolbar(this.headerToolbar());
  });
  readonly footerToolbarConfig = computed<Required<JSchedulerToolbarConfig>>(() => {
    return this.resolveToolbar(this.footerToolbar());
  });
  readonly rootStyle = computed(() => {
    const value = this.autoHeight() ? 'auto' : this.height();
    if (typeof value === 'number') return `${value}px`;
    if (value === 'parent') return '100%';
    return value;
  });
  readonly selectedEvents = computed(() => {
    const ids = new Set(this.selectedEventIds().map(String));
    return this.scheduleEvents().filter((event) => ids.has(String(event.id)));
  });
  readonly resourceOptions = computed(() => {
    const result: { readonly label: string; readonly value: JSchedulerId }[] = [];
    const visit = (items: readonly JSchedulerResource[], depth: number): void => {
      for (const resource of items) {
        if (!resource.disabled)
          result.push({ label: `${'-- '.repeat(depth)}${resource.name}`, value: resource.id });
        if (resource.children) visit(resource.children, depth + 1);
      }
    };
    visit(this.filteredResources(), 0);
    return result;
  });
  readonly categoryOptions = computed(() =>
    this.categories()
      .filter((category) => !category.disabled)
      .map((category) => ({ label: category.label, value: category.id })),
  );
  readonly focusedResources = computed(() => {
    const selected = this.selectedResourceId();
    if (selected == null) return this.filteredResources();
    const resource = this.getResourceById(selected);
    return resource ? [resource] : this.filteredResources();
  });
  readonly inspectedEvent = signal<JSchedulerEvent | null>(null);
  readonly liveAnnouncement = signal('');
  readonly moreDate = signal<Date | null>(null);
  readonly moreTrigger = signal<HTMLElement | null>(null);
  readonly expandedMoreDates = signal<ReadonlySet<string>>(new Set());
  private readonly eventSelectionAnchor = signal<JSchedulerId | null>(null);
  private readonly dateSelectionAnchor = signal<Date | null>(null);
  readonly editingTitle = signal(false);
  readonly titleDraft = signal('');
  readonly editorVisible = signal(false);
  readonly editorEvent = signal<JSchedulerEvent | null>(null);
  readonly editorStart = signal(new Date());
  readonly moveDialogVisible = signal(false);
  readonly moveEventIds = signal<readonly JSchedulerId[]>([]);
  readonly moveDate = signal(new Date());
  readonly moveTime = signal('09:00');
  readonly moveResourceId = signal<JSchedulerId | null>(null);
  readonly printing = signal(false);
  readonly activePrintOptions = signal<JSchedulerPrintOptions>({});
  readonly printGeneratedAt = signal<Date | null>(null);
  readonly surfaceScrollTop = signal(0);
  readonly surfaceViewportHeight = signal(600);
  readonly currentTime = signal(new Date());
  private readonly clipboard = signal<JSchedulerClipboardPayload | null>(null);
  private undoStack: JSchedulerHistoryEntry[] = [];
  private redoStack: JSchedulerHistoryEntry[] = [];
  private readonly rangeCache = new JSchedulerRangeCache();
  private readonly requestKeys = new Map<string, string>();
  private requestSequence = 0;
  private remoteController?: AbortController;
  readonly moreEvents = computed(() => {
    const date = this.moreDate();
    if (!date) return [];
    const end = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    return this.visibleEvents().filter((event) => event.start < end && event.end > date);
  });
  readonly moreDateLabel = computed(() => {
    const date = this.moreDate();
    return date ? new Intl.DateTimeFormat(this.locale(), { dateStyle: 'full' }).format(date) : '';
  });

  constructor() {
    if (this.isBrowser) {
      SCHEDULER_INSTANCES.set(this.host.nativeElement, this);
      this.destroyRef.onDestroy(() => SCHEDULER_INSTANCES.delete(this.host.nativeElement));
      const currentTimeTimer = globalThis.setInterval(
        () => this.currentTime.set(new Date()),
        30_000,
      );
      this.destroyRef.onDestroy(() => globalThis.clearInterval(currentTimeTimer));
    }
    effect(() => {
      this.view();
      this.morePopover?.hide();
      this.expandedMoreDates.set(new Set());
      this.quickInfoPopover?.hide();
      this.closeEventEditor();
    });
    effect((onCleanup) => {
      if (!this.remoteData()) return;
      this.visibleRange();
      this.view();
      this.timezone();
      this.filters();
      this.selectedResourceId();
      this.remotePrefetch();
      const controller = this.dispatchRemoteRequests();
      onCleanup(() => controller.abort());
    });
  }

  today(): void {
    if (this.disabled()) return;
    this.date.set(new Date());
  }

  previous(): void {
    if (this.disabled()) return;
    this.date.set(this.navigationDate(-1));
  }

  next(): void {
    if (this.disabled()) return;
    this.date.set(this.navigationDate(1));
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
    this.commitDateSelection({
      start: new Date(start),
      end: end ? new Date(end) : undefined,
      allDay: this.viewDefinition().family !== 'timeGrid',
      view: this.view(),
      resourceId,
    });
  }

  clearSelection(): void {
    if (!this.disabled()) {
      this.dateSelectionAnchor.set(null);
      this.selectedRange.set(null);
      this.selectionChange.emit(null);
      this.dateUnselect.emit();
    }
  }

  getEvents(): readonly JSchedulerEvent[] {
    return this.scheduleEvents();
  }

  getEventById(id: JSchedulerId): JSchedulerEvent | undefined {
    return this.scheduleEvents().find((event) => String(event.id) === String(id));
  }

  addEvent(event: JSchedulerEvent): void {
    if (
      !this.canAddEvents() ||
      !this.resourceAllows(event.resourceId, 'add') ||
      jSchedulerValidateEvent(event).length
    )
      return;
    this.emitEventAdd(this.changeRequest(event, 'add'));
  }

  updateEvent(event: JSchedulerEvent): void {
    if (
      !this.canEditEvents() ||
      !this.resourceAllows(event.resourceId, 'edit') ||
      jSchedulerValidateEvent(event).length
    )
      return;
    this.emitEventChange(this.changeRequest(event, 'update', this.getEventById(event.id)));
  }

  removeEvent(id: JSchedulerId): void {
    if (!this.canRemoveEvents()) return;
    const event = this.getEventById(id);
    if (event && this.resourceAllows(event.resourceId, 'remove'))
      this.emitEventRemove(this.changeRequest(event, 'remove', event));
  }

  openEventEditor(eventOrId?: JSchedulerEvent | JSchedulerId): void {
    const event =
      typeof eventOrId === 'object'
        ? eventOrId
        : eventOrId === undefined
          ? null
          : (this.getEventById(eventOrId) ?? null);
    if (event ? !this.canEditEvents() : !this.canAddEvents()) return;
    this.eventEditRequest.emit(event);
    if (!this.builtInEditor()) return;
    this.editorEvent.set(event);
    this.editorStart.set(event ? new Date(event.start) : new Date(this.validDate()));
    this.editorVisible.set(true);
  }

  closeEventEditor(): void {
    this.editorVisible.set(false);
    this.editorEvent.set(null);
  }

  handleEditorSave(value: JSchedulerEventEditorSave): void {
    if (value.previousEvent) this.updateEvent(value.event);
    else this.addEvent(value.event);
    this.closeEventEditor();
  }

  handleEditorDelete(event: JSchedulerEvent): void {
    this.removeEvent(event.id);
    this.closeEventEditor();
  }

  getSelectedEvents(): readonly JSchedulerEvent[] {
    return this.selectedEvents();
  }

  clearEventSelection(): void {
    if (this.disabled()) return;
    this.eventSelectionAnchor.set(null);
    this.selectedEventIds.set([]);
    this.eventSelectionChange.emit([]);
  }

  copyEvents(ids?: readonly JSchedulerId[]): readonly JSchedulerEvent[] {
    if (this.disabled()) return [];
    const candidates = this.eventsForClipboard(ids);
    this.clipboard.set(jSchedulerCreateClipboardPayload(candidates));
    this.clipboardChange.emit(candidates);
    this.announce(`${candidates.length} event${candidates.length === 1 ? '' : 's'} copied.`);
    return candidates;
  }

  cutEvents(ids?: readonly JSchedulerId[]): readonly JSchedulerEvent[] {
    if (!this.canEditEvents()) return [];
    const candidates = this.eventsForClipboard(ids);
    this.clipboard.set(jSchedulerCreateClipboardPayload(candidates, true));
    this.clipboardChange.emit(candidates);
    this.announce(`${candidates.length} event${candidates.length === 1 ? '' : 's'} cut.`);
    return candidates;
  }

  pasteEvents(target: JSchedulerPasteTarget): readonly JSchedulerEvent[] {
    if (!this.canAddEvents() && !this.canEditEvents()) return [];
    const clipboard = this.clipboard();
    if (!clipboard || Number.isNaN(target.start.getTime())) return [];
    const proposals = jSchedulerPasteClipboard(clipboard, target).filter((event) => {
      const validation = jSchedulerValidateMove(event, this.scheduleEvents(), {
        allowOverlap: this.eventOverlap(),
        minDate: this.minDate(),
        maxDate: this.maxDate(),
      });
      return (
        validation.valid &&
        this.isRangeAvailable({ start: event.start, end: event.end! }, event.resourceId)
      );
    });
    for (const event of proposals) {
      const previous = clipboard.cut ? this.getEventById(event.id) : undefined;
      if (previous && this.canEditEvents())
        this.emitEventChange(this.changeRequest(event, 'drag', previous));
      else if (!previous && this.canAddEvents())
        this.emitEventAdd(this.changeRequest(event, 'add'));
    }
    if (clipboard.cut && proposals.length === clipboard.events.length) this.clipboard.set(null);
    this.clipboardChange.emit(proposals);
    this.announce(`${proposals.length} event${proposals.length === 1 ? '' : 's'} pasted.`);
    return proposals;
  }

  moveEvents(
    ids: readonly JSchedulerId[],
    target: JSchedulerPasteTarget,
  ): readonly JSchedulerEvent[] {
    if (!this.canDragEvents()) return [];
    const payload = this.createExternalDragPayload(ids);
    if (!payload) return [];
    const moved = jSchedulerProjectExternalDrop(payload, target);
    for (const event of moved) {
      const previous = this.getEventById(event.id);
      if (previous) this.emitEventChange(this.changeRequest(event, 'bulk', previous));
    }
    return moved;
  }

  openMoveDialog(ids: readonly JSchedulerId[] = []): void {
    if (!this.canDragEvents()) return;
    const inspected = this.inspectedEvent();
    const requested = ids.length
      ? ids
      : this.selectedEventIds().length
        ? this.selectedEventIds()
        : inspected
          ? [inspected.id]
          : [];
    const selected = new Set(requested.map(String));
    const events = this.scheduleEvents()
      .filter((event) => selected.has(String(event.id)))
      .slice()
      .sort((left, right) => new Date(left.start).getTime() - new Date(right.start).getTime());
    const first = events[0];
    if (!first) return;
    const start = new Date(first.start);
    this.moveEventIds.set(events.map((event) => event.id));
    this.moveDate.set(start);
    this.moveTime.set(
      `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`,
    );
    this.moveResourceId.set(first.resourceId ?? null);
    this.quickInfoPopover?.hide();
    this.moveDialogVisible.set(true);
  }

  closeMoveDialog(): void {
    this.moveDialogVisible.set(false);
    this.moveEventIds.set([]);
  }

  confirmMoveDialog(): readonly JSchedulerEvent[] {
    if (!this.canDragEvents()) return [];
    const target = new Date(this.moveDate());
    const [hours, minutes] = this.moveTime().split(':').map(Number);
    target.setHours(hours || 0, minutes || 0, 0, 0);
    const moved = this.moveEvents(this.moveEventIds(), {
      start: target,
      resourceId: this.moveResourceId() ?? undefined,
    });
    this.closeMoveDialog();
    return moved;
  }

  createExternalDragPayload(
    ids: readonly JSchedulerId[],
    copy = false,
    data?: Readonly<Record<string, unknown>>,
  ): JSchedulerExternalDragPayload | null {
    const selected = new Set(ids.map(String));
    const events = this.scheduleEvents().filter((event) => selected.has(String(event.id)));
    return events.length
      ? jSchedulerCreateExternalDragPayload(this.schedulerId(), events, copy, data)
      : null;
  }

  receiveExternalDrop(
    payload: JSchedulerExternalDragPayload,
    target: JSchedulerPasteTarget,
    nativeEvent?: DragEvent | PointerEvent,
  ): JSchedulerExternalDropRequest {
    const proposedEvents = jSchedulerProjectExternalDrop(payload, target);
    const conflicts = proposedEvents.flatMap(
      (event) =>
        jSchedulerValidateConflicts(event, this.scheduleEvents(), {
          allowOverlap: this.eventOverlap(),
          resources: this.resources(),
          businessHours: this.constrainToBusinessHours() ? this.businessHours() : [],
          blockedIntervals: this.blockedIntervals(),
        }).conflicts,
    );
    const request: JSchedulerExternalDropRequest = {
      payload,
      target: { start: new Date(target.start), resourceId: target.resourceId },
      proposedEvents,
      valid: this.canAddEvents() && conflicts.every((conflict) => conflict.severity !== 'error'),
      conflicts,
      nativeEvent,
      revert: () => undefined,
    };
    this.externalDrop.emit(request);
    this.announce(
      request.valid
        ? `${request.proposedEvents.length} external event${request.proposedEvents.length === 1 ? '' : 's'} received.`
        : `External drop rejected${conflicts[0]?.message ? `: ${conflicts[0].message}` : '.'}`,
    );
    return request;
  }

  canUndo(): boolean {
    return this.historyEnabled() && this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return this.historyEnabled() && this.redoStack.length > 0;
  }

  undo(): void {
    if (this.cannotEdit() || !this.canUndo()) return;
    const entry = this.undoStack.pop();
    if (!entry) return;
    this.dispatchHistory(entry, true);
    this.redoStack.push(entry);
    this.announce('Scheduler change undone.');
  }

  redo(): void {
    if (this.cannotEdit() || !this.canRedo()) return;
    const entry = this.redoStack.pop();
    if (!entry) return;
    this.dispatchHistory(entry, false);
    this.undoStack.push(entry);
    this.announce('Scheduler change redone.');
  }

  clearHistory(): void {
    this.undoStack = [];
    this.redoStack = [];
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
    return visit(this.effectiveResources());
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

  handleResourceToggle(row: JSchedulerResourceRow): void {
    if (row.expanded) {
      this.collapseResource(row.resource.id);
      this.resourceCollapse.emit(row.resource);
    } else {
      this.expandResource(row.resource.id);
      this.resourceExpand.emit(row.resource);
    }
  }

  selectResource(value: unknown): void {
    if (this.disabled()) return;
    const option = this.resourceOptions().find((item) => String(item.value) === String(value));
    if (option) this.selectedResourceId.set(option.value);
  }

  setResourceFilter(value: unknown): void {
    if (this.disabled()) return;
    const resourceIds = value == null || value === '' ? [] : [value as JSchedulerId];
    this.filtersChange.emit({ ...this.filters(), resourceIds });
  }

  setCategoryFilter(value: unknown): void {
    if (this.disabled()) return;
    const categoryIds = value == null || value === '' ? [] : [value as JSchedulerId];
    this.filtersChange.emit({ ...this.filters(), categoryIds });
  }

  setSearchQuery(value: unknown): void {
    if (this.disabled()) return;
    this.filtersChange.emit({ ...this.filters(), query: String(value ?? '') });
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

  scrollToDate(date: Date): void {
    if (!this.isBrowser || Number.isNaN(date.getTime())) return;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    this.scrollSurface?.nativeElement
      .querySelector<HTMLElement>(`[data-date="${key}"]`)
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  scrollToEvent(id: JSchedulerId): void {
    if (!this.isBrowser) return;
    this.scrollSurface?.nativeElement
      .querySelector<HTMLElement>(`[data-event-id="${CSS.escape(String(id))}"]`)
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  refreshLayout(): void {
    if (this.isBrowser) this.scrollSurface?.nativeElement.getBoundingClientRect();
  }

  zoomIn(): void {
    if (this.disabled()) return;
    this.timelineZoom.set(
      Math.min(this.timelineMaxZoom(), this.timelineZoom() + this.timelineZoomStep()),
    );
  }

  zoomOut(): void {
    if (this.disabled()) return;
    this.timelineZoom.set(
      Math.max(this.timelineMinZoom(), this.timelineZoom() - this.timelineZoomStep()),
    );
  }

  resetZoom(): void {
    if (!this.disabled()) this.timelineZoom.set(1);
  }

  print(options: JSchedulerPrintOptions = {}): void {
    if (!this.isBrowser) return;
    const root = this.scrollSurface?.nativeElement.closest<HTMLElement>('.j-scheduler');
    if (root) root.dataset['printTitle'] = options.title ?? this.title();
    this.activePrintOptions.set({ pageNumbers: true, showGeneratedAt: true, ...options });
    this.printGeneratedAt.set(new Date());
    this.printing.set(true);
    window.addEventListener(
      'afterprint',
      () => {
        this.printing.set(false);
        this.printGeneratedAt.set(null);
      },
      { once: true },
    );
    window.requestAnimationFrame(() => window.print());
  }

  handleSurfaceScroll(event: Event): void {
    const element = event.currentTarget as HTMLElement;
    this.surfaceScrollTop.set(element.scrollTop);
    this.surfaceViewportHeight.set(element.clientHeight);
  }

  serializeState(): JSchedulerState {
    return {
      schemaVersion: 1,
      date: this.validDate().toISOString(),
      view: this.view(),
      selectedRange: this.selectedRange(),
      selectedEventIds: [...this.selectedEventIds()],
      selectedResourceId: this.selectedResourceId(),
      filters: { ...this.filters() },
      expandedResourceIds: [...this.expandedResourceIds()],
      timezone: this.timezone(),
    };
  }

  restoreState(state: JSchedulerState): void {
    if (this.disabled() || state.schemaVersion !== 1) return;
    const date = new Date(state.date);
    if (!Number.isNaN(date.getTime())) this.date.set(date);
    if (this.views().includes(state.view)) this.view.set(state.view);
    this.selectedResourceId.set(state.selectedResourceId);
    this.selectionChange.emit(state.selectedRange);
    const selectedIds = new Set(state.selectedEventIds.map(String));
    this.eventSelectionChange.emit(
      this.scheduleEvents().filter((event) => selectedIds.has(String(event.id))),
    );
    this.filtersChange.emit({ ...state.filters });
    this.expandedResourceIdsChange.emit([...state.expandedResourceIds]);
  }

  resetState(): void {
    if (this.disabled()) return;
    this.date.set(new Date());
    this.view.set(this.views()[0] ?? 'month');
    this.selectedResourceId.set(null);
    this.selectionChange.emit(null);
    this.eventSelectionChange.emit([]);
    this.filtersChange.emit({});
    this.expandedResourceIdsChange.emit([]);
  }

  exportToJSON(metadata?: Readonly<Record<string, unknown>>): string {
    return jSchedulerExportJson(
      this.scheduleEvents(),
      this.resources(),
      this.categories(),
      metadata,
      {
        availability: this.availability(),
        blockedIntervals: this.blockedIntervals(),
        appointmentSlots: this.appointmentSlots(),
      },
    );
  }

  exportToCSV(options?: JSchedulerCsvOptions): string {
    return jSchedulerExportCsv(this.scheduleEvents(), options);
  }

  exportToExcel(options?: JSchedulerCsvOptions): string {
    return jSchedulerExportExcelXml(this.scheduleEvents(), options);
  }

  exportToXLSX(options?: JSchedulerXlsxOptions): Uint8Array {
    return jSchedulerExportXlsx(this.scheduleEvents(), options);
  }

  exportToICS(): string {
    return jSchedulerExportIcs(this.scheduleEvents());
  }

  exportToPDF(options: JSchedulerPdfOptions = {}): Uint8Array {
    return jSchedulerExportPdf(this.scheduleEvents(), {
      title: this.title(),
      locale: this.locale(),
      view: this.view(),
      range: this.visibleRange(),
      resources: this.filteredResources(),
      ...options,
    });
  }

  importData(data: string, options: JSchedulerImportOptions = {}): JSchedulerImportResult {
    const format =
      options.format ??
      (data.trimStart().startsWith('BEGIN:VCALENDAR')
        ? 'ics'
        : data.trimStart().startsWith('{')
          ? 'json'
          : 'csv');
    const parsed =
      format === 'ics'
        ? jSchedulerImportIcs(data)
        : format === 'json'
          ? jSchedulerImportJson(data)
          : jSchedulerImportCsv(data);
    const preview = jSchedulerReviewImport(parsed, this.scheduleEvents(), this.resources());
    this.importPreview.emit(preview);
    return preview;
  }

  completeRangeRequest(requestId: string): void {
    const key = this.requestKeys.get(requestId);
    if (!key) return;
    this.rangeCache.complete(key);
    this.requestKeys.delete(requestId);
  }

  invalidateRangeCache(): void {
    this.rangeCache.invalidate();
    this.requestKeys.clear();
  }

  retryRemoteData(): void {
    if (!this.remoteData() || this.disabled()) return;
    const key = this.currentRangeKey();
    this.rangeCache.invalidate(key);
    this.retryRequest.emit();
    this.dispatchRemoteRequests(true);
  }

  isToolbarActionVisible(action: JSchedulerToolbarAction): boolean {
    if (typeof action !== 'string') return true;
    return !this.isViewAction(action) || this.views().includes(action);
  }

  isViewAction(action: JSchedulerToolbarAction): action is JSchedulerView {
    if (typeof action !== 'string') return false;
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
        'datePicker',
        'search',
        'print',
        'export',
      ].includes(action)
    );
  }

  isToolbarButton(action: JSchedulerToolbarAction): action is JSchedulerToolbarButton {
    return typeof action === 'object' && !('buttons' in action);
  }

  isToolbarButtonGroup(action: JSchedulerToolbarAction): action is JSchedulerToolbarButtonGroup {
    return typeof action === 'object' && 'buttons' in action;
  }

  activateToolbarButton(button: JSchedulerToolbarButton): void {
    if (this.disabled() || button.disabled) return;
    button.onClick?.();
    this.toolbarButtonClick.emit(button.id);
  }

  viewLabel(view: JSchedulerView): string {
    return jSchedulerViewDefinition(view).label;
  }

  handleDateActivate(value: Date | JSchedulerDateInteraction): void {
    if (this.disabled()) return;
    const interaction: JSchedulerDateInteraction =
      value instanceof Date
        ? {
            start: new Date(value),
            end: new Date(value.getFullYear(), value.getMonth(), value.getDate() + 1),
            allDay: true,
            view: this.view(),
          }
        : value;
    this.dateClick.emit(new Date(interaction.start));
    const mode = this.effectiveDateSelectionMode();
    if (this.readonly() || mode === 'none') return;
    const modifier = interaction.nativeEvent as
      (Event & { readonly shiftKey?: boolean }) | undefined;
    let selection = interaction;
    const anchor = this.dateSelectionAnchor();
    if ((mode === 'dateRange' || mode === 'multiple') && modifier?.shiftKey && anchor) {
      const clicked = new Date(
        interaction.start.getFullYear(),
        interaction.start.getMonth(),
        interaction.start.getDate(),
      );
      const start = new Date(Math.min(anchor.getTime(), clicked.getTime()));
      const last = new Date(Math.max(anchor.getTime(), clicked.getTime()));
      selection = {
        ...interaction,
        start,
        end: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1),
      };
    }
    this.commitDateSelection(selection);
  }

  handleTimelineCellActivate(value: {
    readonly date: Date;
    readonly resourceId: JSchedulerId;
    readonly nativeEvent?: Event;
  }): void {
    this.handleDateActivate({
      start: new Date(value.date),
      end: new Date(value.date.getTime() + this.timelineSlotMinutes() * 60_000),
      allDay: false,
      view: this.view(),
      resourceId: value.resourceId,
      nativeEvent: value.nativeEvent,
    });
  }

  handleDateRangeActivate(interaction: JSchedulerDateInteraction): void {
    if (this.disabled() || this.readonly() || this.effectiveDateSelectionMode() === 'none') return;
    this.commitDateSelection(interaction);
  }

  handleEventActivate(interaction: JSchedulerEventInteraction): void {
    if (!this.disabled()) {
      this.updateEventSelection(interaction);
      this.eventClick.emit(interaction);
      if (this.quickInfo()) {
        this.inspectedEvent.set(interaction.event);
        this.quickInfoShow.emit(interaction.event);
        queueMicrotask(() => this.quickInfoPopover?.show(this.scrollSurface?.nativeElement));
      }
    }
  }

  private updateEventSelection(interaction: JSchedulerEventInteraction): void {
    const mode = this.effectiveEventSelectionMode();
    const event = interaction.event;
    if (mode === 'none' || event.selectable === false || event.disabled) return;
    const modifier = interaction.nativeEvent as
      | (Event & {
          readonly ctrlKey?: boolean;
          readonly metaKey?: boolean;
          readonly shiftKey?: boolean;
        })
      | undefined;
    const current = this.selectedEventIds();
    const clickedId = event.id;
    let next: readonly JSchedulerId[];
    if (mode === 'single') {
      next = [clickedId];
    } else if (modifier?.shiftKey && this.eventSelectionAnchor() !== null) {
      const ordered = [
        ...new Map(
          this.displayedEvents().map((item) => [String(item.source.id), item.source.id]),
        ).values(),
      ];
      const anchorIndex = ordered.findIndex(
        (id) => String(id) === String(this.eventSelectionAnchor()),
      );
      const clickedIndex = ordered.findIndex((id) => String(id) === String(clickedId));
      next =
        anchorIndex < 0 || clickedIndex < 0
          ? [clickedId]
          : ordered.slice(
              Math.min(anchorIndex, clickedIndex),
              Math.max(anchorIndex, clickedIndex) + 1,
            );
    } else if (modifier?.ctrlKey || modifier?.metaKey) {
      const contains = current.some((id) => String(id) === String(clickedId));
      next = contains
        ? current.filter((id) => String(id) !== String(clickedId))
        : [...current, clickedId];
    } else {
      next = [clickedId];
    }
    const limit = Math.max(0, Math.floor(this.eventSelectionLimit()));
    next = next.slice(0, Number.isFinite(limit) ? limit : undefined);
    this.eventSelectionAnchor.set(clickedId);
    this.selectedEventIds.set(next);
    const selected = new Set(next.map(String));
    this.eventSelectionChange.emit(
      this.scheduleEvents().filter((candidate) => selected.has(String(candidate.id))),
    );
    this.announce(`${next.length} event${next.length === 1 ? '' : 's'} selected.`);
  }

  private commitDateSelection(interaction: JSchedulerDateInteraction): boolean {
    const start = new Date(interaction.start);
    const end = interaction.end
      ? new Date(interaction.end)
      : new Date(start.getTime() + (interaction.allDay ? 86_400_000 : this.slotMinutes() * 60_000));
    const duration = end.getTime() - start.getTime();
    let reason: string | undefined;
    if (!this.resourceAllows(interaction.resourceId, 'select'))
      reason = 'Selection is not permitted for this resource.';
    else if (end <= start) reason = 'Selection must end after it starts.';
    else if (duration < this.minimumSelectionDuration()) reason = 'Selection is too short.';
    else if (duration > this.maximumSelectionDuration()) reason = 'Selection is too long.';
    else if (this.minDate() && start < this.minDate()!)
      reason = 'Selection is before the minimum date.';
    else if (this.maxDate() && end > this.maxDate()!)
      reason = 'Selection is after the maximum date.';
    else if (!this.isRangeAvailable({ start, end }, interaction.resourceId))
      reason = 'Selection is unavailable.';
    const normalized: JSchedulerDateInteraction = {
      ...interaction,
      start,
      end,
      view: this.view(),
    };
    const guard = reason ? true : this.selectionGuard()?.(normalized);
    if (guard === false || typeof guard === 'string')
      reason = typeof guard === 'string' ? guard : 'Selection rejected.';
    if (reason) {
      this.announce(`Selection rejected: ${reason}`);
      return false;
    }
    const selection: JSchedulerSelection = {
      start,
      end,
      allDay: interaction.allDay,
      view: this.view(),
      resourceId: interaction.resourceId,
    };
    this.dateSelectionAnchor.set(new Date(interaction.start));
    this.selectedRange.set(selection);
    this.selectionChange.emit(selection);
    this.dateSelect.emit(selection);
    this.announce(`Selected ${this.announcementDate(start)} to ${this.announcementDate(end)}.`);
    return true;
  }

  showMore(value: { readonly date: Date; readonly trigger: HTMLElement }): void {
    if (this.disabled() || !this.showMorePopover()) return;
    if (this.moreEventsMode() === 'expand') {
      const key = schedulerDateKey(value.date);
      this.expandedMoreDates.update((current) => new Set([...current, key]));
      this.announce(`Expanded all events for ${this.announcementDate(value.date)}.`);
      return;
    }
    this.moreTrigger.set(value.trigger);
    this.moreDate.set(new Date(value.date));
  }

  handleMoreClosed(): void {
    const trigger = this.moreTrigger();
    this.moreDate.set(null);
    this.moreTrigger.set(null);
    trigger?.focus({ preventScroll: true });
  }

  activateMoreEvent(event: JSchedulerVisibleEvent): void {
    this.handleMoreClosed();
    this.handleEventActivate({ event: event.source, occurrenceStart: event.start });
  }

  editMoreEvent(event: JSchedulerVisibleEvent): void {
    this.handleMoreClosed();
    this.openEventEditor(event.source);
  }

  deleteMoreEvent(event: JSchedulerVisibleEvent): void {
    this.removeEvent(event.source.id);
    this.handleMoreClosed();
  }

  eventTimeLabel(event: JSchedulerVisibleEvent): string {
    if (event.allDay) return 'All day';
    return new Intl.DateTimeFormat(this.locale(), {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: this.displayTimezone() === 'local' ? undefined : this.displayTimezone(),
    }).formatRange(event.start, event.end);
  }

  hideQuickInfo(): void {
    const event = this.inspectedEvent();
    this.quickInfoPopover?.hide();
    this.quickInfoHide.emit(event);
  }

  requestQuickEdit(): void {
    const event = this.inspectedEvent();
    if (!event || !this.canEditEvents()) return;
    this.quickInfoEdit.emit(event);
    if (this.builtInEditor()) {
      this.hideQuickInfo();
      this.openEventEditor(event);
      return;
    }
    if (this.inlineEdit()) {
      this.editingTitle.set(true);
      this.titleDraft.set(event.title);
      this.inlineEditStart.emit({ event, value: event.title });
    }
  }

  saveInlineTitle(): void {
    const event = this.inspectedEvent();
    const value = this.titleDraft().trim();
    if (!event || !value || !this.canEditEvents()) return;
    this.inlineEditSave.emit({ event, value });
    this.emitEventChange(this.changeRequest({ ...event, title: value }, 'inline', event));
    this.editingTitle.set(false);
  }

  cancelInlineTitle(): void {
    const event = this.inspectedEvent();
    if (event) this.inlineEditCancel.emit({ event, value: this.titleDraft() });
    this.editingTitle.set(false);
  }

  requestQuickDelete(): void {
    const event = this.inspectedEvent();
    if (!event || !this.canRemoveEvents()) return;
    this.quickInfoDelete.emit(event);
    if (this.builtInEditor()) {
      this.removeEvent(event.id);
      this.hideQuickInfo();
    }
  }

  handleInlineKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') this.saveInlineTitle();
    if (event.key === 'Escape') this.cancelInlineTitle();
  }

  updateTitleDraft(event: Event): void {
    this.titleDraft.set((event.target as HTMLInputElement).value);
  }

  handleContextMenu(event: MouseEvent): void {
    if (this.disabled()) return;
    event.preventDefault();
    const target = event.target instanceof Element ? event.target : null;
    const eventId = target?.closest<HTMLElement>('[data-event-id]')?.dataset['eventId'];
    const resourceId = target?.closest<HTMLElement>('[data-resource-id]')?.dataset['resourceId'];
    const dateElement = target?.closest<HTMLElement>('[data-date]');
    const date = this.contextDate(dateElement, target);
    this.contextMenuShow.emit({
      view: this.view(),
      nativeEvent: event,
      event: eventId === undefined ? undefined : this.getEventById(eventId),
      resource: resourceId === undefined ? undefined : this.getResourceById(resourceId),
      date,
    });
  }

  private contextDate(
    element: HTMLElement | null | undefined,
    target: Element | null,
  ): Date | undefined {
    const value = element?.dataset['date'];
    if (!value) return undefined;
    const match = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(value);
    if (!match) return undefined;
    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    const targetTime = target?.closest<HTMLElement>('[data-j-time]')?.dataset['jTime'];
    const timeMatch = /^(\d{2}):(\d{2})$/.exec(targetTime ?? '');
    if (timeMatch) date.setHours(Number(timeMatch[1]), Number(timeMatch[2]), 0, 0);
    return date;
  }

  handleClipboardKeydown(event: KeyboardEvent): void {
    if (!this.clipboardEnabled() || this.disabled()) return;
    const target = event.target;
    if (
      target instanceof HTMLElement &&
      (target.matches('input, textarea, select, [contenteditable="true"]') ||
        target.closest('[contenteditable="true"]'))
    )
      return;
    const modifier = event.ctrlKey || event.metaKey;
    if (!modifier) return;
    const key = event.key.toLowerCase();
    const targetEventId =
      target instanceof HTMLElement
        ? target.closest<HTMLElement>('[data-event-id]')?.dataset['eventId']
        : undefined;
    const ids = this.selectedEventIds().length
      ? this.selectedEventIds()
      : targetEventId == null
        ? undefined
        : [targetEventId];
    if (key === 'c') this.copyEvents(ids);
    else if (key === 'x') this.cutEvents(ids);
    else if (key === 'v') {
      this.pasteEvents({
        start: new Date(this.selectedRange()?.start ?? this.validDate()),
        resourceId: this.selectedResourceId() ?? undefined,
      });
    } else if (key === 'z' && event.shiftKey) this.redo();
    else if (key === 'z') this.undo();
    else if (key === 'y') this.redo();
    else return;
    event.preventDefault();
  }

  handleNativeDragStart(event: DragEvent): void {
    if (!this.externalDrag() || !this.canMoveEventsBetweenSchedulers() || !event.dataTransfer)
      return;
    const target = event.target;
    const id =
      target instanceof HTMLElement
        ? target.closest<HTMLElement>('[data-event-id]')?.dataset['eventId']
        : undefined;
    if (id == null) return;
    const selected = this.selectedEventIds().map(String);
    const ids = selected.includes(String(id)) ? this.selectedEventIds() : [id];
    const payload = this.createExternalDragPayload(
      ids,
      event.ctrlKey || event.metaKey || event.altKey,
    );
    if (!payload) return;
    event.dataTransfer.setData(
      J_SCHEDULER_DRAG_MIME,
      jSchedulerSerializeExternalDragPayload(payload),
    );
    event.dataTransfer.effectAllowed = payload.copy ? 'copy' : 'copyMove';
    this.externalDragStart.emit(payload);
  }

  handleNativeDragOver(event: DragEvent): void {
    if (this.externalDropEnabled() && event.dataTransfer?.types.includes(J_SCHEDULER_DRAG_MIME))
      event.preventDefault();
  }

  handleNativeDrop(event: DragEvent): void {
    if (!this.externalDropEnabled() || !event.dataTransfer) return;
    const payload = jSchedulerParseExternalDragPayload(
      event.dataTransfer.getData(J_SCHEDULER_DRAG_MIME),
    );
    const target = this.dropTargetFromElement(event.target, event.clientY);
    if (!payload || !target) return;
    event.preventDefault();
    this.receiveExternalDrop(payload, target, event);
  }

  handleNativeDragEnd(event: DragEvent): void {
    const text = event.dataTransfer?.getData(J_SCHEDULER_DRAG_MIME);
    this.externalDragEnd.emit(text ? jSchedulerParseExternalDragPayload(text) : null);
  }

  handleEventDoubleActivate(event: JSchedulerVisibleEvent): void {
    if (!this.disabled()) {
      this.eventDoubleClick.emit({ event: event.source, occurrenceStart: event.start });
      if (this.builtInEditor() && !this.readonly()) this.openEventEditor(event.source);
    }
  }

  handleSlotActivate(value: {
    readonly date: Date;
    readonly minutes: number;
    readonly resourceId?: JSchedulerId;
    readonly nativeEvent?: Event;
  }): void {
    if (this.disabled() || this.readonly() || this.effectiveDateSelectionMode() === 'none') return;
    const start = new Date(
      value.date.getFullYear(),
      value.date.getMonth(),
      value.date.getDate(),
      0,
      value.minutes,
    );
    let selectionStart = start;
    let end = new Date(start.getTime() + this.slotMinutes() * 60_000);
    const resourceId = value.resourceId ?? this.selectedResourceId() ?? undefined;
    const modifier = value.nativeEvent as (Event & { readonly shiftKey?: boolean }) | undefined;
    const anchor = this.dateSelectionAnchor();
    if (
      modifier?.shiftKey &&
      anchor &&
      ['timeRange', 'multiple'].includes(this.effectiveDateSelectionMode())
    ) {
      selectionStart = new Date(Math.min(anchor.getTime(), start.getTime()));
      end = new Date(Math.max(anchor.getTime() + this.slotMinutes() * 60_000, end.getTime()));
    }
    this.commitDateSelection({
      start: selectionStart,
      end,
      allDay: false,
      view: this.view(),
      resourceId,
      nativeEvent: value.nativeEvent,
    });
  }

  handleAppointment(slot: JSchedulerAppointmentSlot): void {
    if (this.disabled()) return;
    this.slotClick.emit(slot);
    if (this.readonly() || !this.resourceAllows(slot.resourceId, 'book')) return;
    const capacity = jSchedulerAppointmentAvailability(slot, this.scheduleEvents());
    const blocked = jSchedulerBlockedConflict(slot, this.blockedIntervals(), slot.resourceId);
    const result = jSchedulerValidateBooking(slot, this.scheduleEvents());
    if (
      capacity.full ||
      blocked ||
      slot.status === 'full' ||
      slot.status === 'blocked' ||
      !result.valid
    ) {
      if (!result.valid) this.conflictResult.emit(result);
      this.capacityExceeded.emit(slot);
      this.announce(
        `Booking rejected: ${result.conflicts[0]?.message ?? blocked?.reason ?? blocked?.label ?? 'slot unavailable'}.`,
      );
      return;
    }
    this.slotBook.emit(slot);
    this.announce('Booking requested.');
  }

  bookAppointmentSlot(id: JSchedulerId): void {
    const slot = this.appointmentSlots().find((candidate) => String(candidate.id) === String(id));
    if (slot) this.handleAppointment(slot);
  }

  cancelAppointmentSlot(id: JSchedulerId): void {
    if (this.disabled() || this.readonly()) return;
    const slot = this.appointmentSlots().find((candidate) => String(candidate.id) === String(id));
    if (!slot || !this.resourceAllows(slot.resourceId, 'book')) return;
    this.slotCancel.emit(slot);
    this.announce('Appointment cancellation requested.');
  }

  handleResourceMove(request: JSchedulerResourceMoveRequest): void {
    if (
      this.disabled() ||
      this.readonly() ||
      request.resource.permissions?.reorder === false ||
      request.target.permissions?.reorder === false
    )
      return;
    this.resourceMoveRequest.emit(request);
    this.announce(`${request.resource.name} moved ${request.position} ${request.target.name}.`);
  }

  handleGestureStart(value: JSchedulerRendererGesture, resize: boolean): void {
    if (
      resize
        ? !this.canResizeEvents() || (value.edge === 'start' && !this.canResizeEventsFromStart())
        : !this.canDragEvents()
    )
      return;
    const payload = this.gestureProgress(value, true);
    this.announce(`${resize ? 'Resizing' : 'Moving'} ${value.event.source.title}.`);
    resize ? this.eventResizeStart.emit(payload) : this.eventDragStart.emit(payload);
  }

  handleGestureProgress(value: JSchedulerRendererGesture, resize: boolean): void {
    if (
      resize
        ? !this.canResizeEvents() || (value.edge === 'start' && !this.canResizeEventsFromStart())
        : !this.canDragEvents()
    )
      return;
    this.autoScrollGesture(value.nativeEvent);
    const payload = this.gestureProgress(value, this.validateGesture(value).valid);
    resize ? this.eventResize.emit(payload) : this.eventDrag.emit(payload);
  }

  private autoScrollGesture(nativeEvent: PointerEvent | KeyboardEvent): void {
    if (!(nativeEvent instanceof PointerEvent) || !this.isBrowser) return;
    const surface = this.scrollSurface?.nativeElement;
    if (!surface) return;
    const bounds = surface.getBoundingClientRect();
    const edge = 40;
    const maximumStep = 24;
    const horizontal =
      nativeEvent.clientX < bounds.left + edge
        ? -maximumStep
        : nativeEvent.clientX > bounds.right - edge
          ? maximumStep
          : 0;
    const vertical =
      nativeEvent.clientY < bounds.top + edge
        ? -maximumStep
        : nativeEvent.clientY > bounds.bottom - edge
          ? maximumStep
          : 0;
    if (horizontal || vertical) surface.scrollBy({ left: horizontal, top: vertical });
  }

  handleGestureStop(value: JSchedulerRendererGesture, resize: boolean): void {
    if (
      resize
        ? !this.canResizeEvents() || (value.edge === 'start' && !this.canResizeEventsFromStart())
        : !this.canDragEvents()
    )
      return;
    if (!resize && this.tryPointerTransfer(value)) {
      this.eventDragStop.emit(this.gestureProgress(value, true));
      return;
    }
    const updated = resize
      ? jSchedulerResizeEvent(
          value.event.source,
          value.edge ?? 'end',
          value.edge === 'start' ? value.start : value.end,
          this.minimumEventDuration(),
          this.maximumEventDuration(),
        )
      : {
          ...jSchedulerMoveEvent(value.event.source, value.start, value.end),
          ...(value.resourceId == null
            ? {}
            : { resourceId: value.resourceId, resourceIds: value.resourceIds }),
        };
    const resourceChanged =
      !resize &&
      value.resourceId != null &&
      String(value.resourceId) !== String(value.event.source.resourceId ?? '');
    const validation = jSchedulerValidateMove(updated, this.scheduleEvents(), {
      allowOverlap: this.eventOverlap(),
      minDate: this.minDate(),
      maxDate: this.maxDate(),
    });
    let valid = validation.valid;
    let reason = validation.reason;
    const sourceResourceId = value.event.source.resourceId;
    if (
      resize
        ? !this.resourceAllows(sourceResourceId, 'resize')
        : !this.resourceAllows(sourceResourceId, 'drag')
    ) {
      valid = false;
      reason = `This resource does not permit event ${resize ? 'resizing' : 'dragging'}.`;
    }
    if (resourceChanged && !this.canMoveEventsBetweenResources()) {
      valid = false;
      reason = 'Moving events between resources is disabled.';
    }
    if (
      resourceChanged &&
      (!this.resourceAllows(sourceResourceId, 'moveOut') ||
        !this.resourceAllows(value.resourceId, 'moveIn'))
    ) {
      valid = false;
      reason = 'The source or target resource does not permit this move.';
    }
    const structured = jSchedulerValidateConflicts(updated, this.scheduleEvents(), {
      allowOverlap: this.eventOverlap(),
      resources: this.resources(),
      businessHours: this.constrainToBusinessHours() ? this.businessHours() : [],
      blockedIntervals: this.blockedIntervals(),
    });
    if (!structured.valid) {
      valid = false;
      reason = structured.conflicts[0]?.message;
      this.conflictResult.emit(structured);
    }
    if (
      valid &&
      !this.isRangeAvailable({ start: updated.start, end: updated.end! }, updated.resourceId)
    ) {
      valid = false;
      reason = 'Time is unavailable.';
    }
    const base = jSchedulerProposal(
      updated,
      value.event.source,
      this.view(),
      valid,
      () => undefined,
      reason,
      value.nativeEvent,
    );
    const resizeEdge = value.edge ?? 'end';
    const guard = this.eventChangeGuard()?.(resize ? { ...base, edge: resizeEdge } : base);
    const sequence = ++this.validationSequence;
    if (isPromiseLike(guard)) {
      this.validatingChange.set(true);
      this.announce(`Validating ${resize ? 'resize' : 'move'} for ${value.event.source.title}.`);
      void Promise.resolve(guard)
        .then((result) => {
          if (sequence !== this.validationSequence) return;
          const rejected = result === false || typeof result === 'string';
          this.completeGestureStop(
            value,
            resize,
            updated,
            rejected ? false : valid,
            rejected ? (typeof result === 'string' ? result : 'Change rejected.') : reason,
            resizeEdge,
          );
        })
        .catch(() => {
          if (sequence !== this.validationSequence) return;
          this.completeGestureStop(
            value,
            resize,
            updated,
            false,
            'Change validation failed.',
            resizeEdge,
          );
        })
        .finally(() => {
          if (sequence === this.validationSequence) this.validatingChange.set(false);
        });
      return;
    }
    if (guard === false || typeof guard === 'string') {
      valid = false;
      reason = typeof guard === 'string' ? guard : 'Change rejected.';
    }
    this.completeGestureStop(value, resize, updated, valid, reason, resizeEdge);
  }

  private completeGestureStop(
    value: JSchedulerRendererGesture,
    resize: boolean,
    updated: JSchedulerEvent,
    valid: boolean,
    reason: string | undefined,
    resizeEdge: 'start' | 'end',
  ): void {
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
    const rejectionReason = reason ?? 'invalid time';
    this.announce(
      valid
        ? `${value.event.source.title} ${resize ? 'resized' : 'moved'} to ${this.announcementDate(resize && resizeEdge === 'end' ? value.end : value.start)}.`
        : `${resize ? 'Resize' : 'Move'} rejected: ${rejectionReason}${/[.!?]$/.test(rejectionReason) ? '' : '.'}`,
    );
    if (resize) {
      this.eventResizeStop.emit(progress);
      const resizeProposal: JSchedulerEventResizeProposal = { ...proposal, edge: resizeEdge };
      if (valid) this.emitEventChange(this.changeRequest(updated, 'resize', value.event.source));
      else this.conflictDetected.emit(resizeProposal);
    } else {
      this.eventDragStop.emit(progress);
      this.eventDrop.emit(proposal);
      if (valid) this.emitEventChange(this.changeRequest(updated, 'drag', value.event.source));
      else this.conflictDetected.emit(proposal);
    }
  }

  slotMinutes(): number {
    return Math.max(1, jSchedulerParseTime(this.effectiveSlotDuration(), 30));
  }

  timelineSlotMinutes(): number {
    return Math.max(1, jSchedulerParseTime(this.effectiveTimelineSlotDuration(), 60));
  }

  snapMinutes(): number {
    return Math.max(1, jSchedulerParseTime(this.snapDuration(), 15));
  }

  private validateGesture(value: JSchedulerRendererGesture) {
    const result = jSchedulerValidateMove(
      jSchedulerMoveEvent(value.event.source, value.start, value.end),
      this.scheduleEvents(),
      { allowOverlap: this.eventOverlap(), minDate: this.minDate(), maxDate: this.maxDate() },
    );
    if (!result.valid) return result;
    return this.isRangeAvailable(
      { start: value.start, end: value.end },
      value.event.source.resourceId,
    )
      ? result
      : { valid: false, reason: 'Time is unavailable.' };
  }

  private isRangeAvailable(range: JSchedulerDateRange, resourceId?: JSchedulerId): boolean {
    const resource = resourceId == null ? undefined : this.getResourceById(resourceId);
    const blocks = [...this.blockedIntervals(), ...(resource?.blockedIntervals ?? [])];
    if (jSchedulerBlockedConflict(range, blocks, resourceId)) return false;
    const hours = [...this.businessHours(), ...(resource?.businessHours ?? [])];
    if (
      this.constrainToBusinessHours() &&
      !jSchedulerIsWithinBusinessHours(range, hours, resourceId)
    )
      return false;
    const availability = [...this.availability(), ...(resource?.availability ?? [])];
    return (
      !this.constrainToAvailability() ||
      jSchedulerIsWithinAvailability(range, availability, resourceId)
    );
  }

  private resourceAllows(
    resourceId: JSchedulerId | undefined,
    operation: keyof NonNullable<JSchedulerResource['permissions']>,
  ): boolean {
    if (resourceId == null) return true;
    return this.getResourceById(resourceId)?.permissions?.[operation] !== false;
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

  private navigationDate(direction: -1 | 1): Date {
    const duration = this.view() === 'custom' ? this.activeCustomView()?.duration : undefined;
    if (!duration)
      return jSchedulerNavigateDate(this.validDate(), this.view(), direction, this.agendaDays());
    if (typeof duration === 'object') {
      return jSchedulerAddDuration(this.validDate(), {
        years: (duration.years ?? 0) * direction,
        months: (duration.months ?? 0) * direction,
        weeks: (duration.weeks ?? 0) * direction,
        days: (duration.days ?? 0) * direction,
        hours: (duration.hours ?? 0) * direction,
        minutes: (duration.minutes ?? 0) * direction,
        seconds: (duration.seconds ?? 0) * direction,
        milliseconds: (duration.milliseconds ?? 0) * direction,
      });
    }
    const milliseconds =
      typeof duration === 'number'
        ? duration
        : jSchedulerAddDuration(new Date(0), duration).getTime();
    return new Date(this.validDate().getTime() + milliseconds * direction);
  }

  private cannotEdit(): boolean {
    return (
      this.disabled() ||
      this.readonly() ||
      (!this.editable() && !Object.values(this.editableSettings()).some((value) => value === true))
    );
  }

  private editOperationAllowed(operation: keyof JSchedulerEditableSettings): boolean {
    if (this.disabled() || this.readonly()) return false;
    const settings = this.editableSettings();
    const boardEnabled = this.editable() || Object.values(settings).some((value) => value === true);
    return boardEnabled && settings[operation] !== false;
  }

  private emitEventAdd(request: JSchedulerEventChangeRequest): void {
    this.eventAdd.emit(request);
    this.eventAddRequest.emit(request);
  }

  private emitEventChange(request: JSchedulerEventChangeRequest): void {
    this.eventChange.emit(request);
    this.eventChangeRequest.emit(request);
  }

  private emitEventRemove(request: JSchedulerEventChangeRequest): void {
    this.eventRemove.emit(request);
    this.eventRemoveRequest.emit(request);
  }

  private changeRequest(
    event: JSchedulerEvent,
    reason: JSchedulerEventChangeRequest['reason'],
    previousEvent?: JSchedulerEvent,
  ): JSchedulerEventChangeRequest {
    if (this.historyEnabled()) {
      const entry: JSchedulerHistoryEntry =
        reason === 'add'
          ? { after: event }
          : reason === 'remove'
            ? { before: previousEvent ?? event }
            : { before: previousEvent, after: event };
      this.undoStack.push(entry);
      this.undoStack = this.undoStack.slice(-Math.max(1, this.historyLimit()));
      this.redoStack = [];
    }
    return {
      event: { ...event },
      previousEvent,
      reason,
      view: this.view(),
      revert: () => undefined,
    };
  }

  private eventsForClipboard(ids?: readonly JSchedulerId[]): readonly JSchedulerEvent[] {
    const requested = ids ?? this.selectedEventIds();
    if (!requested.length) return this.inspectedEvent() ? [this.inspectedEvent()!] : [];
    const selected = new Set(requested.map(String));
    return this.scheduleEvents().filter((event) => selected.has(String(event.id)));
  }

  private dispatchHistory(entry: JSchedulerHistoryEntry, undo: boolean): void {
    const from = undo ? entry.after : entry.before;
    const to = undo ? entry.before : entry.after;
    if (from && to) this.emitEventChange(this.historyRequest(to, 'update', from));
    else if (from) this.emitEventRemove(this.historyRequest(from, 'remove', from));
    else if (to) this.emitEventAdd(this.historyRequest(to, 'add'));
  }

  private historyRequest(
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

  private dispatchRemoteRequests(force = false): AbortController {
    this.remoteController?.abort();
    const controller = new AbortController();
    this.remoteController = controller;
    const visible = this.visibleRange();
    this.emitRangeRequest(visible, false, controller, force);
    if (this.remotePrefetch())
      for (const range of jSchedulerAdjacentRanges(visible))
        this.emitRangeRequest(range, true, controller, force);
    return controller;
  }

  private emitRangeRequest(
    range: JSchedulerDateRange,
    prefetch: boolean,
    controller: AbortController,
    force: boolean,
  ): void {
    const context = this.rangeContext();
    const key = jSchedulerRangeKey(range, context);
    if (!force && this.rangeCache.has(key)) return;
    const requestId = `scheduler-range-${++this.requestSequence}`;
    this.requestKeys.set(requestId, key);
    queueMicrotask(() => {
      if (!controller.signal.aborted)
        this.visibleRangeRequest.emit({
          requestId,
          key,
          start: new Date(range.start),
          end: new Date(range.end),
          view: context.view,
          timezone: context.timezone,
          resourceIds: context.resourceIds ?? [],
          filters: { ...this.filters() },
          search: this.filters().query,
          cursor: this.remoteCursor(),
          pageSize: this.remotePageSize(),
          prefetch,
          signal: controller.signal,
        });
    });
  }

  private rangeContext() {
    const selected = this.selectedResourceId();
    const resourceIds = this.filters().resourceIds?.length
      ? this.filters().resourceIds
      : selected == null
        ? []
        : [selected];
    return {
      view: this.view(),
      timezone: this.timezone(),
      resourceIds,
      filters: this.filters(),
      cursor: this.remoteCursor(),
      pageSize: this.remotePageSize(),
    };
  }

  private currentRangeKey(): string {
    return jSchedulerRangeKey(this.visibleRange(), this.rangeContext());
  }

  private tryPointerTransfer(value: JSchedulerRendererGesture): boolean {
    if (
      !this.isBrowser ||
      !this.externalDrag() ||
      !this.canMoveEventsBetweenSchedulers() ||
      typeof PointerEvent === 'undefined' ||
      !(value.nativeEvent instanceof PointerEvent)
    )
      return false;
    const nativeEvent = value.nativeEvent;
    const hit = document.elementFromPoint(nativeEvent.clientX, nativeEvent.clientY);
    const destination = schedulerForElement(hit);
    if (!destination || destination === this || !destination.externalDropEnabled()) return false;
    const target = destination.dropTargetFromElement(hit, nativeEvent.clientY);
    const payload = this.createExternalDragPayload(
      [value.event.source.id],
      nativeEvent.ctrlKey || nativeEvent.metaKey,
    );
    if (!target || !payload) return false;
    this.externalDragStart.emit(payload);
    const request = destination.receiveExternalDrop(payload, target, nativeEvent);
    this.externalDragEnd.emit(payload);
    this.announce(
      request.valid
        ? `${value.event.source.title} transfer requested.`
        : `${value.event.source.title} transfer rejected.`,
    );
    return true;
  }

  private dropTargetFromElement(
    target: EventTarget | null,
    clientY?: number,
  ): JSchedulerPasteTarget | null {
    if (!(target instanceof HTMLElement)) return null;
    const dated = target.closest<HTMLElement>('[data-date]');
    const text = dated?.dataset['date'];
    if (!text) return null;
    const [year, month, day] = text.split('-').map(Number);
    if (!year || !month || !day) return null;
    const time = target.closest<HTMLElement>('[data-j-time]')?.dataset['jTime'];
    let [hour = 0, minute = 0] = time?.split(':').map(Number) ?? [];
    const timeGridDay = target.closest<HTMLElement>('.j-scheduler-time-grid__day');
    if (!time && timeGridDay && clientY != null) {
      const rect = timeGridDay.getBoundingClientRect();
      const minimum = jSchedulerParseTime(this.slotMinTime(), 0);
      const maximum = jSchedulerParseTime(this.slotMaxTime(), 1440);
      const raw =
        minimum +
        Math.max(0, Math.min(1, (clientY - rect.top) / Math.max(1, rect.height))) *
          (maximum - minimum);
      const snapped = Math.round(raw / this.snapMinutes()) * this.snapMinutes();
      hour = Math.floor(snapped / 60);
      minute = snapped % 60;
    }
    const resourceId = target.closest<HTMLElement>('[data-resource-id]')?.dataset['resourceId'];
    return { start: new Date(year, month - 1, day, hour, minute), resourceId };
  }

  private announce(message: string): void {
    this.liveAnnouncement.set('');
    queueMicrotask(() => this.liveAnnouncement.set(message));
  }

  private announcementDate(date: Date): string {
    return new Intl.DateTimeFormat(this.locale(), {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: this.displayTimezone() === 'local' ? undefined : this.displayTimezone(),
    }).format(date);
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

  private resolveToolbar(
    config: boolean | JSchedulerToolbarConfig,
  ): Required<JSchedulerToolbarConfig> {
    if (config === false) return { start: [], center: [], end: [] };
    if (config === true) return DEFAULT_TOOLBAR;
    return {
      start: config.start ?? DEFAULT_TOOLBAR.start,
      center: config.center ?? DEFAULT_TOOLBAR.center,
      end: config.end ?? DEFAULT_TOOLBAR.end,
    };
  }
}

function durationTime(value: JSchedulerDuration): string {
  if (typeof value === 'string') return value;
  const minutes = Math.max(1, Math.round(jSchedulerDurationToMs(value) / 60_000));
  return `${Math.floor(minutes / 60)
    .toString()
    .padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}`;
}

function schedulerForElement(element: Element | null): JSchedulerComponent | undefined {
  let current: Element | null = element;
  while (current) {
    const scheduler = SCHEDULER_INSTANCES.get(current as HTMLElement);
    if (scheduler) return scheduler;
    if (current.classList.contains('j-scheduler') && current.parentElement) {
      const hostScheduler = SCHEDULER_INSTANCES.get(current.parentElement);
      if (hostScheduler) return hostScheduler;
    }
    current = current.parentElement;
  }
  return undefined;
}

function schedulerDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function isPromiseLike<T>(value: T | Promise<T> | undefined): value is Promise<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'then' in value &&
    typeof value.then === 'function'
  );
}

function filterAndSortResources(
  resources: readonly JSchedulerResource[],
  search: string,
  sort: JSchedulerResourceSort,
  predicate: ((resource: JSchedulerResource) => boolean) | null,
  selectedIds: readonly JSchedulerId[] | undefined,
): readonly JSchedulerResource[] {
  const query = search.trim().toLocaleLowerCase();
  const selected = selectedIds?.length ? new Set(selectedIds.map(String)) : null;
  const visit = (items: readonly JSchedulerResource[]): JSchedulerResource[] => {
    const filtered = items.flatMap((resource): JSchedulerResource[] => {
      if (resource.hidden || (predicate && !predicate(resource))) return [];
      const children = visit(resource.children ?? []);
      const matchesSearch = !query || resource.name.toLocaleLowerCase().includes(query);
      const matchesSelection = !selected || selected.has(String(resource.id));
      if ((!matchesSearch || !matchesSelection) && !children.length) return [];
      return [{ ...resource, children: children.length ? children : undefined }];
    });
    if (sort === 'input') return filtered;
    const compare =
      typeof sort === 'function'
        ? sort
        : (left: JSchedulerResource, right: JSchedulerResource) =>
            left.name.localeCompare(right.name) * (sort === 'nameDesc' ? -1 : 1);
    return [...filtered].sort(compare);
  };
  return visit(resources);
}
