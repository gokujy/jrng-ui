import { Routes } from '@angular/router';
import { ShowcasePageComponent } from './showcase-page.component';
import { ChartsDocsPageComponent } from './docs/charts-docs-page.component';
import { ComponentsDocsPageComponent } from './docs/components-docs-page.component';

const page = (path: string, title: string, pageName: string, componentName?: string): Routes[number] => ({
  path,
  component: ShowcasePageComponent,
  data: { page: pageName, component: componentName },
  title,
});

export const routes: Routes = [
  page('', 'JRNG UI - Angular UI Component Library', 'home'),
  page('docs', 'Docs - JRNG UI', 'docs'),
  { path: 'docs/components', component: ComponentsDocsPageComponent, title: 'Components - JRNG UI' },
  { path: 'docs/charts', component: ChartsDocsPageComponent, title: 'Charts - JRNG UI' },
  { path: 'components', redirectTo: 'docs/components', pathMatch: 'full' },
  { path: 'components/:component', redirectTo: 'docs/components', pathMatch: 'full' },
  page('themes', 'Themes - JRNG UI', 'themes'),
  { path: '**', redirectTo: '' },
];
