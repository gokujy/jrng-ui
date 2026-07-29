import { InjectionToken, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type JPopoutMode = 'window' | 'picture-in-picture' | 'auto';
export type JPopoutFallback = 'window' | 'inline' | 'none';
export type JPopoutPosition = 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface JPopoutConfig {
  readonly mode?: JPopoutMode;
  readonly fallback?: JPopoutFallback;
  readonly width?: number;
  readonly height?: number;
  readonly left?: number;
  readonly top?: number;
  readonly position?: JPopoutPosition;
  readonly title?: string;
  readonly name?: string;
  readonly reuse?: boolean;
  readonly resizable?: boolean;
  readonly scrollbars?: boolean;
  readonly copyStyles?: boolean;
  readonly syncTheme?: boolean;
  readonly closeOnParentUnload?: boolean;
  readonly ariaLabel?: string;
}

export interface JDocumentPictureInPictureLike {
  requestWindow(options: { width: number; height: number }): Promise<Window>;
}

export interface JPopoutWindowAdapter {
  readonly supported: boolean;
  readonly pictureInPictureSupported: boolean;
  open(url: string, target: string, features: string): Window | null;
  requestPictureInPicture(width: number, height: number): Promise<Window | null>;
}

export const J_POPOUT_WINDOW_ADAPTER = new InjectionToken<JPopoutWindowAdapter>(
  'J_POPOUT_WINDOW_ADAPTER',
  {
    providedIn: 'root',
    factory: () => {
      const platformId = inject(PLATFORM_ID);
      if (!isPlatformBrowser(platformId)) {
        return {
          supported: false,
          pictureInPictureSupported: false,
          open: () => null,
          requestPictureInPicture: async () => null,
        };
      }
      const browser = window as typeof window & {
        documentPictureInPicture?: JDocumentPictureInPictureLike;
      };
      return {
        supported: true,
        pictureInPictureSupported: Boolean(browser.documentPictureInPicture),
        open: (url, target, features) => browser.open(url, target, features),
        requestPictureInPicture: async (width, height) =>
          browser.documentPictureInPicture?.requestWindow({ width, height }) ?? null,
      };
    },
  },
);
