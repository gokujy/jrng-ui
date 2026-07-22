import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { JToastService } from './toast.service';

describe('JToastService', () => {
  let service: JToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JToastService);
    service.clear();
  });

  it('adds a toast', () => {
    const toast = service.success('Saved', 'Done', 0);

    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0]).toEqual(toast);
    expect(service.toasts()[0]?.type).toBe('success');
  });

  it('removes a toast by id', () => {
    const toast = service.error('Failed', 'Problem', 0);

    service.remove(toast.id);

    expect(service.toasts()).toEqual([]);
  });

  it('auto dismisses after the configured duration', () => {
    vi.useFakeTimers();
    service.info('Queued', 'Info', 25);

    vi.advanceTimersByTime(24);
    expect(service.toasts().length).toBe(1);

    vi.advanceTimersByTime(1);
    expect(service.toasts().length).toBe(0);
    vi.useRealTimers();
  });

  it('supports multiple toasts', () => {
    service.success('Saved', 'Done', 0);
    service.warning('Review', 'Warning', 0);

    expect(service.toasts().map((toast) => toast.type)).toEqual(['success', 'warning']);
  });
});
