import { describe, expect, it } from 'vitest';
import { jSchedulerCreateClipboardPayload, jSchedulerPasteClipboard } from './clipboard-engine';

describe('JRNG scheduler clipboard engine', () => {
  const events = [
    { id: 'a', title: 'A', start: new Date(2026, 7, 5, 9), end: new Date(2026, 7, 5, 10) },
    { id: 'b', title: 'B', start: new Date(2026, 7, 5, 11), end: new Date(2026, 7, 5, 12) },
  ];

  it('preserves relative offsets and creates new IDs for copied events', () => {
    const pasted = jSchedulerPasteClipboard(jSchedulerCreateClipboardPayload(events), {
      start: new Date(2026, 7, 8, 13),
      resourceId: 'room-2',
    });
    expect(pasted.map((event) => event.start.getHours())).toEqual([13, 15]);
    expect(pasted.map((event) => event.resourceId)).toEqual(['room-2', 'room-2']);
    expect(pasted[0]?.id).not.toBe('a');
    expect(events[0]?.start).toEqual(new Date(2026, 7, 5, 9));
  });

  it('preserves IDs for cut-and-paste moves', () => {
    const pasted = jSchedulerPasteClipboard(jSchedulerCreateClipboardPayload(events, true), {
      start: new Date(2026, 7, 6, 9),
    });
    expect(pasted.map((event) => event.id)).toEqual(['a', 'b']);
  });
});
