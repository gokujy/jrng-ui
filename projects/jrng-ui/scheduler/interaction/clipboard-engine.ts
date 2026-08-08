import { jSchedulerEventEnd } from '../engine/event-engine';
import { JSchedulerEvent, JSchedulerId, JSchedulerPasteTarget } from '../scheduler.models';

export interface JSchedulerClipboardPayload {
  readonly events: readonly JSchedulerEvent[];
  readonly cut: boolean;
  readonly copiedAt: Date;
}

export function jSchedulerCreateClipboardPayload(
  events: readonly JSchedulerEvent[],
  cut = false,
): JSchedulerClipboardPayload {
  return {
    events: events.map(cloneEvent),
    cut,
    copiedAt: new Date(),
  };
}

export function jSchedulerPasteClipboard(
  payload: JSchedulerClipboardPayload,
  target: JSchedulerPasteTarget,
  idFactory: (sourceId: JSchedulerId, index: number) => JSchedulerId = (id, index) =>
    `${id}-copy-${target.start.getTime()}-${index + 1}`,
): readonly JSchedulerEvent[] {
  if (!payload.events.length) return [];
  const firstStart = Math.min(...payload.events.map((event) => event.start.getTime()));
  return payload.events.map((event, index) => {
    const start = new Date(target.start.getTime() + event.start.getTime() - firstStart);
    const duration = jSchedulerEventEnd(event).getTime() - event.start.getTime();
    return {
      ...cloneEvent(event),
      id: payload.cut ? event.id : idFactory(event.id, index),
      start,
      end: new Date(start.getTime() + duration),
      duration: undefined,
      resourceId: target.resourceId ?? event.resourceId,
      resourceIds: target.resourceId == null ? event.resourceIds : undefined,
    };
  });
}

function cloneEvent(event: JSchedulerEvent): JSchedulerEvent {
  return {
    ...event,
    start: new Date(event.start),
    end: event.end ? new Date(event.end) : undefined,
    resourceIds: event.resourceIds ? [...event.resourceIds] : undefined,
    categoryIds: event.categoryIds ? [...event.categoryIds] : undefined,
    recurrenceExceptions: event.recurrenceExceptions?.map((exception) => ({
      ...exception,
      originalStart: new Date(exception.originalStart),
      start: exception.start ? new Date(exception.start) : undefined,
      end: exception.end ? new Date(exception.end) : undefined,
    })),
  };
}
