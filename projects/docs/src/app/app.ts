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
import { JThemeService } from 'jrng-ui/theming';
import { JrToastContainerComponent } from 'jrng-ui/toast';
import { filter, map } from 'rxjs';
import { DocsSeoService } from './core/seo.service';
import { DocsAnalyticsService } from './core/analytics.service';

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
    JrToastContainerComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly theme = inject(JThemeService);
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
        { label: 'Admin Starter', path: '/admin-starter' },
        { label: 'GitHub', path: this.githubUrl },
      ],
    },
  ];

  readonly mode = this.theme.mode;
  readonly modeLabel = computed(() => {
    const value = this.mode();
    return value.charAt(0).toUpperCase() + value.slice(1);
  });

  readonly density = signal<'comfortable' | 'compact'>('comfortable');
  readonly navOpen = signal(false);
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

  constructor() {
    this.seo.start();
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        const path = event.urlAfterRedirects.split(/[?#]/)[0];
        if (path.startsWith('/docs/components')) {
          this.analytics.track('component_page_view', { path });
        }
        if (path.startsWith('/guides/')) {
          this.analytics.track('guide_page_view', { path });
        }
      });
  }

  /** Cycle light -> dark -> system. */
  cycleMode(): void {
    const order = ['light', 'dark', 'system'] as const;
    const next = order[(order.indexOf(this.mode()) + 1) % order.length];
    this.theme.setMode(next);
  }

  toggleDensity(): void {
    this.density.update((value) => (value === 'comfortable' ? 'compact' : 'comfortable'));
    if (this.isBrowser) {
      this.documentRef.documentElement.classList.toggle(
        'j-density-compact',
        this.density() === 'compact',
      );
    }
  }

  toggleNavigation(): void {
    this.navOpen.update((value) => !value);
  }

  closeNavigation(): void {
    this.navOpen.set(false);
  }
}
