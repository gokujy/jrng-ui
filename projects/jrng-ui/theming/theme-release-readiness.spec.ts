import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { JThemePresetId } from './preset.types';
import { JThemePresetRegistry } from './theme-registry';
import { jResolveTheme } from './theme-resolver';
import { JThemeService } from './theme.service';

describe('theme release readiness', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('keeps the official registry limited to complete Default, Material, and Nexus presets', () => {
    const registry = TestBed.configureTestingModule({}).inject(JThemePresetRegistry);
    const presets = registry.list();
    expect(presets.map((preset) => preset.id)).toEqual(['default', 'material', 'nexus']);
    expect(presets.map((preset) => preset.displayName)).toEqual(['Default', 'Material', 'Nexus']);

    for (const preset of presets) {
      const resolved = jResolveTheme(preset);
      const lightKeys = Object.keys(resolved.light).sort();
      const darkKeys = Object.keys(resolved.dark).sort();
      expect(lightKeys.length).toBeGreaterThan(30);
      expect(darkKeys).toEqual(lightKeys);
      expect(Object.values(resolved.light).every(Boolean)).toBe(true);
      expect(Object.values(resolved.dark).every(Boolean)).toBe(true);
    }
  });

  it('switches all six preset and explicit scheme combinations without duplicate styles', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(JThemeService);
    const root = TestBed.inject(DOCUMENT).documentElement;
    const presets: readonly JThemePresetId[] = ['default', 'material', 'nexus'];

    for (const preset of presets) {
      for (const colorScheme of ['light', 'dark'] as const) {
        service.setPreset(preset);
        service.setColorScheme(colorScheme);
        expect(root.dataset['jThemePreset']).toBe(preset);
        expect(root.dataset['jColorScheme']).toBe(colorScheme);
        expect(root.classList.contains('j-dark')).toBe(colorScheme === 'dark');
        expect(root.style.getPropertyValue('--j-color-background')).toBeTruthy();
        expect(root.style.getPropertyValue('--j-focus-ring')).toContain('3px');
      }
    }

    service.setColorScheme('system');
    expect(service.colorScheme()).toBe('system');
    expect(document.querySelectorAll('style#j-theme-preset')).toHaveLength(1);
  });

  it('keeps scoped RTL state and application-owned attributes through switching and cleanup', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(JThemeService);
    const target = document.createElement('section');
    target.dir = 'rtl';
    target.dataset['applicationLayout'] = 'unchanged';

    const scope = service.createScope(target, { preset: 'default', colorScheme: 'light' });
    scope.update({ preset: 'material', colorScheme: 'dark' });
    scope.update({ preset: 'nexus', colorScheme: 'light' });
    expect(target.dir).toBe('rtl');
    expect(target.dataset['applicationLayout']).toBe('unchanged');
    expect(target.dataset['jThemePreset']).toBe('nexus');

    scope.destroy();
    expect(target.dir).toBe('rtl');
    expect(target.dataset['applicationLayout']).toBe('unchanged');
    expect(target.dataset['jThemePreset']).toBeUndefined();
  });
});
