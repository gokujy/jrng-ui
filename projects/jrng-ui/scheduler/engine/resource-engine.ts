import { JSchedulerEvent, JSchedulerId, JSchedulerResource } from '../scheduler.models';

export interface JSchedulerResourceRow {
  readonly resource: JSchedulerResource;
  readonly depth: number;
  readonly parent: boolean;
  readonly expanded: boolean;
  readonly eventCount: number;
}

export function jSchedulerFlattenResources(
  resources: readonly JSchedulerResource[],
  expandedIds: readonly JSchedulerId[] | boolean,
  events: readonly JSchedulerEvent[] = [],
  query = '',
): readonly JSchedulerResourceRow[] {
  const expanded =
    expandedIds === true ? null : new Set((expandedIds === false ? [] : expandedIds).map(String));
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
        eventCount: eventCount(resource, events),
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
  const ids = new Set(
    [resource.id, ...(resource.children ?? []).flatMap(descendantIds)].map(String),
  );
  return events.filter((event) =>
    [event.resourceId, ...(event.resourceIds ?? [])].some(
      (id) => id != null && ids.has(String(id)),
    ),
  ).length;
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
