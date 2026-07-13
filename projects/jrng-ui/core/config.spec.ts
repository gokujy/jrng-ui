import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { JRNG_CONFIG, JRNG_DEFAULT_CONFIG, jMergeConfig, provideJrngUI } from './config';

describe('JRNG UI configuration', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('data-j-density');
    document.documentElement.removeAttribute('data-j-input-style');
    document.documentElement.removeAttribute('data-j-locale');
    document.documentElement.classList.remove('j-dark', 'j-unstyled', 'j-animations-disabled');
    TestBed.resetTestingModule();
  });

  it('immutably merges partial configuration and nested z-index values', () => {
    const input = { density: 'compact' as const, zIndex: { modal: 5000 } };
    const merged = jMergeConfig(input);
    expect(merged.density).toBe('compact');
    expect(merged.zIndex.modal).toBe(5000);
    expect(merged.zIndex.dropdown).toBe(JRNG_DEFAULT_CONFIG.zIndex.dropdown);
    expect(input).toEqual({ density: 'compact', zIndex: { modal: 5000 } });
    expect(merged.zIndex).not.toBe(input.zIndex);
  });

  it('provides one merged config and applies browser-wide behavior hooks', () => {
    TestBed.configureTestingModule({
      providers: [
        provideJrngUI({
          themeMode: 'dark',
          inputStyle: 'filled',
          density: 'compact',
          animation: 'disabled',
          unstyled: true,
          locale: 'de-DE',
        }),
      ],
    });
    const config = TestBed.inject(JRNG_CONFIG);
    expect(config.inputStyle).toBe('filled');
    expect(document.documentElement.dataset['jDensity']).toBe('compact');
    expect(document.documentElement.dataset['jInputStyle']).toBe('filled');
    expect(document.documentElement.dataset['jLocale']).toBe('de-DE');
    expect(document.documentElement.classList.contains('j-dark')).toBe(true);
    expect(document.documentElement.classList.contains('j-animations-disabled')).toBe(true);
    expect(document.documentElement.classList.contains('j-unstyled')).toBe(true);
  });
});
