import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { JBadgeComponent } from 'jrng-ui/badge';
import { JButtonComponent } from 'jrng-ui/button';
import { JCardComponent } from 'jrng-ui/card';
import { JCheckboxComponent } from 'jrng-ui/checkbox';
import { JInputComponent } from 'jrng-ui/input';
import { JIconComponent } from 'jrng-ui/icon';
import { JSwitchComponent } from 'jrng-ui/switch';
import { componentDocs } from '../docs/component-docs.data';
import { DocsAnalyticsService } from '../core/analytics.service';

interface Feature {
  readonly icon: string;
  readonly tag: string;
  readonly title: string;
  readonly text: string;
  readonly hero?: boolean;
}

interface Stat {
  readonly label: string;
  readonly value: string;
  readonly delta: string;
  readonly tone: 'up' | 'down' | 'neutral';
}

interface CategoryPreview {
  readonly name: string;
  readonly count: number;
}

@Component({
  selector: 'app-home-page',
  imports: [
    RouterLink,
    JButtonComponent,
    JInputComponent,
    JIconComponent,
    JCheckboxComponent,
    JSwitchComponent,
    JBadgeComponent,
    JCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="docs-home">
      <section class="docs-home-hero">
        <div class="docs-home-hero__glow" aria-hidden="true"></div>
        <div class="docs-container docs-home-hero__inner">
          <div class="docs-home-hero__copy">
            <span class="docs-home-pill">
              <span aria-hidden="true"></span>
              jrng-ui@0.0.9
            </span>

            <h1>
              <span class="docs-home-highlight">Premium UI Suite for Angular</span>
            </h1>

            <p>
              Build responsive admin panels and dashboards with {{ totalComponents }}+ standalone
              components, advanced data tools, accessible themes, SSR support, and modular imports.
            </p>

            <div class="docs-cta">
              <a
                class="docs-btn docs-btn--primary"
                routerLink="/docs"
                (click)="analytics.track('get_started_click')"
              >
                Get started
                <span aria-hidden="true">-></span>
              </a>
              <a class="docs-btn docs-btn--ghost" routerLink="/docs/components">
                View components
              </a>
              <a class="docs-btn docs-btn--ghost" routerLink="/examples">Live examples</a>
              <a
                class="docs-btn docs-btn--ghost docs-btn--icon"
                [href]="githubUrl"
                target="_blank"
                rel="noreferrer"
                (click)="analytics.track('github_click')"
              >
                GitHub
              </a>
              <a
                class="docs-btn docs-btn--ghost"
                [href]="npmUrl"
                target="_blank"
                rel="noreferrer"
                (click)="analytics.track('npm_click')"
              >
                npm
              </a>
              <a
                class="docs-btn docs-btn--ghost"
                routerLink="/admin-starter"
                (click)="analytics.track('admin_starter_click')"
                >Admin Starter</a
              >
            </div>

            <div class="docs-home-trust" aria-label="Built for application teams">
              <span
                >Built for admin consoles, back-office tools, dashboards, and design systems</span
              >
              <div>
                <strong>Standalone</strong>
                <strong>Zoneless</strong>
                <strong>SSR-ready</strong>
                <strong>Accessible</strong>
              </div>
            </div>
          </div>

          <div class="docs-home-showcase" aria-label="Dashboard showcase">
            <div class="docs-home-showcase__rail" aria-hidden="true">
              <span class="is-brand">JR</span>
              <span class="is-active"></span>
              <span></span>
              <span></span>
              <span></span>
            </div>

            <div class="docs-home-showcase__panel">
              <header>
                <div>
                  <span class="docs-home-live">
                    <span></span>
                    Live
                  </span>
                  <h2>Portfolio command</h2>
                  <p>Monitor exposure, settlement flow, and component adoption.</p>
                </div>
                <div class="docs-home-search">Search components</div>
              </header>

              <div class="docs-home-segments" aria-hidden="true">
                <span>Weekly</span>
                <span class="is-active">Monthly</span>
                <span>Yearly</span>
              </div>

              <div class="docs-home-stats">
                @for (stat of stats; track stat.label) {
                  <article [attr.data-tone]="stat.tone">
                    <span>{{ stat.label }}</span>
                    <strong>{{ stat.value }}</strong>
                    <small>{{ stat.delta }}</small>
                  </article>
                }
              </div>

              <div class="docs-home-chart" aria-hidden="true">
                <div class="docs-home-chart__header">
                  <strong>Component activity</strong>
                  <span>Last 12 weeks</span>
                </div>
                <svg viewBox="0 0 640 160" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="homeChartFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stop-color="var(--j-color-primary)" stop-opacity="0.22" />
                      <stop offset="100%" stop-color="var(--j-color-primary)" stop-opacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,126 L58,104 L116,111 L174,72 L232,82 L291,52 L349,62 L407,36 L465,48 L523,20 L581,30 L640,8 L640,160 L0,160 Z"
                    fill="url(#homeChartFill)"
                  />
                  <path
                    d="M0,126 L58,104 L116,111 L174,72 L232,82 L291,52 L349,62 L407,36 L465,48 L523,20 L581,30 L640,8"
                  />
                  <path
                    d="M0,92 L58,100 L116,82 L174,88 L232,70 L291,76 L349,54 L407,64 L465,44 L523,54 L581,34 L640,42"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main class="docs-home-main docs-container">
        <section class="docs-home-section">
          <div class="docs-home-section__heading">
            <span class="docs-eyebrow">Angular business application components</span>
            <h2>A focused Angular design system for operational interfaces.</h2>
            <p>
              JRNG UI is designed for teams building admin panels and business applications.
              Evaluate its APIs, accessibility, component coverage, maintenance needs, and migration
              cost against your own requirements.
            </p>
          </div>
        </section>
        <section class="docs-home-section">
          <div class="docs-home-section__heading">
            <span class="docs-eyebrow">Core engineering</span>
            <h2>Engineered for scale.</h2>
            <p>
              A dependency-free foundation for dense product interfaces, tuned for Angular
              applications that need strict APIs, runtime themes, and reliable accessibility.
            </p>
          </div>

          <div class="docs-home-bento">
            @for (feature of features; track feature.title) {
              <article [class.is-hero]="feature.hero">
                <span class="docs-home-feature-icon" aria-hidden="true">{{ feature.icon }}</span>
                <small>{{ feature.tag }}</small>
                <h3>{{ feature.title }}</h3>
                <p>{{ feature.text }}</p>
              </article>
            }
          </div>
        </section>

        <section class="docs-home-section">
          <div class="docs-home-section__heading docs-home-section__heading--split">
            <div>
              <span class="docs-eyebrow">Inventory</span>
              <h2>Component manifest</h2>
              <p>
                Explore {{ totalComponents }}+ production-ready primitives across
                {{ categoryPreviews.length }} documentation groups.
              </p>
            </div>
            <a routerLink="/docs/components">Browse full directory -></a>
          </div>

          <div class="docs-home-manifest">
            <a class="docs-home-manifest__feature" routerLink="/docs/components">
              <small>Directory</small>
              <strong>{{ totalComponents }}+</strong>
              <span>Standalone components with focused secondary entrypoints.</span>
              <em>Browse components -></em>
            </a>

            @for (category of categoryPreviews; track category.name; let index = $index) {
              <a
                class="docs-home-manifest__category"
                routerLink="/docs/components"
                [attr.aria-label]="category.name + ', ' + category.count + ' components'"
              >
                <span class="docs-home-manifest__category-top" aria-hidden="true">
                  <small>{{ index + 1 }}</small>
                  <j-icon class="docs-home-manifest__arrow" name="chevron-right" />
                </span>
                <strong class="docs-home-manifest__category-name">{{ category.name }}</strong>
                <span class="docs-home-manifest__count">
                  <b>{{ category.count }}</b>
                  components
                </span>
              </a>
            }
          </div>
        </section>

        <section class="docs-home-section docs-home-code-section">
          <div class="docs-home-section__heading docs-home-section__heading--center">
            <span class="docs-eyebrow">Developer experience</span>
            <h2>Built for Angular.</h2>
            <p>
              Clean standalone imports, typed inputs, semantic variants, and a theme system that
              flows through every component.
            </p>
          </div>

          <div class="docs-home-code-grid">
            <pre class="docs-code"><code>{{ usageSnippet }}</code></pre>
            <div class="docs-home-live-components">
              <pre class="docs-code"><code>{{ themeSnippet }}</code></pre>
              <div class="docs-demo">
                <j-button label="Primary" />
                <j-button label="Outlined" variant="outlined" />
                <j-input label="Email" placeholder="name@example.com" />
                <j-checkbox label="Subscribe" />
                <j-switch label="Notifications" />
                <j-badge value="New" />
                <j-card header="Surface" subheader="Token-driven" variant="outlined">
                  <p>Docs components react to the active theme controls in the header.</p>
                </j-card>
              </div>
            </div>
          </div>
        </section>

        <section class="docs-home-cta">
          <h2>Start building today.</h2>
          <p>Free, open source, MIT licensed, and ready for Angular 21 projects.</p>
          <div class="docs-cta">
            <a class="docs-btn docs-btn--primary" routerLink="/docs">Read the docs</a>
            <a class="docs-btn docs-btn--ghost" routerLink="/docs/components">Browse components</a>
          </div>
        </section>
      </main>
    </div>
  `,
})
export class HomePageComponent {
  readonly analytics = inject(DocsAnalyticsService);
  readonly githubUrl = 'https://github.com/gokujy/jrng-ui';
  readonly npmUrl = 'https://www.npmjs.com/package/jrng-ui';
  readonly totalComponents = componentDocs.length;
  readonly categoryPreviews: readonly CategoryPreview[] = Array.from(
    new Set(componentDocs.map((doc) => doc.category)),
  )
    .map((name) => ({
      name,
      count: componentDocs.filter((doc) => doc.category === name).length,
    }))
    .sort((a, b) => b.count - a.count);

  readonly stats: readonly Stat[] = [
    { label: 'Components', value: `${this.totalComponents}+`, delta: '+registry', tone: 'up' },
    { label: 'Entrypoints', value: '1:1', delta: 'tree-shakeable', tone: 'neutral' },
    { label: 'Theme modes', value: '3', delta: 'light/dark/system', tone: 'up' },
    { label: 'Status', value: '0.0.9', delta: 'current', tone: 'down' },
  ];

  readonly features: readonly Feature[] = [
    {
      icon: 'S',
      tag: 'runtime',
      title: 'Signal-driven & zoneless',
      text: 'Angular 21 APIs, standalone components, and lean primitives for dense product workflows.',
      hero: true,
    },
    {
      icon: 'A',
      tag: 'a11y',
      title: 'Accessibility baked in',
      text: 'Keyboard behavior, ARIA wiring, focus states, and semantic contracts are documented with each primitive.',
    },
    {
      icon: 'T',
      tag: 'theming',
      title: 'Runtime design tokens',
      text: 'Swap mode, palette, density, and component tokens at runtime through CSS variables.',
    },
    {
      icon: 'E',
      tag: 'bundling',
      title: 'Secondary entrypoints',
      text: 'Import only what a screen needs from package paths like jrng-ui/button or jrng-ui/table.',
    },
    {
      icon: 'D',
      tag: 'docs',
      title: 'Generated registry',
      text: 'The docs catalogue is backed by the actual library source so coverage gaps stay visible.',
    },
    {
      icon: 'R',
      tag: 'rendering',
      title: 'SSR-aware utilities',
      text: 'Clipboard, focus, overlay, storage, and timing utilities are guarded for browser and server environments.',
    },
  ];

  readonly usageSnippet = `import { Component } from '@angular/core';
import { JButtonComponent } from 'jrng-ui/button';
import { JInputComponent } from 'jrng-ui/input';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [JButtonComponent, JInputComponent],
  template: \`
    <j-input label="Email" placeholder="you@company.com" />
    <j-button label="Subscribe" />
  \`,
})
export class SignupComponent {}`;

  readonly themeSnippet = `// styles.scss
@use 'jrng-ui/styles';

// Toggle dark mode with a class:
// <html class="j-dark">`;
}
