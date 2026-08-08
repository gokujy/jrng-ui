import { jSchedulerCreateClipboardPayload, jSchedulerPasteClipboard } from './clipboard-engine';
import {
  JSchedulerEvent,
  JSchedulerExternalDragPayload,
  JSchedulerPasteTarget,
} from '../scheduler.models';

export const J_SCHEDULER_DRAG_MIME = 'application/x-jrng-scheduler-events+json';

export function jSchedulerCreateExternalDragPayload(
  sourceSchedulerId: string,
  events: readonly JSchedulerEvent[],
  copy = false,
  data?: Readonly<Record<string, unknown>>,
): JSchedulerExternalDragPayload {
  return {
    version: 1,
    sourceSchedulerId,
    events: events.map((event) => ({
      ...event,
      start: new Date(event.start),
      end: event.end ? new Date(event.end) : undefined,
    })),
    copy,
    data,
  };
}

export function jSchedulerSerializeExternalDragPayload(
  payload: JSchedulerExternalDragPayload,
): string {
  return JSON.stringify(payload);
}

export function jSchedulerParseExternalDragPayload(
  value: string,
): JSchedulerExternalDragPayload | null {
  try {
    const source = JSON.parse(value) as Partial<JSchedulerExternalDragPayload>;
    if (source.version !== 1 || !source.sourceSchedulerId || !Array.isArray(source.events))
      return null;
    const events = source.events.flatMap((event) => {
      if (!event || typeof event !== 'object') return [];
      const start = new Date(event.start);
      const end = event.end ? new Date(event.end) : undefined;
      if (Number.isNaN(start.getTime()) || (end && Number.isNaN(end.getTime()))) return [];
      return [{ ...event, start, end } as JSchedulerEvent];
    });
    return {
      version: 1,
      sourceSchedulerId: source.sourceSchedulerId,
      events,
      copy: source.copy === true,
      data: source.data,
    };
  } catch {
    return null;
  }
}

export function jSchedulerProjectExternalDrop(
  payload: JSchedulerExternalDragPayload,
  target: JSchedulerPasteTarget,
): readonly JSchedulerEvent[] {
  return jSchedulerPasteClipboard(
    jSchedulerCreateClipboardPayload(payload.events, !payload.copy),
    target,
  );
}
