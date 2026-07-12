import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

const siteUrl = 'https://jrngui.dev';
const defaultDescription =
  'JRNG UI is a modern Angular component library for admin panels, dashboards and business applications.';

@Injectable({ providedIn: 'root' })
export class DocsSeoService {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly meta = inject(Meta);
  private readonly documentRef = inject(DOCUMENT);

  start(): void {
    this.update();
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => this.update());
  }

  private update(): void {
    let route = this.route;
    while (route.firstChild) route = route.firstChild;
    const description =
      (route.snapshot.data['description'] as string | undefined) ?? defaultDescription;
    const path = this.router.url.split(/[?#]/)[0] || '/';
    const canonicalUrl = `${siteUrl}${path === '/' ? '/' : path}`;
    const title = this.documentRef.title;
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: 'index,follow' });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: canonicalUrl });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    let canonical = this.documentRef.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = this.documentRef.createElement('link');
      canonical.rel = 'canonical';
      this.documentRef.head.append(canonical);
    }
    canonical.href = canonicalUrl;
  }
}
