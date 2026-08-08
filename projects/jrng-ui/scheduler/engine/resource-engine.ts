import {
  JSchedulerEvent,
  JSchedulerId,
  JSchedulerResource,
  JSchedulerResourceDimension,
} from '../scheduler.models';

export interface JSchedulerResourceRow {
  readonly resource: JSchedulerResource;
  readonly depth: number;
  readonly parent: boolean;
  readonly expanded: boolean;
  readonly eventCount: number;
}

/**
 * Composes independent resource dimensions into a deterministic hierarchy.
 * Source resources are never mutated; generated IDs are stable for the same
 * dimension/resource path and each lane retains its original dimension values.
 */
export function jSchedulerComposeResourceDimensions(
  dimensions: readonly JSchedulerResourceDimension[],
): readonly JSchedulerResource[] {
  const active = dimensions.filter((dimension) => dimension.resources.length > 0);
  const compose = (
    dimensionIndex: number,
    values: Readonly<Record<string, JSchedulerId>>,
    path: readonly string[],
    names: readonly string[],
  ): readonly JSchedulerResource[] => {
    const dimension = active[dimensionIndex];
    if (!dimension) return [];
    return dimension.resources
      .filter((resource) => !resource.hidden)
      .map((resource) => {
        const nextValues = { ...values, [dimension.id]: resource.id };
        const nextNames = [...names, resource.name];
        const nextPath = [
          ...path,
          `${encodeURIComponent(dimension.id)}=${encodeURIComponent(String(resource.id))}`,
        ];
        const children = compose(dimensionIndex + 1, nextValues, nextPath, nextNames);
        return {
          ...resource,
          name: children.length ? resource.name : nextNames.join(' / '),
          id: `__dimension:${nextPath.join('/')}`,
          parentId: path.length ? `__dimension:${path.join('/')}` : undefined,
          children: children.length ? children : undefined,
          dimensionValues: nextValues,
          metadata: {
            ...(resource.metadata ?? {}),
            schedulerDimensionId: dimension.id,
            schedulerSourceResourceId: resource.id,
          },
        } satisfies JSchedulerResource;
      });
  };
  return active.length ? compose(0, {}, [], []) : [];
}

export function jSchedulerResourceMatchesEvent(
  resource: JSchedulerResource,
  event: Pick<JSchedulerEvent, 'resourceId' | 'resourceIds'>,
  includeDescendants = false,
): boolean {
  const assigned = new Set(
    [event.resourceId, ...(event.resourceIds ?? [])]
      .filter((id): id is JSchedulerId => id != null)
      .map(String),
  );
  const dimensionIds = Object.values(resource.dimensionValues ?? {}).map(String);
  return dimensionIds.length
    ? dimensionIds.every((id) => assigned.has(id))
    : includeDescendants
      ? descendantIds(resource).some((id) => assigned.has(String(id)))
      : assigned.has(String(resource.id));
}

export function jSchedulerFlattenResources(
  resources: readonly JSchedulerResource[],
  expandedIds: readonly JSchedulerId[] | boolean,
  events: readonly JSchedulerEvent[] = [],
  query = '',
): readonly JSchedulerResourceRow[] {
  const expanded =
    expandedIds === true ? null : new Set((expandedIds === false ? [] : expandedIds).map(String));
  const eventCounts = buildEventCounts(resources, events);
  const result: JSchedulerResourceRow[] = [];
  const visit = (items: readonly JSchedulerResource[], depth: number): void => {
    for (const resource of items) {
      const children = resource.children ?? [];
      const matches =
        !query ||
        resource.name.toLocaleLowerCase().includes(query.toLocaleLowerCase()) ||
        descendantsMatch(children, query);
      if (!matches) continue;
      const isExpanded = expanded === null || expanded.has(String(resource.id)) || !!query;
      result.push({
        resource,
        depth,
        parent: children.length > 0,
        expanded: isExpanded,
        eventCount: eventCounts.get(String(resource.id)) ?? 0,
      });
      if (children.length && isExpanded) visit(children, depth + 1);
    }
  };
  visit(resources, 0);
  return result;
}

export function jSchedulerResourceCapacity(
  resource: JSchedulerResource,
  events: readonly JSchedulerEvent[],
): { readonly used: number; readonly capacity?: number; readonly exceeded: boolean } {
  const used = eventCount(resource, events);
  return {
    used,
    capacity: resource.capacity,
    exceeded: resource.capacity != null && used > resource.capacity,
  };
}

function eventCount(resource: JSchedulerResource, events: readonly JSchedulerEvent[]): number {
  if (resource.dimensionValues)
    return events.filter((event) => jSchedulerResourceMatchesEvent(resource, event)).length;
  const ids = new Set(
    [resource.id, ...(resource.children ?? []).flatMap(descendantIds)].map(String),
  );
  return events.filter((event) =>
    [event.resourceId, ...(event.resourceIds ?? [])].some(
      (id) => id != null && ids.has(String(id)),
    ),
  ).length;
}

function buildEventCounts(
  resources: readonly JSchedulerResource[],
  events: readonly JSchedulerEvent[],
): ReadonlyMap<string, number> {
  const direct = new Map<string, number>();
  for (const event of events) {
    const assigned = new Set(
      [event.resourceId, ...(event.resourceIds ?? [])]
        .filter((id): id is JSchedulerId => id != null)
        .map(String),
    );
    for (const id of assigned) direct.set(id, (direct.get(id) ?? 0) + 1);
  }
  const aggregate = new Map<string, number>();
  const visit = (resource: JSchedulerResource): number => {
    if (resource.dimensionValues) {
      const total = events.filter((event) =>
        jSchedulerResourceMatchesEvent(resource, event),
      ).length;
      aggregate.set(String(resource.id), total);
      for (const child of resource.children ?? []) visit(child);
      return total;
    }
    const total =
      (direct.get(String(resource.id)) ?? 0) +
      (resource.children ?? []).reduce((sum, child) => sum + visit(child), 0);
    aggregate.set(String(resource.id), total);
    return total;
  };
  for (const resource of resources) visit(resource);
  return aggregate;
}
function descendantIds(resource: JSchedulerResource): JSchedulerId[] {
  return [resource.id, ...(resource.children ?? []).flatMap(descendantIds)];
}
function descendantsMatch(resources: readonly JSchedulerResource[], query: string): boolean {
  return resources.some(
    (resource) =>
      resource.name.toLocaleLowerCase().includes(query.toLocaleLowerCase()) ||
      descendantsMatch(resource.children ?? [], query),
  );
}
