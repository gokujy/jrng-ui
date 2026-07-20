export function removeNullish<T extends object>(value: T): Partial<T> {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item != null)) as Partial<T>;
}

export function pick<T extends object, K extends keyof T>(
  value: T,
  keys: readonly K[],
): Pick<T, K> {
  return Object.fromEntries(
    keys.filter((key) => key in value).map((key) => [key, value[key]]),
  ) as Pick<T, K>;
}

export function omit<T extends object, K extends keyof T>(
  value: T,
  keys: readonly K[],
): Omit<T, K> {
  const excluded = new Set<PropertyKey>(keys);
  return Object.fromEntries(Object.entries(value).filter(([key]) => !excluded.has(key))) as Omit<
    T,
    K
  >;
}

export function deepMerge<T>(base: T, ...overrides: readonly unknown[]): T {
  return overrides.reduce<T>(
    (result, override) => mergeValue(result, override) as T,
    cloneValue(base) as T,
  );
}

export function deepEqual(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true;
  if (Array.isArray(left) && Array.isArray(right))
    return (
      left.length === right.length && left.every((item, index) => deepEqual(item, right[index]))
    );
  if (isPlainObject(left) && isPlainObject(right)) {
    const leftKeys = Object.keys(left);
    return (
      leftKeys.length === Object.keys(right).length &&
      leftKeys.every((key) => key in right && deepEqual(left[key], right[key]))
    );
  }
  return false;
}

export function changedFields<T extends object>(previous: T, current: T): Partial<T> {
  return Object.fromEntries(
    Object.keys(current)
      .filter((key) => !deepEqual(previous[key as keyof T], current[key as keyof T]))
      .map((key) => [key, current[key as keyof T]]),
  ) as Partial<T>;
}

export function toQueryParams(value: Record<string, unknown>): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, item] of Object.entries(value)) {
    if (item == null) continue;
    for (const entry of Array.isArray(item) ? item : [item])
      params.append(key, entry instanceof Date ? entry.toISOString() : String(entry));
  }
  return params;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value == null || Object.getPrototypeOf(value) !== Object.prototype) return false;
  return true;
}

function cloneValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(cloneValue);
  if (isPlainObject(value))
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, cloneValue(item)]));
  return value;
}

function mergeValue(base: unknown, override: unknown): unknown {
  if (override === undefined) return cloneValue(base);
  if (
    override != null &&
    typeof override === 'object' &&
    !Array.isArray(override) &&
    !(override instanceof Date) &&
    !isPlainObject(override)
  )
    return cloneValue(base);
  if (!isPlainObject(base) || !isPlainObject(override)) return cloneValue(override);
  const result: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
    result[key] = mergeValue(result[key], value);
  }
  return result;
}
