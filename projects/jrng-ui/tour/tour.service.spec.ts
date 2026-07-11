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
});
