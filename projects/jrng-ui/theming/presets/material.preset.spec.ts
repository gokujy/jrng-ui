import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { JThemePresetRegistry } from '../theme-registry';
import { jResolveTheme } from '../theme-resolver';
import { JThemeService } from '../theme.service';
import { defaultPreset } from './default.preset';
import { materialPreset } from './material.preset';

describe('Material theme preset', () => {
  it('is registered under its official identifier', () => {
    TestBed.configureTestingModule({});
    expect(TestBed.inject(JThemePresetRegistry).resolve('material')).toBe(materialPreset);
    expect(materialPreset.displayName).toBe('Material');
  });

  it('has complete light and dark contracts distinct from Default', () => {
    const material = jResolveTheme(materialPreset);
    const jrngDefault = jResolveTheme(defaultPreset);
    expect(Object.keys(material.light)).toEqual(Object.keys(material.dark));
    expect(material.light['--j-color-primary']).not.toBe(jrngDefault.light['--j-color-primary']);
    expect(material.light['--j-radius-md']).not.toBe(jrngDefault.light['--j-radius-md']);
    expect(material.light['--j-shadow-md']).not.toBe(jrngDefault.light['--j-shadow-md']);
  });

  it('switches without a reload and retains token overrides', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(JThemeService);
    const root = TestBed.inject(DOCUMENT).documentElement;
    service.applyTokens({ '--j-color-primary': '#123a8c' });
    service.setPreset('material');
    service.setColorScheme('dark');
    expect(service.presetId()).toBe('material');
    expect(root.dataset['jThemePreset']).toBe('material');
    expect(root.classList.contains('j-dark')).toBe(true);
    expect(root.style.getPropertyValue('--j-color-primary')).toBe('#123a8c');
  });

  it('provides structured form, data, navigation, overlay, and motion tokens', () => {
    const resolved = jResolveTheme(materialPreset).light;
    for (const token of [
      '--j-control-height-md',
      '--j-input-radius',
      '--j-table-header-bg',
      '--j-menu-item-height',
      '--j-tabs-active-indicator-size',
      '--j-dialog-shadow',
      '--j-overlay-radius',
      '--j-ripple-duration',
    ] as const) {
      expect(resolved[token]).toBeTruthy();
    }
  });
});
