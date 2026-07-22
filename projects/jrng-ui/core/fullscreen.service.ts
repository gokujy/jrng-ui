import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { DestroyRef, Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class JFullscreenService {
  private readonly documentRef = inject(DOCUMENT);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly destroyRef = inject(DestroyRef);
  readonly active = signal(false);
  readonly supported = signal(false);

  constructor() {
    this.supported.set(
      this.browser && typeof this.documentRef.documentElement?.requestFullscreen === 'function',
    );
    if (this.browser) {
      const updateActiveState = () => this.active.set(!!this.documentRef.fullscreenElement);
      this.documentRef.addEventListener('fullscreenchange', updateActiveState);
      this.destroyRef.onDestroy(() =>
        this.documentRef.removeEventListener('fullscreenchange', updateActiveState),
      );
    }
  }

  async enter(element: HTMLElement = this.documentRef.documentElement): Promise<boolean> {
    if (!this.supported()) return false;
    try {
      await element.requestFullscreen();
      return true;
    } catch {
      return false;
    }
  }

  async exit(): Promise<boolean> {
    if (!this.browser || !this.documentRef.fullscreenElement) return false;
    try {
      await this.documentRef.exitFullscreen();
      return true;
    } catch {
      return false;
    }
  }

  toggle(element?: HTMLElement): Promise<boolean> {
    return this.active() ? this.exit() : this.enter(element);
  }
}
