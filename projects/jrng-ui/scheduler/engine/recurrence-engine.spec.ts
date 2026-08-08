import { describe, expect, it } from 'vitest';
import {
  jSchedulerDeleteRecurrence,
  jSchedulerEditRecurrence,
  jSchedulerExpandRecurrence,
  jSchedulerParseRecurrenceRule,
  jSchedulerRecurrenceSummary,
  jSchedulerSerializeRecurrenceRule,
} from './recurrence-engine';

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

  it('keeps a daily recurrence at the same IANA wall time across DST', () => {
    const expanded = jSchedulerExpandRecurrence(
      [
        {
          id: 'daily-rounds',
          title: 'Daily rounds',
          start: new Date('2026-03-07T14:00:00Z'),
          end: new Date('2026-03-07T15:00:00Z'),
          startTimezone: 'America/New_York',
          recurrenceRule: { frequency: 'daily', count: 3 },
        },
      ],
      { start: new Date('2026-03-07T00:00:00Z'), end: new Date('2026-03-10T00:00:00Z') },
      0,
    );
    expect(expanded.map((event) => event.start.toISOString())).toEqual([
      '2026-03-07T14:00:00.000Z',
      '2026-03-08T13:00:00.000Z',
      '2026-03-09T13:00:00.000Z',
    ]);
  });

  it('round-trips positional recurrence fields and provides a readable summary', () => {
    const rule = jSchedulerParseRecurrenceRule(
      'FREQ=MONTHLY;INTERVAL=2;BYDAY=MO;BYSETPOS=2;BYMONTH=8;COUNT=3',
    );
    expect(rule).toMatchObject({
      frequency: 'monthly',
      interval: 2,
      weekdays: [1],
      weekPosition: 2,
      month: 8,
      count: 3,
    });
    expect(jSchedulerSerializeRecurrenceRule(rule!)).toBe(
      'FREQ=MONTHLY;INTERVAL=2;BYDAY=MO;BYSETPOS=2;BYMONTH=8;COUNT=3',
    );
    expect(jSchedulerRecurrenceSummary(rule!)).toContain('Every 2 months');
  });

  it('parses ordinal BYDAY and expands the last weekday of each month', () => {
    const rule = jSchedulerParseRecurrenceRule('FREQ=MONTHLY;BYDAY=-1FR;COUNT=3');
    expect(rule).toMatchObject({ weekdays: [5], weekPosition: -1 });
    const expanded = jSchedulerExpandRecurrence(
      [
        {
          id: 'month-end-review',
          title: 'Month-end review',
          start: new Date(2026, 0, 30, 9),
          end: new Date(2026, 0, 30, 10),
          recurrenceRule: rule!,
        },
      ],
      { start: new Date(2026, 0, 1), end: new Date(2026, 3, 1) },
      0,
    );
    expect(expanded.map((event) => [event.start.getMonth(), event.start.getDate()])).toEqual([
      [0, 30],
      [1, 27],
      [2, 27],
    ]);
  });

  it('supports negative month days and skips dates absent from a month', () => {
    const lastDay = jSchedulerExpandRecurrence(
      [
        {
          id: 'last-day',
          title: 'Last day',
          start: new Date(2026, 0, 31, 9),
          end: new Date(2026, 0, 31, 10),
          recurrenceRule: 'FREQ=MONTHLY;BYMONTHDAY=-1;COUNT=3',
        },
      ],
      { start: new Date(2026, 0, 1), end: new Date(2026, 3, 1) },
      0,
    );
    expect(lastDay.map((event) => [event.start.getMonth(), event.start.getDate()])).toEqual([
      [0, 31],
      [1, 28],
      [2, 31],
    ]);

    const thirtyFirst = jSchedulerExpandRecurrence(
      [
        {
          id: 'thirty-first',
          title: 'Thirty-first',
          start: new Date(2026, 0, 31, 9),
          end: new Date(2026, 0, 31, 10),
          recurrenceRule: 'FREQ=MONTHLY;BYMONTHDAY=31',
        },
      ],
      { start: new Date(2026, 0, 1), end: new Date(2026, 3, 1) },
      0,
    );
    expect(thirtyFirst.map((event) => event.start.getMonth())).toEqual([0, 2]);
  });

  it('creates immutable occurrence exceptions and future series splits', () => {
    const series = {
      id: 'rounds',
      title: 'Service rounds',
      start: new Date(2026, 7, 3, 9),
      end: new Date(2026, 7, 3, 10),
      recurrenceRule: { frequency: 'weekly' as const, count: 8 },
    };
    const occurrenceStart = new Date(2026, 7, 10, 9);
    const occurrenceEdit = jSchedulerEditRecurrence(
      series,
      occurrenceStart,
      { ...series, start: new Date(2026, 7, 10, 11), end: new Date(2026, 7, 10, 12) },
      'occurrence',
    );
    expect(occurrenceEdit.upsert[0]?.recurrenceExceptions?.[0]).toMatchObject({
      originalStart: occurrenceStart,
      start: new Date(2026, 7, 10, 11),
    });
    expect(series).not.toHaveProperty('recurrenceExceptions');

    const futureEdit = jSchedulerEditRecurrence(
      series,
      occurrenceStart,
      {
        ...series,
        title: 'Updated rounds',
        start: occurrenceStart,
        end: new Date(2026, 7, 10, 10),
      },
      'future',
    );
    expect(futureEdit.upsert).toHaveLength(2);
    expect(futureEdit.upsert[0]?.recurrenceRule).toMatchObject({ count: undefined });
    expect(futureEdit.upsert[1]?.title).toBe('Updated rounds');

    const deleted = jSchedulerDeleteRecurrence(series, occurrenceStart, 'occurrence');
    expect(deleted.upsert[0]?.recurrenceExceptions?.[0]?.excluded).toBe(true);
  });
});
