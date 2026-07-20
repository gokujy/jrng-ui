export type JComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type JSeverity =
  'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger' | 'contrast' | 'neutral';

export type JDensity = 'compact' | 'comfortable' | 'spacious';

export type JOrientation = 'horizontal' | 'vertical';

export type JShape = 'square' | 'rounded' | 'pill' | 'circle';

export type JComponentWidth = 'auto' | 'full';

export type JActionVariant = 'solid' | 'outlined' | 'soft' | 'text' | 'link';

export type JSurfaceVariant = 'elevated' | 'outlined' | 'filled' | 'minimal';

export type JFieldVariant = 'outlined' | 'filled' | 'underlined';

export type JStatusVariant = 'solid' | 'soft' | 'outlined' | 'dot';

export type JNavigationVariant = 'underline' | 'pill' | 'boxed' | 'minimal';

export type JActionDisplay = 'icon' | 'icon-label' | 'label';

export type JComponentState =
  | 'default'
  | 'loading'
  | 'empty'
  | 'error'
  | 'success'
  | 'warning'
  | 'disabled'
  | 'readonly'
  | 'invalid';

/** Release maturity assigned to a public JRNG component. */
export type JComponentStability = 'stable' | 'beta' | 'experimental';

export type JPosition =
  | 'top'
  | 'right'
  | 'bottom'
  | 'left'
  | 'center'
  | 'top-start'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-end';

export type JOverlayPosition =
  | 'top'
  | 'right'
  | 'bottom'
  | 'left'
  | 'top-start'
  | 'top-end'
  | 'right-start'
  | 'right-end'
  | 'bottom-start'
  | 'bottom-end'
  | 'left-start'
  | 'left-end';

export type JTableSortOrder = 1 | -1 | 0;
