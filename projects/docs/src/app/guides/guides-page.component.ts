import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { JButtonComponent } from 'jrng-ui/button';
import { JAffixDirective } from 'jrng-ui/affix';
import { JDragDirective, JDragHandleDirective, JDropListDirective } from 'jrng-ui/drag-drop';
import { JPanDirective, JSwipeDirective, JZoomDirective } from 'jrng-ui/gesture';
import { JMentionDirective } from 'jrng-ui/mention';
import { JPortalDirective, JPortalOutletDirective } from 'jrng-ui/portal';
import { JTruncateMiddleDirective } from 'jrng-ui/truncate';
import { CodeBlockComponent } from '../docs/code-block.component';
import { guides } from './guides.data';

@Component({
  selector: 'app-guides-page',
  imports: [
    RouterLink,
    CodeBlockComponent,
    JButtonComponent,
    JAffixDirective,
    JDragDirective,
    JDragHandleDirective,
    JDropListDirective,
    JPanDirective,
    JSwipeDirective,
    JZoomDirective,
    JMentionDirective,
    JPortalDirective,
    JPortalOutletDirective,
    JTruncateMiddleDirective,
  ],
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
        @if (item.slug === 'interaction-foundations') {
          <section>
            <h2>Live preview</h2>
            <div class="j-preview-stack">
              <div class="j-preview-row">
                <j-button label="Attach toolbar" (onClick)="portal.attach()" />
                <j-button label="Detach toolbar" variant="outlined" (onClick)="outlet.detach()" />
              </div>
              <ng-template [jPortal]="outlet" #portal="jPortal">
                <div
                  class="j-doc-preview-card"
                  role="toolbar"
                  aria-label="Dynamic customer toolbar"
                >
                  Customer toolbar attached through a template portal
                </div>
              </ng-template>
              <div jPortalOutlet #outlet="jPortalOutlet"></div>
              <p
                [jTruncateMiddle]="'customer-contract-renewal-approved-final.pdf'"
                [maxCharacters]="28"
                preserveExtension
              ></p>
              <div
                class="j-doc-preview-card"
                jSwipe
                jPan
                jZoom
                tabindex="0"
                aria-label="Gesture surface; use the buttons for keyboard alternatives"
                (swipe)="gestureStatus = 'Swipe ' + $event.direction"
                (panEnd)="gestureStatus = 'Pan completed'"
                (zoom)="gestureStatus = 'Zoom ' + $event.scale.toFixed(2)"
              >
                {{ gestureStatus }}
              </div>
              <div class="j-preview-row" aria-label="Gesture keyboard alternatives">
                <j-button
                  label="Move left"
                  variant="outlined"
                  (onClick)="gestureStatus = 'Move left'"
                />
                <j-button
                  label="Zoom in"
                  variant="outlined"
                  (onClick)="gestureStatus = 'Zoom 1.10'"
                />
              </div>
              <div
                class="j-doc-preview-card"
                jDropList
                [(data)]="previewCustomers"
                aria-label="Customer ordering"
              >
                @for (customer of previewCustomers; track customer) {
                  <div jDrag [data]="customer" [dragLabel]="customer">
                    <button type="button" jDragHandle aria-label="Reorder customer">↕</button>
                    {{ customer }}
                  </div>
                }
              </div>
            </div>
          </section>
        }
        @if (item.slug === 'hierarchical-inputs') {
          <section>
            <h2>Live mention preview</h2>
            <div class="j-preview-stack">
              <label for="mention-preview">Customer note</label>
              <textarea
                id="mention-preview"
                [jMention]="mentionPeople"
                [debounce]="0"
                placeholder="Type @ to mention an account manager"
              ></textarea>
              <p class="j-preview-note">
                Type @, use Arrow keys to move, Enter to insert, or Escape to close.
              </p>
            </div>
          </section>
        }
        @if (item.slug === 'layout-behaviors') {
          <section>
            <h2>Live Affix preview</h2>
            <div
              #affixScroll
              class="j-preview-stack"
              style="max-height: 12rem; overflow: auto"
              aria-label="Scrollable customer list"
            >
              <div
                [jAffix]="'top'"
                [scrollContainer]="affixScroll"
                [offset]="0"
                class="j-doc-preview-card"
              >
                Customer filters remain available
              </div>
              @for (customer of affixCustomers; track customer) {
                <p>{{ customer }}</p>
              }
            </div>
          </section>
        }
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
  previewCustomers: unknown[] = ['Aster Labs', 'Northstar Goods', 'Cedar Systems'];
  readonly mentionPeople = [
    { label: 'Avery Reed', value: 'avery' },
    { label: 'Morgan Kim', value: 'morgan' },
  ];
  readonly affixCustomers = Array.from(
    { length: 10 },
    (_, index) => `CUS-${String(index + 1).padStart(4, '0')} · Fictional customer`,
  );
  gestureStatus = 'Swipe, pan or pinch this surface';

  constructor() {
    effect(() => {
      const guide = this.guide();
      if (!guide) return;
      this.title.setTitle(`${guide.title} - JRNG UI`);
      this.meta.updateTag({ name: 'description', content: guide.description });
    });
  }
}
