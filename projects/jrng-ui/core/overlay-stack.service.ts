import { Injectable } from '@angular/core';

/**
 * Tracks the stack of currently-open overlays (dialogs, drawers, popovers) so
 * that keyboard handling (notably Escape) only acts on the front-most one.
 * Without this, every open overlay listens for Escape independently and a single
 * press dismisses them all at once instead of just the topmost.
 */
@Injectable({ providedIn: 'root' })
export class JOverlayStackService {
  private readonly stack: object[] = [];

  /** Register an overlay as opened, moving it to the top of the stack. */
  push(ref: object): void {
    this.remove(ref);
    this.stack.push(ref);
  }

  /** Remove an overlay from the stack (on close or destroy). */
  remove(ref: object): void {
    const index = this.stack.indexOf(ref);
    if (index !== -1) {
      this.stack.splice(index, 1);
    }
  }

  /** Whether the given overlay is the front-most open overlay. */
  isTopmost(ref: object): boolean {
    return this.stack.length > 0 && this.stack[this.stack.length - 1] === ref;
  }
}
