import { JComponentThemeTokens, JThemePreset, JThemeTokens } from './preset.types';

/** Theming-specific options passed to `provideJrngTheme` (mode lives in `JRNG_CONFIG`). */
export interface JThemeOptions {
  /** Class toggled on the document root for dark styling. Default `'j-dark'`. */
  darkClass?: string;
  /** Preset applied on startup. */
  preset?: JThemePreset;
  /** Global semantic or foundation token overrides applied at startup. */
  tokens?: JThemeTokens;
  /** Component token overrides applied at startup. */
  components?: JComponentThemeTokens;
}
