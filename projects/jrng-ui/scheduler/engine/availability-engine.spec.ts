import { describe, expect, it } from 'vitest';
import {
  jSchedulerAppointmentAvailability,
  jSchedulerBlockedConflict,
  jSchedulerIsWithinBusinessHours,
} from './availability-engine';

describe('JRNG scheduler availability engine', () => {
  it('evaluates business hours and blocked ranges', () => {
    const range = { start: new Date(2026, 7, 3, 9), end: new Date(2026, 7, 3, 10) };
    expect(
      jSchedulerIsWithinBusinessHours(range, [
        { daysOfWeek: [1], startTime: '08:00', endTime: '17:00' },
      ]),
    ).toBe(true);
    expect(
      jSchedulerBlockedConflict(range, [
        {
          start: new Date(2026, 7, 3, 9, 30),
          end: new Date(2026, 7, 3, 11),
          reason: 'Maintenance',
        },
      ])?.reason,
    ).toBe('Maintenance');
  });
  it('never displays appointment capacity below committed overlaps', () => {
    const slot = {
      id: 'slot',
      start: new Date(2026, 7, 3, 9),
      end: new Date(2026, 7, 3, 10),
      capacity: 1,
      bookedCount: 0,
    };
    const availability = jSchedulerAppointmentAvailability(slot, [
      { id: 'booking', title: 'Booking', start: slot.start, end: slot.end },
    ]);
    expect(availability).toMatchObject({ booked: 1, available: 0, full: true });
  });
});
