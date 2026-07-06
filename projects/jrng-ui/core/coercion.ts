export function jCoerceBoolean(value: unknown): boolean {
  return value != null && `${value}` !== 'false';
}
