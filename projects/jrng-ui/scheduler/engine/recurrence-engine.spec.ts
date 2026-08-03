import { describe, expect, it } from 'vitest';
import { jSchedulerExpandRecurrence, jSchedulerParseRecurrenceRule } from './recurrence-engine';

describe('JRNG scheduler recurrence engine', () => {
  it('parses the supported RFC 5545 rule subset', () => {
    expect(
      jSchedulerParseRecurrenceRule('FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE;COUNT=4'),
    ).toMatchObject({ frequency: 'weekly', interval: 2, weekdays: [1, 3], count: 4 });
  });
  it('expands only the visible range and applies exceptions', () => {
    const start = new Date(2026, 7, 3, 9);
    const events = [
      {
        id: 'training',
        title: 'Training',
        start,
        end: new Date(2026, 7, 3, 10),
        recurrenceRule: { frequency: 'daily' as const, count: 20 },
        recurrenceExceptions: [{ originalStart: new Date(2026, 7, 5, 9), excluded: true }],
      },
    ];
    const expanded = jSchedulerExpandRecurrence(
      events,
      { start: new Date(2026, 7, 4), end: new Date(2026, 7, 8) },
      0,
    );
    expect(expanded.map((event) => event.start.getDate())).toEqual([4, 6, 7]);
    expect(expanded.every((event) => event.recurrenceId === 'training')).toBe(true);
  });
});
