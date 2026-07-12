import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { CodeBlockComponent } from '../docs/code-block.component';
import { guides } from './guides.data';

@Component({
  selector: 'app-guides-page',
  imports: [RouterLink, CodeBlockComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="docs-container">
    @if (guide(); as item) {
      <article class="j-guide">
        <nav aria-label="Breadcrumb">
          <a routerLink="/guides">Guides</a> / <span>{{ item.title }}</span>
        </nav>
        <header class="j-page-hero j-page-hero--docs">
          <span class="j-page-eyebrow">Technical guide</span>
          <h1>{{ item.title }}</h1>
          <p>{{ item.description }}</p>
        </header>
        <section>
          <h2>Problem</h2>
          <p>{{ item.problem }}</p>
        </section>
        <section>
          <h2>Implementation</h2>
          <ol>
            @for (step of item.implementation; track step) {
              <li>{{ step }}</li>
            }
          </ol>
        </section>
        <section>
          <h2>Complete code</h2>
          <app-code-block label="Angular" language="ts" [code]="item.code" />
        </section>
        <section>
          <h2>Explanation</h2>
          <ul>
            @for (point of item.explanation; track point) {
              <li>{{ point }}</li>
            }
          </ul>
        </section>
        <section>
          <h2>Accessibility notes</h2>
          <ul>
            @for (point of item.accessibility; track point) {
              <li>{{ point }}</li>
            }
          </ul>
        </section>
        <section>
          <h2>Common mistakes</h2>
          <ul>
            @for (point of item.mistakes; track point) {
              <li>{{ point }}</li>
            }
          </ul>
        </section>
        <section>
          <h2>Related components</h2>
          <div class="docs-cta">
            @for (related of item.related; track related.name) {
              <a
                class="docs-btn docs-btn--ghost"
                routerLink="/docs/components"
                [fragment]="related.slug"
                >{{ related.name }}</a
              >
            }
          </div>
        </section>
      </article>
    } @else {
      <header class="j-page-hero j-page-hero--docs">
        <span class="j-page-eyebrow">Guides</span>
        <h1>Build Angular business applications with JRNG UI</h1>
        <p>
          Complete implementation guides for dashboards, data, forms, themes, confirmations,
          responsive layouts, SSR and zoneless Angular.
        </p>
      </header>
      <div class="j-guide-index">
        @for (item of allGuides; track item.slug) {
          <article>
            <h2>
              <a [routerLink]="['/guides', item.slug]">{{ item.title }}</a>
            </h2>
            <p>{{ item.description }}</p>
            <a [routerLink]="['/guides', item.slug]">Read guide</a>
          </article>
        }
      </div>
    }
  </div>`,
})
export class GuidesPageComponent {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  readonly slug = input('');
  readonly allGuides = guides;
  readonly guide = computed(() => guides.find((item) => item.slug === this.slug()) ?? null);

  constructor() {
    effect(() => {
      const guide = this.guide();
      if (!guide) return;
      this.title.setTitle(`${guide.title} - JRNG UI`);
      this.meta.updateTag({ name: 'description', content: guide.description });
    });
  }
}
