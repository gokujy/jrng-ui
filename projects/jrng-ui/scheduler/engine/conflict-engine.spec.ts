import { describe, expect, it } from 'vitest';
import { jSchedulerValidateBooking, jSchedulerValidateConflicts } from './conflict-engine';

describe('JRNG scheduler conflict engine', () => {
  it('returns structured resource, attendee, blocked and buffer conflicts', () => {
    const candidate = {
      id: 'new',
      title: 'New',
      start: new Date(2026, 7, 5, 9),
      end: new Date(2026, 7, 5, 10),
      resourceId: 'room',
      attendees: [{ id: 'attendee' }],
      bufferAfter: { minutes: 30 },
    };
    const result = jSchedulerValidateConflicts(
      candidate,
      [
        {
          id: 'existing',
          title: 'Existing',
          start: new Date(2026, 7, 5, 10, 15),
          end: new Date(2026, 7, 5, 11),
          resourceId: 'room',
          attendees: [{ id: 'attendee' }],
        },
      ],
      {
        resources: [{ id: 'room', name: 'Room', capacity: 1 }],
        blockedIntervals: [
          { id: 'block', start: new Date(2026, 7, 5, 9, 30), end: new Date(2026, 7, 5, 9, 45) },
        ],
      },
    );
    expect(result.valid).toBe(false);
    expect(result.conflicts.map((conflict) => conflict.code)).toEqual(
      expect.arrayContaining(['buffer', 'resource-capacity', 'blocked', 'attendee']),
    );
  });

  it('validates booking capacity, notice and eligibility', () => {
    const result = jSchedulerValidateBooking(
      {
        id: 'slot',
        start: new Date(2026, 7, 5, 10),
        end: new Date(2026, 7, 5, 11),
        resourceId: 'room-a',
        capacity: 1,
        bookedCount: 1,
        minimumNotice: { hours: 2 },
        eligibleResourceIds: ['room-b'],
      },
      [],
      new Date(2026, 7, 5, 9),
    );
    expect(result.conflicts.map((conflict) => conflict.code)).toEqual(
      expect.arrayContaining(['appointment-capacity', 'minimum-notice', 'resource-ineligible']),
    );
  });
});
