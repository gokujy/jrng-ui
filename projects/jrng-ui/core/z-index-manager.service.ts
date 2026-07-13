import { Injectable } from '@angular/core';

/**
 * Allocates z-index values while preserving the semantic layering of the base
 * bands (dropdown < overlay < modal < popover < toast < tooltip). Each base has
 * its own counter, so a value handed out for a higher base is always above one
 * from a lower base regardless of open order — a dropdown opened after a modal
 * still renders below it. Within the same base, later requests stack on top.
 */
@Injectable({ providedIn: 'root' })
export class JZIndexManagerService {
  private readonly offsets = new Map<number, number>();

  next(base = 1000): number {
    const offset = (this.offsets.get(base) ?? 0) + 1;
    this.offsets.set(base, offset);
    return base + offset;
  }

  reset(): void {
    this.offsets.clear();
  }
}
