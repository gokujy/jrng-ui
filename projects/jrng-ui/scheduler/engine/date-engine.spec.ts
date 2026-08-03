import { describe, expect, it } from 'vitest';
import {
  jSchedulerAddDays,
  jSchedulerIsoWeekNumber,
  jSchedulerMonthCells,
  jSchedulerNavigateDate,
  jSchedulerStartOfWeek,
  jSchedulerVisibleRange,
} from './date-engine';

describe('JRNG scheduler date engine', () => {
  it('starts weeks on the configured weekday without mutating the source', () => {
    const source = new Date(2026, 7, 5, 11, 30);
    const start = jSchedulerStartOfWeek(source, 1);
    expect(start).toEqual(new Date(2026, 7, 3));
    expect(source).toEqual(new Date(2026, 7, 5, 11, 30));
  });

  it('creates a stable six-week month grid', () => {
    const cells = jSchedulerMonthCells(new Date(2026, 7, 1), 1, new Date(2026, 7, 3));
    expect(cells).toHaveLength(42);
    expect(cells[0]?.date).toEqual(new Date(2026, 6, 27));
    expect(cells.filter((cell) => cell.today)).toHaveLength(1);
    expect(cells.filter((cell) => cell.inMonth)).toHaveLength(31);
  });

  it('returns exclusive ranges for every view family', () => {
    const active = new Date(2026, 7, 5);
    expect(jSchedulerVisibleRange(active, 'day')).toEqual({
      start: new Date(2026, 7, 5),
      end: new Date(2026, 7, 6),
    });
    expect(jSchedulerVisibleRange(active, 'week', { firstDayOfWeek: 1 })).toEqual({
      start: new Date(2026, 7, 3),
      end: new Date(2026, 7, 10),
    });
    expect(jSchedulerVisibleRange(active, 'timelineMonth').end).toEqual(new Date(2026, 8, 1));
    expect(jSchedulerVisibleRange(active, 'timelineYear')).toEqual({
      start: new Date(2026, 0, 1),
      end: new Date(2027, 0, 1),
    });
  });

  it('navigates by the active view unit', () => {
    const active = new Date(2026, 0, 31);
    expect(jSchedulerNavigateDate(active, 'month', 1)).toEqual(new Date(2026, 1, 28));
    expect(jSchedulerNavigateDate(active, 'week', -1)).toEqual(jSchedulerAddDays(active, -7));
  });

  it('calculates ISO week numbers around year boundaries', () => {
    expect(jSchedulerIsoWeekNumber(new Date(2026, 0, 1))).toBe(1);
    expect(jSchedulerIsoWeekNumber(new Date(2027, 0, 1))).toBe(53);
  });
});
