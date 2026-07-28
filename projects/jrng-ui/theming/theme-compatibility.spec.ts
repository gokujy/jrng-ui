import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideJrngUI } from 'jrng-ui/core';
import { afterEach, describe, expect, it } from 'vitest';
import { provideJrngTheme } from './provide-theme';
import { jThemePresets } from './presets/color-presets';
import { JThemePresetRegistry } from './theme-registry';
import { JThemeService } from './theme.service';

describe('theme backward compatibility', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('uses the legacy provideJrngUI themeMode when colorScheme is omitted', () => {
    TestBed.configureTestingModule({
      providers: [provideJrngUI({ themeMode: 'dark' }), provideJrngTheme()],
    });

    const service = TestBed.inject(JThemeService);
    expect(service.mode()).toBe('dark');
    expect(service.colorScheme()).toBe('dark');
    expect(service.isDark()).toBe(true);
  });

  it('lets explicit new colorScheme override the legacy global themeMode', () => {
    TestBed.configureTestingModule({
      providers: [
        provideJrngUI({ themeMode: 'dark' }),
        provideJrngTheme({ preset: 'material', colorScheme: 'light' }),
      ],
    });

    const service = TestBed.inject(JThemeService);
    expect(service.colorScheme()).toBe('light');
    expect(service.presetId()).toBe('material');
  });

  it('continues to accept legacy colour preset objects at runtime', () => {
    TestBed.configureTestingModule({ providers: [provideJrngTheme()] });
    const service = TestBed.inject(JThemeService);
    const root = TestBed.inject(DOCUMENT).documentElement;

    service.setMode('light');
    service.setPreset(jThemePresets.emerald);

    expect(service.presetId()).toBe('emerald');
    expect(root.style.getPropertyValue('--j-color-primary')).toBe(
      jThemePresets.emerald.light?.['--j-color-primary'],
    );
  });

  it('continues to accept a legacy preset object during provider setup', () => {
    TestBed.configureTestingModule({
      providers: [
        provideJrngTheme({
          preset: jThemePresets.violet,
          colorScheme: 'dark',
          tokens: { '--j-color-card': '#15131b' },
        }),
      ],
    });

    const service = TestBed.inject(JThemeService);
    const root = TestBed.inject(DOCUMENT).documentElement;
    TestBed.tick();
    expect(service.presetId()).toBe('violet');
    expect(root.style.getPropertyValue('--j-color-card')).toBe('#15131b');
  });

  it('emits established CSS aliases for every official preset', () => {
    const registry = TestBed.configureTestingModule({}).inject(JThemePresetRegistry);

    for (const id of ['default', 'material', 'nexus'] as const) {
      const preset = registry.resolve(id);
      expect(preset.aliases).toEqual(
        expect.objectContaining({
          '--j-color-focus': '--j-color-primary',
          '--j-input-color': '--j-input-text-color',
          '--j-highlight-background': '--j-color-highlight-background',
        }),
      );
    }
  });
});
