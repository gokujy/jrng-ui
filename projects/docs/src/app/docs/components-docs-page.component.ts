import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { JIconComponent } from 'jrng-ui/icon';
import { componentDocs } from './component-docs.data';
import { ComponentDetailViewComponent } from './component-detail-view.component';
import { DocsAnalyticsService } from '../core/analytics.service';

@Component({
  selector: 'app-components-docs-page',
  imports: [RouterLink, JIconComponent, ComponentDetailViewComponent],
  template: `
    <section class="j-page-hero j-page-hero--docs">
      <span class="j-page-eyebrow">Components</span>
      <h1>Component Documentation</h1>
      <p>
        Browse the reusable JRNG UI building blocks from one page. Select a component on the left to
        preview it, copy code, and read beginner-friendly usage guidance without navigating away.
      </p>
      <div class="j-doc-hero-links">
        <a routerLink="/docs/charts"><j-icon name="chart-no-axes-column" /> Charts</a>
        <a routerLink="/docs"><j-icon name="book-open" /> Getting started</a>
      </div>
    </section>

    <section class="j-components-layout">
      <aside class="j-components-sidebar" aria-label="Component groups">
        <div class="j-components-sidebar__filters">
          <label class="j-doc-search">
            <j-icon name="search" />
            <input
              type="search"
              placeholder="Search components"
              [value]="query()"
              (input)="updateQuery($event)"
            />
          </label>
        </div>

        <nav class="j-components-nav">
          @for (group of filteredGroups(); track group.name) {
            <section class="j-components-nav__group">
              <h2>
                <j-icon [name]="group.icon" />
                {{ group.name }}
              </h2>
              @for (doc of group.docs; track doc.slug) {
                <button
                  type="button"
                  [class.is-active]="selectedSlug() === doc.slug"
                  (click)="select(doc.slug)"
                >
                  <j-icon [name]="doc.icon" />
                  <span>{{ doc.name }}</span>
                </button>
              }
            </section>
          } @empty {
            <p class="j-empty-sidebar">No components match this search.</p>
          }
        </nav>
      </aside>

      <main class="j-components-content">
        @if (selectedDoc(); as doc) {
          <app-component-detail-view [doc]="doc" />
        }
      </main>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComponentsDocsPageComponent {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly analytics = inject(DocsAnalyticsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly query = signal('');
  readonly selectedSlug = signal(componentDocs[0]?.slug ?? 'input');

  readonly selectedDoc = computed(
    () => componentDocs.find((doc) => doc.slug === this.selectedSlug()) ?? componentDocs[0],
  );

  constructor() {
    this.route.fragment.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((fragment) => {
      if (fragment && componentDocs.some((doc) => doc.slug === fragment)) {
        this.selectedSlug.set(fragment);
        this.updateMetadata(fragment);
      }
    });
  }

  readonly filteredGroups = computed(() => {
    const search = this.query().trim().toLowerCase();
    const categories = [...new Set(componentDocs.map((doc) => doc.category))].sort();
    return categories
      .map((category) => ({
        name: category,
        icon: 'layout-grid',
        docs: componentDocs
          .filter((doc) => doc.category === category)
          .filter(
            (doc) =>
              !search ||
              doc.name.toLowerCase().includes(search) ||
              doc.category.toLowerCase().includes(search) ||
              doc.selector.toLowerCase().includes(search) ||
              doc.description.toLowerCase().includes(search),
          ),
      }))
      .filter((group) => group.docs.length > 0);
  });

  select(slug: string): void {
    this.selectedSlug.set(slug);
    void this.router.navigate([], { fragment: slug, replaceUrl: true });
    this.updateMetadata(slug);
  }

  private updateMetadata(slug: string): void {
    const doc = componentDocs.find((item) => item.slug === slug);
    if (doc) {
      this.analytics.track('component_page_view', { component: doc.slug });
      this.title.setTitle(`${doc.name} Angular Component - JRNG UI`);
      this.meta.updateTag({
        name: 'description',
        content: `${doc.description} Review the live preview, code, API, accessibility, responsive behavior and troubleshooting guidance.`,
      });
    }
  }

  updateQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }
}
