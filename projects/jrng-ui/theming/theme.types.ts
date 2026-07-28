import { JComponentThemeTokens, JThemePresetSource, JThemeTokens } from './preset.types';

export type JThemeColorScheme = 'light' | 'dark' | 'system';
export type JThemeTarget = 'document' | HTMLElement;

/** Theming-specific options passed to `provideJrngTheme` (mode lives in `JRNG_CONFIG`). */
export interface JThemeOptions {
  /** Class toggled on the document root for dark styling. Default `'j-dark'`. */
  darkClass?: string;
  /** Registered identifier or custom preset applied on startup. */
  preset?: JThemePresetSource;
  /** Scheme override. Defaults to `JRNG_CONFIG.themeMode`. */
  colorScheme?: JThemeColorScheme;
  /** Global semantic or foundation token overrides applied at startup. */
  tokens?: JThemeTokens;
  /** Component token overrides applied at startup. */
  components?: JComponentThemeTokens;
}

export interface JThemeScopeOptions extends Omit<JThemeOptions, 'darkClass'> {
  /** Explicit scheme for this scope. Defaults to the service scheme. */
  colorScheme?: JThemeColorScheme;
}

export interface JThemeScope {
  readonly id: string;
  readonly target: HTMLElement;
  update(options: JThemeScopeOptions): void;
  reset(): void;
  destroy(): void;
}
