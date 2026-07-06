/** Match modes for text/number/date filtering, aligned with common data-grid semantics. */
export type JFilterMatchMode =
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith'
  | 'equals'
  | 'notEquals'
  | 'lt'
  | 'lte'
  | 'gt'
  | 'gte'
  | 'between';

function toComparable(value: unknown): number | null {
  if (value instanceof Date) {
    return value.getTime();
  }
  if (typeof value === 'number') {
    return value;
  }
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

function toText(value: unknown): string {
  return value == null ? '' : String(value).toLowerCase().trim();
}

/**
 * Test whether `value` satisfies `filter` under the given match `mode`. An empty
 * filter always matches. Text modes are case-insensitive; comparison modes coerce
 * to numbers/dates. `between` expects `filter` to be a `[min, max]` tuple.
 */
export function jMatchesFilter(
  value: unknown,
  filter: unknown,
  mode: JFilterMatchMode = 'contains',
): boolean {
  if (filter == null || filter === '' || (Array.isArray(filter) && filter.length === 0)) {
    return true;
  }

  if (mode === 'between') {
    const v = toComparable(value);
    const [min, max] = (filter as [unknown, unknown]) ?? [];
    const lo = toComparable(min);
    const hi = toComparable(max);
    if (v == null) {
      return false;
    }
    return (lo == null || v >= lo) && (hi == null || v <= hi);
  }

  if (mode === 'lt' || mode === 'lte' || mode === 'gt' || mode === 'gte') {
    const v = toComparable(value);
    const f = toComparable(filter);
    if (v == null || f == null) {
      return false;
    }
    return mode === 'lt' ? v < f : mode === 'lte' ? v <= f : mode === 'gt' ? v > f : v >= f;
  }

  const v = toText(value);
  const f = toText(filter);
  switch (mode) {
    case 'contains':
      return v.includes(f);
    case 'notContains':
      return !v.includes(f);
    case 'startsWith':
      return v.startsWith(f);
    case 'endsWith':
      return v.endsWith(f);
    case 'equals':
      return v === f;
    case 'notEquals':
      return v !== f;
    default:
      return v.includes(f);
  }
}

/** Resolve a dot-path (e.g. `'user.name'`) or accessor against an item. */
function resolveField<T>(item: T, field: string | ((item: T) => unknown)): unknown {
  if (typeof field === 'function') {
    return field(item);
  }
  return field.split('.').reduce<unknown>((acc, key) => {
    return acc == null ? acc : (acc as Record<string, unknown>)[key];
  }, item);
}

/**
 * Filter `items` by matching `query` against one or more `fields`. An item is kept
 * when any field matches (logical OR). An empty query returns all items.
 */
export function jFilterBy<T>(
  items: readonly T[],
  query: unknown,
  fields: readonly (string | ((item: T) => unknown))[],
  mode: JFilterMatchMode = 'contains',
): T[] {
  if (query == null || query === '') {
    return [...items];
  }
  return items.filter((item) =>
    fields.some((field) => jMatchesFilter(resolveField(item, field), query, mode)),
  );
}
