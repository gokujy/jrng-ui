import { afterEach, describe, expect, it, vi } from 'vitest';
import { jDebounce, jThrottle } from './timing';

describe('timing utilities', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('debounces calls and can flush the pending value', () => {
    vi.useFakeTimers();
    const calls: string[] = [];
    const debounced = jDebounce((value: string) => calls.push(value), 100);

    debounced('first');
    debounced('second');
    expect(calls).toEqual([]);

    debounced.flush();
    expect(calls).toEqual(['second']);
  });

  it('cancels pending debounce calls', () => {
    vi.useFakeTimers();
    const calls: string[] = [];
    const debounced = jDebounce((value: string) => calls.push(value), 100);

    debounced('value');
    debounced.cancel();
    vi.advanceTimersByTime(100);

    expect(calls).toEqual([]);
  });

  it('throttles calls and keeps the latest trailing value', () => {
    vi.useFakeTimers();
    const calls: string[] = [];
    const throttled = jThrottle((value: string) => calls.push(value), 100);

    throttled('first');
    throttled('second');
    throttled('third');
    vi.advanceTimersByTime(100);

    expect(calls).toEqual(['first', 'third']);
  });
});
