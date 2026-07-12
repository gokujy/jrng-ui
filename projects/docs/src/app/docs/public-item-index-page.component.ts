import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { JIconComponent } from 'jrng-ui/icon';
import { publicItemCategories, publicItemIndex } from './public-item-index.data';
import { DocsAnalyticsService } from '../core/analytics.service';

@Component({
  selector: 'app-public-item-index-page',
  imports: [RouterLink, JIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="docs-container">
      <header class="j-page-hero j-page-hero--docs">
        <span class="j-page-eyebrow">Public API</span>
        <h1>JRNG UI component and utility index</h1>
        <p>
          Search every exported component, directive, pipe, and service by API name, selector,
          category, description, or common use case.
        </p>
      </header>

      <section class="j-index-controls" aria-label="Filter public APIs">
        <label class="j-doc-search">
          <j-icon name="search" />
          <input
            type="search"
            placeholder="Search public APIs"
            [value]="query()"
            (input)="updateQuery($event)"
          />
        </label>
        <label>
          <span>Category</span>
          <select [value]="category()" (change)="updateCategory($event)">
            <option value="">All categories</option>
            @for (item of categories; track item) {
              <option [value]="item">{{ item }}</option>
            }
          </select>
        </label>
      </section>

      <p class="j-index-result-count" aria-live="polite">
        {{ filteredItems().length }} public items
      </p>

      <div class="j-public-index-grid">
        @for (item of filteredItems(); track item.kind + item.identifier) {
          <article>
            <header>
              <span>{{ item.kind }}</span
              ><small>{{ item.documentationStatus }}</small>
            </header>
            <h2>{{ item.name }}</h2>
            <code>{{ item.identifier }}</code>
            <p>{{ item.description }}</p>
            <dl>
              <div>
                <dt>Category</dt>
                <dd>{{ item.category }}</dd>
              </div>
              <div>
                <dt>Import</dt>
                <dd>
                  <code>{{ item.importPath }}</code>
                </dd>
              </div>
            </dl>
            <a
              [routerLink]="item.documentationRoute.split('#')[0]"
              [fragment]="item.documentationRoute.split('#')[1] || undefined"
              >Documentation</a
            >
          </article>
        } @empty {
          <div class="j-doc-empty-detail">
            <j-icon name="search" />
            <p>No public APIs match the current search and category.</p>
          </div>
        }
      </div>
    </div>
  `,
})
export class PublicItemIndexPageComponent {
  private readonly analytics = inject(DocsAnalyticsService);
  readonly categories = publicItemCategories;
  readonly query = signal('');
  readonly category = signal('');
  readonly filteredItems = computed(() => {
    const query = this.query().trim().toLocaleLowerCase();
    const category = this.category();
    return publicItemIndex.filter((item) => {
      const categoryMatch = !category || item.category === category;
      const searchText = [
        item.name,
        item.identifier,
        item.category,
        item.description,
        ...item.useCases,
      ]
        .join(' ')
        .toLocaleLowerCase();
      return categoryMatch && (!query || searchText.includes(query));
    });
  });

  updateQuery(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.query.set(value);
    this.analytics.track('search_use', { area: 'public_api', hasQuery: Boolean(value.trim()) });
  }
  updateCategory(event: Event): void {
    this.category.set((event.target as HTMLSelectElement).value);
  }
}
