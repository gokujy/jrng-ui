import { ENVIRONMENT_INITIALIZER, Injectable, inject, makeEnvironmentProviders } from '@angular/core';

export type JIconName =
  | 'check'
  | 'close'
  | 'chevron-down'
  | 'chevron-up'
  | 'chevron-left'
  | 'chevron-right'
  | 'search'
  | 'calendar'
  | 'clock'
  | 'upload'
  | 'download'
  | 'plus'
  | 'minus'
  | 'info'
  | 'warning'
  | 'error'
  | 'success'
  | 'loading'
  | 'sort'
  | 'filter'
  | 'more-horizontal'
  | 'more-vertical';

export type JIconMap = Readonly<Record<string, string>>;

export const JRNG_DEFAULT_ICONS: JIconMap = {
  check: 'M20 6 9 17l-5-5',
  close: 'M18 6 6 18M6 6l12 12',
  'chevron-down': 'm6 9 6 6 6-6',
  'chevron-up': 'm18 15-6-6-6 6',
  'chevron-left': 'm15 18-6-6 6-6',
  'chevron-right': 'm9 18 6-6-6-6',
  search: 'm21 21-4.35-4.35M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z',
  calendar: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z',
  clock: 'M12 6v6l4 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  upload: 'M12 16V4m0 0 5 5m-5-5-5 5M4 20h16',
  download: 'M12 4v12m0 0 5-5m-5 5-5-5M4 20h16',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  info: 'M12 16v-4M12 8h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  warning: 'M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z',
  error: 'M12 9v4M12 17h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  success: 'M20 6 9 17l-5-5M21 12a9 9 0 1 1-5.27-8.2',
  loading: 'M21 12a9 9 0 0 1-9 9',
  sort: 'm7 8 5-5 5 5M7 16l5 5 5-5',
  filter: 'M4 5h16M7 12h10M10 19h4',
  'more-horizontal': 'M5 12h.01M12 12h.01M19 12h.01',
  'more-vertical': 'M12 5h.01M12 12h.01M12 19h.01',
};

@Injectable({ providedIn: 'root' })
export class JIconRegistry {
  private readonly icons = new Map<string, string>(Object.entries(JRNG_DEFAULT_ICONS));

  register(name: string, svg: string): void {
    this.registerIcon(name, svg);
  }

  registerIcon(name: string, svg: string): void {
    const normalizedName = name.trim();

    if (!normalizedName) {
      return;
    }

    this.icons.set(normalizedName, svg);
  }

  registerIcons(map: JIconMap): void {
    for (const [name, svg] of Object.entries(map)) {
      this.registerIcon(name, svg);
    }
  }

  get(name: string): string {
    return this.getIcon(name);
  }

  getIcon(name: string): string {
    return this.icons.get(name) ?? '';
  }
}

export function provideJrngIcons(icons: JIconMap = {}) {
  return makeEnvironmentProviders([
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useValue: () => {
        inject(JIconRegistry).registerIcons(icons);
      },
    },
  ]);
}
