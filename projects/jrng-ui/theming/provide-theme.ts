import {
  ENVIRONMENT_INITIALIZER,
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
} from '@angular/core';
import { J_THEME_OPTIONS } from './theme-config.token';
import { JThemeService } from './theme.service';
import { JThemeOptions } from './theme.types';

/**
 * Activates JRNG UI runtime theming at application bootstrap. Pair with
 * `provideJrngUI({ themeMode })` to set the initial mode.
 *
 * ```ts
 * bootstrapApplication(App, {
 *   providers: [
 *     provideJrngUI({ themeMode: 'system' }),
 *     provideJrngTheme({ preset: violetPreset }),
 *   ],
 * });
 * ```
 *
 * Eagerly instantiates {@link JThemeService} so the mode and preset apply during
 * startup.
 */
export function provideJrngTheme(options: JThemeOptions = {}): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: J_THEME_OPTIONS, useValue: options },
    { provide: ENVIRONMENT_INITIALIZER, multi: true, useValue: () => inject(JThemeService) },
  ]);
}
