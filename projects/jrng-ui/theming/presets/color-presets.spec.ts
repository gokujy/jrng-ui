import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { JThemeService } from '../theme.service';
import { jThemePresets } from './color-presets';

describe('theme presets', () => {
  const names = Object.keys(jThemePresets) as (keyof typeof jThemePresets)[];

  it('exposes presets with complete light and dark palettes', () => {
    for (const name of names) {
      const preset = jThemePresets[name];
      expect(preset.name).toBe(name);
      for (const scope of [preset.light, preset.dark]) {
        expect(scope).toBeDefined();
        expect(scope!['--j-color-primary']).toMatch(/^#|rgb/);
        expect(scope!['--j-color-primary-foreground']).toBeDefined();
        expect(scope!['--j-color-ring']).toBeDefined();
      }
    }
  });

  it('setPreset injects a stylesheet carrying the preset tokens', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(JThemeService);
    const doc = TestBed.inject(DOCUMENT);

    service.setPreset(jThemePresets.emerald);
    const style = doc.getElementById('j-theme-preset');
    expect(style).not.toBeNull();
    expect(style!.textContent).toContain(jThemePresets.emerald.light!['--j-color-primary']);
    expect(style!.textContent).toContain('.j-dark{');
  });
});
