import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  computed,
  DestroyRef,
  effect,
  inject,
  Injectable,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { JRNG_CONFIG } from 'jrng-ui/core';
import {
  JComponentThemeTokens,
  JResolvedTheme,
  JThemePresetSource,
  JThemeTokens,
} from './preset.types';
import { J_THEME_OPTIONS } from './theme-config.token';
import { jApplyThemeTokens, jThemeDeclarations } from './theme-css';
import {
  jApplyThemePalettes,
  JPrimaryPaletteSource,
  JSurfacePaletteSource,
} from './theme-palettes';
import { JThemePresetRegistry } from './theme-registry';
import { jMergeThemeOverrides, jResolveTheme } from './theme-resolver';
import { JThemeColorScheme, JThemeOptions, JThemeScope, JThemeScopeOptions } from './theme.types';

const PRESET_STYLE_ID = 'j-theme-preset';

interface ScopeRecord {
  readonly id: string;
  readonly target: HTMLElement;
  options: JThemeScopeOptions;
  managed: readonly string[];
}

export interface JThemeInitialState {
  readonly preset: string;
  readonly colorScheme: JThemeColorScheme;
  readonly darkClass: string;
  readonly css: string;
}

/**
 * Signal-based, SSR-safe runtime control for registered and custom JRNG themes.
 * The service owns theme variables only; persistence and application layout
 * remain application responsibilities.
 */
@Injectable({ providedIn: 'root' })
export class JThemeService {
  private readonly documentRef = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly config = inject(JRNG_CONFIG);
  private readonly destroyRef = inject(DestroyRef);
  private readonly options = inject(J_THEME_OPTIONS, { optional: true }) ?? {};
  private readonly registry = inject(JThemePresetRegistry);
  private readonly presetSource = signal<JThemePresetSource>(this.options.preset ?? 'default');
  private readonly tokenOverrides = signal<JThemeTokens>(this.options.tokens ?? {});
  private readonly componentOverrides = signal<JComponentThemeTokens>(
    this.options.components ?? {},
  );
  private readonly primaryPalette = signal<JPrimaryPaletteSource | undefined>(this.options.primary);
  private readonly surfacePalette = signal<JSurfacePaletteSource | undefined>(this.options.surface);
  private readonly systemPrefersDark = signal(this.prefersDark());
  private readonly scopes = new Map<string, ScopeRecord>();
  private readonly scopeVersion = signal(0);
  private rootManagedTokens: readonly string[] = [];
  private nextScopeId = 0;

  /** Class toggled on the document root for dark styling. */
  readonly darkClass = this.options.darkClass ?? 'j-dark';

  /** Current requested colour scheme. */
  readonly colorScheme = signal<JThemeColorScheme>(
    this.options.colorScheme ?? this.config.themeMode,
  );
  /** @deprecated Use `colorScheme` instead. Retained for source compatibility. */
  readonly mode = this.colorScheme;

  /** Current resolved preset and stable identifier. */
  readonly resolvedTheme = computed(() =>
    jApplyThemePalettes(
      jResolveTheme(this.registry.resolve(this.presetSource())),
      this.primaryPalette(),
      this.surfacePalette(),
    ),
  );
  readonly presetId = computed(() => this.resolvedTheme().presetId);

  /** Whether dark styling is currently active after resolving `system`. */
  readonly isDark = computed(
    () =>
      this.colorScheme() === 'dark' ||
      (this.colorScheme() === 'system' && this.systemPrefersDark()),
  );

  constructor() {
    const darkModeQuery = this.darkModeQuery();
    if (darkModeQuery) {
      const onChange = (event: MediaQueryListEvent): void =>
        this.systemPrefersDark.set(event.matches);
      darkModeQuery.addEventListener('change', onChange);
      this.destroyRef.onDestroy(() => darkModeQuery.removeEventListener('change', onChange));
    }

    effect(() => {
      const resolved = this.resolvedTheme();
      const dark = this.isDark();
      const tokens = this.mergedTokens(resolved, dark);
      this.scopeVersion();
      if (!this.isBrowser) return;
      this.applyRoot(resolved, tokens, dark);
      this.applyScopes();
    });

    this.destroyRef.onDestroy(() => this.cleanup());
  }

  /** @deprecated Use `setColorScheme()` instead. */
  setMode(mode: JThemeColorScheme): void {
    this.setColorScheme(mode);
  }

  setColorScheme(colorScheme: JThemeColorScheme): void {
    this.colorScheme.set(colorScheme);
    this.refresh();
  }

  toggle(): void {
    this.setColorScheme(this.isDark() ? 'light' : 'dark');
  }

  /** Switch to a registered identifier or a legacy/custom preset object. */
  setPreset(preset: JThemePresetSource): void {
    this.presetSource.set(preset);
    this.refresh();
  }

  /** Replace global semantic/foundation overrides. */
  applyTokens(tokens: JThemeTokens): void {
    this.tokenOverrides.set({ ...this.tokenOverrides(), ...tokens });
    this.refresh();
  }

  /** Replace global component-token groups. */
  applyComponentTokens(components: JComponentThemeTokens): void {
    this.componentOverrides.set({ ...this.componentOverrides(), ...components });
    this.refresh();
  }

  setPrimaryPalette(primary?: JPrimaryPaletteSource): void {
    this.primaryPalette.set(primary);
    this.refresh();
  }

  setSurfacePalette(surface?: JSurfacePaletteSource): void {
    this.surfacePalette.set(surface);
    this.refresh();
  }

  /** Restore provider defaults, clearing runtime overrides. */
  reset(): void {
    this.presetSource.set(this.options.preset ?? 'default');
    this.colorScheme.set(this.options.colorScheme ?? this.config.themeMode);
    this.tokenOverrides.set(this.options.tokens ?? {});
    this.componentOverrides.set(this.options.components ?? {});
    this.primaryPalette.set(this.options.primary);
    this.surfacePalette.set(this.options.surface);
    this.refresh();
  }

  /**
   * Apply an independently configurable theme to a container. The returned
   * handle owns only attributes and variables it applies.
   */
  createScope(target: HTMLElement, options: JThemeScopeOptions = {}): JThemeScope {
    const id = `j-theme-scope-${++this.nextScopeId}`;
    const record: ScopeRecord = { id, target, options, managed: [] };
    this.scopes.set(id, record);
    this.refreshScopes();
    let destroyed = false;
    return {
      id,
      target,
      update: (next) => {
        if (destroyed) return;
        record.options = next;
        this.refreshScopes();
      },
      reset: () => {
        if (destroyed) return;
        record.options = {};
        this.refreshScopes();
      },
      destroy: () => {
        if (destroyed) return;
        destroyed = true;
        this.clearScope(record);
        this.scopes.delete(id);
        this.bumpScopes();
      },
    };
  }

  /** Deterministic state that an SSR integration can serialize into the page. */
  getInitialState(): JThemeInitialState {
    const resolved = this.resolvedTheme();
    const light = jMergeThemeOverrides(
      resolved.light,
      this.tokenOverrides(),
      this.componentOverrides(),
    );
    const dark = jMergeThemeOverrides(
      resolved.dark,
      this.tokenOverrides(),
      this.componentOverrides(),
    );
    return {
      preset: resolved.presetId,
      colorScheme: this.colorScheme(),
      darkClass: this.darkClass,
      css: `:root{${jThemeDeclarations(light)}}:root.${this.darkClass}{${jThemeDeclarations(dark)}}`,
    };
  }

  getToken(name: string, target?: HTMLElement): string {
    if (!this.isBrowser) return '';
    return (
      this.documentRef.defaultView
        ?.getComputedStyle(target ?? this.documentRef.documentElement)
        .getPropertyValue(name)
        .trim() ?? ''
    );
  }

  private mergedTokens(resolved: JResolvedTheme, dark: boolean): JThemeTokens {
    return jMergeThemeOverrides(
      dark ? resolved.dark : resolved.light,
      this.tokenOverrides(),
      this.componentOverrides(),
    );
  }

  private refresh(): void {
    if (!this.isBrowser) return;
    const resolved = this.resolvedTheme();
    this.applyRoot(resolved, this.mergedTokens(resolved, this.isDark()), this.isDark());
    this.applyScopes();
  }

  private refreshScopes(): void {
    this.bumpScopes();
    if (this.isBrowser) this.applyScopes();
  }

  private applyRoot(resolved: JResolvedTheme, tokens: JThemeTokens, dark: boolean): void {
    const root = this.documentRef.documentElement;
    root.classList.toggle(this.darkClass, dark);
    root.dataset['jThemePreset'] = resolved.presetId;
    root.dataset['jColorScheme'] = this.colorScheme();
    root.style.colorScheme = dark ? 'dark' : 'light';
    this.rootManagedTokens = jApplyThemeTokens(root, tokens, this.rootManagedTokens);

    let style = this.documentRef.getElementById(PRESET_STYLE_ID) as HTMLStyleElement | null;
    if (!style) {
      style = this.documentRef.createElement('style');
      style.id = PRESET_STYLE_ID;
      style.dataset['jThemeManaged'] = 'true';
      this.documentRef.head.appendChild(style);
    }
    const state = this.getInitialState();
    if (style.textContent !== state.css) style.textContent = state.css;
  }

  private applyScopes(): void {
    for (const record of this.scopes.values()) {
      const resolved = jApplyThemePalettes(
        jResolveTheme(this.registry.resolve(record.options.preset ?? this.presetSource())),
        record.options.primary ?? this.primaryPalette(),
        record.options.surface ?? this.surfacePalette(),
      );
      const scheme = record.options.colorScheme ?? this.colorScheme();
      const dark = scheme === 'dark' || (scheme === 'system' && this.systemPrefersDark());
      const tokens = jMergeThemeOverrides(
        dark ? resolved.dark : resolved.light,
        record.options.tokens,
        record.options.components,
      );
      record.target.dataset['jThemePreset'] = resolved.presetId;
      record.target.dataset['jColorScheme'] = scheme;
      record.target.classList.toggle(this.darkClass, dark);
      record.target.style.colorScheme = dark ? 'dark' : 'light';
      record.managed = jApplyThemeTokens(record.target, tokens, record.managed);
    }
  }

  private clearScope(record: ScopeRecord): void {
    for (const name of record.managed) record.target.style.removeProperty(name);
    record.target.classList.remove(this.darkClass);
    delete record.target.dataset['jThemePreset'];
    delete record.target.dataset['jColorScheme'];
    record.target.style.removeProperty('color-scheme');
    record.managed = [];
  }

  private cleanup(): void {
    if (!this.isBrowser) return;
    for (const record of this.scopes.values()) this.clearScope(record);
    this.scopes.clear();
    const root = this.documentRef.documentElement;
    for (const name of this.rootManagedTokens) root.style.removeProperty(name);
    root.classList.remove(this.darkClass);
    delete root.dataset['jThemePreset'];
    delete root.dataset['jColorScheme'];
    root.style.removeProperty('color-scheme');
    const style = this.documentRef.getElementById(PRESET_STYLE_ID);
    if (style?.dataset['jThemeManaged'] === 'true') style.remove();
  }

  private bumpScopes(): void {
    this.scopeVersion.update((version) => version + 1);
  }

  private prefersDark(): boolean {
    return this.darkModeQuery()?.matches ?? false;
  }

  private darkModeQuery(): MediaQueryList | null {
    const view = this.documentRef.defaultView;
    if (!this.isBrowser || typeof view?.matchMedia !== 'function') return null;
    return view.matchMedia('(prefers-color-scheme: dark)');
  }
}
