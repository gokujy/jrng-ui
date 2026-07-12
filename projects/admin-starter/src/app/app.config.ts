import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideJrngUI } from 'jrng-ui/core';
import { provideJrngTheme } from 'jrng-ui/theming';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideJrngUI({ themeMode: 'system' }),
    provideJrngTheme(),
  ],
};
