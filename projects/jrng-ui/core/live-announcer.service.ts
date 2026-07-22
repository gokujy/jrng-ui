import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, OnDestroy, PLATFORM_ID, inject } from '@angular/core';

export type JLiveAnnouncerPoliteness = 'polite' | 'assertive';

@Injectable({ providedIn: 'root' })
export class JLiveAnnouncerService implements OnDestroy {
  private readonly documentRef = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private liveElement: HTMLElement | null = null;
  private clearTimer: ReturnType<typeof setTimeout> | null = null;

  announce(message: string, politeness: JLiveAnnouncerPoliteness = 'polite'): void {
    const element = this.getLiveElement();
    if (!element) return;

    if (this.clearTimer) clearTimeout(this.clearTimer);
    element.setAttribute('aria-live', politeness);
    element.textContent = '';
    queueMicrotask(() => {
      if (this.liveElement === element) element.textContent = message;
    });
  }

  clear(delayMs = 0): void {
    if (this.clearTimer) clearTimeout(this.clearTimer);
    this.clearTimer = setTimeout(
      () => {
        if (this.liveElement) this.liveElement.textContent = '';
        this.clearTimer = null;
      },
      Math.max(0, delayMs),
    );
  }

  ngOnDestroy(): void {
    if (this.clearTimer) clearTimeout(this.clearTimer);
    this.liveElement?.remove();
    this.liveElement = null;
  }

  private getLiveElement(): HTMLElement | null {
    if (!this.isBrowser) return null;
    if (this.liveElement) return this.liveElement;

    const element = this.documentRef.createElement('div');
    element.className = 'j-sr-only';
    element.setAttribute('aria-atomic', 'true');
    element.setAttribute('aria-live', 'polite');
    this.documentRef.body.append(element);
    this.liveElement = element;
    return element;
  }
}
