import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { defaultPreset } from './presets/default.preset';
import { jApplyThemePalettes, jPrimaryPalettes, jResolvePrimaryPalette } from './theme-palettes';
import { jResolveTheme } from './theme-resolver';
import { JThemeService } from './theme.service';

describe('theme palette customization', () => {
  it('resolves every approved primary palette', () => {
    for (const name of ['blue', 'indigo', 'violet', 'emerald', 'teal', 'orange', 'rose'] as const) {
      expect(jResolvePrimaryPalette(name)).toBe(jPrimaryPalettes[name]);
      expect(jPrimaryPalettes[name]['600']).toMatch(/^#/);
    }
  });

  it('fills missing custom steps and ignores empty steps predictably', () => {
    const palette = jResolvePrimaryPalette({
      '400': '#44aaaa',
      '600': '',
      '700': '#116666',
    });
    expect(palette?.['400']).toBe('#44aaaa');
    expect(palette?.['600']).toBe(jPrimaryPalettes.indigo['600']);
    expect(palette?.['700']).toBe('#116666');
  });

  it('derives light/dark primary relationships after preset values', () => {
    const resolved = jApplyThemePalettes(jResolveTheme(defaultPreset), 'emerald');
    expect(resolved.light['--j-color-primary']).toBe(jPrimaryPalettes.emerald['600']);
    expect(resolved.dark['--j-color-primary']).toBe(jPrimaryPalettes.emerald['400']);
    expect(resolved.light['--j-color-ring']).toContain(jPrimaryPalettes.emerald['600']!);
  });

  it('maps complete surface roles for light and dark', () => {
    const resolved = jApplyThemePalettes(jResolveTheme(defaultPreset), undefined, 'warm');
    expect(resolved.light['--j-color-background']).toBe('#faf8f4');
    expect(resolved.light['--j-color-card']).toBe('#fffefa');
    expect(resolved.dark['--j-color-popover']).toBe('#28211a');
    expect(resolved.dark['--j-color-hover-background']).toBe('#352c23');
  });

  it('updates palettes at runtime and resets to preset defaults', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(JThemeService);
    const root = TestBed.inject(DOCUMENT).documentElement;
    service.setPreset('material');
    service.setPrimaryPalette('rose');
    service.setSurfacePalette('neutral');
    expect(root.style.getPropertyValue('--j-color-primary')).toBe(jPrimaryPalettes.rose['600']);
    expect(root.style.getPropertyValue('--j-color-background')).toBe('#f7f7f7');
    service.reset();
    expect(root.style.getPropertyValue('--j-color-primary')).toBe(
      defaultPreset.light?.['--j-color-primary'],
    );
  });

  it('applies palettes independently inside a scope', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(JThemeService);
    const container = document.createElement('section');
    const scope = service.createScope(container, {
      preset: 'nexus',
      primary: 'orange',
      surface: 'warm',
      colorScheme: 'dark',
    });
    expect(container.style.getPropertyValue('--j-color-primary')).toBe(
      jPrimaryPalettes.orange['400'],
    );
    expect(container.style.getPropertyValue('--j-color-background')).toBe('#17130f');
    scope.destroy();
  });
});
