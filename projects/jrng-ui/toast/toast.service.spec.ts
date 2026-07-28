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

  it('normalizes malformed runtime severity, position, and duration values', () => {
    const toast = service.show({
      severity: 'unknown',
      position: 'center',
      life: Number.POSITIVE_INFINITY,
    } as never);

    expect(toast.severity).toBe('info');
    expect(toast.position).toBe('top-right');
    expect(toast.life).toBe(5000);
  });

  it('pauses and resumes automatic dismissal with the remaining duration', () => {
    vi.useFakeTimers();
    const toast = service.info('Queued', 'Info', 50);
    vi.advanceTimersByTime(20);
    service.pause(toast.id);
    vi.advanceTimersByTime(100);
    expect(service.toasts()).toHaveLength(1);

    service.resume(toast.id);
    vi.advanceTimersByTime(29);
    expect(service.toasts()).toHaveLength(1);
    vi.advanceTimersByTime(1);
    expect(service.toasts()).toHaveLength(0);
    vi.useRealTimers();
  });
});
