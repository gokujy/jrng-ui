import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { JMediaQueryService } from './media-query.service';

describe('JMediaQueryService', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  it('reports matches and cleans up listeners', () => {
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();
    const matchMedia = vi.fn().mockReturnValue({
      matches: true,
      media: '(min-width: 768px)',
      addEventListener,
      removeEventListener,
    });
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: matchMedia,
    });

    const service = TestBed.inject(JMediaQueryService);
    const states: boolean[] = [];
    const subscription = service.observe('(min-width: 768px)').subscribe((state) => {
      states.push(state.matches);
    });

    subscription.unsubscribe();

    expect(states).toEqual([true]);
    expect(addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    expect(removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });
});
