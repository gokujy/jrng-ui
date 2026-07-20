import {
  ENVIRONMENT_INITIALIZER,
  Injectable,
  inject,
  makeEnvironmentProviders,
} from '@angular/core';

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
  | 'more-vertical'
  | 'boxes'
  | 'folder-code'
  | 'settings'
  | 'chart-no-axes-column'
  | 'copy'
  | 'database'
  | 'check-check'
  | 'book-open'
  | 'panel-left'
  | 'palette'
  | 'component'
  | 'layout-dashboard'
  | 'mouse-pointer-click'
  | 'circle-dot'
  | 'toggle-left'
  | 'table'
  | 'badge'
  | 'tag'
  | 'message-square'
  | 'loader-circle'
  | 'panel-top'
  | 'menu'
  | 'route'
  | 'panel-left-open'
  | 'message-square-more'
  | 'text-cursor-input'
  | 'square'
  | 'list-check'
  | 'layers'
  | 'code-xml'
  | 'accessibility'
  | 'lightbulb'
  | 'triangle-alert'
  | 'file'
  | 'file-text'
  | 'image'
  | 'video'
  | 'archive'
  | 'eye'
  | 'eye-off'
  | 'trash';

export type JIconMap = Readonly<Record<string, string>>;

export const JRNG_DEFAULT_ICONS: JIconMap = {
  check: 'M20 6 9 17l-5-5',
  close: 'M18 6 6 18M6 6l12 12',
  'chevron-down': 'm6 9 6 6 6-6',
  'chevron-up': 'm18 15-6-6-6 6',
  'chevron-left': 'm15 18-6-6 6-6',
  'chevron-right': 'm9 18 6-6-6-6',
  search: 'm21 21-4.35-4.35M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z',
  calendar:
    'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z',
  clock: 'M12 6v6l4 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  upload: 'M12 16V4m0 0 5 5m-5-5-5 5M4 20h16',
  download: 'M12 4v12m0 0 5-5m-5 5-5-5M4 20h16',
  eye: 'M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  'eye-off': 'm3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.1A11 11 0 0 1 12 5c6.5 0 10 7 10 7a18 18 0 0 1-2.1 3M6.6 6.6C3.6 8.4 2 12 2 12s3.5 7 10 7c1.5 0 2.8-.4 4-.9',
  trash: 'M4 7h16M9 7V4h6v3m3 0-1 14H7L6 7m4 4v6m4-6v6',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  info: 'M12 16v-4M12 8h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  warning:
    'M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z',
  error: 'M12 9v4M12 17h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  success: 'M20 6 9 17l-5-5M21 12a9 9 0 1 1-5.27-8.2',
  loading: 'M21 12a9 9 0 0 1-9 9',
  sort: 'm7 8 5-5 5 5M7 16l5 5 5-5',
  filter: 'M4 5h16M7 12h10M10 19h4',
  'more-horizontal': 'M5 12h.01M12 12h.01M19 12h.01',
  'more-vertical': 'M12 5h.01M12 12h.01M12 19h.01',
  boxes:
    'M2.97 12.92 7 15.1l4.03-2.18M2.97 12.92V8.54L7 6.36l4.03 2.18v4.38M7 15.1v4.36l4.03 2.18 4.03-2.18V15.1M11.03 12.92l4.03 2.18 4.03-2.18M15.06 15.1v4.36M11.03 8.54 15.06 6.36l4.03 2.18v4.38M15.06 6.36V2l-4.03 2.18L7 2v4.36',
  'folder-code':
    'M10 10.5 8 13l2 2.5M14 10.5l2 2.5-2 2.5M3 7V5a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z',
  settings:
    'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM19.43 12.98c.04-.32.07-.65.07-.98s-.02-.66-.07-.98l2.11-1.65-2-3.46-2.49 1a7.4 7.4 0 0 0-1.7-.98L15 3h-6l-.35 2.93c-.6.24-1.16.56-1.7.98l-2.49-1-2 3.46 2.11 1.65c-.05.32-.07.65-.07.98s.02.66.07.98l-2.11 1.65 2 3.46 2.49-1c.53.41 1.1.74 1.7.98L9 21h6l.35-2.93c.6-.24 1.16-.57 1.7-.98l2.49 1 2-3.46-2.11-1.65Z',
  'chart-no-axes-column': 'M5 21V10M12 21V3M19 21v-7',
  copy: 'M8 8h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2ZM4 16H3a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1',
  database:
    'M21 6c0 2.21-4.03 4-9 4S3 8.21 3 6s4.03-4 9-4 9 1.79 9 4ZM3 6v6c0 2.21 4.03 4 9 4s9-1.79 9-4V6M3 12v6c0 2.21 4.03 4 9 4s9-1.79 9-4v-6',
  'check-check': 'M18 6 7 17l-5-5M22 10l-7.5 7.5L13 16',
  'book-open':
    'M12 7v14M3 5a2 2 0 0 1 2-2h4a3 3 0 0 1 3 3v15a3 3 0 0 0-3-3H5a2 2 0 0 0-2 2V5ZM21 5a2 2 0 0 0-2-2h-4a3 3 0 0 0-3 3v15a3 3 0 0 1 3-3h4a2 2 0 0 1 2 2V5Z',
  'panel-left': 'M3 3h18v18H3V3ZM9 3v18',
  palette:
    'M12 22a10 10 0 1 1 10-10c0 1.66-1.34 3-3 3h-1.77c-.86 0-1.23 1.1-.55 1.62.41.31.65.8.65 1.31A4.07 4.07 0 0 1 13.26 22H12ZM7.5 10.5h.01M10.5 7.5h.01M14.5 7.5h.01M16.5 10.5h.01',
  component:
    'M5.5 8.5 9 5l3.5 3.5L9 12 5.5 8.5ZM12 15.5 15.5 12l3.5 3.5-3.5 3.5-3.5-3.5ZM5 16h4v4H5v-4ZM15 4h4v4h-4V4Z',
  'layout-dashboard': 'M3 3h7v9H3V3ZM14 3h7v5h-7V3ZM14 12h7v9h-7v-9ZM3 16h7v5H3v-5Z',
  'mouse-pointer-click': 'M14 4.1 12 6M5.1 8 3 7M6 12l-2 2M7.2 2.2 8 5M9 9l4 12 2-5 5-2L9 9Z',
  'circle-dot': 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  'toggle-left': 'M8 12h.01M3 12a5 5 0 0 1 5-5h8a5 5 0 0 1 0 10H8a5 5 0 0 1-5-5Z',
  table: 'M3 3h18v18H3V3ZM3 9h18M3 15h18M9 3v18M15 3v18',
  badge:
    'M7.5 7.5h9v9h-9zM12 2l2.2 3.8L18.5 5l-.8 4.3L21 12l-3.3 2.7.8 4.3-4.3-.8L12 22l-2.2-3.8-4.3.8.8-4.3L3 12l3.3-2.7L5.5 5l4.3.8L12 2Z',
  tag: 'M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L3 13V3h10l7.59 7.59a2 2 0 0 1 0 2.82ZM7.5 7.5h.01',
  'message-square': 'M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z',
  'loader-circle': 'M21 12a9 9 0 1 1-6.22-8.56',
  'panel-top': 'M3 3h18v18H3V3ZM3 9h18',
  menu: 'M4 6h16M4 12h16M4 18h16',
  route:
    'M6 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM18 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 16h8a4 4 0 0 0 4-4v-1',
  'panel-left-open': 'M3 3h18v18H3V3ZM9 3v18M14 9l3 3-3 3',
  'message-square-more':
    'M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10ZM8 10h.01M12 10h.01M16 10h.01',
  'text-cursor-input': 'M5 4h14M12 4v16M8 20h8M19 9V7a2 2 0 0 0-2-2h-1M5 9V7a2 2 0 0 1 2-2h1',
  square: 'M5 5h14v14H5V5Z',
  'list-check': 'M11 6h10M11 12h10M11 18h10M3 6l1.5 1.5L8 4M3 12l1.5 1.5L8 10M3 18l1.5 1.5L8 16',
  layers: 'M12 2 2 7l10 5 10-5-10-5ZM2 17l10 5 10-5M2 12l10 5 10-5',
  'code-xml': 'M8 17 3 12l5-5M16 7l5 5-5 5M14 4l-4 16',
  accessibility: 'M12 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM19 9l-5 1v11h-4V10L5 9l1-3 6 1 6-1 1 3Z',
  lightbulb:
    'M9 18h6M10 22h4M15.09 14c.18-.98.74-1.86 1.48-2.57A6 6 0 1 0 7.43 11.43c.74.71 1.3 1.59 1.48 2.57h6.18Z',
  'triangle-alert':
    'M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z',
  file: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6ZM14 2v6h6',
  'file-text':
    'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6ZM14 2v6h6M8 13h8M8 17h8M8 9h2',
  image:
    'M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5ZM8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM21 15l-5-5L5 21',
  video: 'm16 13 5 3V8l-5 3v2ZM3 6h13v12H3V6Z',
  archive: 'M3 5h18v4H3V5ZM5 9h14v12H5V9ZM10 13h4',
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
