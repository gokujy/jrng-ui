import { JThemePreset } from './preset.types';

/** Theming-specific options passed to `provideJrngTheme` (mode lives in `JRNG_CONFIG`). */
export interface JThemeOptions {
  /** Class toggled on the document root for dark styling. Default `'j-dark'`. */
  darkClass?: string;
  /** Preset applied on startup. */
  preset?: JThemePreset;
}
