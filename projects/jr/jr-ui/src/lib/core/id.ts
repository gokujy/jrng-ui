let nextId = 0;

export function jrCreateId(prefix: string): string {
  nextId += 1;
  return `${prefix}-${nextId}`;
}
