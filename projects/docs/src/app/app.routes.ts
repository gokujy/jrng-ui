import { Routes } from '@angular/router';
import { ChartsDocsPageComponent } from './docs/charts-docs-page.component';
import { PublicItemIndexPageComponent } from './docs/public-item-index-page.component';
import { AdminStarterPageComponent } from './pages/admin-starter-page.component';
import { CommunityPageComponent } from './pages/community-page.component';
import { ExamplesPageComponent } from './pages/examples-page.component';
import { GettingStartedPageComponent } from './pages/getting-started-page.component';
import { HomePageComponent } from './pages/home-page.component';
import { ThemingPageComponent } from './pages/theming-page.component';

export const routes: Routes = [
  {
    path: '',
    component: HomePageComponent,
    title: 'JRNG UI - Angular Components for Admin Panels and Dashboards',
    data: {
      description:
        'JRNG UI is an Angular UI component library for accessible admin panels, dashboard UI and business applications.',
    },
  },
  {
    path: 'docs',
    component: GettingStartedPageComponent,
    title: 'Getting Started with JRNG UI',
    data: {
      description:
        'Install JRNG UI in five minutes with Angular standalone components, themes, Reactive Forms, SSR and zoneless setup.',
    },
  },
  {
    path: 'docs/components',
    loadComponent: () =>
      import('./docs/components-docs-page.component').then(
        (module) => module.ComponentsDocsPageComponent,
      ),
    title: 'Angular Components - JRNG UI',
    data: {
      description:
        'Explore JRNG UI Angular admin components, data tables, forms, overlays, navigation and responsive business layouts.',
    },
  },
  {
    path: 'docs/index',
    component: PublicItemIndexPageComponent,
    title: 'JRNG UI Public API Index',
    data: {
      description:
        'Search every public JRNG UI Angular component, directive, pipe and service by selector, category and use case.',
    },
  },
  {
    path: 'docs/charts',
    component: ChartsDocsPageComponent,
    title: 'Angular Charts - JRNG UI',
    data: {
      description: 'Build responsive Angular dashboard charts with JRNG UI and Chart.js adapters.',
    },
  },
  {
    path: 'themes',
    component: ThemingPageComponent,
    title: 'Angular Design System Theming - JRNG UI',
    data: {
      description:
        'Customize JRNG UI light and dark themes using semantic Angular design system tokens.',
    },
  },
  {
    path: 'examples',
    component: ExamplesPageComponent,
    title: 'JRNG UI Angular Examples',
    data: {
      description:
        'Copy valid JRNG UI examples for Angular standalone components, Reactive Forms, data tables and themes.',
    },
  },
  {
    path: 'admin-starter',
    component: AdminStarterPageComponent,
    title: 'JRNG Angular Admin Starter',
    data: {
      description:
        'Explore the responsive Angular admin starter built with JRNG UI components, Reactive Forms, lazy routes and mock services.',
    },
  },
  {
    path: 'guides',
    loadComponent: () =>
      import('./guides/guides-page.component').then((module) => module.GuidesPageComponent),
    title: 'Angular Business Application Guides - JRNG UI',
    data: {
      description:
        'Complete JRNG UI guides for Angular dashboards, data tables, Reactive Forms, dark mode, SSR and zoneless applications.',
    },
  },
  {
    path: 'guides/:slug',
    loadComponent: () =>
      import('./guides/guides-page.component').then((module) => module.GuidesPageComponent),
    title: 'JRNG UI Technical Guide',
    data: {
      description:
        'Implementation guidance for accessible Angular admin panels, dashboards and business applications with JRNG UI.',
    },
  },
  {
    path: 'community',
    component: CommunityPageComponent,
    title: 'JRNG UI Community',
    data: {
      description:
        'Find JRNG UI support, discussions, issues, contribution guidance, security policy, roadmap and verified projects.',
    },
  },
  { path: 'components', redirectTo: 'docs/components', pathMatch: 'full' },
  { path: 'components/:component', redirectTo: 'docs/components', pathMatch: 'full' },
  { path: '**', redirectTo: '' },
];
