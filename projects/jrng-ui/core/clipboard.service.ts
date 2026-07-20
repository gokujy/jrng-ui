import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';

export type JClipboardStatus = 'success' | 'unavailable' | 'failed';

export interface JClipboardResult {
  readonly status: JClipboardStatus;
  readonly text: string;
  readonly error?: unknown;
}

@Injectable({ providedIn: 'root' })
export class JClipboardService {
  private readonly documentRef = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  async copyText(text: string): Promise<JClipboardResult> {
    if (!this.isBrowser) {
      return { status: 'unavailable', text };
    }

    const windowRef = this.documentRef.defaultView;

    try {
      const clipboard = windowRef?.navigator?.clipboard;
      if (clipboard?.writeText) {
        await clipboard.writeText(text);
        return { status: 'success', text };
      }

      if (this.copyWithTextArea(text)) {
        return { status: 'success', text };
      }

      return { status: 'unavailable', text };
    } catch (error) {
      return { status: 'failed', text, error };
    }
  }

  copyStructured(value: unknown, spacing = 2): Promise<JClipboardResult> {
    return this.copyText(typeof value === 'string' ? value : JSON.stringify(value, null, spacing));
  }

  private copyWithTextArea(text: string): boolean {
    const body = this.documentRef.body;
    const activeElement = this.documentRef.activeElement;

    if (!body || typeof this.documentRef.execCommand !== 'function') {
      return false;
    }

    const textarea = this.documentRef.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.left = '-9999px';
    textarea.style.opacity = '0';
    textarea.style.position = 'fixed';
    textarea.style.top = '0';

    body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);

    let copied = false;
    try {
      copied = this.documentRef.execCommand('copy');
    } finally {
      body.removeChild(textarea);
      const HTMLElementCtor = this.documentRef.defaultView?.HTMLElement;
      if (HTMLElementCtor && activeElement instanceof HTMLElementCtor) {
        activeElement.focus({ preventScroll: true });
      }
    }

    return copied;
  }
}
