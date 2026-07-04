import { Routes } from '@angular/router';
import { ShowcasePageComponent } from './showcase-page.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'introduction' },
  {
    path: 'introduction',
    component: ShowcasePageComponent,
    data: { page: 'introduction' },
    title: 'JRNG UI Showcase',
  },
  { path: 'theme', component: ShowcasePageComponent, data: { page: 'theme' }, title: 'Theme - JRNG UI' },
  { path: 'button', component: ShowcasePageComponent, data: { page: 'button' }, title: 'Button - JRNG UI' },
  { path: 'inputs', component: ShowcasePageComponent, data: { page: 'inputs' }, title: 'Inputs - JRNG UI' },
  { path: 'select', component: ShowcasePageComponent, data: { page: 'select' }, title: 'Select - JRNG UI' },
  { path: 'selection', component: ShowcasePageComponent, data: { page: 'selection' }, title: 'Selection - JRNG UI' },
  { path: 'date-picker', component: ShowcasePageComponent, data: { page: 'date-picker' }, title: 'DatePicker - JRNG UI' },
  { path: 'dialog', component: ShowcasePageComponent, data: { page: 'dialog' }, title: 'Dialog - JRNG UI' },
  { path: 'toast', component: ShowcasePageComponent, data: { page: 'toast' }, title: 'Toast - JRNG UI' },
  {
    path: 'confirm-dialog',
    component: ShowcasePageComponent,
    data: { page: 'confirm-dialog' },
    title: 'ConfirmDialog - JRNG UI',
  },
  { path: 'table', component: ShowcasePageComponent, data: { page: 'table' }, title: 'Table - JRNG UI' },
  { path: 'layout', component: ShowcasePageComponent, data: { page: 'layout' }, title: 'Panels - JRNG UI' },
  {
    path: 'file-upload',
    component: ShowcasePageComponent,
    data: { page: 'file-upload' },
    title: 'FileUpload - JRNG UI',
  },
  {
    path: 'accessibility',
    component: ShowcasePageComponent,
    data: { page: 'accessibility' },
    title: 'Accessibility - JRNG UI',
  },
  { path: 'migration', component: ShowcasePageComponent, data: { page: 'migration' }, title: 'Migration - JRNG UI' },
  { path: '**', redirectTo: 'introduction' },
];
