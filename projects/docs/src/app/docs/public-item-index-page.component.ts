import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { JIconComponent } from 'jrng-ui/icon';
import {
  publicItemCategories,
  publicItemIndex,
  type PublicItemIndexRecord,
} from './public-item-index.data';
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
          Search exported components, directives, pipes, services, and tokens by identifier,
          selector, category, stability, or import path.
        </p>
      </header>

      <section class="j-doc-section-block" aria-labelledby="component-completeness-heading">
        <h2 id="component-completeness-heading">Component completeness</h2>
        <dl class="j-doc-quality-summary">
          <div>
            <dt>Public components</dt>
            <dd>{{ componentCount }}</dd>
          </div>
          <div>
            <dt>Documentation</dt>
            <dd>{{ completeComponentCount('documentation') }}</dd>
          </div>
          <div>
            <dt>Previews</dt>
            <dd>{{ completeComponentCount('preview') }}</dd>
          </div>
          <div>
            <dt>Examples</dt>
            <dd>{{ completeComponentCount('examples') }}</dd>
          </div>
          <div>
            <dt>API references</dt>
            <dd>{{ completeComponentCount('apiReference') }}</dd>
          </div>
          <div>
            <dt>Direct tests</dt>
            <dd>{{ completeComponentCount('tests') }}</dd>
          </div>
          <div>
            <dt>Accessibility</dt>
            <dd>{{ completeComponentCount('accessibility') }}</dd>
          </div>
          <div>
            <dt>Theme</dt>
            <dd>{{ completeComponentCount('theme') }}</dd>
          </div>
        </dl>
      </section>

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
        <label>
          <span>Stability</span>
          <select [value]="stability()" (change)="updateStability($event)">
            <option value="">All stability levels</option>
            @for (item of stabilityLevels; track item) {
              <option [value]="item">{{ item }}</option>
            }
          </select>
        </label>
        <label>
          <span>Sort</span>
          <select [value]="sortMode()" (change)="updateSort($event)">
            <option value="alphabetical">Alphabetical</option>
            <option value="category">Category</option>
          </select>
        </label>
      </section>

      <p class="j-index-result-count" aria-live="polite">
        {{ filteredItems().length }} public items
      </p>

      <div class="j-public-index-grid">
        @for (item of filteredItems(); track item.kind + item.identifier) {
          <article
            [attr.id]="item.kind === 'Component' ? null : item.documentationRoute.split('#')[1]"
          >
            <header>
              <span>{{ item.kind }}</span
              ><small>{{ item.stability }}</small>
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
            @if (item.kind === 'Component') {
              <dl aria-label="Component quality coverage">
                <div>
                  <dt>Documentation</dt>
                  <dd>{{ item.quality.documentation }}</dd>
                </div>
                <div>
                  <dt>Preview</dt>
                  <dd>{{ item.quality.preview }}</dd>
                </div>
                <div>
                  <dt>Examples</dt>
                  <dd>{{ item.quality.examples }}</dd>
                </div>
                <div>
                  <dt>API reference</dt>
                  <dd>{{ item.quality.apiReference }}</dd>
                </div>
                <div>
                  <dt>Tests</dt>
                  <dd>{{ item.quality.tests }}</dd>
                </div>
                <div>
                  <dt>Accessibility</dt>
                  <dd>{{ item.quality.accessibility }}</dd>
                </div>
                <div>
                  <dt>Responsive</dt>
                  <dd>{{ item.quality.responsive }}</dd>
                </div>
                <div>
                  <dt>Theme</dt>
                  <dd>{{ item.quality.theme }}</dd>
                </div>
              </dl>
            }
            @if (item.signatures.length) {
              <details>
                <summary>API reference</summary>
                @for (signature of item.signatures.slice(0, 8); track signature) {
                  <code>{{ signature }}</code>
                }
              </details>
            }
            <a
              [routerLink]="item.documentationRoute.split('#')[0]"
              [fragment]="item.documentationRoute.split('#')[1] || undefined"
              >Documentation</a
            >
          </article>
        } @empty {
          <div class="j-doc-empty-detail">
            <j-icon name="search" />
            <p>No public APIs match the current filters.</p>
          </div>
        }
      </div>
    </div>
  `,
})
export class PublicItemIndexPageComponent {
  private readonly analytics = inject(DocsAnalyticsService);
  readonly categories = publicItemCategories;
  readonly componentCount = publicItemIndex.filter((item) => item.kind === 'Component').length;
  readonly stabilityLevels = ['Stable', 'Beta', 'Experimental'] as const;
  readonly query = signal('');
  readonly category = signal('');
  readonly stability = signal('');
  readonly sortMode = signal<'alphabetical' | 'category'>('alphabetical');
  readonly filteredItems = computed(() => {
    const query = this.query().trim().toLocaleLowerCase();
    const category = this.category();
    const stability = this.stability();
    const items = publicItemIndex.filter((item) => {
      const categoryMatch = !category || item.category === category;
      const stabilityMatch = !stability || item.stability === stability;
      const searchText = [
        item.name,
        item.identifier,
        item.category,
        item.description,
        item.importPath,
        item.stability,
        ...item.searchTerms,
      ]
        .join(' ')
        .toLocaleLowerCase();
      return categoryMatch && stabilityMatch && (!query || searchText.includes(query));
    });
    return [...items].sort(this.compareItems(this.sortMode()));
  });

  updateQuery(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.query.set(value);
    this.analytics.track('search_use', { area: 'public_api', hasQuery: Boolean(value.trim()) });
  }
  updateCategory(event: Event): void {
    this.category.set((event.target as HTMLSelectElement).value);
  }
  updateStability(event: Event): void {
    this.stability.set((event.target as HTMLSelectElement).value);
  }
  updateSort(event: Event): void {
    this.sortMode.set((event.target as HTMLSelectElement).value as 'alphabetical' | 'category');
  }

  completeComponentCount(key: keyof PublicItemIndexRecord['quality']): number {
    return publicItemIndex.filter(
      (item) => item.kind === 'Component' && item.quality[key] === 'Complete',
    ).length;
  }

  private compareItems(mode: 'alphabetical' | 'category') {
    return (left: PublicItemIndexRecord, right: PublicItemIndexRecord): number =>
      mode === 'category'
        ? left.category.localeCompare(right.category) || left.name.localeCompare(right.name)
        : left.name.localeCompare(right.name);
  }
}
