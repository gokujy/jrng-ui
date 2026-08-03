import { describe, expect, it } from 'vitest';
import {
  jSchedulerMoveEvent,
  jSchedulerResizeEvent,
  jSchedulerSnapInstant,
  jSchedulerValidateMove,
} from './interaction-engine';

describe('JRNG scheduler interaction engine', () => {
  const event = {
    id: 'visit',
    title: 'Field visit',
    start: new Date(2026, 7, 5, 9),
    end: new Date(2026, 7, 5, 10),
  };

  it('snaps instants and moves immutable event copies', () => {
    expect(jSchedulerSnapInstant(new Date(2026, 7, 5, 9, 8), 15)).toEqual(
      new Date(2026, 7, 5, 9, 15),
    );
    const moved = jSchedulerMoveEvent(event, new Date(2026, 7, 5, 11));
    expect(moved).toMatchObject({ start: new Date(2026, 7, 5, 11), end: new Date(2026, 7, 5, 12) });
    expect(event.start).toEqual(new Date(2026, 7, 5, 9));
  });

  it('enforces minimum and maximum resize durations', () => {
    expect(
      jSchedulerResizeEvent(event, 'end', new Date(2026, 7, 5, 9, 5), 15 * 60_000).end,
    ).toEqual(new Date(2026, 7, 5, 9, 15));
    expect(
      jSchedulerResizeEvent(event, 'end', new Date(2026, 7, 5, 14), 15 * 60_000, 2 * 3_600_000).end,
    ).toEqual(new Date(2026, 7, 5, 11));
  });

  it('detects stable resource-aware overlap conflicts', () => {
    const result = jSchedulerValidateMove(
      event,
      [
        {
          ...event,
          id: 'other',
          start: new Date(2026, 7, 5, 9, 30),
          end: new Date(2026, 7, 5, 10, 30),
        },
      ],
      { allowOverlap: false },
    );
    expect(result).toEqual({ valid: false, reason: 'Event overlaps another event.' });
  });
});
