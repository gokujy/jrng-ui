import { InjectionToken } from '@angular/core';
import { JThemeOptions } from './theme.types';

/** DI token holding the {@link JThemeOptions} supplied via `provideJrngTheme`. */
export const J_THEME_OPTIONS = new InjectionToken<JThemeOptions>('J_THEME_OPTIONS');
