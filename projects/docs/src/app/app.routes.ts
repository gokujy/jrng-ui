import { Routes } from '@angular/router';
import { ChartsDocsPageComponent } from './docs/charts-docs-page.component';
import { ComponentsDocsPageComponent } from './docs/components-docs-page.component';
import { GettingStartedPageComponent } from './pages/getting-started-page.component';
import { HomePageComponent } from './pages/home-page.component';
import { ThemingPageComponent } from './pages/theming-page.component';

export const routes: Routes = [
  { path: '', component: HomePageComponent, title: 'JRNG UI — Angular UI Component Library' },
  { path: 'docs', component: GettingStartedPageComponent, title: 'Getting Started — JRNG UI' },
  {
    path: 'docs/components',
    component: ComponentsDocsPageComponent,
    title: 'Components — JRNG UI',
  },
  { path: 'docs/charts', component: ChartsDocsPageComponent, title: 'Charts — JRNG UI' },
  { path: 'themes', component: ThemingPageComponent, title: 'Theming — JRNG UI' },
  { path: 'components', redirectTo: 'docs/components', pathMatch: 'full' },
  { path: 'components/:component', redirectTo: 'docs/components', pathMatch: 'full' },
  { path: '**', redirectTo: '' },
];
