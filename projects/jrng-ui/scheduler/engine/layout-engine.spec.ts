import { describe, expect, it } from 'vitest';
import { JSchedulerVisibleEvent } from '../scheduler.models';
import { jSchedulerLayoutMonthEvents, jSchedulerLayoutTimedEvents } from './layout-engine';

function visible(id: string, start: Date, end: Date, allDay = false): JSchedulerVisibleEvent {
  return { source: { id, title: id, start, end, allDay }, start, end, allDay, occurrenceId: id };
}

describe('JRNG scheduler layout engine', () => {
  it('splits month spans at calendar row boundaries with continuation flags', () => {
    const range = { start: new Date(2026, 6, 27), end: new Date(2026, 8, 7) };
    const event = visible('span', new Date(2026, 7, 1), new Date(2026, 7, 12), true);
    const segments = jSchedulerLayoutMonthEvents([event], range);
    expect(segments).toHaveLength(3);
    expect(segments.map((segment) => [segment.row, segment.startColumn, segment.span])).toEqual([
      [0, 5, 2],
      [1, 0, 7],
      [2, 0, 2],
    ]);
    expect(segments[1]).toMatchObject({ continuesBefore: true, continuesAfter: true });
  });

  it('places overlaps side by side in stable columns', () => {
    const day = new Date(2026, 7, 5);
    const events = [
      visible('a', new Date(2026, 7, 5, 9), new Date(2026, 7, 5, 11)),
      visible('b', new Date(2026, 7, 5, 10), new Date(2026, 7, 5, 12)),
      visible('c', new Date(2026, 7, 5, 12), new Date(2026, 7, 5, 13)),
    ];
    const placements = jSchedulerLayoutTimedEvents(events, [day], 8 * 60, 18 * 60);
    expect(placements.map((placement) => [placement.event.source.id, placement.column])).toEqual([
      ['a', 0],
      ['b', 1],
      ['c', 0],
    ]);
    expect(placements.every((placement) => placement.columnCount === 2)).toBe(true);
  });
});
