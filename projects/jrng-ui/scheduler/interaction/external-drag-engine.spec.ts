import { describe, expect, it } from 'vitest';
import {
  jSchedulerCreateExternalDragPayload,
  jSchedulerParseExternalDragPayload,
  jSchedulerProjectExternalDrop,
  jSchedulerSerializeExternalDragPayload,
} from './external-drag-engine';

describe('JRNG scheduler external drag engine', () => {
  const events = [
    { id: 'a', title: 'A', start: new Date(2026, 7, 5, 9), end: new Date(2026, 7, 5, 10) },
    { id: 'b', title: 'B', start: new Date(2026, 7, 5, 11), end: new Date(2026, 7, 5, 12) },
  ];

  it('round-trips payloads and preserves group offsets across schedulers', () => {
    const payload = jSchedulerParseExternalDragPayload(
      jSchedulerSerializeExternalDragPayload(
        jSchedulerCreateExternalDragPayload('source', events, true),
      ),
    );
    expect(payload?.events[0]?.start).toBeInstanceOf(Date);
    const projected = jSchedulerProjectExternalDrop(payload!, {
      start: new Date(2026, 7, 8, 13),
      resourceId: 'resource-b',
    });
    expect(projected.map((event) => event.start.getHours())).toEqual([13, 15]);
    expect(projected[0]?.id).not.toBe('a');
  });
});
