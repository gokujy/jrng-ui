import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { JThemePresetRegistry } from '../theme-registry';
import { jResolveTheme } from '../theme-resolver';
import { defaultPreset } from './default.preset';

describe('Default theme preset', () => {
  it('is the official registry fallback', () => {
    TestBed.configureTestingModule({});
    const registry = TestBed.inject(JThemePresetRegistry);
    expect(registry.resolve('default')).toBe(defaultPreset);
    expect(defaultPreset.displayName).toBe('Default');
  });

  it('provides complete, distinct light and dark semantic schemes', () => {
    const resolved = jResolveTheme(defaultPreset);
    const required = [
      '--j-color-background',
      '--j-color-foreground',
      '--j-color-card',
      '--j-color-popover',
      '--j-color-border',
      '--j-color-primary',
      '--j-color-primary-foreground',
      '--j-color-success',
      '--j-color-info',
      '--j-color-warning',
      '--j-color-danger',
      '--j-color-disabled-background',
      '--j-color-disabled-text',
      '--j-color-ring',
      '--j-overlay-backdrop-bg',
    ] as const;
    for (const token of required) {
      expect(resolved.light[token], `${token} light`).toBeTruthy();
      expect(resolved.dark[token], `${token} dark`).toBeTruthy();
    }
    expect(resolved.light['--j-color-background']).not.toBe(resolved.dark['--j-color-background']);
  });

  it('covers representative component categories with semantic variables', () => {
    const resolved = jResolveTheme(defaultPreset);
    for (const token of [
      '--j-button-primary-bg',
      '--j-input-border-color',
      '--j-select-option-selected-bg',
      '--j-card-bg',
      '--j-dialog-shadow',
      '--j-menu-item-hover-bg',
      '--j-tabs-active-color',
      '--j-table-header-bg',
      '--j-toast-bg',
      '--j-tooltip-bg',
      '--j-progress-value-bg',
      '--j-skeleton-bg',
      '--j-scheduler-bg',
      '--j-scheduler-selection-bg',
      '--j-scheduler-resource-rail-bg',
    ] as const) {
      expect(resolved.light[token]).toContain('var(--j-');
      expect(resolved.dark[token]).toContain('var(--j-');
    }
  });

  it('keeps accessible control sizing and visible focus defaults', () => {
    const resolved = jResolveTheme(defaultPreset);
    expect(resolved.light['--j-control-height-md']).toBe('2.5rem');
    expect(resolved.light['--j-focus-ring']).toContain('3px');
    expect(resolved.light['--j-disabled-opacity']).toBe('0.58');
  });
});
