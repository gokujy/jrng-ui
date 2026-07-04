import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, PLATFORM_ID, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { JConfirmDialogComponent } from 'jrng-ui/confirm-dialog';
import { JrToastContainerComponent } from 'jrng-ui/toast';

interface SiteNavItem {
  readonly label: string;
  readonly path?: string;
  readonly href?: string;
}

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, JConfirmDialogComponent, JrToastContainerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly documentRef = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly mobileMenuOpen = signal(false);
  readonly darkMode = signal(false);
  readonly density = signal<'comfortable' | 'compact'>('comfortable');

  readonly navItems: readonly SiteNavItem[] = [
    { label: 'Home', path: '/' },
    { label: 'Docs', path: '/docs' },
    { label: 'Components', path: '/components' },
    { label: 'Themes', path: '/themes' },
    { label: 'GitHub', href: 'https://github.com/jrng-ui/jrng-ui' },
  ];

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((value) => !value);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  toggleDarkMode(): void {
    this.darkMode.update((value) => !value);
    this.syncDocumentClasses();
  }

  toggleDensity(): void {
    this.density.update((value) => (value === 'comfortable' ? 'compact' : 'comfortable'));
    this.syncDocumentClasses();
  }

  private syncDocumentClasses(): void {
    if (!this.isBrowser) {
      return;
    }

    const root = this.documentRef.documentElement;
    root.classList.toggle('j-dark', this.darkMode());
    root.classList.toggle('j-density-compact', this.density() === 'compact');
  }
}
