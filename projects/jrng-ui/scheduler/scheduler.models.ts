import { TemplateRef } from '@angular/core';

export type JSchedulerId = string | number;

export type JSchedulerView =
  | 'month'
  | 'multiMonth'
  | 'multiMonthYear'
  | 'week'
  | 'workWeek'
  | 'day'
  | 'agenda'
  | 'monthAgenda'
  | 'year'
  | 'timelineDay'
  | 'timelineWeek'
  | 'timelineWorkWeek'
  | 'timelineMonth'
  | 'timelineQuarter'
  | 'timelineYear'
  | 'resourceDay'
  | 'resourceWeek'
  | 'resourceWorkWeek'
  | 'resourceMonth'
  | 'resourceTimelineDay'
  | 'resourceTimelineWeek'
  | 'resourceTimelineMonth'
  | 'resourceTimelineYear'
  | 'custom'
  /** @deprecated Use resourceDay with groupByDate. */
  | 'dateDay'
  /** @deprecated Use resourceWeek with groupByDate. */
  | 'dateWeek'
  /** @deprecated Use resourceMonth with groupByDate. */
  | 'dateMonth';

export type JSchedulerSelectionMode = 'disabled' | 'single' | 'multiple' | 'range' | 'timeRange';
export type JSchedulerEventSelectionMode = 'none' | 'single' | 'multiple';
export type JSchedulerDateSelectionMode =
  'none' | 'single' | 'multiple' | 'dateRange' | 'timeRange';
export interface JSchedulerEditableSettings {
  readonly add?: boolean;
  readonly edit?: boolean;
  readonly remove?: boolean;
  readonly drag?: boolean;
  readonly resize?: boolean;
  readonly resizeFromStart?: boolean;
  readonly moveBetweenResources?: boolean;
  readonly moveBetweenSchedulers?: boolean;
}
export interface JSchedulerEventAdapter {
  fromSource(source: object, index: number): JSchedulerEvent;
}
export type JSchedulerRecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type JSchedulerRecurrenceScope = 'occurrence' | 'future' | 'series';
export type JSchedulerGroupOrder = 'resourceFirst' | 'dateFirst';
export type JSchedulerAppointmentStatus = 'available' | 'tentative' | 'booked' | 'full' | 'blocked';
export type JSchedulerAppointmentDisplay =
  | 'grid'
  | 'overlay'
  | 'indicator'
  | 'lane'
  /** @deprecated Use lane. */
  | 'separateLane';
export type JSchedulerMoreEventsMode = 'popover' | 'dialog' | 'drawer' | 'expand';
export type JSchedulerTimelineHeaderUnit = 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
export interface JSchedulerTimelineHeaderLevel {
  readonly unit: JSchedulerTimelineHeaderUnit;
  readonly format?: Intl.DateTimeFormatOptions;
}
export type JSchedulerTimeZone = 'local' | 'UTC' | (string & {});
export type JSchedulerHeight = number | 'auto' | 'parent' | (string & {});
export interface JSchedulerDurationParts {
  readonly years?: number;
  readonly months?: number;
  readonly weeks?: number;
  readonly days?: number;
  readonly hours?: number;
  readonly minutes?: number;
  readonly seconds?: number;
  readonly milliseconds?: number;
}

export type JSchedulerDuration = number | `${number}:${number}` | JSchedulerDurationParts;

export type JSchedulerVisibleRangeResolver = (activeDate: Date) => JSchedulerDateRange;

export interface JSchedulerCustomView {
  readonly id: string;
  readonly label: string;
  readonly type:
    'timeGrid' | 'dayGrid' | 'timeline' | 'agenda' | 'resourceTimeGrid' | 'resourceTimeline';
  readonly duration?: JSchedulerDuration;
  readonly visibleRange?: JSchedulerVisibleRangeResolver;
  readonly slotDuration?: JSchedulerDuration;
  readonly groupBy?: 'resource' | 'date';
}

export interface JSchedulerDateRange {
  readonly start: Date;
  readonly end: Date;
}

export interface JSchedulerRecurrenceRule {
  readonly frequency: JSchedulerRecurrenceFrequency;
  readonly interval?: number;
  readonly weekdays?: readonly number[];
  readonly monthDay?: number;
  readonly weekPosition?: number;
  readonly month?: number;
  readonly count?: number;
  readonly until?: Date;
  readonly excludedDates?: readonly Date[];
}

export interface JSchedulerRecurrenceEditResult {
  readonly upsert: readonly JSchedulerEvent[];
  readonly removeIds: readonly JSchedulerId[];
}

export interface JSchedulerRecurrenceException {
  readonly originalStart: Date;
  readonly excluded?: boolean;
  readonly start?: Date;
  readonly end?: Date;
  readonly title?: string;
  readonly resourceId?: JSchedulerId;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface JSchedulerEvent {
  readonly id: JSchedulerId;
  readonly title: string;
  readonly start: Date;
  readonly end?: Date;
  readonly duration?: JSchedulerDuration;
  readonly allDay?: boolean;
  /** Renders a point-in-time marker; end and duration are optional. */
  readonly milestone?: boolean;
  readonly resourceId?: JSchedulerId;
  readonly resourceIds?: readonly JSchedulerId[];
  readonly categoryId?: JSchedulerId;
  readonly categoryIds?: readonly JSchedulerId[];
  readonly groupId?: JSchedulerId;
  readonly parentEventId?: JSchedulerId;
  readonly description?: string;
  readonly location?: string;
  readonly url?: string;
  readonly color?: string;
  readonly backgroundColor?: string;
  readonly textColor?: string;
  readonly borderColor?: string;
  readonly icon?: string;
  readonly display?: 'auto' | 'block' | 'list' | 'background' | 'inverse-background' | 'hidden';
  readonly editable?: boolean;
  readonly startEditable?: boolean;
  readonly durationEditable?: boolean;
  readonly resourceEditable?: boolean;
  readonly draggable?: boolean;
  readonly resizable?: boolean;
  readonly deletable?: boolean;
  readonly readonly?: boolean;
  readonly selectable?: boolean;
  readonly disabled?: boolean;
  readonly recurrenceRule?: string | JSchedulerRecurrenceRule;
  readonly recurrenceExceptions?: readonly JSchedulerRecurrenceException[];
  readonly recurrenceId?: JSchedulerId;
  readonly originalStart?: Date;
  readonly timezone?: string;
  readonly startTimezone?: string;
  readonly endTimezone?: string;
  readonly capacity?: number;
  readonly attendees?: readonly JSchedulerAttendee[];
  readonly status?: string;
  readonly priority?: string;
  readonly bufferBefore?: JSchedulerDuration;
  readonly bufferAfter?: JSchedulerDuration;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface JSchedulerAttendee {
  readonly id: JSchedulerId;
  readonly name?: string;
  readonly status?: 'needs-action' | 'accepted' | 'declined' | 'tentative';
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface JSchedulerResource {
  readonly id: JSchedulerId;
  readonly name: string;
  readonly parentId?: JSchedulerId;
  readonly children?: readonly JSchedulerResource[];
  readonly color?: string;
  readonly icon?: string;
  readonly avatar?: string;
  readonly hidden?: boolean;
  readonly capacity?: number;
  readonly disabled?: boolean;
  readonly permissions?: JSchedulerResourcePermissions;
  readonly businessHours?: readonly JSchedulerBusinessHours[];
  readonly blockedIntervals?: readonly JSchedulerBlockedInterval[];
  readonly availability?: readonly JSchedulerAvailabilityRule[];
  /** Values represented by a Scheduler-composed multi-dimension lane. */
  readonly dimensionValues?: Readonly<Record<string, JSchedulerId>>;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface JSchedulerResourcePermissions {
  readonly add?: boolean;
  readonly edit?: boolean;
  readonly remove?: boolean;
  readonly select?: boolean;
  readonly book?: boolean;
  readonly drag?: boolean;
  readonly resize?: boolean;
  readonly moveIn?: boolean;
  readonly moveOut?: boolean;
  readonly reorder?: boolean;
}

export interface JSchedulerResourceDimension {
  readonly id: string;
  readonly label: string;
  readonly resources: readonly JSchedulerResource[];
}

export type JSchedulerResourceSort =
  | 'input'
  | 'nameAsc'
  | 'nameDesc'
  | ((left: JSchedulerResource, right: JSchedulerResource) => number);

export interface JSchedulerCategory {
  readonly id: JSchedulerId;
  readonly label: string;
  readonly color?: string;
  readonly textColor?: string;
  readonly icon?: string;
  readonly disabled?: boolean;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface JSchedulerBusinessHours {
  readonly daysOfWeek?: readonly number[];
  readonly startTime: string;
  readonly endTime: string;
  readonly resourceId?: JSchedulerId;
}

export interface JSchedulerAvailabilityRule {
  readonly id?: JSchedulerId;
  readonly daysOfWeek?: readonly number[];
  readonly startTime: string;
  readonly endTime: string;
  readonly effectiveStart?: Date;
  readonly effectiveEnd?: Date;
  readonly excludedDates?: readonly Date[];
  readonly resourceId?: JSchedulerId;
  readonly label?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface JSchedulerBlockedInterval {
  readonly id?: JSchedulerId;
  readonly start: Date;
  readonly end: Date;
  readonly resourceId?: JSchedulerId;
  readonly label?: string;
  readonly reason?: string;
  readonly recurrenceRule?: string | JSchedulerRecurrenceRule;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface JSchedulerAppointmentSlot {
  readonly id: JSchedulerId;
  readonly start: Date;
  readonly end: Date;
  readonly resourceId?: JSchedulerId;
  readonly serviceId?: JSchedulerId;
  readonly capacity?: number;
  readonly bookedCount?: number;
  readonly status?: JSchedulerAppointmentStatus;
  readonly serviceDuration?: JSchedulerDuration;
  readonly bufferBefore?: JSchedulerDuration;
  readonly bufferAfter?: JSchedulerDuration;
  readonly minimumNotice?: JSchedulerDuration;
  readonly maximumAdvance?: JSchedulerDuration;
  readonly eligibleResourceIds?: readonly JSchedulerId[];
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export type JSchedulerConflictCode =
  | 'overlap'
  | 'resource-capacity'
  | 'appointment-capacity'
  | 'attendee'
  | 'blocked'
  | 'business-hours'
  | 'buffer'
  | 'minimum-notice'
  | 'maximum-advance'
  | 'resource-ineligible'
  | 'custom';

export interface JSchedulerConflict {
  readonly code: JSchedulerConflictCode;
  readonly message: string;
  readonly severity: 'warning' | 'error';
  readonly eventId?: JSchedulerId;
  readonly resourceId?: JSchedulerId;
  readonly blockedIntervalId?: JSchedulerId;
}

export interface JSchedulerConflictResult {
  readonly valid: boolean;
  readonly conflicts: readonly JSchedulerConflict[];
}

export type JSchedulerBuiltInToolbarAction =
  | 'prev'
  | 'next'
  | 'today'
  | 'title'
  | 'resourceFilter'
  | 'categoryFilter'
  | 'timezone'
  | 'addEvent'
  | 'datePicker'
  | 'search'
  | 'print'
  | 'export'
  | JSchedulerView;

export interface JSchedulerToolbarButton {
  readonly id: string;
  readonly label?: string;
  readonly icon?: string;
  readonly ariaLabel?: string;
  readonly tooltip?: string;
  readonly disabled?: boolean;
  readonly onClick?: () => void;
}

export interface JSchedulerToolbarButtonGroup {
  readonly id: string;
  readonly ariaLabel?: string;
  readonly buttons: readonly JSchedulerToolbarButton[];
}

export type JSchedulerToolbarAction =
  JSchedulerBuiltInToolbarAction | JSchedulerToolbarButton | JSchedulerToolbarButtonGroup;

export interface JSchedulerToolbarConfig {
  readonly start?: readonly JSchedulerToolbarAction[];
  readonly center?: readonly JSchedulerToolbarAction[];
  readonly end?: readonly JSchedulerToolbarAction[];
}

export interface JSchedulerFilterState {
  readonly resourceIds?: readonly JSchedulerId[];
  readonly categoryIds?: readonly JSchedulerId[];
  readonly query?: string;
}

export interface JSchedulerSelection {
  readonly start: Date;
  readonly end?: Date;
  readonly allDay: boolean;
  readonly view: JSchedulerView;
  readonly resourceId?: JSchedulerId;
}

export interface JSchedulerDateInteraction extends JSchedulerSelection {
  readonly nativeEvent?: Event;
}
export type JSchedulerSelectionGuard = (selection: JSchedulerDateInteraction) => boolean | string;

export interface JSchedulerEventInteraction {
  readonly event: JSchedulerEvent;
  readonly occurrenceStart?: Date;
  readonly nativeEvent?: Event;
}

export interface JSchedulerEventChangeRequest {
  readonly event: JSchedulerEvent;
  readonly previousEvent?: JSchedulerEvent;
  readonly reason:
    | 'add'
    | 'update'
    | 'remove'
    | 'drag'
    | 'resize'
    | 'resource'
    | 'inline'
    | 'bulk'
    | 'external-drop';
  readonly view: JSchedulerView;
  readonly revert: () => void;
}

export interface JSchedulerEventMoveProposal {
  readonly updatedEvent: JSchedulerEvent;
  readonly previousEvent: JSchedulerEvent;
  readonly start: Date;
  readonly end: Date;
  readonly allDay: boolean;
  readonly previousResourceId?: JSchedulerId;
  readonly resourceId?: JSchedulerId;
  readonly view: JSchedulerView;
  readonly valid: boolean;
  readonly reason?: string;
  readonly nativeEvent?: PointerEvent | KeyboardEvent;
  readonly revert: () => void;
}

export interface JSchedulerEventResizeProposal extends JSchedulerEventMoveProposal {
  readonly edge: 'start' | 'end';
}

export interface JSchedulerGestureProgress {
  readonly event: JSchedulerEvent;
  readonly start: Date;
  readonly end: Date;
  readonly view: JSchedulerView;
  readonly valid: boolean;
  readonly nativeEvent: PointerEvent | KeyboardEvent;
}

export type JSchedulerEventChangeGuard = (
  proposal: JSchedulerEventMoveProposal | JSchedulerEventResizeProposal,
) => boolean | string | Promise<boolean | string>;

export interface JSchedulerVisibleEvent extends JSchedulerDateRange {
  readonly source: JSchedulerEvent;
  readonly occurrenceId: string;
  readonly allDay: boolean;
}

export interface JSchedulerEventTemplateContext {
  readonly $implicit: JSchedulerVisibleEvent;
  readonly event: JSchedulerEvent;
  readonly view: JSchedulerView;
  readonly resource?: JSchedulerResource;
  readonly category?: JSchedulerCategory;
  readonly selected: boolean;
  readonly dragging: boolean;
  readonly resizing: boolean;
  readonly conflict: boolean;
}

export interface JSchedulerCellTemplateContext {
  readonly $implicit: Date;
  readonly date: Date;
  readonly view: JSchedulerView;
  readonly resource?: JSchedulerResource;
  readonly selected: boolean;
  readonly today: boolean;
  readonly disabled: boolean;
}

export interface JSchedulerResourceTemplateContext {
  readonly $implicit: JSchedulerResource;
  readonly resource: JSchedulerResource;
  readonly depth: number;
  readonly parent: boolean;
  readonly expanded: boolean;
  readonly eventCount: number;
}

export interface JSchedulerHeaderTemplateContext {
  readonly $implicit: string;
  readonly label: string;
  readonly view: JSchedulerView;
  readonly date?: Date;
  readonly start?: Date;
  readonly end?: Date;
  readonly resource?: JSchedulerResource;
  readonly unit?: JSchedulerTimelineHeaderUnit;
}

export interface JSchedulerAppointmentTemplateContext {
  readonly $implicit: JSchedulerAppointmentSlot;
  readonly slot: JSchedulerAppointmentSlot;
  readonly view: JSchedulerView;
  readonly resource?: JSchedulerResource;
}

export interface JSchedulerBlockedTemplateContext {
  readonly $implicit: JSchedulerBlockedInterval;
  readonly interval: JSchedulerBlockedInterval;
  readonly view: JSchedulerView;
  readonly resource?: JSchedulerResource;
}

export interface JSchedulerMoreTemplateContext {
  readonly $implicit: number;
  readonly hiddenCount: number;
  readonly date: Date;
  readonly view: JSchedulerView;
}

export interface JSchedulerResourceMoveRequest {
  readonly resource: JSchedulerResource;
  readonly target: JSchedulerResource;
  readonly position: 'before' | 'after' | 'inside';
  readonly view: JSchedulerView;
  readonly nativeEvent?: DragEvent | KeyboardEvent;
  readonly revert: () => void;
}

export interface JSchedulerInlineEditEvent {
  readonly event: JSchedulerEvent;
  readonly value: string;
}

export interface JSchedulerContextMenuEvent {
  readonly view: JSchedulerView;
  readonly nativeEvent: MouseEvent;
  readonly event?: JSchedulerEvent;
  readonly date?: Date;
  readonly resource?: JSchedulerResource;
}

export interface JSchedulerTemplates {
  readonly toolbar?: TemplateRef<unknown>;
  readonly event?: TemplateRef<JSchedulerEventTemplateContext>;
  readonly cell?: TemplateRef<JSchedulerCellTemplateContext>;
  readonly header?: TemplateRef<JSchedulerHeaderTemplateContext>;
  readonly appointment?: TemplateRef<JSchedulerAppointmentTemplateContext>;
  readonly blocked?: TemplateRef<JSchedulerBlockedTemplateContext>;
  readonly more?: TemplateRef<JSchedulerMoreTemplateContext>;
  readonly empty?: TemplateRef<unknown>;
}

export interface JSchedulerPrintOptions {
  readonly orientation?: 'portrait' | 'landscape';
  readonly color?: boolean;
  readonly title?: string;
  readonly showGeneratedAt?: boolean;
  readonly showFilters?: boolean;
  readonly pageNumbers?: boolean;
}

export interface JSchedulerState {
  readonly schemaVersion: 1;
  readonly date: string;
  readonly view: JSchedulerView;
  readonly selectedRange: JSchedulerSelection | null;
  readonly selectedEventIds: readonly JSchedulerId[];
  readonly selectedResourceId: JSchedulerId | null;
  readonly filters: JSchedulerFilterState;
  readonly expandedResourceIds: readonly JSchedulerId[];
  readonly timezone: JSchedulerTimeZone;
}

export interface JSchedulerImportOptions {
  readonly format?: 'json' | 'csv' | 'ics';
  readonly strategy?: 'append' | 'upsert' | 'replaceRange';
}

export interface JSchedulerPasteTarget {
  readonly start: Date;
  readonly resourceId?: JSchedulerId;
}

export interface JSchedulerExternalDragPayload {
  readonly version: 1;
  readonly sourceSchedulerId: string;
  readonly events: readonly JSchedulerEvent[];
  readonly copy: boolean;
  readonly data?: Readonly<Record<string, unknown>>;
}

export interface JSchedulerExternalDropRequest {
  readonly payload: JSchedulerExternalDragPayload;
  readonly target: JSchedulerPasteTarget;
  readonly proposedEvents: readonly JSchedulerEvent[];
  readonly valid: boolean;
  readonly conflicts: readonly JSchedulerConflict[];
  readonly nativeEvent?: DragEvent | PointerEvent;
  readonly revert: () => void;
}

export interface JSchedulerVisibleRangeRequest extends JSchedulerDateRange {
  readonly requestId: string;
  readonly key: string;
  readonly view: JSchedulerView;
  readonly timezone: JSchedulerTimeZone;
  readonly resourceIds: readonly JSchedulerId[];
  readonly filters: JSchedulerFilterState;
  readonly search?: string;
  readonly cursor?: string;
  readonly pageSize?: number;
  readonly prefetch: boolean;
  readonly signal: AbortSignal;
}
