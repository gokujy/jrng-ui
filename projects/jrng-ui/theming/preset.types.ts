/**
 * A map of CSS custom properties to values, e.g.
 * `{ '--j-color-primary': '#7c3aed' }`.
 */
export type JThemeTokenName = `--j-${string}`;
export type JThemeTokens = Partial<Record<JThemeTokenName, string>>;

export type JComponentThemeName =
  | 'button'
  | 'input'
  | 'select'
  | 'dialog'
  | 'table'
  | 'tabs'
  | 'menu'
  | 'card'
  | 'toast'
  | 'tooltip'
  | 'drawer'
  | 'editor';

export type JComponentThemeTokens = Partial<Record<JComponentThemeName, JThemeTokens>>;

/** A named preset providing design-token overrides per mode. */
export interface JThemePreset {
  name: string;
  /** Tokens applied to the light (`:root`) scope. */
  light?: JThemeTokens;
  /** Tokens applied to the dark scope (the configured `darkClass`). */
  dark?: JThemeTokens;
  /** Optional component-scoped token groups, flattened to JRNG CSS variables. */
  components?: JComponentThemeTokens;
}
