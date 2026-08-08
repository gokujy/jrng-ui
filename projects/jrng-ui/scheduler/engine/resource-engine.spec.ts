import { describe, expect, it } from 'vitest';
import {
  jSchedulerComposeResourceDimensions,
  jSchedulerFlattenResources,
  jSchedulerResourceCapacity,
  jSchedulerResourceMatchesEvent,
} from './resource-engine';

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
  it('composes independent dimensions without mutating their resources', () => {
    const departments = [{ id: 'operations', name: 'Operations' }];
    const rooms = [
      { id: 'north', name: 'North room' },
      { id: 'south', name: 'South room' },
    ];
    const composed = jSchedulerComposeResourceDimensions([
      { id: 'department', label: 'Department', resources: departments },
      { id: 'room', label: 'Room', resources: rooms },
    ]);
    expect(composed).toHaveLength(1);
    expect(composed[0]?.children).toHaveLength(2);
    expect(composed[0]?.children?.[0]?.dimensionValues).toEqual({
      department: 'operations',
      room: 'north',
    });
    expect(
      jSchedulerResourceMatchesEvent(composed[0]!.children![0]!, {
        resourceIds: ['operations', 'north'],
      }),
    ).toBe(true);
    expect(
      jSchedulerResourceMatchesEvent(composed[0]!.children![0]!, {
        resourceIds: ['operations', 'south'],
      }),
    ).toBe(false);
    expect(departments[0]).toEqual({ id: 'operations', name: 'Operations' });
  });
  it('matches descendant assignments for aggregate resource lanes', () => {
    expect(jSchedulerResourceMatchesEvent(resources[0]!, { resourceId: 'room' }, true)).toBe(true);
    expect(jSchedulerResourceMatchesEvent(resources[0]!, { resourceId: 'unrelated' }, true)).toBe(
      false,
    );
  });
});
