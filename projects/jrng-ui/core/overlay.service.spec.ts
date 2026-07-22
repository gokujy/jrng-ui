import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { provideJrngUI } from './config';
import { JOverlayService } from './overlay.service';

describe('JOverlayService', () => {
  afterEach(() => {
    document.querySelectorAll('[data-test-overlay]').forEach((element) => element.remove());
    TestBed.resetTestingModule();
  });

  it('resolves body, element and selector targets and safely rejects invalid selectors', () => {
    const target = document.createElement('div');
    target.id = 'overlay-target';
    target.dataset['testOverlay'] = '';
    document.body.appendChild(target);
    TestBed.configureTestingModule({ providers: [provideJrngUI()] });
    const service = TestBed.inject(JOverlayService);

    expect(service.resolveTarget('body')).toBe(document.body);
    expect(service.resolveTarget(target)).toBe(target);
    expect(service.resolveTarget('#overlay-target')).toBe(target);
    expect(service.resolveTarget('[')).toBeNull();
    expect(service.resolveTarget('#missing')).toBeNull();
  });

  it('uses the global append target and restores the Angular-owned node on detach', () => {
    const target = document.createElement('div');
    target.id = 'global-target';
    target.dataset['testOverlay'] = '';
    document.body.appendChild(target);
    TestBed.configureTestingModule({ providers: [provideJrngUI({ appendTo: '#global-target' })] });
    const service = TestBed.inject(JOverlayService);
    const owner = document.createElement('div');
    const trigger = document.createElement('button');
    const panel = document.createElement('div');
    owner.append(trigger, panel);
    document.body.appendChild(owner);
    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
      top: 10,
      bottom: 30,
      left: 20,
      width: 100,
      height: 20,
      right: 120,
      x: 20,
      y: 10,
      toJSON: () => ({}),
    });

    const handle = service.attach(trigger, panel);
    expect(panel.parentElement).toBe(target);
    expect(panel.style.position).toBe('fixed');
    handle.detach();
    expect(panel.parentElement).toBe(owner);
    owner.remove();
  });

  it('is a no-op on the server and never reads browser constructors', () => {
    TestBed.configureTestingModule({
      providers: [provideJrngUI(), { provide: PLATFORM_ID, useValue: 'server' }],
    });
    const service = TestBed.inject(JOverlayService);
    const trigger = document.createElement('button');
    const panel = document.createElement('div');
    expect(() => service.attach(trigger, panel, { appendTo: 'body' }).reposition()).not.toThrow();
    expect(service.resolveTarget('body')).toBeNull();
  });
});
