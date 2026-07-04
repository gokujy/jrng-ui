import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class JBodyScrollLockService {
  private readonly documentRef = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private lockCount = 0;
  private previousOverflow = '';

  lock(): void {
    const body = this.body;

    if (!body) {
      return;
    }

    this.lockCount += 1;

    if (this.lockCount > 1) {
      return;
    }

    this.previousOverflow = body.style.overflow;
    body.style.overflow = 'hidden';
  }

  unlock(): void {
    const body = this.body;

    if (!body) {
      this.lockCount = 0;
      this.previousOverflow = '';
      return;
    }

    if (this.lockCount === 0) {
      return;
    }

    this.lockCount -= 1;

    if (this.lockCount === 0) {
      body.style.overflow = this.previousOverflow;
      this.previousOverflow = '';
    }
  }

  clear(): void {
    const body = this.body;

    this.lockCount = 0;

    if (body) {
      body.style.overflow = this.previousOverflow;
    }

    this.previousOverflow = '';
  }

  private get body(): HTMLElement | null {
    return this.isBrowser ? this.documentRef.body : null;
  }
}
