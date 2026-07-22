import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';

/**
 * Isolated browser editing-command adapter pending the Selection/Range engine.
 * Keeping commands behind this boundary allows a future Selection/Range
 * implementation without changing JEditorComponent's public API.
 */
@Injectable({ providedIn: 'root' })
export class JEditorCommandService {
  private readonly documentRef = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  execute(command: string, value?: string): boolean {
    if (!this.isBrowser || typeof this.documentRef.execCommand !== 'function') {
      return false;
    }

    const supports = this.documentRef.queryCommandSupported;
    if (typeof supports === 'function') {
      try {
        if (!supports.call(this.documentRef, command)) return false;
      } catch {
        return false;
      }
    }

    try {
      return this.documentRef.execCommand(command, false, value);
    } catch {
      return false;
    }
  }
}
