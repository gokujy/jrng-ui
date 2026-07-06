/**
 * A map of CSS custom properties to values, e.g.
 * `{ '--j-color-primary': '#7c3aed' }`.
 */
export type JThemeTokens = Record<string, string>;

/** A named preset providing design-token overrides per mode. */
export interface JThemePreset {
  name: string;
  /** Tokens applied to the light (`:root`) scope. */
  light?: JThemeTokens;
  /** Tokens applied to the dark scope (the configured `darkClass`). */
  dark?: JThemeTokens;
}
