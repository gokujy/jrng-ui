import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { JTourService } from './tour.service';
import { JTourEvent } from './tour.types';

describe('JTourService', () => {
  it('emits and callbacks missing target errors without starting a tour', async () => {
    const service = TestBed.inject(JTourService);
    const events: JTourEvent[] = [];
    const onError = vi.fn();
    const subscription = service.events$.subscribe((event) => events.push(event));

    await service.start({
      id: 'missing-target',
      steps: [{ element: '#missing-target', title: 'Missing target' }],
      onError,
    });

    subscription.unsubscribe();
    expect(service.isActive()).toBe(false);
    expect(service.lastError()).toBe('Tour target was not found: #missing-target');
    expect(events.some((event) => event.type === 'error')).toBe(true);
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'error',
        tourId: 'missing-target',
        error: 'Tour target was not found: #missing-target',
      }),
    );
  });

  it('does not execute during SSR', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    });

    const service = TestBed.inject(JTourService);
    await service.start({ steps: [{ title: 'Server rendered' }] });

    expect(service.isActive()).toBe(false);
    expect(service.activeIndex()).toBe(-1);
  });

  it('runs native steps, supports navigation, and cleans up on completion', async () => {
    TestBed.resetTestingModule();
    const service = TestBed.inject(JTourService);
    const first = document.createElement('button');
    const second = document.createElement('button');
    first.id = 'tour-first';
    second.id = 'tour-second';
    document.body.append(first, second);
    const events: string[] = [];
    const subscription = service.events$.subscribe((event) => events.push(event.type));

    await service.start({
      id: 'native-tour',
      animate: false,
      steps: [
        { element: '#tour-first', title: 'First' },
        { element: '#tour-second', title: 'Second' },
      ],
    });
    expect(service.isActive()).toBe(true);
    expect(service.currentStep()?.title).toBe('First');

    await service.next();
    expect(service.activeIndex()).toBe(1);
    expect(service.currentStep()?.title).toBe('Second');

    await service.complete();
    expect(service.isActive()).toBe(false);
    expect(service.currentStep()).toBeNull();
    expect(events).toEqual(expect.arrayContaining(['start', 'next', 'complete', 'destroy']));

    subscription.unsubscribe();
    first.remove();
    second.remove();
    localStorage.removeItem('jrng-tour:native-tour');
  });

  it('continues without persistence when localStorage is unavailable', async () => {
    TestBed.resetTestingModule();
    const storage = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Blocked');
    });
    const service = TestBed.inject(JTourService);

    await service.start({
      id: 'storage-blocked',
      showOnce: true,
      steps: [{ title: 'Available without storage' }],
    });

    expect(service.isActive()).toBe(true);
    expect(service.lastError()).toBe('Tour persistence storage is unavailable.');
    service.destroy();
    storage.mockRestore();
  });

  it('normalizes invalid programmatic indexes and stage padding', async () => {
    TestBed.resetTestingModule();
    const service = TestBed.inject(JTourService);
    const target = document.createElement('div');
    target.id = 'tour-normalized';
    Object.defineProperty(target, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({ top: 10, left: 20, width: 100, height: 50 }),
    });
    document.body.append(target);

    await service.start({
      stagePadding: Number.NaN,
      steps: [
        { element: target, title: 'First' },
        { element: target, title: 'Second' },
      ],
    });
    await service.goTo(Number.NaN);

    expect(service.activeIndex()).toBe(0);
    expect(service.targetRect()).toEqual({ top: 2, left: 12, width: 116, height: 66 });
    service.destroy();
    target.remove();
  });
});
