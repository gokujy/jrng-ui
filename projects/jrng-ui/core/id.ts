let nextId = 0;

export function jCreateId(prefix = 'j'): string {
  nextId += 1;
  return `${prefix}-${nextId}`;
}

export function jrCreateId(prefix: string): string {
  return jCreateId(prefix);
}
