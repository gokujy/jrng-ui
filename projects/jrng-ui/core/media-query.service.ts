import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';

export const J_BREAKPOINT_QUERIES = {
  xs: '(max-width: 575.98px)',
  sm: '(min-width: 576px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 992px)',
  xl: '(min-width: 1200px)',
  xxl: '(min-width: 1400px)',
} as const;

export type JBreakpoint = keyof typeof J_BREAKPOINT_QUERIES;

export interface JMediaQueryState {
  readonly query: string;
  readonly matches: boolean;
}

@Injectable({ providedIn: 'root' })
export class JMediaQueryService {
  private readonly documentRef = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly cache = new Map<string, Observable<JMediaQueryState>>();

  observe(query: string): Observable<JMediaQueryState> {
    const normalizedQuery = query.trim();
    const existing = this.cache.get(normalizedQuery);
    if (existing) {
      return existing;
    }

    const observable = new Observable<JMediaQueryState>((subscriber) => {
      const matchMedia = this.isBrowser ? this.documentRef.defaultView?.matchMedia : undefined;
      if (!matchMedia) {
        subscriber.next({ query: normalizedQuery, matches: false });
        subscriber.complete();
        return undefined;
      }

      const mediaQueryList = matchMedia.call(this.documentRef.defaultView, normalizedQuery);
      const emit = (): void => {
        subscriber.next({ query: normalizedQuery, matches: mediaQueryList.matches });
      };
      const listener = (): void => emit();

      emit();
      this.addListener(mediaQueryList, listener);

      return () => this.removeListener(mediaQueryList, listener);
    }).pipe(shareReplay({ bufferSize: 1, refCount: true }));

    this.cache.set(normalizedQuery, observable);
    return observable;
  }

  observeBreakpoint(breakpoint: JBreakpoint): Observable<JMediaQueryState> {
    return this.observe(J_BREAKPOINT_QUERIES[breakpoint]);
  }

  matches(query: string): boolean {
    const matchMedia = this.isBrowser ? this.documentRef.defaultView?.matchMedia : undefined;
    return matchMedia?.call(this.documentRef.defaultView, query).matches ?? false;
  }

  prefersReducedMotion(): boolean {
    return this.matches('(prefers-reduced-motion: reduce)');
  }

  prefersDarkColorScheme(): boolean {
    return this.matches('(prefers-color-scheme: dark)');
  }

  private addListener(mediaQueryList: MediaQueryList, listener: () => void): void {
    if (typeof mediaQueryList.addEventListener === 'function') {
      mediaQueryList.addEventListener('change', listener);
      return;
    }
    mediaQueryList.addListener(listener);
  }

  private removeListener(mediaQueryList: MediaQueryList, listener: () => void): void {
    if (typeof mediaQueryList.removeEventListener === 'function') {
      mediaQueryList.removeEventListener('change', listener);
      return;
    }
    mediaQueryList.removeListener(listener);
  }
}
