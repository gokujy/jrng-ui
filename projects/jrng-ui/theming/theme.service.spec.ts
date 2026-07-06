import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { JThemeService } from './theme.service';

describe('JThemeService', () => {
  let service: JThemeService;
  let root: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JThemeService);
    root = TestBed.inject(DOCUMENT).documentElement;
    service.setMode('light');
    TestBed.tick(); // flush the class-sync effect
  });

  it('defaults to light mode', () => {
    expect(service.mode()).toBe('light');
    expect(service.isDark()).toBe(false);
    expect(root.classList.contains('j-dark')).toBe(false);
  });

  it('toggles dark mode and reflects it on the document root', () => {
    service.toggle();
    TestBed.tick();
    expect(service.isDark()).toBe(true);
    expect(root.classList.contains('j-dark')).toBe(true);

    service.toggle();
    TestBed.tick();
    expect(service.isDark()).toBe(false);
    expect(root.classList.contains('j-dark')).toBe(false);
  });

  it('applies token overrides as CSS custom properties on the root', () => {
    service.applyTokens({ '--j-color-primary': '#123456' });
    expect(root.style.getPropertyValue('--j-color-primary')).toBe('#123456');
  });

  it('setMode updates the resolved dark state', () => {
    service.setMode('dark');
    TestBed.tick();
    expect(service.isDark()).toBe(true);
    expect(root.classList.contains('j-dark')).toBe(true);
  });
});
