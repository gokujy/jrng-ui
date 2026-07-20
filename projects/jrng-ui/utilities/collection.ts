export function groupBy<T, K extends PropertyKey>(
  items: readonly T[],
  key: (item: T) => K,
): Record<K, T[]> {
  return items.reduce(
    (groups, item) => {
      (groups[key(item)] ??= []).push(item);
      return groups;
    },
    {} as Record<K, T[]>,
  );
}

export function uniqueBy<T, K>(items: readonly T[], key: (item: T) => K): T[] {
  const seen = new Set<K>();
  return items.filter((item) => !seen.has(key(item)) && !!seen.add(key(item)));
}

export function sortBy<T>(
  items: readonly T[],
  selector: (item: T) => unknown,
  direction: 'asc' | 'desc' = 'asc',
): T[] {
  const factor = direction === 'asc' ? 1 : -1;
  return [...items].sort((left, right) => compareValues(selector(left), selector(right)) * factor);
}

export function chunk<T>(items: readonly T[], size: number): T[][] {
  if (!Number.isInteger(size) || size < 1)
    throw new RangeError('Chunk size must be a positive integer.');
  return Array.from({ length: Math.ceil(items.length / size) }, (_, index) =>
    items.slice(index * size, (index + 1) * size),
  );
}

export function moveItem<T>(items: readonly T[], from: number, to: number): T[] {
  const copy = [...items];
  if (from < 0 || from >= copy.length || to < 0 || to >= copy.length) return copy;
  const [item] = copy.splice(from, 1);
  if (item !== undefined) copy.splice(to, 0, item);
  return copy;
}

export function flattenTree<T>(
  items: readonly T[],
  children: (item: T) => readonly T[] | null | undefined,
): T[] {
  return items.flatMap((item) => [item, ...flattenTree(children(item) ?? [], children)]);
}

export function buildTree<T, K>(
  items: readonly T[],
  id: (item: T) => K,
  parentId: (item: T) => K | null | undefined,
  setChildren: (item: T, children: T[]) => T,
): T[] {
  const childrenByParent = new Map<K | null, T[]>();
  for (const item of items) {
    const parent = parentId(item) ?? null;
    childrenByParent.set(parent, [...(childrenByParent.get(parent) ?? []), item]);
  }
  const visit = (item: T, path: Set<K>): T => {
    const itemId = id(item);
    if (path.has(itemId)) throw new Error('Cannot build a tree containing a cycle.');
    return setChildren(
      item,
      (childrenByParent.get(itemId) ?? []).map((child) => visit(child, new Set([...path, itemId]))),
    );
  };
  return (childrenByParent.get(null) ?? []).map((item) => visit(item, new Set()));
}

function compareValues(left: unknown, right: unknown): number {
  if (left == null) return right == null ? 0 : 1;
  if (right == null) return -1;
  if (typeof left === 'number' && typeof right === 'number') return left - right;
  return String(left).localeCompare(String(right), undefined, {
    numeric: true,
    sensitivity: 'base',
  });
}
