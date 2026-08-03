import { JSchedulerDateRange, JSchedulerEvent, JSchedulerVisibleEvent } from '../scheduler.models';

export interface JSchedulerNormalizedEvent extends JSchedulerVisibleEvent {
  readonly duration: number;
}

export function jSchedulerEventEnd(event: JSchedulerEvent): Date {
  if (event.end instanceof Date) return new Date(event.end.getTime());
  if (event.duration != null) return new Date(event.start.getTime() + Math.max(0, event.duration));
  return event.allDay
    ? new Date(event.start.getFullYear(), event.start.getMonth(), event.start.getDate() + 1)
    : new Date(event.start.getTime() + 30 * 60_000);
}

export function jSchedulerEventIntersects(
  event: Pick<JSchedulerEvent, 'start' | 'end' | 'duration' | 'allDay'>,
  range: JSchedulerDateRange,
): boolean {
  const end =
    event.end ??
    (event.duration != null
      ? new Date(event.start.getTime() + event.duration)
      : new Date(event.start.getTime() + (event.allDay ? 86_400_000 : 30 * 60_000)));
  return event.start < range.end && end > range.start;
}

export function jSchedulerNormalizeEvents(
  events: readonly JSchedulerEvent[],
  range: JSchedulerDateRange,
): readonly JSchedulerNormalizedEvent[] {
  return events
    .filter((event) => jSchedulerEventIntersects(event, range))
    .map((event) => {
      const end = jSchedulerEventEnd(event);
      return {
        source: event,
        start: new Date(event.start.getTime()),
        end,
        duration: end.getTime() - event.start.getTime(),
        allDay: event.allDay === true,
        occurrenceId: String(event.id),
      };
    })
    .sort(jSchedulerCompareVisibleEvents);
}

export function jSchedulerCompareVisibleEvents(
  left: JSchedulerVisibleEvent,
  right: JSchedulerVisibleEvent,
): number {
  return (
    left.start.getTime() - right.start.getTime() ||
    right.end.getTime() - right.start.getTime() - (left.end.getTime() - left.start.getTime()) ||
    String(left.source.id).localeCompare(String(right.source.id))
  );
}

export function jSchedulerValidateEvent(event: JSchedulerEvent): readonly string[] {
  const errors: string[] = [];
  if (event.id === '' || event.id == null) errors.push('Event id is required.');
  if (!event.title.trim()) errors.push('Event title is required.');
  if (Number.isNaN(event.start.getTime())) errors.push('Event start must be a valid Date.');
  const end = jSchedulerEventEnd(event);
  if (Number.isNaN(end.getTime())) errors.push('Event end must be a valid Date.');
  if (end <= event.start) errors.push('Event end must be after start.');
  if (event.end == null && event.duration == null && !event.allDay) {
    errors.push('Timed events should provide end or duration.');
  }
  return errors;
}
