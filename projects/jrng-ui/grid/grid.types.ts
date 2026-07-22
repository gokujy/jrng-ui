export type JGridAlignment = 'start' | 'center' | 'end' | 'stretch' | 'baseline';

export type JGridJustification = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

export type JGridColumnSize = number | `${number}` | 'auto';

export type JGridColumnOrder = number | `${number}` | 'first' | 'last';

export type JGridGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export function jGridGapToken(value: JGridGap): string {
  return value === 'none' ? '0' : `var(--j-spacing-${value})`;
}
