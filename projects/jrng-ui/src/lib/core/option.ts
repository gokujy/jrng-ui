export interface JOptionLike {
  readonly label?: string;
  readonly value?: unknown;
  readonly disabled?: boolean;
}

export type JOptionSource = string | number | boolean | JOptionLike;

export function jOptionLabel(option: JOptionSource): string {
  if (typeof option === 'object') {
    return option.label ?? String(option.value ?? '');
  }

  return String(option);
}

export function jOptionValue(option: JOptionSource): unknown {
  if (typeof option === 'object') {
    return option.value ?? option.label ?? '';
  }

  return option;
}

export function jOptionDisabled(option: JOptionSource): boolean {
  return typeof option === 'object' && option.disabled === true;
}
