import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { computed, effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { JRNG_CONFIG, JThemeMode } from 'jrng-ui/core';
import { JThemePreset, JThemeTokens } from './preset.types';
import { J_THEME_OPTIONS } from './theme-config.token';

const PRESET_STYLE_ID = 'j-theme-preset';

/**
 * Runtime theming control for JRNG UI. Manages dark mode (including `'system'`
 * OS-preference tracking) and lets applications override design tokens or apply
 * presets at runtime, on top of the token-driven CSS-variable theme.
 *
 * The initial mode is read from `JRNG_CONFIG.themeMode` (see `provideJrngUI`).
 * Available without configuration via `inject(JThemeService)`; use
 * `provideJrngTheme(options)` to apply a preset/darkClass and activate it at
 * bootstrap.
 */
@Injectable({ providedIn: 'root' })
export class JThemeService {
  private readonly documentRef = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly config = inject(JRNG_CONFIG);
  private readonly options = inject(J_THEME_OPTIONS, { optional: true }) ?? {};

  /** Class toggled on the document root for dark styling. */
  readonly darkClass = this.options.darkClass ?? 'j-dark';

  /** Current mode: `'light' | 'dark' | 'system'`. */
  readonly mode = signal<JThemeMode>(this.config.themeMode);

  private readonly systemPrefersDark = signal(this.prefersDark());

  /** Whether dark styling is currently active (resolves `'system'`). */
  readonly isDark = computed(
    () => this.mode() === 'dark' || (this.mode() === 'system' && this.systemPrefersDark()),
  );

  constructor() {
    if (this.options.preset) {
      this.setPreset(this.options.preset);
    }

    this.darkModeQuery()?.addEventListener('change', (event) =>
      this.systemPrefersDark.set(event.matches),
    );

    // Keep the root element's dark class in sync with the resolved mode.
    effect(() => {
      const dark = this.isDark();
      if (this.isBrowser) {
        this.documentRef.documentElement.classList.toggle(this.darkClass, dark);
      }
    });
  }

  /** Set the theme mode. */
  setMode(mode: JThemeMode): void {
    this.mode.set(mode);
  }

  /** Toggle between light and dark (resolving the current effective mode). */
  toggle(): void {
    this.mode.set(this.isDark() ? 'light' : 'dark');
  }

  /** Override CSS custom properties on the document root, e.g. a brand color. */
  applyTokens(tokens: JThemeTokens): void {
    if (!this.isBrowser) {
      return;
    }
    const root = this.documentRef.documentElement;
    for (const [name, value] of Object.entries(tokens)) {
      root.style.setProperty(name, value);
    }
  }

  /** Apply a preset by injecting a managed stylesheet with its light/dark tokens. */
  setPreset(preset: JThemePreset): void {
    if (!this.isBrowser) {
      return;
    }
    const css =
      (preset.light ? `:root{${this.toDeclarations(preset.light)}}` : '') +
      (preset.dark ? `.${this.darkClass}{${this.toDeclarations(preset.dark)}}` : '');

    let style = this.documentRef.getElementById(PRESET_STYLE_ID) as HTMLStyleElement | null;
    if (!style) {
      style = this.documentRef.createElement('style');
      style.id = PRESET_STYLE_ID;
      this.documentRef.head.appendChild(style);
    }
    style.textContent = css;
  }

  /** Read the computed value of a design token, e.g. `getToken('--j-color-primary')`. */
  getToken(name: string): string {
    if (!this.isBrowser) {
      return '';
    }
    return getComputedStyle(this.documentRef.documentElement).getPropertyValue(name).trim();
  }

  private toDeclarations(tokens: JThemeTokens): string {
    return Object.entries(tokens)
      .map(([name, value]) => `${name}:${value};`)
      .join('');
  }

  private prefersDark(): boolean {
    return this.darkModeQuery()?.matches ?? false;
  }

  /** The `prefers-color-scheme: dark` media query, or null when unavailable (SSR/jsdom). */
  private darkModeQuery(): MediaQueryList | null {
    const view = this.documentRef.defaultView;
    if (!this.isBrowser || typeof view?.matchMedia !== 'function') {
      return null;
    }
    return view.matchMedia('(prefers-color-scheme: dark)');
  }
}
