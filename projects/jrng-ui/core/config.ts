import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  InjectionToken,
  PLATFORM_ID,
  inject,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
} from '@angular/core';
import { JDensity } from './types';

export type JThemeMode = 'light' | 'dark' | 'system';
export type JInputStyle = 'outlined' | 'filled';
export type JAnimationMode = 'enabled' | 'disabled';
export type JAppendTo = 'self' | 'body' | HTMLElement | string;

export interface JZIndexConfig {
  readonly base: number;
  readonly dropdown: number;
  readonly sticky: number;
  readonly overlay: number;
  readonly modal: number;
  readonly popover: number;
  readonly toast: number;
  readonly tooltip: number;
}

export interface JConfig {
  readonly themeMode: JThemeMode;
  readonly inputStyle: JInputStyle;
  readonly ripple: boolean;
  readonly locale: string;
  readonly zIndex: JZIndexConfig;
  readonly appendTo: JAppendTo;
  readonly animation: JAnimationMode;
  readonly density: JDensity;
}

export type JConfigInput = Partial<Omit<JConfig, 'zIndex'>> & {
  readonly zIndex?: Partial<JZIndexConfig>;
};

export const JRNG_DEFAULT_CONFIG: JConfig = {
  themeMode: 'light',
  inputStyle: 'outlined',
  ripple: true,
  locale: 'en',
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    overlay: 1040,
    modal: 1060,
    popover: 1080,
    toast: 1100,
    tooltip: 1120,
  },
  appendTo: 'self',
  animation: 'enabled',
  density: 'comfortable',
};

export const JRNG_CONFIG = new InjectionToken<JConfig>('JRNG_CONFIG', {
  providedIn: 'root',
  factory: () => JRNG_DEFAULT_CONFIG,
});

export function jMergeConfig(config: JConfigInput = {}): JConfig {
  return {
    ...JRNG_DEFAULT_CONFIG,
    ...config,
    zIndex: {
      ...JRNG_DEFAULT_CONFIG.zIndex,
      ...(config.zIndex ?? {}),
    },
  };
}

export function provideJrngUI(config: JConfigInput = {}) {
  const merged = jMergeConfig(config);
  return makeEnvironmentProviders([
    {
      provide: JRNG_CONFIG,
      useValue: merged,
    },
    provideEnvironmentInitializer(() => {
      if (!isPlatformBrowser(inject(PLATFORM_ID))) return;
      const root = inject(DOCUMENT).documentElement;
      root.dataset['jDensity'] = merged.density;
      root.dataset['jInputStyle'] = merged.inputStyle;
      root.dataset['jLocale'] = merged.locale;
      root.classList.toggle('j-animations-disabled', merged.animation === 'disabled');
      root.classList.toggle('j-dark', merged.themeMode === 'dark');
    }),
  ]);
}
