import { provideClientHydration } from '@angular/platform-browser';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideJrngUI } from 'jrng-ui/core';
import { SsrAppComponent } from './app.component';

const bootstrap = () =>
  bootstrapApplication(SsrAppComponent, {
    providers: [provideClientHydration(), provideJrngUI({ appendTo: 'body' })],
  });

export default bootstrap;
