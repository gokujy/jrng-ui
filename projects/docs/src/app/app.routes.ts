import { Routes } from '@angular/router';
import { ShowcasePageComponent } from './showcase-page.component';

const page = (path: string, title: string, pageName: string): Routes[number] => ({
  path,
  component: ShowcasePageComponent,
  data: { page: pageName },
  title,
});

export const routes: Routes = [
  page('', 'JRNG UI - Angular UI Component Library', 'home'),
  page('docs', 'Docs - JRNG UI', 'docs'),
  page('components', 'Components - JRNG UI', 'components'),
  page('themes', 'Themes - JRNG UI', 'themes'),
  page('support', 'Support - JRNG UI', 'support'),
  { path: '**', redirectTo: '' },
];
