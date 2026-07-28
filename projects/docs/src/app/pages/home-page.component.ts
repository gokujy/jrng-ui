import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { JBadgeComponent } from 'jrng-ui/badge';
import { JButtonComponent } from 'jrng-ui/button';
import { JCardComponent } from 'jrng-ui/card';
import { JCheckboxComponent } from 'jrng-ui/checkbox';
import { JInputComponent } from 'jrng-ui/input';
import { JIconComponent } from 'jrng-ui/icon';
import { JSwitchComponent } from 'jrng-ui/switch';
import { JTableColumn, JTableComponent } from 'jrng-ui/table';
import { componentDocs } from '../docs/component-docs.data';
import { generatedComponentCategories } from '../docs/generated-component-categories';
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

interface FooterGroup {
  readonly title: string;
  readonly links: readonly {
    readonly label: string;
    readonly path: string;
    readonly external?: boolean;
  }[];
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
    JTableComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="docs-home">
      <div class="j-docs-home-announcement">
        <span>JRNG UI 0.1 brings three original presets and expanded advanced components.</span>
        <a routerLink="/themes">Explore theming</a>
      </div>
      <section class="docs-home-hero">
        <div class="docs-home-hero__glow" aria-hidden="true"></div>
        <div class="docs-container docs-home-hero__inner">
          <div class="docs-home-hero__copy">
            <span class="docs-home-pill">
              <span aria-hidden="true"></span>
              jrng-ui@0.1.0 · Angular 21
            </span>

            <h1>
              <span class="docs-home-highlight">Build clear, capable Angular products.</span>
            </h1>

            <p>
              JRNG UI gives product teams standalone Angular components, advanced data tools,
              accessible themes, SSR support, and modular imports for real operational software.
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
                  <h2>Customer workspace</h2>
                  <p>Monitor growth, subscriptions, support cases, and account activity.</p>
                </div>
                <j-input ariaLabel="Search customers" placeholder="Search customers" />
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
                  <strong>Customer growth</strong>
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
            <span class="docs-eyebrow">Theme presets</span>
            <h2>One JRNG system, three distinct working styles.</h2>
            <p>Switch presets from the settings button to see every preview update live.</p>
          </div>
          <div class="j-docs-home-presets">
            @for (preset of presets; track preset.name) {
              <article [attr.data-preset]="preset.name.toLowerCase()">
                <span>{{ preset.name }}</span>
                <h3>{{ preset.title }}</h3>
                <p>{{ preset.description }}</p>
                <div aria-hidden="true"><i></i><i></i><i></i></div>
              </article>
            }
          </div>
        </section>

        <section class="docs-home-section">
          <div class="docs-home-section__heading docs-home-section__heading--split">
            <div>
              <span class="docs-eyebrow">Featured component</span>
              <h2>A customer table that starts simple.</h2>
              <p>Search, sort, scan status, and paginate without mixing in editing or expansion.</p>
            </div>
            <a routerLink="/docs/components" fragment="table">Explore j-table -></a>
          </div>
          <div class="j-docs-home-featured-table">
            <j-table
              caption="Customers"
              [value]="customers"
              [columns]="customerColumns"
              [paginator]="true"
              [rows]="5"
              [showGlobalFilter]="true"
              globalFilterPlaceholder="Search customers"
              responsiveMode="scroll"
            />
          </div>
        </section>

        <section class="docs-home-section">
          <div class="docs-home-section__heading">
            <span class="docs-eyebrow">Advanced workflows</span>
            <h2>Go beyond foundational controls.</h2>
            <p>These cards link only to advanced components implemented in this repository.</p>
          </div>
          <div class="j-docs-home-advanced">
            @for (component of advancedComponents; track component.slug) {
              <a routerLink="/docs/components" [fragment]="component.slug">
                <j-icon [name]="component.icon" aria-hidden="true" />
                <div>
                  <h3>{{ component.name }}</h3>
                  <p>{{ component.description }}</p>
                </div>
                <span aria-hidden="true">-></span>
              </a>
            }
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

      <footer class="j-docs-home-footer docs-container">
        @for (group of footerGroups; track group.title) {
          <section>
            <h2>{{ group.title }}</h2>
            @for (link of group.links; track link.label) {
              @if (link.external) {
                <a [href]="link.path" target="_blank" rel="noreferrer">{{ link.label }}</a>
              } @else {
                <a [routerLink]="link.path">{{ link.label }}</a>
              }
            }
          </section>
        }
      </footer>
    </div>
  `,
  styles: [
    `
      .j-docs-home-announcement {
        align-items: center;
        background: var(--j-color-primary-soft);
        color: var(--j-color-foreground);
        display: flex;
        font-size: var(--j-font-size-sm);
        gap: var(--j-spacing-3);
        justify-content: center;
        padding: var(--j-spacing-2) var(--j-spacing-4);
        text-align: center;
      }
      .j-docs-home-announcement a {
        color: var(--j-color-primary);
        font-weight: var(--j-font-weight-semibold);
      }
      .j-docs-home-presets {
        display: grid;
        gap: var(--j-spacing-4);
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
      .j-docs-home-presets article,
      .j-docs-home-featured-table {
        background: var(--j-color-card);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-xl);
        padding: var(--j-spacing-5);
      }
      .j-docs-home-presets article > span {
        color: var(--j-color-primary);
        font-size: var(--j-font-size-xs);
        font-weight: var(--j-font-weight-bold);
        text-transform: uppercase;
      }
      .j-docs-home-presets h3,
      .j-docs-home-presets p {
        margin-block: var(--j-spacing-2) 0;
      }
      .j-docs-home-presets p {
        color: var(--j-color-muted-foreground);
      }
      .j-docs-home-presets article > div {
        display: grid;
        gap: var(--j-spacing-2);
        grid-template-columns: 2fr 1fr 1fr;
        margin-top: var(--j-spacing-5);
      }
      .j-docs-home-presets i {
        background: var(--j-color-primary);
        border-radius: var(--j-radius-sm);
        display: block;
        height: 2.25rem;
        opacity: 0.3;
      }
      .j-docs-home-presets i:first-child {
        opacity: 0.85;
      }
      .j-docs-home-advanced {
        display: grid;
        gap: var(--j-spacing-3);
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
      .j-docs-home-advanced a {
        align-items: center;
        background: var(--j-color-card);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-lg);
        color: inherit;
        display: flex;
        gap: var(--j-spacing-3);
        padding: var(--j-spacing-4);
        text-decoration: none;
      }
      .j-docs-home-advanced a:hover {
        border-color: var(--j-color-primary);
        transform: translateY(-2px);
      }
      .j-docs-home-advanced h3,
      .j-docs-home-advanced p {
        margin: 0;
      }
      .j-docs-home-advanced p {
        color: var(--j-color-muted-foreground);
        font-size: var(--j-font-size-sm);
        margin-top: var(--j-spacing-1);
      }
      .j-docs-home-advanced a > span {
        margin-inline-start: auto;
      }
      .j-docs-home-footer {
        border-top: 1px solid var(--j-color-border);
        display: grid;
        gap: var(--j-spacing-6);
        grid-template-columns: repeat(4, minmax(0, 1fr));
        padding-block: var(--j-spacing-8);
      }
      .j-docs-home-footer section {
        display: grid;
        gap: var(--j-spacing-2);
      }
      .j-docs-home-footer h2 {
        font-size: var(--j-font-size-sm);
        margin: 0;
      }
      .j-docs-home-footer a {
        color: var(--j-color-muted-foreground);
        font-size: var(--j-font-size-sm);
        text-decoration: none;
      }
      .j-docs-home-footer a:hover {
        color: var(--j-color-primary);
      }
      @media (max-width: 800px) {
        .j-docs-home-presets,
        .j-docs-home-advanced {
          grid-template-columns: 1fr;
        }
        .j-docs-home-footer {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      @media (max-width: 480px) {
        .j-docs-home-announcement {
          align-items: flex-start;
          flex-direction: column;
        }
        .j-docs-home-footer {
          grid-template-columns: 1fr;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .j-docs-home-advanced a:hover {
          transform: none;
        }
      }
    `,
  ],
})
export class HomePageComponent {
  readonly analytics = inject(DocsAnalyticsService);
  readonly githubUrl = 'https://github.com/gokujy/jrng-ui';
  readonly npmUrl = 'https://www.npmjs.com/package/jrng-ui';
  readonly totalComponents = componentDocs.length;
  readonly categoryPreviews: readonly CategoryPreview[] = generatedComponentCategories.map(
    ({ name, count }) => ({ name, count }),
  );

  readonly stats: readonly Stat[] = [
    { label: 'Active customers', value: '1,284', delta: '+8.6% this quarter', tone: 'up' },
    { label: 'Subscriptions', value: '936', delta: '73% active', tone: 'neutral' },
    { label: 'Support cases', value: '24', delta: '6 need attention', tone: 'down' },
    { label: 'Renewals', value: '48', delta: 'next 30 days', tone: 'up' },
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
      text: 'Use Default, Material, or Nexus with live palette, surface, and light/dark controls.',
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

  readonly presets = [
    {
      name: 'Default',
      title: 'Balanced by design',
      description: 'A modern general-purpose foundation for product interfaces.',
    },
    {
      name: 'Material',
      title: 'Structured and familiar',
      description: 'JRNG styling inspired by Material Design principles.',
    },
    {
      name: 'Nexus',
      title: 'Compact and information-rich',
      description: 'An enterprise preset for dashboards and operational tools.',
    },
  ] as const;

  readonly customerColumns: readonly JTableColumn[] = [
    { field: 'id', header: 'Customer ID', sortable: true, width: '8rem' },
    { field: 'name', header: 'Customer Name', sortable: true, width: '12rem' },
    { field: 'company', header: 'Company', sortable: true, width: '13rem' },
    { field: 'manager', header: 'Account Manager', sortable: true, width: '12rem' },
    { field: 'joined', header: 'Joined Date', type: 'date', sortable: true, width: '10rem' },
    { field: 'status', header: 'Status', type: 'status', sortable: true, width: '8rem' },
    { field: 'activity', header: 'Activity', sortable: true, align: 'end', width: '7rem' },
  ];

  readonly customers = [
    {
      id: 'CUS-1042',
      name: 'Mira Patel',
      company: 'Northwind Harbor',
      manager: 'Evan Cole',
      joined: new Date('2025-02-14'),
      status: 'Active',
      activity: 18,
    },
    {
      id: 'CUS-1048',
      name: 'Jon Bell',
      company: 'Willow & Pine',
      manager: 'Lena Ortiz',
      joined: new Date('2025-03-08'),
      status: 'Active',
      activity: 12,
    },
    {
      id: 'CUS-1051',
      name: 'Amara Reed',
      company: 'Brightpath Works',
      manager: 'Evan Cole',
      joined: new Date('2025-04-19'),
      status: 'Onboarding',
      activity: 9,
    },
    {
      id: 'CUS-1057',
      name: 'Noah Kim',
      company: 'Summit Field Labs',
      manager: 'Priya Shah',
      joined: new Date('2025-05-27'),
      status: 'Active',
      activity: 21,
    },
    {
      id: 'CUS-1063',
      name: 'Sofia Lane',
      company: 'Copperline Studio',
      manager: 'Lena Ortiz',
      joined: new Date('2025-06-11'),
      status: 'Review',
      activity: 7,
    },
    {
      id: 'CUS-1068',
      name: 'Theo Grant',
      company: 'Juniper Systems',
      manager: 'Priya Shah',
      joined: new Date('2025-07-02'),
      status: 'Active',
      activity: 15,
    },
  ] as const;

  readonly advancedComponents = [
    {
      slug: 'query-builder',
      name: 'Query Builder',
      description: 'Compose customer segments with nested rules.',
      icon: 'filter',
    },
    {
      slug: 'cron-expression',
      name: 'Cron Expression',
      description: 'Schedule recurring customer reports.',
      icon: 'clock',
    },
    {
      slug: 'barcode',
      name: 'Barcode',
      description: 'Create customer ticket QR and linear codes.',
      icon: 'square',
    },
    {
      slug: 'calendar-scheduler',
      name: 'Scheduler',
      description: 'Plan meetings, renewals, and follow-ups.',
      icon: 'calendar',
    },
    {
      slug: 'gantt',
      name: 'Gantt',
      description: 'Track customer implementation plans.',
      icon: 'chart-no-axes-column',
    },
    {
      slug: 'kanban',
      name: 'Kanban',
      description: 'Move customer onboarding through clear stages.',
      icon: 'layout-dashboard',
    },
  ] as const;

  readonly footerGroups: readonly FooterGroup[] = [
    {
      title: 'Documentation',
      links: [
        { label: 'Get Started', path: '/docs' },
        { label: 'Theming', path: '/themes' },
      ],
    },
    {
      title: 'Components',
      links: [
        { label: 'Component Directory', path: '/docs/components' },
        { label: 'Public API Index', path: '/docs/index' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Examples', path: '/examples' },
        { label: 'Guides', path: '/guides' },
      ],
    },
    {
      title: 'Community',
      links: [
        { label: 'Community', path: '/community' },
        { label: 'GitHub', path: this.githubUrl, external: true },
      ],
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
