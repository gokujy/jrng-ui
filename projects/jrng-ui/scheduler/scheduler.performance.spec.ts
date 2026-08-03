import { describe, expect, it } from 'vitest';
import { jSchedulerNormalizeEvents } from './engine/event-engine';
import { jSchedulerLayoutMonthEvents, jSchedulerLayoutTimedEvents } from './engine/layout-engine';
import { jSchedulerFlattenResources } from './engine/resource-engine';
import { jSchedulerVirtualWindow } from './engine/timeline-engine';
import { JSchedulerEvent } from './scheduler.models';

const day = new Date(2026, 6, 1);
const range = { start: day, end: new Date(2026, 7, 1) };

function events(count: number): readonly JSchedulerEvent[] {
  return Array.from({ length: count }, (_, index) => {
    const start = new Date(2026, 6, 1 + (index % 28), 8 + (index % 8), (index % 4) * 15);
    return {
      id: `event-${index}`,
      title: `Operational event ${index}`,
      start,
      end: new Date(start.getTime() + 45 * 60_000),
      resourceId: `resource-${index % 500}`,
    };
  });
}

describe('scheduler representative performance workloads', () => {
  it('lays out 1,000 month events without losing stable identities', () => {
    const normalized = jSchedulerNormalizeEvents(events(1_000), range);
    const segments = jSchedulerLayoutMonthEvents(normalized, range);
    expect(normalized).toHaveLength(1_000);
    expect(new Set(segments.map((segment) => segment.event.occurrenceId)).size).toBe(1_000);
  });

  it('places 2,000 timed week events deterministically', () => {
    const source = events(2_000);
    const normalized = jSchedulerNormalizeEvents(source, range);
    const days = Array.from({ length: 7 }, (_, index) => new Date(2026, 6, 1 + index));
    const first = jSchedulerLayoutTimedEvents(normalized, days, 0, 24 * 60);
    const second = jSchedulerLayoutTimedEvents(normalized, days, 0, 24 * 60);
    expect(first).toEqual(second);
    expect(first.length).toBeGreaterThan(0);
  });

  it('flattens 500 resources and computes event counts', () => {
    const resources = Array.from({ length: 500 }, (_, index) => ({
      id: `resource-${index}`,
      name: `Resource ${index}`,
    }));
    const rows = jSchedulerFlattenResources(resources, true, events(2_000));
    expect(rows).toHaveLength(500);
    expect(rows.reduce((sum, row) => sum + row.eventCount, 0)).toBe(2_000);
  });

  it('virtualizes a 10,000-slot timeline to the viewport and overscan', () => {
    const slots = Array.from({ length: 10_000 }, (_, index) => index);
    const window = jSchedulerVirtualWindow(slots, 72, 72 * 5_000, 1_024, 4);
    expect(window.items.length).toBeLessThan(30);
    expect(window.totalSize).toBe(720_000);
    expect(window.before + window.after).toBeGreaterThan(700_000);
  });
});
