import { TemplateRef } from '@angular/core';

export type JSchedulerId = string | number;

export type JSchedulerView =
  | 'month'
  | 'week'
  | 'day'
  | 'agenda'
  | 'year'
  | 'timelineDay'
  | 'timelineWeek'
  | 'timelineMonth'
  | 'timelineYear'
  | 'resourceDay'
  | 'resourceWeek'
  | 'resourceMonth'
  | 'resourceTimelineDay'
  | 'resourceTimelineWeek'
  | 'resourceTimelineMonth'
  | 'dateDay'
  | 'dateWeek'
  | 'dateMonth';

export type JSchedulerSelectionMode = 'disabled' | 'single' | 'multiple' | 'range' | 'timeRange';
export type JSchedulerRecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type JSchedulerRecurrenceScope = 'occurrence' | 'future' | 'series';
export type JSchedulerGroupOrder = 'resourceFirst' | 'dateFirst';
export type JSchedulerAppointmentStatus = 'available' | 'tentative' | 'booked' | 'full' | 'blocked';
export type JSchedulerAppointmentDisplay = 'grid' | 'overlay' | 'indicator';
export type JSchedulerTimeZone = 'local' | 'UTC' | (string & {});
export type JSchedulerHeight = number | 'auto' | 'parent' | (string & {});
export type JSchedulerDuration = number | `${number}:${number}`;

export interface JSchedulerDateRange {
  readonly start: Date;
  readonly end: Date;
}

export interface JSchedulerRecurrenceRule {
  readonly frequency: JSchedulerRecurrenceFrequency;
  readonly interval?: number;
  readonly weekdays?: readonly number[];
  readonly monthDay?: number;
  readonly count?: number;
  readonly until?: Date;
  readonly excludedDates?: readonly Date[];
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
  readonly duration?: number;
  readonly allDay?: boolean;
  readonly resourceId?: JSchedulerId;
  readonly resourceIds?: readonly JSchedulerId[];
  readonly categoryId?: JSchedulerId;
  readonly categoryIds?: readonly JSchedulerId[];
  readonly description?: string;
  readonly location?: string;
  readonly color?: string;
  readonly backgroundColor?: string;
  readonly textColor?: string;
  readonly borderColor?: string;
  readonly editable?: boolean;
  readonly startEditable?: boolean;
  readonly durationEditable?: boolean;
  readonly selectable?: boolean;
  readonly disabled?: boolean;
  readonly recurrenceRule?: string | JSchedulerRecurrenceRule;
  readonly recurrenceExceptions?: readonly JSchedulerRecurrenceException[];
  readonly recurrenceId?: JSchedulerId;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface JSchedulerResource {
  readonly id: JSchedulerId;
  readonly name: string;
  readonly parentId?: JSchedulerId;
  readonly children?: readonly JSchedulerResource[];
  readonly color?: string;
  readonly capacity?: number;
  readonly disabled?: boolean;
  readonly businessHours?: readonly JSchedulerBusinessHours[];
  readonly blockedIntervals?: readonly JSchedulerBlockedInterval[];
  readonly metadata?: Readonly<Record<string, unknown>>;
}

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
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export type JSchedulerToolbarAction =
  | 'prev'
  | 'next'
  | 'today'
  | 'title'
  | 'resourceFilter'
  | 'categoryFilter'
  | 'timezone'
  | 'addEvent'
  | JSchedulerView;

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

export interface JSchedulerEventInteraction {
  readonly event: JSchedulerEvent;
  readonly occurrenceStart?: Date;
  readonly nativeEvent?: Event;
}

export interface JSchedulerEventChangeRequest {
  readonly event: JSchedulerEvent;
  readonly previousEvent?: JSchedulerEvent;
  readonly reason: 'add' | 'update' | 'remove' | 'drag' | 'resize' | 'resource' | 'inline';
  readonly view: JSchedulerView;
  readonly revert: () => void;
}

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

export interface JSchedulerTemplates {
  readonly toolbar?: TemplateRef<unknown>;
  readonly event?: TemplateRef<JSchedulerEventTemplateContext>;
  readonly cell?: TemplateRef<JSchedulerCellTemplateContext>;
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
