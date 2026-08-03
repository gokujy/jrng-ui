import { describe, expect, it } from 'vitest';
import { jSchedulerFlattenResources, jSchedulerResourceCapacity } from './resource-engine';

describe('JRNG scheduler resource engine', () => {
  const resources = [
    { id: 'team', name: 'Team', children: [{ id: 'room', name: 'Room', capacity: 1 }] },
  ];
  it('flattens only expanded hierarchical rows', () => {
    expect(jSchedulerFlattenResources(resources, []).map((row) => row.resource.id)).toEqual([
      'team',
    ]);
    expect(jSchedulerFlattenResources(resources, ['team']).map((row) => row.resource.id)).toEqual([
      'team',
      'room',
    ]);
  });
  it('aggregates parent counts and capacity', () => {
    const events = [
      { id: 'one', title: 'Room booking', start: new Date(), duration: 1, resourceId: 'room' },
      { id: 'two', title: 'Training', start: new Date(), duration: 1, resourceId: 'room' },
    ];
    expect(jSchedulerFlattenResources(resources, true, events)[0]?.eventCount).toBe(2);
    expect(jSchedulerResourceCapacity(resources[0]!.children![0]!, events).exceeded).toBe(true);
  });
});
