import {
  JSchedulerAppointmentSlot,
  JSchedulerBlockedInterval,
  JSchedulerBusinessHours,
  JSchedulerDateRange,
  JSchedulerEvent,
  JSchedulerId,
} from '../scheduler.models';
import { jSchedulerEventEnd } from './event-engine';

export function jSchedulerIsWithinBusinessHours(
  range: JSchedulerDateRange,
  hours: readonly JSchedulerBusinessHours[],
  resourceId?: JSchedulerId,
): boolean {
  if (!hours.length) return true;
  return hours.some(
    (item) =>
      (item.resourceId == null ||
        resourceId == null ||
        String(item.resourceId) === String(resourceId)) &&
      (!item.daysOfWeek?.length || item.daysOfWeek.includes(range.start.getDay())) &&
      minutes(range.start) >= parse(item.startTime) &&
      minutes(range.end) <= parse(item.endTime),
  );
}

export function jSchedulerBlockedConflict(
  range: JSchedulerDateRange,
  blocks: readonly JSchedulerBlockedInterval[],
  resourceId?: JSchedulerId,
): JSchedulerBlockedInterval | undefined {
  return blocks.find(
    (block) =>
      (block.resourceId == null ||
        resourceId == null ||
        String(block.resourceId) === String(resourceId)) &&
      block.start < range.end &&
      block.end > range.start,
  );
}

export function jSchedulerAppointmentAvailability(
  slot: JSchedulerAppointmentSlot,
  events: readonly JSchedulerEvent[],
): {
  readonly booked: number;
  readonly capacity: number;
  readonly available: number;
  readonly full: boolean;
} {
  const capacity = Math.max(0, slot.capacity ?? 1);
  const committed = events.filter(
    (event) =>
      (slot.resourceId == null || String(event.resourceId) === String(slot.resourceId)) &&
      event.start < slot.end &&
      jSchedulerEventEnd(event) > slot.start,
  ).length;
  const booked = Math.max(slot.bookedCount ?? 0, committed);
  return { booked, capacity, available: Math.max(0, capacity - booked), full: booked >= capacity };
}

function minutes(date: Date) {
  return date.getHours() * 60 + date.getMinutes();
}
function parse(value: string) {
  const [hours = 0, minutesValue = 0] = value.split(':').map(Number);
  return hours * 60 + minutesValue;
}
