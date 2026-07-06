import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { JConfirmDialogComponent } from 'jrng-ui/confirm-dialog';
import { JThemeService } from 'jrng-ui/theming';
import { JrToastContainerComponent } from 'jrng-ui/toast';

interface DocsNavItem {
  readonly label: string;
  readonly path: string;
  readonly exact?: boolean;
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

  readonly githubUrl = 'https://github.com/gokujy/jrng-ui';

  readonly nav: readonly DocsNavItem[] = [
    { label: 'Home', path: '/', exact: true },
    { label: 'Getting Started', path: '/docs' },
    { label: 'Components', path: '/docs/components' },
    { label: 'Charts', path: '/docs/charts' },
    { label: 'Theming', path: '/themes' },
  ];

  readonly mode = this.theme.mode;
  readonly modeLabel = computed(() => {
    const value = this.mode();
    return value.charAt(0).toUpperCase() + value.slice(1);
  });

  readonly density = signal<'comfortable' | 'compact'>('comfortable');

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
}
