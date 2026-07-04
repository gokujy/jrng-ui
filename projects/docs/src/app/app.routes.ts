import { Routes } from '@angular/router';
import { ShowcasePageComponent } from './showcase-page.component';

const page = (path: string, title: string, pageName: string, componentName?: string): Routes[number] => ({
  path,
  component: ShowcasePageComponent,
  data: { page: pageName, component: componentName },
  title,
});

export const routes: Routes = [
  page('', 'JRNG UI - Angular UI Component Library', 'home'),
  page('docs', 'Docs - JRNG UI', 'docs'),
  page('components', 'Components - JRNG UI', 'components'),
  page('components/button', 'Button - JRNG UI', 'component-detail', 'button'),
  page('components/input', 'Input - JRNG UI', 'component-detail', 'input'),
  page('components/select', 'Select - JRNG UI', 'component-detail', 'select'),
  page('components/card', 'Card - JRNG UI', 'component-detail', 'card'),
  page('components/dialog', 'Dialog - JRNG UI', 'component-detail', 'dialog'),
  page('components/toast', 'Toast - JRNG UI', 'component-detail', 'toast'),
  page('components/table', 'Table - JRNG UI', 'component-detail', 'table'),
  page('themes', 'Themes - JRNG UI', 'themes'),
  { path: '**', redirectTo: '' },
];
