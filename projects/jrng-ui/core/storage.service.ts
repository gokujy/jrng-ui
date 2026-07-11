import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';

export type JStorageKind = 'local' | 'session';

export interface JStorageOptions {
  readonly kind?: JStorageKind;
  readonly prefix?: string;
  readonly version?: number;
}

interface JStoredValue<T> {
  readonly version: number;
  readonly value: T;
}

@Injectable({ providedIn: 'root' })
export class JStorageService {
  private readonly documentRef = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  get<T>(key: string, options: JStorageOptions = {}): T | null {
    try {
      const raw = this.storage(options)?.getItem(this.key(key, options));
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Partial<JStoredValue<T>>;
      return parsed.version === (options.version ?? 1) && 'value' in parsed
        ? (parsed.value ?? null)
        : null;
    } catch {
      return null;
    }
  }

  set<T>(key: string, value: T, options: JStorageOptions = {}): boolean {
    try {
      this.storage(options)?.setItem(
        this.key(key, options),
        JSON.stringify({ version: options.version ?? 1, value }),
      );
      return this.storage(options) !== null;
    } catch {
      return false;
    }
  }

  remove(key: string, options: JStorageOptions = {}): boolean {
    try {
      this.storage(options)?.removeItem(this.key(key, options));
      return this.storage(options) !== null;
    } catch {
      return false;
    }
  }

  private key(key: string, options: JStorageOptions): string {
    return `${options.prefix ?? 'jrng'}:${key}`;
  }
  private storage(options: JStorageOptions): Storage | null {
    if (!this.isBrowser) return null;
    const view = this.documentRef.defaultView;
    try {
      return options.kind === 'session'
        ? (view?.sessionStorage ?? null)
        : (view?.localStorage ?? null);
    } catch {
      return null;
    }
  }
}
