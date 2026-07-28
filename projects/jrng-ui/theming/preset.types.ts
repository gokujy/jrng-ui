/**
 * A map of CSS custom properties to values, e.g.
 * `{ '--j-color-primary': '#7c3aed' }`.
 */
export type JThemeTokenName = `--j-${string}`;
export type JThemeTokens = Partial<Record<JThemeTokenName, string>>;

/** Stable identifiers for the official JRNG visual presets. */
export type JThemePresetId = 'default' | 'material' | 'nexus';

/** Light/dark token sets used by every preset. */
export interface JThemeSchemeTokens {
  readonly light: JThemeTokens;
  readonly dark: JThemeTokens;
}

/**
 * Component groups are open so every tree-shakable JRNG entrypoint and
 * application-defined component can participate without changing this union.
 */
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
  | 'editor'
  | (string & {});

export type JComponentThemeTokens = Partial<Record<JComponentThemeName, JThemeTokens>>;

/**
 * A JRNG-owned visual preset. `name`, `light`, `dark`, and `components` remain
 * compatible with the original 0.1 theming API.
 */
export interface JThemePreset {
  readonly name: string;
  /** Stable registry key. Falls back to a normalized `name` for legacy presets. */
  readonly id?: JThemePresetId | (string & {});
  /** User-facing name used by documentation and configuration UIs. */
  readonly displayName?: string;
  /** Foundation tokens shared by both colour schemes. */
  readonly primitive?: JThemeTokens;
  /** Tokens applied to both schemes before scheme-specific values. */
  readonly semantic?: JThemeTokens;
  /** Tokens applied to the light (`:root`) scope. */
  readonly light?: JThemeTokens;
  /** Tokens applied to the dark scope (the configured `darkClass`). */
  readonly dark?: JThemeTokens;
  /** Optional component-scoped token groups, flattened to JRNG CSS variables. */
  readonly components?: JComponentThemeTokens;
  /** Optional scheme-specific component groups. */
  readonly lightComponents?: JComponentThemeTokens;
  readonly darkComponents?: JComponentThemeTokens;
  /** Optional aliases emitted after canonical values for compatibility. */
  readonly aliases?: Readonly<Record<JThemeTokenName, JThemeTokenName>>;
}

/** A preset identifier or a legacy/custom preset object. */
export type JThemePresetSource = JThemePresetId | (string & {}) | JThemePreset;

export interface JResolvedTheme {
  readonly preset: JThemePreset;
  readonly presetId: string;
  readonly light: JThemeTokens;
  readonly dark: JThemeTokens;
}
