import { describe, expect, it } from 'vitest';
import { JZIndexManagerService } from './z-index-manager.service';

describe('JZIndexManagerService', () => {
  it('hands out increasing values within a bucket', () => {
    const z = new JZIndexManagerService();
    expect(z.next(1000)).toBe(1001);
    expect(z.next(1000)).toBe(1002);
    expect(z.next(1000)).toBe(1003);
  });

  it('keeps a higher bucket above a lower one regardless of open order', () => {
    const z = new JZIndexManagerService();
    // A modal (base 1100) opens first...
    expect(z.next(1100)).toBe(1101);
    // ...then a dropdown (base 1000) opens later and must stay below the modal.
    expect(z.next(1000)).toBe(1001);
    expect(1001).toBeLessThan(1101);
  });

  it('reset clears all per-bucket counters', () => {
    const z = new JZIndexManagerService();
    z.next(1000);
    z.next(1000);
    z.reset();
    expect(z.next(1000)).toBe(1001);
  });
});
