import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AdminStarterApp } from './app/app.component';

bootstrapApplication(AdminStarterApp, appConfig).catch((error: unknown) => console.error(error));
