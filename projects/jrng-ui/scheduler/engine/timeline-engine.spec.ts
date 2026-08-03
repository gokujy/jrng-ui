import { describe, expect, it } from 'vitest';
import { jSchedulerTimelineSlots, jSchedulerVirtualWindow } from './timeline-engine';

describe('JRNG scheduler timeline engine', () => {
  it('generates view-specific slots', () => {
    const range = { start: new Date(2026, 7, 3), end: new Date(2026, 7, 4) };
    expect(jSchedulerTimelineSlots(range, 'timelineDay', 'en-US', 60)).toHaveLength(24);
    expect(
      jSchedulerTimelineSlots(
        { start: new Date(2026, 0, 1), end: new Date(2027, 0, 1) },
        'timelineYear',
      ),
    ).toHaveLength(12);
  });
  it('returns a bounded overscanned virtual window', () => {
    const result = jSchedulerVirtualWindow(
      Array.from({ length: 1000 }, (_, index) => index),
      50,
      500,
      200,
      2,
    );
    expect(result).toMatchObject({ startIndex: 8, endIndex: 16, before: 400, totalSize: 50_000 });
    expect(result.items).toHaveLength(8);
  });
});
