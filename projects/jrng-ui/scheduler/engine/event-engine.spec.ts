import { describe, expect, it } from 'vitest';
import { JSchedulerEvent } from '../scheduler.models';
import {
  jSchedulerEventEnd,
  jSchedulerEventIntersects,
  jSchedulerNormalizeEvents,
  jSchedulerValidateEvent,
} from './event-engine';

describe('JRNG scheduler event engine', () => {
  const range = { start: new Date(2026, 7, 3), end: new Date(2026, 7, 10) };

  it('normalizes end from duration without mutating the event', () => {
    const event: JSchedulerEvent = {
      id: 'review',
      title: 'Product review',
      start: new Date(2026, 7, 4, 9),
      duration: 3_600_000,
    };
    expect(jSchedulerEventEnd(event)).toEqual(new Date(2026, 7, 4, 10));
    expect(event.end).toBeUndefined();
  });

  it('uses exclusive-end intersection semantics', () => {
    expect(
      jSchedulerEventIntersects({ start: new Date(2026, 7, 2), end: new Date(2026, 7, 3) }, range),
    ).toBe(false);
    expect(
      jSchedulerEventIntersects({ start: new Date(2026, 7, 9), end: new Date(2026, 7, 11) }, range),
    ).toBe(true);
  });

  it('filters and stably sorts visible events', () => {
    const events: readonly JSchedulerEvent[] = [
      { id: 2, title: 'Later', start: new Date(2026, 7, 5, 10), duration: 3_600_000 },
      { id: 1, title: 'Earlier', start: new Date(2026, 7, 5, 9), duration: 3_600_000 },
      { id: 3, title: 'Outside', start: new Date(2026, 8, 5), duration: 3_600_000 },
    ];
    expect(jSchedulerNormalizeEvents(events, range).map((event) => event.source.id)).toEqual([
      1, 2,
    ]);
  });

  it('reports invalid ranges and missing duration', () => {
    expect(
      jSchedulerValidateEvent({ id: 'invalid', title: '', start: new Date(2026, 7, 5) }),
    ).toEqual(['Event title is required.', 'Timed events should provide end or duration.']);
  });

  it('normalizes a milestone as a visible point without requiring a duration', () => {
    const milestone: JSchedulerEvent = {
      id: 'release',
      title: 'Release marker',
      start: new Date(2026, 7, 5, 12),
      milestone: true,
    };
    expect(jSchedulerValidateEvent(milestone)).toEqual([]);
    expect(jSchedulerEventEnd(milestone).getTime()).toBe(milestone.start.getTime() + 1);
    expect(jSchedulerNormalizeEvents([milestone], range)).toHaveLength(1);
  });
});
