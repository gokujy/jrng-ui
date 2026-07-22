import { provideServerRendering } from '@angular/platform-server';
import { BootstrapContext, bootstrapApplication } from '@angular/platform-browser';
import { provideJrngUI } from 'jrng-ui/core';
import { SsrAppComponent } from './app.component';

const bootstrap = (context: BootstrapContext) =>
  bootstrapApplication(
    SsrAppComponent,
    {
      providers: [provideServerRendering(), provideJrngUI({ appendTo: 'body' })],
    },
    context,
  );

export default bootstrap;
