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
import { JThemePresetName, JThemeService, jThemePresets } from 'jrng-ui/theming';
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

  readonly isDark = this.theme.isDark;

  /** PrimeNG-style theme configurator (top-bar popover). */
  readonly presetNames = Object.keys(jThemePresets) as JThemePresetName[];
  readonly activePreset = signal<JThemePresetName>('indigo');
  readonly configOpen = signal(false);

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

  /** Light <-> dark, mirroring PrimeNG's top-bar toggle. */
  toggleDark(): void {
    this.theme.setMode(this.isDark() ? 'light' : 'dark');
  }

  setColorScheme(dark: boolean): void {
    this.theme.setMode(dark ? 'dark' : 'light');
  }

  toggleConfig(): void {
    this.configOpen.update((open) => !open);
  }

  closeConfig(): void {
    this.configOpen.set(false);
  }

  /** Apply a color preset (the configurator's "Primary" palette). */
  selectPreset(name: JThemePresetName): void {
    this.activePreset.set(name);
    this.theme.setPreset(jThemePresets[name]);
  }

  /** Swatch color for a preset chip. */
  presetSwatch(name: JThemePresetName): string {
    return jThemePresets[name].light?.['--j-color-primary'] ?? 'transparent';
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
