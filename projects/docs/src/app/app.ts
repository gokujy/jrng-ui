import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { JConfirmDialogComponent } from 'jrng-ui/confirm-dialog';
import { JToastContainerComponent } from 'jrng-ui/toast';
import { filter, map } from 'rxjs';
import { DocsSeoService } from './core/seo.service';
import { DocsAnalyticsService } from './core/analytics.service';
import { componentDocs } from './docs/component-docs.data';
import { DocsThemeSettingsComponent } from './theme/docs-theme-settings.component';

interface DocsNavItem {
  readonly label: string;
  readonly path: string;
  readonly exact?: boolean;
}

interface DocsNavGroup {
  readonly label: string;
  readonly items: readonly DocsNavItem[];
}

@Component({
  selector: 'app-root',
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    JConfirmDialogComponent,
    JToastContainerComponent,
    DocsThemeSettingsComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly documentRef = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly router = inject(Router);
  private readonly seo = inject(DocsSeoService);
  private readonly analytics = inject(DocsAnalyticsService);

  readonly githubUrl = 'https://github.com/gokujy/jrng-ui';

  readonly nav: readonly DocsNavItem[] = [
    { label: 'Home', path: '/', exact: true },
    { label: 'Docs', path: '/docs' },
    { label: 'Components', path: '/docs/components' },
    { label: 'API Index', path: '/docs/index' },
    { label: 'Examples', path: '/examples' },
    { label: 'Guides', path: '/guides' },
    { label: 'Charts', path: '/docs/charts' },
    { label: 'Themes', path: '/themes' },
  ];

  readonly docsNavGroups: readonly DocsNavGroup[] = [
    {
      label: 'Getting Started',
      items: [
        { label: 'Overview', path: '/', exact: true },
        { label: 'Installation', path: '/docs', exact: true },
        { label: 'Theming', path: '/themes', exact: true },
      ],
    },
    {
      label: 'Library',
      items: [
        { label: 'Components', path: '/docs/components', exact: true },
        { label: 'Public API Index', path: '/docs/index', exact: true },
        { label: 'Live Examples', path: '/examples', exact: true },
        { label: 'Guides', path: '/guides' },
        { label: 'Charts', path: '/docs/charts', exact: true },
      ],
    },
    {
      label: 'Resources',
      items: [
        { label: 'Community', path: '/community' },
        { label: 'GitHub', path: this.githubUrl },
      ],
    },
  ];

  readonly navOpen = signal(false);
  readonly componentsExpanded = signal(false);
  readonly componentQuery = signal('');
  readonly collapsedComponentCategories = signal<ReadonlySet<string>>(new Set());
  readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );
  readonly isHomeRoute = computed(() => {
    const path = this.currentUrl().split(/[?#]/)[0];
    return path === '' || path === '/';
  });
  readonly isComponentsRoute = computed(
    () => this.currentUrl().split(/[?#]/)[0] === '/docs/components',
  );
  readonly activeComponentSlug = computed(() => {
    const fragment = this.currentUrl().split('#')[1];
    return fragment ? decodeURIComponent(fragment.split('?')[0]) : componentDocs[0]?.slug;
  });
  readonly componentNavGroups = computed(() => {
    const query = this.componentQuery().trim().toLowerCase();
    const navigableDocs = componentDocs;
    const categories = [...new Set(navigableDocs.map((doc) => doc.category))];

    return categories
      .map((category) => ({
        name: category,
        docs: navigableDocs.filter(
          (doc) =>
            doc.category === category &&
            (!query ||
              doc.name.toLowerCase().includes(query) ||
              doc.selector.toLowerCase().includes(query) ||
              doc.category.toLowerCase().includes(query)),
        ),
      }))
      .filter((group) => group.docs.length > 0);
  });

  constructor() {
    this.seo.start();
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        const path = event.urlAfterRedirects.split(/[?#]/)[0];
        this.navOpen.set(false);
        this.componentsExpanded.set(path === '/docs/components');
        if (path.startsWith('/docs/components')) {
          this.analytics.track('component_page_view', { path });
        }
        if (path.startsWith('/guides/')) {
          this.analytics.track('guide_page_view', { path });
        }
        if (this.isBrowser && path === '/docs/components') {
          setTimeout(() =>
            this.documentRef
              .querySelector<HTMLElement>('.docs-component-catalog__items a.is-active')
              ?.scrollIntoView({ block: 'nearest' }),
          );
        }
      });
  }

  toggleNavigation(): void {
    this.navOpen.update((value) => !value);
  }

  closeNavigation(): void {
    this.navOpen.set(false);
  }

  toggleComponentsNavigation(): void {
    this.componentsExpanded.update((expanded) => !expanded);
  }

  updateComponentQuery(event: Event): void {
    this.componentQuery.set((event.target as HTMLInputElement).value);
    this.componentsExpanded.set(true);
    this.collapsedComponentCategories.set(new Set());
  }

  isComponentCategoryExpanded(category: string): boolean {
    return !this.collapsedComponentCategories().has(category);
  }

  toggleComponentCategory(category: string): void {
    this.collapsedComponentCategories.update((collapsed) => {
      const next = new Set(collapsed);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }
}
