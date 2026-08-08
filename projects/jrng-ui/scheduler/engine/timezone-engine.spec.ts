import { describe, expect, it } from 'vitest';
import {
  jSchedulerAddZonedCalendar,
  jSchedulerIsValidTimeZone,
  jSchedulerZonedDateToInstant,
  jSchedulerZonedParts,
} from './timezone-engine';

describe('JRNG scheduler timezone engine', () => {
  it('projects instants without mutating them', () => {
    const instant = new Date('2026-03-08T07:30:00Z');
    const before = instant.getTime();
    expect(jSchedulerZonedParts(instant, 'America/New_York')).toMatchObject({
      hour: 3,
      minute: 30,
      offsetMinutes: -240,
    });
    expect(instant.getTime()).toBe(before);
  });
  it('detects supported IANA zones', () => {
    expect(jSchedulerIsValidTimeZone('Asia/Kolkata')).toBe(true);
    expect(jSchedulerIsValidTimeZone('Invalid/Zone')).toBe(false);
  });
  it('resolves repeated DST wall times with explicit earlier and later policies', () => {
    const wall = { year: 2026, month: 11, day: 1, hour: 1, minute: 30, second: 0 };
    const earlier = jSchedulerZonedDateToInstant(wall, 'America/New_York', 'earlier');
    const later = jSchedulerZonedDateToInstant(wall, 'America/New_York', 'later');
    expect(later.getTime() - earlier.getTime()).toBe(60 * 60_000);
    expect(jSchedulerZonedParts(earlier, 'America/New_York')).toMatchObject(wall);
    expect(jSchedulerZonedParts(later, 'America/New_York')).toMatchObject(wall);
  });
  it('preserves recurrence wall time while adding days across a DST boundary', () => {
    const start = new Date('2026-03-07T14:00:00Z');
    const next = jSchedulerAddZonedCalendar(start, 'America/New_York', { days: 1 });
    expect(jSchedulerZonedParts(next, 'America/New_York')).toMatchObject({ hour: 9, minute: 0 });
    expect(next.toISOString()).toBe('2026-03-08T13:00:00.000Z');
  });
  it('rejects nonexistent DST gap wall times when requested', () => {
    expect(() =>
      jSchedulerZonedDateToInstant(
        { year: 2026, month: 3, day: 8, hour: 2, minute: 30, second: 0 },
        'America/New_York',
        'reject',
      ),
    ).toThrow(RangeError);
  });
});
