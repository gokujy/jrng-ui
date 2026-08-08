import { jSchedulerDurationToMs } from './date-engine';
import { jSchedulerEventEnd } from './event-engine';
import { jSchedulerBlockedConflict, jSchedulerIsWithinBusinessHours } from './availability-engine';
import {
  JSchedulerAppointmentSlot,
  JSchedulerBlockedInterval,
  JSchedulerBusinessHours,
  JSchedulerConflict,
  JSchedulerConflictResult,
  JSchedulerEvent,
  JSchedulerId,
  JSchedulerResource,
} from '../scheduler.models';

export interface JSchedulerConflictOptions {
  readonly allowOverlap?: boolean;
  readonly resources?: readonly JSchedulerResource[];
  readonly businessHours?: readonly JSchedulerBusinessHours[];
  readonly blockedIntervals?: readonly JSchedulerBlockedInterval[];
}

export function jSchedulerValidateConflicts(
  candidate: JSchedulerEvent,
  events: readonly JSchedulerEvent[],
  options: JSchedulerConflictOptions = {},
): JSchedulerConflictResult {
  const conflicts: JSchedulerConflict[] = [];
  const start = new Date(
    candidate.start.getTime() - jSchedulerDurationToMs(candidate.bufferBefore ?? 0),
  );
  const end = new Date(
    jSchedulerEventEnd(candidate).getTime() + jSchedulerDurationToMs(candidate.bufferAfter ?? 0),
  );
  const assigned = eventResourceIds(candidate);
  const overlaps = events.filter(
    (event) =>
      String(event.id) !== String(candidate.id) &&
      event.start < end &&
      jSchedulerEventEnd(event) > start &&
      sharesResource(candidate, event),
  );
  if (options.allowOverlap === false && overlaps.length)
    conflicts.push({
      code: 'overlap',
      message: 'Event overlaps another event.',
      severity: 'error',
      eventId: overlaps[0]?.id,
    });
  if (overlaps.length && (candidate.bufferBefore || candidate.bufferAfter))
    conflicts.push({
      code: 'buffer',
      message: 'Event buffer overlaps another assignment.',
      severity: 'error',
      eventId: overlaps[0]?.id,
    });
  for (const resourceId of assigned) {
    const resource = findResource(options.resources ?? [], resourceId);
    if (resource?.capacity != null && overlaps.length + 1 > resource.capacity)
      conflicts.push({
        code: 'resource-capacity',
        message: `${resource.name} capacity is exceeded.`,
        severity: 'error',
        resourceId,
      });
  }
  const block = jSchedulerBlockedConflict(
    { start, end },
    options.blockedIntervals ?? [],
    candidate.resourceId,
  );
  if (block)
    conflicts.push({
      code: 'blocked',
      message: block.reason ?? block.label ?? 'Time is blocked.',
      severity: 'error',
      resourceId: block.resourceId,
      blockedIntervalId: block.id,
    });
  if (
    options.businessHours?.length &&
    !jSchedulerIsWithinBusinessHours({ start, end }, options.businessHours, candidate.resourceId)
  )
    conflicts.push({
      code: 'business-hours',
      message: 'Outside business hours.',
      severity: 'error',
    });
  const attendeeConflict = events.find(
    (event) =>
      String(event.id) !== String(candidate.id) &&
      event.start < end &&
      jSchedulerEventEnd(event) > start &&
      sharesAttendee(candidate, event),
  );
  if (attendeeConflict)
    conflicts.push({
      code: 'attendee',
      message: 'An attendee has another event during this time.',
      severity: 'error',
      eventId: attendeeConflict.id,
    });
  return { valid: conflicts.every((conflict) => conflict.severity !== 'error'), conflicts };
}

export function jSchedulerValidateBooking(
  slot: JSchedulerAppointmentSlot,
  events: readonly JSchedulerEvent[],
  now = new Date(),
): JSchedulerConflictResult {
  const conflicts: JSchedulerConflict[] = [];
  const booked = Math.max(
    slot.bookedCount ?? 0,
    events.filter(
      (event) =>
        (slot.resourceId == null ||
          eventResourceIds(event).map(String).includes(String(slot.resourceId))) &&
        event.start < slot.end &&
        jSchedulerEventEnd(event) > slot.start,
    ).length,
  );
  if (booked >= Math.max(0, slot.capacity ?? 1) || slot.status === 'full')
    conflicts.push({
      code: 'appointment-capacity',
      message: 'Appointment capacity is full.',
      severity: 'error',
      resourceId: slot.resourceId,
    });
  if (
    slot.minimumNotice &&
    slot.start.getTime() - now.getTime() < jSchedulerDurationToMs(slot.minimumNotice)
  )
    conflicts.push({
      code: 'minimum-notice',
      message: 'Minimum booking notice is not met.',
      severity: 'error',
    });
  if (
    slot.maximumAdvance &&
    slot.start.getTime() - now.getTime() > jSchedulerDurationToMs(slot.maximumAdvance)
  )
    conflicts.push({
      code: 'maximum-advance',
      message: 'Appointment is beyond the advance booking window.',
      severity: 'error',
    });
  if (
    slot.eligibleResourceIds?.length &&
    (slot.resourceId == null ||
      !slot.eligibleResourceIds.map(String).includes(String(slot.resourceId)))
  )
    conflicts.push({
      code: 'resource-ineligible',
      message: 'Resource is not eligible for this service.',
      severity: 'error',
      resourceId: slot.resourceId,
    });
  return { valid: conflicts.every((conflict) => conflict.severity !== 'error'), conflicts };
}

export async function jSchedulerValidateConflictsAsync(
  candidate: JSchedulerEvent,
  events: readonly JSchedulerEvent[],
  validator: (event: JSchedulerEvent) => Promise<JSchedulerConflictResult>,
  options?: JSchedulerConflictOptions,
): Promise<JSchedulerConflictResult> {
  const local = jSchedulerValidateConflicts(candidate, events, options);
  if (!local.valid) return local;
  const custom = await validator(candidate);
  return { valid: custom.valid, conflicts: [...local.conflicts, ...custom.conflicts] };
}

function eventResourceIds(event: JSchedulerEvent): JSchedulerId[] {
  return [event.resourceId, ...(event.resourceIds ?? [])].filter(
    (id): id is JSchedulerId => id != null,
  );
}
function sharesResource(left: JSchedulerEvent, right: JSchedulerEvent): boolean {
  const leftIds = eventResourceIds(left).map(String);
  const rightIds = eventResourceIds(right).map(String);
  return !leftIds.length || !rightIds.length || leftIds.some((id) => rightIds.includes(id));
}
function sharesAttendee(left: JSchedulerEvent, right: JSchedulerEvent): boolean {
  const ids = new Set((left.attendees ?? []).map((attendee) => String(attendee.id)));
  return (right.attendees ?? []).some((attendee) => ids.has(String(attendee.id)));
}
function findResource(
  resources: readonly JSchedulerResource[],
  id: JSchedulerId,
): JSchedulerResource | undefined {
  for (const resource of resources) {
    if (String(resource.id) === String(id)) return resource;
    const child = findResource(resource.children ?? [], id);
    if (child) return child;
  }
  return undefined;
}
