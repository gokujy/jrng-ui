import { Injectable } from '@angular/core';

export type JIconName = 'check' | 'close' | 'info' | 'warning' | 'search' | 'chevron-down';

const iconPaths: Record<JIconName, string> = {
  check: 'M20 6 9 17l-5-5',
  close: 'M18 6 6 18M6 6l12 12',
  info: 'M12 16v-4M12 8h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  warning: 'M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z',
  search: 'm21 21-4.35-4.35M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z',
  'chevron-down': 'm6 9 6 6 6-6',
};

@Injectable({ providedIn: 'root' })
export class JIconRegistry {
  private readonly icons = new Map<string, string>(Object.entries(iconPaths));

  register(name: string, path: string): void {
    this.icons.set(name, path);
  }

  get(name: string): string {
    return this.icons.get(name) ?? '';
  }
}
