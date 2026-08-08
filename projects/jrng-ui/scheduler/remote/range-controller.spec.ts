import { describe, expect, it } from 'vitest';
import {
  jSchedulerAdjacentRanges,
  jSchedulerRangeKey,
  JSchedulerRangeCache,
} from './range-controller';

describe('JRNG scheduler remote range controller', () => {
  it('creates stable context-aware keys and adjacent ranges', () => {
    const range = {
      start: new Date('2026-08-01T00:00:00Z'),
      end: new Date('2026-08-08T00:00:00Z'),
    };
    const key = jSchedulerRangeKey(range, {
      view: 'week',
      timezone: 'UTC',
      resourceIds: ['b', 'a'],
      filters: { query: 'service' },
    });
    expect(key).toContain('service');
    expect(jSchedulerAdjacentRanges(range)).toEqual([
      { start: new Date('2026-07-25T00:00:00Z'), end: new Date('2026-08-01T00:00:00Z') },
      { start: new Date('2026-08-08T00:00:00Z'), end: new Date('2026-08-15T00:00:00Z') },
    ]);
  });

  it('tracks and invalidates completed ranges', () => {
    const cache = new JSchedulerRangeCache();
    cache.complete('range');
    expect(cache.has('range')).toBe(true);
    cache.invalidate('range');
    expect(cache.has('range')).toBe(false);
  });
});
