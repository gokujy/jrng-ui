import { DOCUMENT } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { JThemePresetRegistry } from '../theme-registry';
import { jResolveTheme } from '../theme-resolver';
import { JThemeService } from '../theme.service';
import { nexusPreset } from './nexus.preset';

describe('Nexus enterprise theme preset', () => {
  it('is registered under its official identifier', () => {
    TestBed.configureTestingModule({});
    expect(TestBed.inject(JThemePresetRegistry).resolve('nexus')).toBe(nexusPreset);
    expect(nexusPreset.displayName).toBe('Nexus');
  });

  it('has complete light and dark semantic contracts', () => {
    const resolved = jResolveTheme(nexusPreset);
    expect(Object.keys(resolved.light)).toEqual(Object.keys(resolved.dark));
    for (const token of [
      '--j-color-background',
      '--j-color-card',
      '--j-color-border',
      '--j-color-primary',
      '--j-color-ring',
      '--j-color-disabled-text',
    ] as const) {
      expect(resolved.light[token]).toBeTruthy();
      expect(resolved.dark[token]).toBeTruthy();
    }
  });

  it('defines compact accessible controls and enterprise density', () => {
    const tokens = jResolveTheme(nexusPreset).light;
    expect(tokens['--j-control-height-md']).toBe('2.25rem');
    expect(tokens['--j-control-min-target']).toBe('1.5rem');
    expect(tokens['--j-table-row-height']).toBe('2.25rem');
    expect(tokens['--j-menu-item-height']).toBe('2rem');
    expect(tokens['--j-scheduler-resource-rail-bg']).toBe('var(--j-color-surface-subtle)');
    for (const token of [
      '--j-toolbar-height',
      '--j-chip-height',
      '--j-kanban-card-padding',
      '--j-gantt-row-height',
      '--j-scheduler-row-height',
      '--j-file-browser-row-height',
      '--j-query-builder-row-gap',
    ] as const) {
      expect(tokens[token]).toBeTruthy();
    }
  });

  it('does not add application layout responsibilities', () => {
    const serialized = JSON.stringify(nexusPreset);
    for (const unsupportedProperty of [
      'menuMode',
      'staticMenu',
      'overlayMenu',
      'sidebarType',
      'topbarConfig',
      'userPreferences',
      'localStorage',
    ]) {
      expect(serialized).not.toContain(unsupportedProperty);
    }
  });

  it('switches at runtime and maintains an RTL-neutral scope', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(JThemeService);
    const scopeElement = TestBed.inject(DOCUMENT).createElement('section');
    scopeElement.dir = 'rtl';
    const scope = service.createScope(scopeElement, {
      preset: 'nexus',
      colorScheme: 'dark',
    });
    expect(scopeElement.dir).toBe('rtl');
    expect(scopeElement.dataset['jThemePreset']).toBe('nexus');
    expect(scopeElement.style.getPropertyValue('--j-table-row-height')).toBe('2.25rem');
    scope.destroy();
  });

  it('resolves deterministic Nexus CSS during SSR', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    });
    const service = TestBed.inject(JThemeService);
    service.setPreset('nexus');
    const state = service.getInitialState();
    expect(state.preset).toBe('nexus');
    expect(state.css).toContain('--j-table-row-height:2.25rem;');
  });
});
