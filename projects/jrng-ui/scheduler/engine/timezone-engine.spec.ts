import { describe, expect, it } from 'vitest';
import { jSchedulerIsValidTimeZone, jSchedulerZonedParts } from './timezone-engine';

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
});
