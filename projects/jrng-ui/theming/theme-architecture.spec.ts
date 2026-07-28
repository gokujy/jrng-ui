import { DOCUMENT } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { JThemePreset } from './preset.types';
import { jThemeDeclarations } from './theme-css';
import { JThemePresetRegistry } from './theme-registry';
import { jResolveTheme } from './theme-resolver';
import { JThemeService } from './theme.service';

const testPreset: JThemePreset = {
  id: 'test',
  name: 'Test',
  primitive: { '--j-spacing-test': '1rem' },
  semantic: { '--j-color-test': '#112233' },
  light: { '--j-color-surface-test': '#ffffff' },
  dark: { '--j-color-surface-test': '#101820' },
  components: { button: { '--j-button-test': '2.5rem' } },
  aliases: { '--j-legacy-test': '--j-color-test' },
};

describe('theme architecture', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('registers and unregisters presets', () => {
    TestBed.configureTestingModule({});
    const registry = TestBed.inject(JThemePresetRegistry);
    const unregister = registry.register(testPreset);
    expect(registry.get('test')).toBe(testPreset);
    unregister();
    expect(registry.get('test')).toBeUndefined();
  });

  it('falls back to Default for an unknown preset', () => {
    TestBed.configureTestingModule({});
    const registry = TestBed.inject(JThemePresetRegistry);
    expect(registry.resolve('missing').displayName).toBe('Default');
  });

  it('resolves stable layered output and aliases', () => {
    const resolved = jResolveTheme(testPreset);
    expect(resolved.light['--j-color-surface-test']).toBe('#ffffff');
    expect(resolved.dark['--j-color-surface-test']).toBe('#101820');
    expect(resolved.light['--j-button-test']).toBe('2.5rem');
    expect(resolved.light['--j-legacy-test']).toBe('var(--j-color-test)');
    expect(Object.keys(resolved.light)).toEqual([...Object.keys(resolved.light)].sort());
  });

  it('generates stable CSS variables and rejects invalid names', () => {
    expect(
      jThemeDeclarations({
        '--j-z': 'last',
        '--j-a': 'first',
        ['--external' as `--j-${string}`]: 'ignored',
      }),
    ).toBe('--j-a:first;--j-z:last;');
  });

  it('switches registered presets and applies semantic/component overrides', () => {
    TestBed.configureTestingModule({});
    const registry = TestBed.inject(JThemePresetRegistry);
    registry.register(testPreset);
    const service = TestBed.inject(JThemeService);
    const root = TestBed.inject(DOCUMENT).documentElement;

    service.setPreset('test');
    service.applyTokens({ '--j-color-test': '#445566' });
    service.applyComponentTokens({ button: { '--j-button-test': '3rem' } });

    expect(service.presetId()).toBe('test');
    expect(root.dataset['jThemePreset']).toBe('test');
    expect(root.style.getPropertyValue('--j-color-test')).toBe('#445566');
    expect(root.style.getPropertyValue('--j-button-test')).toBe('3rem');
  });

  it('supports light, dark, and system scheme state', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(JThemeService);
    service.setColorScheme('light');
    expect(service.isDark()).toBe(false);
    service.setColorScheme('dark');
    expect(service.isDark()).toBe(true);
    service.setColorScheme('system');
    expect(service.colorScheme()).toBe('system');
  });

  it('creates independent scopes and cleans up only managed state', () => {
    TestBed.configureTestingModule({});
    const registry = TestBed.inject(JThemePresetRegistry);
    registry.register(testPreset);
    const service = TestBed.inject(JThemeService);
    const container = document.createElement('section');
    container.style.setProperty('--application-token', 'keep');

    const scope = service.createScope(container, {
      preset: 'test',
      colorScheme: 'dark',
      tokens: { '--j-color-test': '#abcdef' },
    });
    expect(container.dataset['jThemePreset']).toBe('test');
    expect(container.classList.contains('j-dark')).toBe(true);
    expect(container.style.getPropertyValue('--j-color-test')).toBe('#abcdef');

    scope.destroy();
    expect(container.dataset['jThemePreset']).toBeUndefined();
    expect(container.style.getPropertyValue('--j-color-test')).toBe('');
    expect(container.style.getPropertyValue('--application-token')).toBe('keep');
  });

  it('reuses a single managed preset style', () => {
    TestBed.configureTestingModule({});
    const registry = TestBed.inject(JThemePresetRegistry);
    registry.register(testPreset);
    const service = TestBed.inject(JThemeService);
    service.setPreset('test');
    service.setPreset('default');
    service.setPreset('test');
    expect(document.querySelectorAll('style#j-theme-preset')).toHaveLength(1);
  });

  it('produces deterministic initial state without browser writes on SSR', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    });
    const service = TestBed.inject(JThemeService);
    const state = service.getInitialState();
    expect(state.preset).toBe('default');
    expect(state.colorScheme).toBe('light');
    expect(state.css).toContain(':root{');
  });
});
