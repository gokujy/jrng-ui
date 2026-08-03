import {
  JSchedulerDateRange,
  JSchedulerEvent,
  JSchedulerEventMoveProposal,
} from '../scheduler.models';
import { jSchedulerEventEnd } from '../engine/event-engine';

export function jSchedulerSnapInstant(value: Date, snapMinutes: number): Date {
  const snap = Math.max(1, snapMinutes) * 60_000;
  return new Date(Math.round(value.getTime() / snap) * snap);
}

export function jSchedulerMoveEvent(
  event: JSchedulerEvent,
  start: Date,
  end = new Date(start.getTime() + (jSchedulerEventEnd(event).getTime() - event.start.getTime())),
): JSchedulerEvent {
  return { ...event, start: new Date(start), end: new Date(end), duration: undefined };
}

export function jSchedulerResizeEvent(
  event: JSchedulerEvent,
  edge: 'start' | 'end',
  instant: Date,
  minimumDuration: number,
  maximumDuration = Number.POSITIVE_INFINITY,
): JSchedulerEvent {
  const previousEnd = jSchedulerEventEnd(event);
  let start = edge === 'start' ? instant : event.start;
  let end = edge === 'end' ? instant : previousEnd;
  if (end.getTime() - start.getTime() < minimumDuration) {
    if (edge === 'start') start = new Date(end.getTime() - minimumDuration);
    else end = new Date(start.getTime() + minimumDuration);
  }
  if (end.getTime() - start.getTime() > maximumDuration) {
    if (edge === 'start') start = new Date(end.getTime() - maximumDuration);
    else end = new Date(start.getTime() + maximumDuration);
  }
  return { ...event, start: new Date(start), end: new Date(end), duration: undefined };
}

export function jSchedulerValidateMove(
  updated: JSchedulerEvent,
  events: readonly JSchedulerEvent[],
  options: {
    readonly range?: JSchedulerDateRange;
    readonly allowOverlap?: boolean;
    readonly minDate?: Date;
    readonly maxDate?: Date;
  } = {},
): { readonly valid: boolean; readonly reason?: string } {
  const end = jSchedulerEventEnd(updated);
  if (options.minDate && updated.start < options.minDate)
    return { valid: false, reason: 'Before minimum date.' };
  if (options.maxDate && end > options.maxDate)
    return { valid: false, reason: 'After maximum date.' };
  if (options.range && (updated.start < options.range.start || end > options.range.end))
    return { valid: false, reason: 'Outside the visible range.' };
  if (options.allowOverlap === false) {
    const conflict = events.some(
      (event) =>
        String(event.id) !== String(updated.id) &&
        (event.resourceId == null ||
          updated.resourceId == null ||
          String(event.resourceId) === String(updated.resourceId)) &&
        event.start < end &&
        jSchedulerEventEnd(event) > updated.start,
    );
    if (conflict) return { valid: false, reason: 'Event overlaps another event.' };
  }
  return { valid: true };
}

export function jSchedulerProposal(
  updatedEvent: JSchedulerEvent,
  previousEvent: JSchedulerEvent,
  view: JSchedulerEventMoveProposal['view'],
  valid: boolean,
  revert: () => void,
  reason?: string,
  nativeEvent?: PointerEvent | KeyboardEvent,
): JSchedulerEventMoveProposal {
  return {
    updatedEvent,
    previousEvent,
    start: updatedEvent.start,
    end: jSchedulerEventEnd(updatedEvent),
    allDay: updatedEvent.allDay === true,
    previousResourceId: previousEvent.resourceId,
    resourceId: updatedEvent.resourceId,
    view,
    valid,
    reason,
    nativeEvent,
    revert,
  };
}
