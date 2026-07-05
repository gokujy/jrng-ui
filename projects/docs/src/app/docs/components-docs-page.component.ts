import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { JIconComponent } from 'jrng-ui/icon';
import { componentDocs, componentGroups } from './component-docs.data';
import { ComponentDetailViewComponent } from './component-detail-view.component';

@Component({
  selector: 'app-components-docs-page',
  imports: [RouterLink, JIconComponent, ComponentDetailViewComponent],
  template: `
    <section class="j-page-hero j-page-hero--docs">
      <span class="j-page-eyebrow">Components</span>
      <h1>Component Documentation</h1>
      <p>
        Browse the reusable JRNG UI building blocks from one page. Select a component on the left to preview it,
        copy code, and read beginner-friendly usage guidance without navigating away.
      </p>
      <div class="j-doc-hero-links">
        <a routerLink="/docs/charts"><j-icon name="chart-no-axes-column" /> Charts</a>
        <a routerLink="/docs"><j-icon name="book-open" /> Getting started</a>
      </div>
    </section>

    <section class="j-components-layout">
      <aside class="j-components-sidebar" aria-label="Component groups">
        <label class="j-doc-search">
          <j-icon name="search" />
          <input
            type="search"
            placeholder="Search components"
            [value]="query()"
            (input)="updateQuery($event)"
          />
        </label>

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
                  <small>{{ doc.status }}</small>
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
  readonly query = signal('');
  readonly selectedSlug = signal(componentDocs[0]?.slug ?? 'input');

  readonly selectedDoc = computed(() => componentDocs.find((doc) => doc.slug === this.selectedSlug()) ?? componentDocs[0]);

  readonly filteredGroups = computed(() => {
    const search = this.query().trim().toLowerCase();
    return componentGroups
      .map((group) => ({
        ...group,
        docs: group.slugs
          .map((slug) => componentDocs.find((doc) => doc.slug === slug))
          .filter((doc) => doc != null)
          .filter((doc) =>
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
  }

  updateQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }
}
