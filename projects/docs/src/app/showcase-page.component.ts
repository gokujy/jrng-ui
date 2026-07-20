import { DOCUMENT, NgTemplateOutlet, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  PLATFORM_ID,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { JBadgeComponent } from 'jrng-ui/badge';
import { JButtonComponent } from 'jrng-ui/button';
import { JCardComponent } from 'jrng-ui/card';
import { JInputComponent } from 'jrng-ui/input';

type SitePage = 'home' | 'docs' | 'components' | 'themes' | 'component-detail';

interface PageMeta {
  readonly eyebrow: string;
  readonly title: string;
  readonly intro: string;
}

interface ApiRow {
  readonly name: string;
  readonly type: string;
  readonly defaultValue: string;
  readonly description: string;
}

interface OutputRow {
  readonly name: string;
  readonly payload: string;
  readonly description: string;
}

interface TokenRow {
  readonly name: string;
  readonly description: string;
}

interface TextSection {
  readonly title: string;
  readonly body: readonly string[];
  readonly code?: string;
  readonly codeLabel?: string;
  readonly list?: readonly string[];
}

interface ComponentCategory {
  readonly title: string;
  readonly description: string;
  readonly items: readonly ComponentSummary[];
}

interface ComponentSummary {
  readonly name: string;
  readonly selector: string;
  readonly importPath: string;
  readonly description: string;
  readonly status: 'ready' | 'basic' | 'planned';
  readonly route?: string;
}

interface ComponentDoc {
  readonly slug: string;
  readonly name: string;
  readonly selector: string;
  readonly importPath: string;
  readonly overview: readonly string[];
  readonly importCode: string;
  readonly basicUsage: string;
  readonly variants?: string;
  readonly sizes?: string;
  readonly states?: string;
  readonly forms?: string;
  readonly inputs: readonly ApiRow[];
  readonly outputs: readonly OutputRow[];
  readonly tokens: readonly TokenRow[];
  readonly stylingHtml: string;
  readonly stylingCss: string;
  readonly accessibility: readonly string[];
}

type CodeTokenKind = 'comment' | 'keyword' | 'string' | 'tag' | 'attr' | 'type' | 'plain';

interface CodeToken {
  readonly text: string;
  readonly kind: CodeTokenKind;
}

function isSitePage(value: unknown): value is SitePage {
  return (
    value === 'home' ||
    value === 'docs' ||
    value === 'components' ||
    value === 'themes' ||
    value === 'component-detail'
  );
}

@Component({
  selector: 'app-code-block',
  imports: [],
  template: `
    <div class="j-code-block">
      <div class="j-code-block__header">
        @if (label()) {
          <span>{{ label() }}</span>
        }
        <button type="button" (click)="copy()">{{ copied() ? 'Copied' : 'Copy' }}</button>
      </div>
      <pre><code>@for (token of highlightedCode(); track $index) {<span [class]="'j-token j-token--' + token.kind">{{ token.text }}</span>}</code></pre>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodeBlockComponent {
  private readonly documentRef = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private copyTimer: number | undefined;

  readonly code = input('');
  readonly label = input('');
  readonly copied = signal(false);
  readonly highlightedCode = computed(() => tokenizeCode(this.code()));

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.copyTimer !== undefined) {
        this.documentRef.defaultView?.clearTimeout(this.copyTimer);
      }
    });
  }

  copy(): void {
    if (!this.isBrowser) {
      return;
    }

    const windowRef = this.documentRef.defaultView;
    const clipboard = windowRef?.navigator.clipboard;
    void clipboard?.writeText(this.code()).then(() => {
      this.copied.set(true);
      this.copyTimer = windowRef?.setTimeout(() => this.copied.set(false), 1200);
    });
  }
}

@Component({
  selector: 'app-showcase-page',
  imports: [
    RouterLink,
    NgTemplateOutlet,
    CodeBlockComponent,
    JButtonComponent,
    JInputComponent,
    JCardComponent,
    JBadgeComponent,
  ],
  template: `
    @switch (currentPage()) {
      @case ('home') {
        <section class="j-home-hero">
          <div class="j-home-hero__content">
            <span class="j-page-eyebrow">Angular UI Library</span>
            <h1>JRNG UI</h1>
            <p>
              A modern Angular UI component library for building clean, fast, and accessible web
              applications.
            </p>
            <div class="j-hero-actions">
              <a class="j-button-link j-button-link--primary" routerLink="/docs">Get Started</a>
              <a class="j-button-link" routerLink="/docs/components">Components</a>
              <a class="j-button-link" [href]="npmLink" target="_blank" rel="noopener noreferrer"
                >npm</a
              >
              <a class="j-button-link" [href]="githubLink" target="_blank" rel="noopener noreferrer"
                >GitHub</a
              >
            </div>
          </div>
          <j-card
            header="Reusable primitives"
            subheader="Generic controls for application screens"
            variant="elevated"
          >
            <div class="j-preview-form">
              <j-badge value="Active" severity="success" />
              <j-input label="Email" placeholder="Enter email" />
              <j-button label="Save" />
            </div>
          </j-card>
        </section>

        <section class="j-page-section j-page-section--narrow" aria-labelledby="install-heading">
          <div class="j-section-heading">
            <span class="j-page-eyebrow">Install</span>
            <h2 id="install-heading">Add JRNG UI to Angular</h2>
          </div>
          <app-code-block [code]="installCode" />
        </section>

        <section class="j-page-section" aria-labelledby="usage-heading">
          <div class="j-section-heading">
            <span class="j-page-eyebrow">Usage</span>
            <h2 id="usage-heading">Import standalone components</h2>
          </div>
          <div class="j-two-column">
            <app-code-block label="TypeScript" [code]="typescriptUsageCode" />
            <app-code-block label="HTML" [code]="htmlUsageCode" />
          </div>
        </section>

        <section class="j-page-section" aria-labelledby="features-heading">
          <div class="j-section-heading">
            <span class="j-page-eyebrow">Highlights</span>
            <h2 id="features-heading">Built for clean application interfaces</h2>
          </div>
          <div class="j-card-grid j-card-grid--three">
            @for (feature of features; track feature.title) {
              <article class="j-info-card">
                <h3>{{ feature.title }}</h3>
                <p>{{ feature.description }}</p>
              </article>
            }
          </div>
        </section>

        <section class="j-page-section" aria-labelledby="preview-heading">
          <div class="j-section-heading">
            <span class="j-page-eyebrow">Preview</span>
            <h2 id="preview-heading">Simple component preview</h2>
          </div>
          <div class="j-preview-panel">
            <j-card header="Order summary" subheader="Current period" variant="outlined">
              <div class="j-preview-toolbar">
                <j-button label="Create order" />
                <j-badge value="Ready" severity="info" />
              </div>
              <j-input label="Customer" placeholder="Search customers" />
              <div class="j-table-preview" role="img" aria-label="Table preview placeholder">
                <div class="j-table-preview__row j-table-preview__row--header">
                  <span>Product</span>
                  <span>Status</span>
                  <span>Total</span>
                </div>
                @for (row of tablePreviewRows; track row.product) {
                  <div class="j-table-preview__row">
                    <span>{{ row.product }}</span>
                    <span>{{ row.status }}</span>
                    <span>{{ row.total }}</span>
                  </div>
                }
              </div>
            </j-card>
          </div>
        </section>
      }

      @case ('docs') {
        <ng-container [ngTemplateOutlet]="pageHero" />
        <section class="j-docs-shell j-page-section">
          <nav class="j-docs-sidebar" aria-label="Documentation sections">
            @for (section of docsSections; track section.title) {
              <a [href]="'/docs#' + slug(section.title)">{{ section.title }}</a>
            }
          </nav>
          <div class="j-docs-content">
            @for (section of docsSections; track section.title) {
              <article class="j-doc-section" [id]="slug(section.title)">
                <h2>{{ section.title }}</h2>
                @for (paragraph of section.body; track paragraph) {
                  <p>{{ paragraph }}</p>
                }
                @if (section.list) {
                  <ul class="j-clean-list">
                    @for (item of section.list; track item) {
                      <li>{{ item }}</li>
                    }
                  </ul>
                }
                @if (section.code) {
                  <app-code-block [label]="section.codeLabel ?? ''" [code]="section.code" />
                }
              </article>
            }
          </div>
        </section>
      }

      @case ('components') {
        <ng-container [ngTemplateOutlet]="pageHero" />
        <section class="j-page-section">
          <div class="j-card-grid">
            @for (category of componentCategories; track category.title) {
              <article class="j-info-card">
                <h2>{{ category.title }}</h2>
                <p>{{ category.description }}</p>
                <div class="j-component-list">
                  @for (item of category.items; track item.name) {
                    @if (item.route) {
                      <a class="j-component-card" [routerLink]="item.route">
                        <strong>{{ item.name }}</strong>
                        <code>{{ item.selector }}</code>
                        <span>{{ item.importPath }}</span>
                        <small [attr.data-j-status]="item.status">{{ item.status }}</small>
                        <p>{{ item.description }}</p>
                      </a>
                    } @else {
                      <div class="j-component-card">
                        <strong>{{ item.name }}</strong>
                        <code>{{ item.selector }}</code>
                        <span>{{ item.importPath }}</span>
                        <small [attr.data-j-status]="item.status">{{ item.status }}</small>
                        <p>{{ item.description }}</p>
                      </div>
                    }
                  }
                </div>
              </article>
            }
          </div>
        </section>
      }

      @case ('component-detail') {
        @if (activeComponent(); as doc) {
          <section class="j-page-hero">
            <span class="j-page-eyebrow">Component</span>
            <h1>{{ doc.name }}</h1>
            <p>{{ doc.overview[0] }}</p>
          </section>
          <section class="j-docs-shell j-page-section">
            <nav class="j-docs-sidebar" aria-label="Component documentation sections">
              @for (item of componentNav; track item) {
                <a [href]="'/components/' + doc.slug + '#' + slug(item)">{{ item }}</a>
              }
            </nav>
            <article class="j-docs-content">
              <section class="j-doc-section" id="overview">
                <h2>Overview</h2>
                @for (paragraph of doc.overview; track paragraph) {
                  <p>{{ paragraph }}</p>
                }
              </section>
              <section class="j-doc-section" id="import">
                <h2>Import</h2>
                <app-code-block label="TypeScript" [code]="doc.importCode" />
              </section>
              <section class="j-doc-section" id="basic-usage">
                <h2>Basic Usage</h2>
                <app-code-block label="HTML" [code]="doc.basicUsage" />
              </section>
              @if (doc.variants) {
                <section class="j-doc-section" id="variants">
                  <h2>Variants</h2>
                  <app-code-block label="HTML" [code]="doc.variants" />
                </section>
              }
              @if (doc.sizes) {
                <section class="j-doc-section" id="sizes">
                  <h2>Sizes</h2>
                  <app-code-block label="HTML" [code]="doc.sizes" />
                </section>
              }
              @if (doc.states) {
                <section class="j-doc-section" id="states">
                  <h2>States</h2>
                  <app-code-block label="HTML" [code]="doc.states" />
                </section>
              }
              @if (doc.forms) {
                <section class="j-doc-section" id="reactive-forms">
                  <h2>Reactive Forms</h2>
                  <p>
                    Import ReactiveFormsModule and bind the JRNG form component to a FormControl.
                  </p>
                  <app-code-block label="TypeScript" [code]="doc.forms" />
                </section>
              }
              <section class="j-doc-section" id="api">
                <h2>API</h2>
                <h3>Inputs</h3>
                <div class="j-table-wrap">
                  <table class="j-api-table">
                    <thead>
                      <tr>
                        <th>Input</th>
                        <th>Type</th>
                        <th>Default</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (row of doc.inputs; track row.name) {
                        <tr>
                          <td>
                            <code>{{ row.name }}</code>
                          </td>
                          <td>{{ row.type }}</td>
                          <td>
                            <code>{{ row.defaultValue }}</code>
                          </td>
                          <td>{{ row.description }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
                <h3>Outputs</h3>
                <div class="j-table-wrap">
                  <table class="j-api-table">
                    <thead>
                      <tr>
                        <th>Output</th>
                        <th>Payload</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (row of doc.outputs; track row.name) {
                        <tr>
                          <td>
                            <code>{{ row.name }}</code>
                          </td>
                          <td>{{ row.payload }}</td>
                          <td>{{ row.description }}</td>
                        </tr>
                      } @empty {
                        <tr>
                          <td colspan="3">No common outputs for this component.</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
                <h3>CSS tokens</h3>
                <div class="j-table-wrap">
                  <table class="j-api-table">
                    <thead>
                      <tr>
                        <th>Token</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (row of doc.tokens; track row.name) {
                        <tr>
                          <td>
                            <code>{{ row.name }}</code>
                          </td>
                          <td>{{ row.description }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </section>
              <section class="j-doc-section" id="styling">
                <h2>Styling</h2>
                <p>Use styleClass for local classes and CSS variables for theme-level changes.</p>
                <div class="j-two-column">
                  <app-code-block label="HTML" [code]="doc.stylingHtml" />
                  <app-code-block label="CSS" [code]="doc.stylingCss" />
                </div>
              </section>
              <section class="j-doc-section" id="accessibility">
                <h2>Accessibility</h2>
                <ul class="j-clean-list">
                  @for (note of doc.accessibility; track note) {
                    <li>{{ note }}</li>
                  }
                </ul>
              </section>
            </article>
          </section>
        }
      }

      @case ('themes') {
        <ng-container [ngTemplateOutlet]="pageHero" />
        <section class="j-docs-shell j-page-section">
          <nav class="j-docs-sidebar" aria-label="Theme documentation sections">
            @for (section of themeSections; track section.title) {
              <a [href]="'/themes#' + slug(section.title)">{{ section.title }}</a>
            }
          </nav>
          <div class="j-docs-content">
            @for (section of themeSections; track section.title) {
              <article class="j-doc-section" [id]="slug(section.title)">
                <h2>{{ section.title }}</h2>
                @for (paragraph of section.body; track paragraph) {
                  <p>{{ paragraph }}</p>
                }
                @if (section.code) {
                  <app-code-block [label]="section.codeLabel ?? ''" [code]="section.code" />
                }
                @if (section.list) {
                  <ul class="j-clean-list">
                    @for (item of section.list; track item) {
                      <li>{{ item }}</li>
                    }
                  </ul>
                }
              </article>
            }
          </div>
        </section>
      }
    }

    <ng-template #pageHero>
      <section class="j-page-hero">
        <span class="j-page-eyebrow">{{ meta().eyebrow }}</span>
        <h1>{{ meta().title }}</h1>
        <p>{{ meta().intro }}</p>
      </section>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowcasePageComponent {
  private readonly route = inject(ActivatedRoute);

  readonly currentPage = signal<SitePage>('home');
  readonly currentComponent = signal('button');
  readonly githubLink = 'https://github.com/gokujy/jrng-ui';
  readonly npmLink = 'https://www.npmjs.com/package/jrng-ui';

  readonly activeComponent = computed(
    () =>
      this.componentDocs.find((doc) => doc.slug === this.currentComponent()) ??
      this.componentDocs[0],
  );

  readonly componentNav = [
    'Overview',
    'Import',
    'Basic Usage',
    'Variants',
    'Sizes',
    'States',
    'Reactive Forms',
    'API',
    'Styling',
    'Accessibility',
  ] as const;

  readonly installCode = 'npm install jrng-ui';
  readonly typescriptUsageCode = `import { JButtonComponent } from 'jrng-ui/button';
import { JInputComponent } from 'jrng-ui/input';`;
  readonly htmlUsageCode = `<j-button label="Save"></j-button>
<j-input label="Email" placeholder="Enter email"></j-input>`;

  readonly pageMeta: Record<SitePage, PageMeta> = {
    home: {
      eyebrow: 'Home',
      title: 'JRNG UI',
      intro:
        'A modern Angular UI component library for building clean, fast, and accessible web applications.',
    },
    docs: {
      eyebrow: 'Documentation',
      title: 'Documentation',
      intro:
        'Beginner-friendly setup, usage patterns, imports, styling, accessibility, and troubleshooting for JRNG UI.',
    },
    components: {
      eyebrow: 'Components',
      title: 'Component Catalog',
      intro:
        'Browse generic component categories, selectors, import paths, descriptions, and implementation status.',
    },
    themes: {
      eyebrow: 'Themes',
      title: 'Theme System',
      intro:
        'Learn how JRNG UI styles, light and dark themes, CSS variables, and component tokens work together.',
    },
    'component-detail': {
      eyebrow: 'Component',
      title: 'Component Documentation',
      intro:
        'Usage examples, API tables, styling notes, and accessibility guidance for JRNG UI components.',
    },
  };

  readonly features = [
    {
      title: 'Modern Angular standalone components',
      description: 'Import only the components needed by each screen.',
    },
    {
      title: 'Clean j-* selectors',
      description: 'Selectors are short, predictable, and easy to scan in templates.',
    },
    {
      title: 'Premium dashboard-friendly design',
      description: 'Calm spacing, subtle borders, rounded cards, and clear hierarchy.',
    },
    {
      title: 'Light and dark theme support',
      description: 'Themes are token-driven and ready for application-level toggles.',
    },
    {
      title: 'Design tokens',
      description: 'Primitive, semantic, and component tokens keep customization maintainable.',
    },
    {
      title: 'Accessible components',
      description: 'Semantic structure, focus states, ARIA, and keyboard patterns are built in.',
    },
    {
      title: 'Reactive Forms support',
      description: 'Form controls are designed to work with Angular Reactive Forms.',
    },
    {
      title: 'SSR-safe and zoneless-friendly',
      description: 'Browser APIs are guarded and interactions avoid unnecessary assumptions.',
    },
    {
      title: 'Secondary entrypoints',
      description: 'Use focused imports such as jrng-ui/button and jrng-ui/input.',
    },
  ] as const;

  readonly docsSections: readonly TextSection[] = [
    {
      title: 'Getting Started',
      body: [
        'JRNG UI is a generic Angular UI component library for building clean, fast, accessible web applications.',
        'It provides reusable j-* components so teams do not need to rebuild common controls such as buttons, inputs, cards, dialogs, toasts, and tables for every Angular project.',
        'The j-* prefix means each component is easy to identify in templates. For example, j-button is a JRNG UI button and j-input is a JRNG UI input.',
        'Standalone Angular components can be imported directly into another standalone component without creating an Angular NgModule.',
      ],
      list: [
        'Use JRNG UI when you want consistent UI patterns across Angular screens.',
        'Use secondary entrypoints to import only the components you need.',
        'Use design tokens and CSS variables for theme-level customization.',
      ],
    },
    {
      title: 'Installation',
      body: ['Install the JRNG UI package from npm in an Angular workspace.'],
      codeLabel: 'Terminal',
      code: 'npm install jrng-ui',
    },
    {
      title: 'Theme Setup',
      body: [
        'JRNG UI styles are required for the visual design, spacing, colors, focus rings, and component states.',
        'Use one style setup method. If components appear unstyled, the global style import is usually missing or pointing to the wrong path.',
      ],
      codeLabel: 'angular.json',
      code: `"styles": [
  "node_modules/jrng-ui/styles/jrng-ui.css",
  "src/styles.scss"
]`,
    },
    {
      title: 'SCSS Style Import',
      body: [
        'If your workspace uses SCSS, import the style entry once from your global stylesheet.',
      ],
      codeLabel: 'SCSS',
      code: `@use 'jrng-ui/styles';`,
    },
    {
      title: 'First Component',
      body: [
        'Import the JRNG component, add it to the standalone component imports array, then use the j-button tag in the template.',
      ],
      codeLabel: 'TypeScript',
      code: `import { Component } from '@angular/core';
import { JButtonComponent } from 'jrng-ui/button';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [JButtonComponent],
  template: \`
    <j-button label="Save" (onClick)="save()"></j-button>
  \`
})
export class ExampleComponent {
  save(): void {}
}`,
    },
    {
      title: 'Using Multiple Components',
      body: [
        'Components are standalone, so add each imported component to the imports array of the component that uses them.',
      ],
      codeLabel: 'TypeScript and HTML',
      code: `import { JButtonComponent } from 'jrng-ui/button';
import { JInputComponent } from 'jrng-ui/input';
import { JCardComponent } from 'jrng-ui/card';

<j-card header="Create user">
  <j-input label="Name" placeholder="Enter name"></j-input>
  <j-button label="Save" (onClick)="save()"></j-button>
</j-card>`,
    },
    {
      title: 'Reactive Forms',
      body: [
        'Form components support Angular Reactive Forms. Import ReactiveFormsModule and bind a FormControl.',
      ],
      codeLabel: 'TypeScript',
      code: `import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { JInputComponent } from 'jrng-ui/input';

@Component({
  selector: 'app-form-example',
  standalone: true,
  imports: [ReactiveFormsModule, JInputComponent],
  template: \`
    <j-input
      label="Email"
      placeholder="Enter email"
      [formControl]="email">
    </j-input>
  \`
})
export class FormExampleComponent {
  email = new FormControl('');
}`,
    },
    {
      title: 'Component Imports',
      body: [
        'JRNG UI exposes secondary entrypoints. Import only what you use to keep code clear and bundle-friendly.',
        'Standalone Angular components must be listed in the imports array before their selectors can be used in the template.',
      ],
      codeLabel: 'TypeScript',
      code: `import { JButtonComponent } from 'jrng-ui/button';
import { JInputComponent } from 'jrng-ui/input';
import { JSelectComponent } from 'jrng-ui/select';`,
    },
    {
      title: 'Common API Pattern',
      body: [
        'Many JRNG UI components share common input and output names to make APIs predictable.',
      ],
      list: [
        'Common inputs: label, placeholder, disabled, loading, size, severity, variant, styleClass.',
        'Common outputs: onClick, valueChange, selectionChange, opened, closed, clear, remove, pageChange, sortChange.',
      ],
    },
    {
      title: 'Business Utilities',
      body: [
        'Business utilities provide common admin-app building blocks such as Metric Card, Stat Card, Status Chip, Page Header, and Empty State.',
        'Use them for dashboard summaries, workflow states, empty results, and repeatable page title/action patterns.',
      ],
      list: [
        'Metric Card and Stat Card cover KPI and operational counters.',
        'Status Chip keeps workflow states readable in tables and detail views.',
        'Page Header standardizes breadcrumbs, titles, descriptions, and action slots.',
        'Empty State gives filtered, first-run, and missing-record screens clear next steps.',
      ],
    },
    {
      title: 'Data Table',
      body: [
        'The table component supports common business data workflows including sorting, pagination, global filtering, column management, export, row selection, lazy loading, row expansion, and editing hooks.',
        'Start with value and columns, then enable advanced features only when the screen needs them.',
      ],
      codeLabel: 'HTML',
      code: `<j-table
  [value]="orders"
  [columns]="columns"
  paginator
  showGlobalFilter
  showColumnManager
  showExport>
</j-table>`,
    },
    {
      title: 'Tour Guide',
      body: [
        'JRNG UI includes a native Tour Guide for short onboarding and feature walkthroughs.',
        'App code uses JTourService, jTourStep and one j-tour-guide host with no third-party runtime.',
      ],
      codeLabel: 'TypeScript',
      code: `this.jTour.start({
  id: 'dashboard-intro-v1',
  steps: [
    {
      element: '#createBtn',
      title: 'Create',
      description: 'Click here to create a new record.'
    }
  ]
});`,
    },
    {
      title: 'Changelog',
      body: [
        'Review the 0.1.0 changelog before adopting the final Button event and variant contracts.',
      ],
      codeLabel: 'HTML',
      code: `<j-button label="Save" (onClick)="save()"></j-button>`,
    },
    {
      title: 'Styling Components',
      body: [
        'Use styleClass for local custom classes. Prefer CSS variables for theme-level changes. Avoid targeting internal elements unless there is a specific need.',
      ],
      codeLabel: 'HTML and CSS',
      code: `<j-button label="Save" styleClass="my-save-button"></j-button>

.my-save-button {
  min-width: 120px;
}`,
    },
    {
      title: 'Accessibility',
      body: [
        'Use labels for form controls. Use ariaLabel for icon-only controls. Components should support keyboard navigation where their role requires it.',
      ],
      codeLabel: 'HTML',
      code: `<j-button icon="search" ariaLabel="Search"></j-button>`,
    },
    {
      title: 'Troubleshooting',
      body: [
        'Most setup issues are caused by missing imports, missing styles, or wrong entrypoint paths.',
      ],
      list: [
        'Component is unknown: import the standalone component and add it to the imports array.',
        'Styles are not applied: add the JRNG UI global styles once.',
        'FormControl is not working: import ReactiveFormsModule and use a form component that supports ControlValueAccessor.',
        'Dark theme is not working: add the j-dark class to a root element and make sure JRNG styles are loaded.',
        'Build error after import: verify the package is installed and the import path matches the component entrypoint.',
        'Wrong import path: use paths such as jrng-ui/button, jrng-ui/input, and jrng-ui/select.',
        'Missing ReactiveFormsModule: add ReactiveFormsModule to the standalone imports array.',
      ],
    },
  ];

  readonly themeSections: readonly TextSection[] = [
    {
      title: 'Theme overview',
      body: [
        'JRNG UI uses design tokens so colors, radius, spacing, shadows, and component-level values can be changed consistently.',
        'The default theme is light. Dark mode is enabled by adding the j-dark class to a root element.',
      ],
    },
    {
      title: 'Importing styles',
      body: [
        'Import JRNG UI styles once. Do not duplicate both setup methods in the same application unless you have a specific build reason.',
      ],
      codeLabel: 'SCSS',
      code: `@use 'jrng-ui/styles';`,
    },
    {
      title: 'Light theme',
      body: [
        'The light theme is the default and provides clean surfaces, readable text, soft borders, and calm focus states.',
      ],
    },
    {
      title: 'Dark theme',
      body: [
        'Add j-dark to a root element to enable dark semantic tokens for components inside that scope.',
      ],
      codeLabel: 'HTML',
      code: `<main class="j-dark">
  <j-button label="Save"></j-button>
</main>`,
    },
    {
      title: 'CSS variables',
      body: [
        'Theme values are exposed as --j-* CSS variables. Override them globally or in a scoped container.',
      ],
      codeLabel: 'CSS',
      code: `:root {
  --j-color-primary: #2563eb;
  --j-color-primary-foreground: #ffffff;
}`,
    },
    {
      title: 'Primitive tokens',
      body: [
        'Primitive tokens are raw foundation values such as color palettes, spacing, radius, shadows, and typography steps.',
      ],
      list: [
        '--j-color-slate-50',
        '--j-color-blue-500',
        '--j-radius-md',
        '--j-spacing-4',
        '--j-shadow-sm',
      ],
    },
    {
      title: 'Semantic tokens',
      body: [
        'Semantic tokens map primitive values to interface intent, such as background, foreground, border, primary, success, warning, and danger.',
      ],
      list: [
        '--j-color-background',
        '--j-color-foreground',
        '--j-color-border',
        '--j-color-primary',
        '--j-color-danger',
      ],
    },
    {
      title: 'Component tokens',
      body: ['Component tokens tune a specific component while preserving the global theme model.'],
      list: [
        '--j-button-primary-bg',
        '--j-button-primary-color',
        '--j-input-border-color',
        '--j-card-radius',
      ],
    },
    {
      title: 'Customizing primary color',
      body: [
        'Override primary semantic tokens to align the component system with your application palette.',
      ],
      codeLabel: 'CSS',
      code: `:root {
  --j-color-primary: #2563eb;
  --j-color-primary-foreground: #ffffff;
}`,
    },
    {
      title: 'Customizing radius',
      body: [
        'Radius tokens control the rounded corner system. Small changes can make the whole UI feel sharper or softer.',
      ],
      codeLabel: 'CSS',
      code: `:root {
  --j-radius-md: 0.75rem;
}`,
    },
    {
      title: 'Customizing button token',
      body: [
        'Use component tokens when only one component family needs a different visual treatment.',
      ],
      codeLabel: 'CSS',
      code: `:root {
  --j-button-primary-bg: #111827;
  --j-button-primary-color: #ffffff;
}`,
    },
    {
      title: 'Best practices',
      body: [
        'Keep token overrides small and intentional. Prefer semantic tokens before component tokens, and avoid styling internal component elements unless needed.',
      ],
      list: [
        'Set brand colors through semantic tokens.',
        'Use component tokens for targeted changes.',
        'Test overrides in light and dark mode.',
        'Keep focus states visible and high contrast.',
      ],
    },
  ];

  readonly componentCategories: readonly ComponentCategory[] = [
    {
      title: 'Basic',
      description: 'Foundational display and feedback components.',
      items: [
        summary(
          'Button',
          'j-button',
          'jrng-ui/button',
          'Actions, submits, toolbar controls, and icon buttons.',
          'ready',
          '/components/button',
        ),
        summary(
          'Card',
          'j-card',
          'jrng-ui/card',
          'Grouped content, panels, metric blocks, and section containers.',
          'ready',
          '/components/card',
        ),
        summary('Badge', 'j-badge', 'jrng-ui/badge', 'Small status and count labels.', 'ready'),
        summary(
          'Tag',
          'j-tag',
          'jrng-ui/tag',
          'Compact labels with optional remove actions.',
          'ready',
        ),
        summary(
          'Avatar',
          'j-avatar',
          'jrng-ui/avatar',
          'Images, initials, and presence indicators.',
          'ready',
        ),
      ],
    },
    {
      title: 'Forms',
      description: 'Inputs and form controls for Angular Reactive Forms.',
      items: [
        summary(
          'Input',
          'j-input',
          'jrng-ui/input',
          'Text input with labels, hints, errors, and form binding.',
          'ready',
          '/components/input',
        ),
        summary(
          'Select',
          'j-select',
          'jrng-ui/select',
          'Single selection with primitive or object options.',
          'ready',
          '/components/select',
        ),
        summary('Textarea', 'j-textarea', 'jrng-ui/textarea', 'Multi-line text input.', 'ready'),
        summary(
          'Checkbox',
          'j-checkbox',
          'jrng-ui/checkbox',
          'Boolean and selection input.',
          'ready',
        ),
        summary('Switch', 'j-switch', 'jrng-ui/switch', 'Accessible on/off control.', 'ready'),
      ],
    },
    {
      title: 'Data',
      description: 'Components for displaying, filtering, and navigating data.',
      items: [
        summary(
          'Table',
          'j-table',
          'jrng-ui/table',
          'Structured rows, columns, pagination, sorting, and empty states.',
          'ready',
          '/components/table',
        ),
        summary(
          'Data Grid',
          'j-data-grid',
          'jrng-ui/data-grid',
          'App-like data management layout.',
          'basic',
        ),
        summary(
          'Paginator',
          'j-paginator',
          'jrng-ui/paginator',
          'Page navigation for lists and tables.',
          'ready',
        ),
        summary('Tree', 'j-tree', 'jrng-ui/tree', 'Hierarchical data display.', 'basic'),
        summary('Chart', 'j-chart', 'jrng-ui/chart', 'Optional chart rendering.', 'basic'),
      ],
    },
    {
      title: 'Overlay',
      description: 'Layered interaction and feedback components.',
      items: [
        summary(
          'Dialog',
          'j-dialog',
          'jrng-ui/dialog',
          'Modal content with focus handling.',
          'ready',
          '/components/dialog',
        ),
        summary(
          'Toast',
          'j-toast',
          'jrng-ui/toast',
          'Stacked feedback messages.',
          'ready',
          '/components/toast',
        ),
        summary(
          'Drawer',
          'j-drawer',
          'jrng-ui/drawer',
          'Side panel for forms and filters.',
          'ready',
        ),
        summary('Popover', 'j-popover', 'jrng-ui/popover', 'Anchored floating content.', 'basic'),
        summary('Tooltip', 'j-tooltip', 'jrng-ui/tooltip', 'Short contextual help.', 'ready'),
      ],
    },
    {
      title: 'Navigation',
      description: 'Navigation components for application structure.',
      items: [
        summary('Menu', 'j-menu', 'jrng-ui/menu', 'Nested action lists.', 'ready'),
        summary('Tabs', 'j-tabs', 'jrng-ui/tabs', 'Tabbed content regions.', 'ready'),
        summary(
          'Breadcrumb',
          'j-breadcrumb',
          'jrng-ui/breadcrumb',
          'Current page hierarchy.',
          'ready',
        ),
        summary(
          'Accordion',
          'j-accordion',
          'jrng-ui/accordion',
          'Expandable content sections.',
          'ready',
        ),
      ],
    },
    {
      title: 'Layout',
      description: 'Reusable page and application layout blocks.',
      items: [
        summary(
          'App Shell',
          'j-app-shell',
          'jrng-ui/app-shell',
          'Header, sidebar, content, and footer layout.',
          'ready',
        ),
        summary(
          'Page Header',
          'j-page-header',
          'jrng-ui/page-header',
          'Title, description, breadcrumbs, and actions.',
          'ready',
        ),
        summary(
          'Container',
          'j-container',
          'jrng-ui/container',
          'Width-constrained content wrapper.',
          'ready',
        ),
      ],
    },
    {
      title: 'Media',
      description: 'Content and media presentation controls.',
      items: [
        summary('Image', 'j-image', 'jrng-ui/image', 'Responsive image display.', 'basic'),
        summary('Gallery', 'j-gallery', 'jrng-ui/gallery', 'Image gallery with preview.', 'basic'),
        summary('Carousel', 'j-carousel', 'jrng-ui/carousel', 'Rotating content groups.', 'basic'),
        summary(
          'File Preview',
          'j-file-preview',
          'jrng-ui/file-preview',
          'Generic file preview display.',
          'basic',
        ),
      ],
    },
    {
      title: 'Advanced',
      description: 'Productivity components for complex application screens.',
      items: [
        summary('Editor', 'j-editor', 'jrng-ui/editor', 'Rich text editing foundation.', 'basic'),
        summary(
          'File Upload',
          'j-file-upload',
          'jrng-ui/file-upload',
          'Upload queue and progress UI.',
          'ready',
        ),
        summary(
          'Kanban',
          'j-kanban',
          'jrng-ui/kanban',
          'Columns and cards for task workflows.',
          'basic',
        ),
        summary('Gantt', 'j-gantt', 'jrng-ui/gantt', 'Timeline task planning.', 'basic'),
        summary(
          'Calendar Scheduler',
          'j-calendar-scheduler',
          'jrng-ui/calendar-scheduler',
          'Calendar event scheduling.',
          'basic',
        ),
      ],
    },
  ];

  readonly componentDocs: readonly ComponentDoc[] = [
    {
      slug: 'button',
      name: 'Button',
      selector: 'j-button',
      importPath: 'jrng-ui/button',
      overview: [
        'Button is used for actions such as saving, deleting, submitting, opening dialogs, or running toolbar commands.',
        'Use label for text buttons, icon with ariaLabel for icon-only buttons, and loading to prevent duplicate actions while work is in progress.',
      ],
      importCode: `import { JButtonComponent } from 'jrng-ui/button';`,
      basicUsage: `<j-button label="Save"></j-button>
<j-button label="Delete" severity="danger"></j-button>
<j-button label="Loading" [loading]="true"></j-button>
<j-button icon="search" ariaLabel="Search"></j-button>`,
      variants: `<j-button label="Primary"></j-button>
<j-button label="Secondary" severity="secondary"></j-button>
<j-button label="Outline" variant="outlined"></j-button>
<j-button label="Ghost" variant="soft"></j-button>`,
      sizes: `<j-button label="Small" size="sm"></j-button>
<j-button label="Medium" size="md"></j-button>
<j-button label="Large" size="lg"></j-button>`,
      states: `<j-button label="Disabled" disabled></j-button>
<j-button label="Loading" loading></j-button>
<j-button label="Full width" width="full"></j-button>`,
      inputs: [
        api('label', 'string', "''", 'Text displayed inside the button.'),
        api(
          'severity',
          'primary | secondary | neutral | success | warning | danger | info',
          "'primary'",
          'Visual intent of the action.',
        ),
        api(
          'variant',
          'filled | outline | ghost | soft | link',
          "'filled'",
          'Button visual treatment.',
        ),
        api('size', 'sm | md | lg | xl', "'md'", 'Button height and spacing.'),
        api('disabled', 'boolean', 'false', 'Disables interaction.'),
        api('loading', 'boolean', 'false', 'Shows loading state and prevents clicks.'),
        api('icon', 'string', "''", 'Icon name from the JRNG icon registry.'),
        api('iconPosition', 'left | right', "'left'", 'Places icon before or after the label.'),
        api('rounded', 'boolean', 'false', 'Applies fully rounded button shape.'),
        api('fullWidth', 'boolean', 'false', 'Stretches the button to available width.'),
        api('styleClass', 'string', "''", 'Adds a custom class to the root element.'),
        api('ariaLabel', 'string', "''", 'Accessible label for icon-only buttons.'),
      ],
      outputs: [
        out(
          'onClick',
          'MouseEvent',
          'Emits when the button is activated and not disabled or loading.',
        ),
      ],
      tokens: tokens('button', [
        '--j-button-primary-bg',
        '--j-button-primary-color',
        '--j-button-radius',
        '--j-button-height-md',
      ]),
      stylingHtml: `<j-button label="Save" styleClass="my-save-button"></j-button>`,
      stylingCss: `.my-save-button {
  min-width: 120px;
}`,
      accessibility: [
        'Use visible text when possible.',
        'Use ariaLabel for icon-only buttons.',
        'Disabled and loading buttons should not emit onClick.',
        'Buttons should be reachable by Tab and activated with Enter or Space.',
      ],
    },
    {
      slug: 'input',
      name: 'Input',
      selector: 'j-input',
      importPath: 'jrng-ui/input',
      overview: [
        'Input is used for short text values such as user names, email addresses, search text, product names, and invoice references.',
        'It supports labels, hints, errors, clearable behavior, validation states, and Angular Reactive Forms.',
      ],
      importCode: `import { JInputComponent } from 'jrng-ui/input';`,
      basicUsage: `<j-input label="Email" placeholder="Enter email"></j-input>`,
      variants: `<j-input label="Outlined" variant="outlined"></j-input>
<j-input label="Filled" variant="filled"></j-input>`,
      sizes: `<j-input label="Small" size="sm"></j-input>
<j-input label="Medium" size="md"></j-input>
<j-input label="Large" size="lg"></j-input>`,
      states: `<j-input label="Disabled" disabled></j-input>
<j-input label="Readonly" readonly value="Read only"></j-input>
<j-input label="Email" invalid error="Enter a valid email"></j-input>
<j-input label="Search" clearable></j-input>`,
      forms: `import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { JInputComponent } from 'jrng-ui/input';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, JInputComponent],
  template: \`
    <j-input label="Email" [formControl]="email"></j-input>
  \`
})
export class ExampleComponent {
  email = new FormControl('');
}`,
      inputs: [
        api('label', 'string', "''", 'Form control label.'),
        api('placeholder', 'string', "''", 'Placeholder text.'),
        api('disabled', 'boolean', 'false', 'Disables the input.'),
        api('readonly', 'boolean', 'false', 'Makes the input read-only.'),
        api('invalid', 'boolean', 'false', 'Applies invalid styling.'),
        api('error', 'string', "''", 'Error message shown near the input.'),
        api('hint', 'string', "''", 'Helper text shown near the input.'),
        api('size', 'sm | md | lg', "'md'", 'Input height and spacing.'),
        api('variant', 'outlined | filled', "'outlined'", 'Input visual style.'),
        api('clearable', 'boolean', 'false', 'Shows a clear affordance when value exists.'),
        api('styleClass', 'string', "''", 'Adds a custom class to the root element.'),
      ],
      outputs: [out('valueChange', 'string', 'Emits when the input value changes.')],
      tokens: tokens('input', ['--j-input-height-md', '--j-input-border-color', '--j-color-ring']),
      stylingHtml: `<j-input label="Email" styleClass="my-email-input"></j-input>`,
      stylingCss: `.my-email-input {
  max-width: 320px;
}`,
      accessibility: [
        'Always provide label or an accessible label.',
        'Error and hint text should be associated with the input.',
        'Readonly inputs remain focusable when users may need to copy the value.',
      ],
    },
    {
      slug: 'select',
      name: 'Select',
      selector: 'j-select',
      importPath: 'jrng-ui/select',
      overview: [
        'Select is used when users choose one value from a list of products, users, statuses, teams, or other options.',
        'It supports primitive arrays, object arrays, labels, values, search, clear behavior, loading, and Reactive Forms.',
      ],
      importCode: `import { JSelectComponent } from 'jrng-ui/select';`,
      basicUsage: `<j-select label="Product" [options]="products" placeholder="Choose product"></j-select>`,
      variants: `<j-select label="Primitive options" [options]="['Open', 'Closed', 'Archived']"></j-select>

<j-select
  label="Object options"
  [options]="products"
  optionLabel="name"
  optionValue="id">
</j-select>`,
      sizes: `<j-select label="Small" size="sm" [options]="products"></j-select>
<j-select label="Medium" size="md" [options]="products"></j-select>
<j-select label="Large" size="lg" [options]="products"></j-select>`,
      states: `<j-select label="Disabled" disabled [options]="products"></j-select>
<j-select label="Loading" loading [options]="products"></j-select>
<j-select label="Clearable" clearable [options]="products"></j-select>`,
      forms: `import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { JSelectComponent } from 'jrng-ui/select';

readonly product = new FormControl('');
readonly products = [
  { id: 'p1', name: 'Product Alpha' },
  { id: 'p2', name: 'Product Beta' }
];`,
      inputs: [
        api('options', 'readonly unknown[]', '[]', 'Available options.'),
        api('optionLabel', 'string', "''", 'Object field used as display label.'),
        api('optionValue', 'string', "''", 'Object field used as selected value.'),
        api('placeholder', 'string', "''", 'Text shown before selection.'),
        api('searchable', 'boolean', 'false', 'Enables filtering.'),
        api('clearable', 'boolean', 'false', 'Allows clearing the selected value.'),
        api('disabled', 'boolean', 'false', 'Disables selection.'),
        api('loading', 'boolean', 'false', 'Shows loading state.'),
      ],
      outputs: [
        out('valueChange', 'unknown', 'Emits the selected value.'),
        out('selectionChange', 'unknown', 'Emits selection details when selection changes.'),
      ],
      tokens: tokens('select', [
        '--j-input-height-md',
        '--j-input-border-color',
        '--j-color-popover',
      ]),
      stylingHtml: `<j-select label="Product" styleClass="my-product-select" [options]="products"></j-select>`,
      stylingCss: `.my-product-select {
  width: 100%;
}`,
      accessibility: [
        'Use a label so the combobox purpose is clear.',
        'Keyboard support should include arrow keys, Enter, Escape, and typeahead where applicable.',
        'Disabled options should not be selectable.',
      ],
    },
    {
      slug: 'card',
      name: 'Card',
      selector: 'j-card',
      importPath: 'jrng-ui/card',
      overview: [
        'Card groups related content such as metrics, forms, previews, invoices, product details, or task summaries.',
        'Use header and subheader for simple cards, or content projection for custom layouts.',
      ],
      importCode: `import { JCardComponent } from 'jrng-ui/card';`,
      basicUsage: `<j-card header="Create user" subheader="Add basic details">
  <p>Card content goes here.</p>
</j-card>`,
      variants: `<j-card header="Default"></j-card>
<j-card header="Elevated" variant="elevated"></j-card>
<j-card header="Bordered" variant="outlined"></j-card>`,
      states: `<j-card header="Loading" skeleton></j-card>
<j-card header="Interactive" interactive></j-card>`,
      inputs: [
        api('header', 'string', "''", 'Header text.'),
        api('subheader', 'string', "''", 'Secondary header text.'),
        api('title', 'string', "''", 'Alias for header.'),
        api('subtitle', 'string', "''", 'Alias for subheader.'),
        api('elevated', 'boolean', 'false', 'Adds stronger shadow.'),
        api('bordered', 'boolean', 'false', 'Adds bordered card style.'),
        api('interactive', 'boolean', 'false', 'Applies interactive affordance.'),
        api('styleClass', 'string', "''", 'Adds a custom class.'),
      ],
      outputs: [],
      tokens: tokens('card', [
        '--j-card-radius',
        '--j-card-shadow',
        '--j-color-card',
        '--j-color-card-foreground',
      ]),
      stylingHtml: `<j-card header="Analytics" styleClass="my-analytics-card"></j-card>`,
      stylingCss: `.my-analytics-card {
  --j-card-radius: 1rem;
}`,
      accessibility: [
        'Use semantic headings inside cards when the card starts a content section.',
        'Do not make a card interactive unless it has a clear action.',
      ],
    },
    {
      slug: 'dialog',
      name: 'Dialog',
      selector: 'j-dialog',
      importPath: 'jrng-ui/dialog',
      overview: [
        'Dialog presents focused content above the page, such as edit forms, confirmations, or task details.',
        'Use two-way visible binding for open state and provide clear footer actions.',
      ],
      importCode: `import { JDialogComponent } from 'jrng-ui/dialog';`,
      basicUsage: `<j-dialog header="Edit task" [(visible)]="visible">
  <p>Dialog content goes here.</p>
</j-dialog>`,
      variants: `<j-dialog header="Small dialog" size="sm" [(visible)]="visible"></j-dialog>
<j-dialog header="Large dialog" size="lg" [(visible)]="visible"></j-dialog>`,
      states: `<j-dialog header="Dismissable" dismissableMask [(visible)]="visible"></j-dialog>
<j-dialog header="Not closable" [closable]="false" [(visible)]="visible"></j-dialog>`,
      inputs: [
        api('visible', 'boolean', 'false', 'Controls dialog visibility.'),
        api('header', 'string', "''", 'Dialog title.'),
        api('modal', 'boolean', 'true', 'Shows modal behavior.'),
        api('closable', 'boolean', 'true', 'Shows close control.'),
        api('dismissableMask', 'boolean', 'true', 'Allows backdrop click close.'),
        api('size', 'sm | md | lg | xl | full', "'md'", 'Dialog width preset.'),
      ],
      outputs: [
        out('visibleChange', 'boolean', 'Emits when visibility changes.'),
        out('opened', 'void', 'Emits when dialog opens.'),
        out('closed', 'void', 'Emits when dialog closes.'),
      ],
      tokens: tokens('dialog', ['--j-dialog-shadow', '--j-color-popover', '--j-color-border']),
      stylingHtml: `<j-dialog header="Edit order" styleClass="my-dialog" [(visible)]="visible"></j-dialog>`,
      stylingCss: `.my-dialog {
  --j-dialog-shadow: var(--j-shadow-md);
}`,
      accessibility: [
        'Dialog should trap focus while open.',
        'Escape should close the dialog when close on escape is enabled.',
        'Focus should return to the trigger after close.',
      ],
    },
    {
      slug: 'toast',
      name: 'Toast',
      selector: 'j-toast',
      importPath: 'jrng-ui/toast',
      overview: [
        'Toast displays short feedback messages such as saved, failed, loading, or completed states.',
        'Place one j-toast near the application root and use the toast service from actions or workflows.',
      ],
      importCode: `import { JToastContainerComponent, ToastService } from 'jrng-ui/toast';`,
      basicUsage: `<j-toast position="top-right"></j-toast>`,
      variants: `toast.success('Saved successfully');
toast.error('Could not save');
toast.info('Export started');
toast.warning('Review required');`,
      states: `toast.show({
  severity: 'success',
  summary: 'Saved',
  detail: 'The order was updated.',
  life: 3000
});

toast.clear();`,
      inputs: [
        api(
          'position',
          'top-right | top-left | bottom-right | bottom-left',
          "'top-right'",
          'Toast stack position.',
        ),
        api('duration', 'number', '3000', 'Default message duration.'),
        api('styleClass', 'string', "''", 'Adds a custom class to the container.'),
      ],
      outputs: [],
      tokens: tokens('toast', [
        '--j-color-success',
        '--j-color-danger',
        '--j-color-info',
        '--j-color-warning',
      ]),
      stylingHtml: `<j-toast styleClass="my-toast-stack"></j-toast>`,
      stylingCss: `.my-toast-stack {
  --j-toast-radius: var(--j-radius-lg);
}`,
      accessibility: [
        'Use concise messages.',
        'Use appropriate live-region behavior for important feedback.',
        'Do not rely on color alone to communicate severity.',
      ],
    },
    {
      slug: 'table',
      name: 'Table',
      selector: 'j-table',
      importPath: 'jrng-ui/table',
      overview: [
        'Table displays structured rows and columns for users, products, orders, invoices, tasks, and analytics.',
        'Use pagination, sorting, loading, and empty states to keep large data views readable.',
      ],
      importCode: `import { JTableComponent } from 'jrng-ui/table';`,
      basicUsage: `<j-table [value]="orders" [columns]="columns"></j-table>`,
      variants: `<j-table [value]="orders" [columns]="columns" paginator [rows]="10"></j-table>

<j-table
  [value]="orders"
  [columns]="columns"
  [loading]="loading"
  (pageChange)="loadPage($event)"
  (sortChange)="sortOrders($event)">
</j-table>`,
      states: `<j-table [value]="[]" [columns]="columns" emptyMessage="No orders found"></j-table>
<j-table [value]="orders" [columns]="columns" loading></j-table>`,
      inputs: [
        api('value', 'readonly unknown[]', '[]', 'Rows displayed in the table.'),
        api('columns', 'readonly JTableColumn[]', '[]', 'Column definitions.'),
        api('loading', 'boolean', 'false', 'Shows loading state.'),
        api('paginator', 'boolean', 'false', 'Enables pagination controls.'),
        api('rows', 'number', '10', 'Rows per page.'),
        api('totalRecords', 'number', '0', 'Total row count for paginated or lazy data.'),
        api('sort', 'JTableSort', 'null', 'Current sort state.'),
        api(
          'emptyMessage',
          'string',
          "'No records found'",
          'Message shown when there are no rows.',
        ),
      ],
      outputs: [
        out('pageChange', 'JTablePageChange', 'Emits when the page changes.'),
        out('sortChange', 'JTableSort', 'Emits when sorting changes.'),
        out('lazyLoad', 'JTableLazyLoadEvent', 'Emits when lazy data should be loaded.'),
      ],
      tokens: tokens('table', ['--j-table-header-bg', '--j-color-border', '--j-color-card']),
      stylingHtml: `<j-table styleClass="my-orders-table" [value]="orders" [columns]="columns"></j-table>`,
      stylingCss: `.my-orders-table {
  --j-table-header-bg: var(--j-color-muted);
}`,
      accessibility: [
        'Use clear column headers.',
        'Sortable headers should expose sort state.',
        'Loading and empty states should be announced or visible.',
        'Do not hide important row actions behind hover-only interactions.',
      ],
    },
  ];

  readonly tablePreviewRows = [
    { product: 'Product Alpha', status: 'Ready', total: '$128.00' },
    { product: 'Product Beta', status: 'Pending', total: '$86.00' },
    { product: 'Product Gamma', status: 'Complete', total: '$214.00' },
  ] as const;

  constructor() {
    this.route.data.pipe(takeUntilDestroyed()).subscribe((data) => {
      const page = data['page'];
      const component = data['component'];
      this.currentPage.set(isSitePage(page) ? page : 'home');
      this.currentComponent.set(typeof component === 'string' ? component : 'button');
    });
  }

  meta(): PageMeta {
    return this.pageMeta[this.currentPage()];
  }

  slug(value: string): string {
    return value.toLowerCase().replaceAll(' ', '-');
  }
}

function summary(
  name: string,
  selector: string,
  importPath: string,
  description: string,
  status: ComponentSummary['status'],
  route?: string,
): ComponentSummary {
  return { name, selector, importPath, description, status, route };
}

function api(name: string, type: string, defaultValue: string, description: string): ApiRow {
  return { name, type, defaultValue, description };
}

function out(name: string, payload: string, description: string): OutputRow {
  return { name, payload, description };
}

function tokens(component: string, names: readonly string[]): readonly TokenRow[] {
  return names.map((name) => ({ name, description: `Token used by ${component} styling.` }));
}

function tokenizeCode(code: string): readonly CodeToken[] {
  const tokens: CodeToken[] = [];
  const pattern =
    /(<!--[\s\S]*?-->|\/\/[^\n]*|\/\*[\s\S]*?\*\/|`(?:\\.|[^`])*`|'(?:\\.|[^'])*'|"(?:\\.|[^"])*"|<\/?[A-Za-z][\w:-]*|[[(][\w:-]+[\])]|@[A-Za-z]+|\b(?:import|from|export|const|let|readonly|class|interface|type|return|if|else|true|false|null|undefined|new|extends|implements|public|private|protected)\b|\b[A-Z][A-Za-z0-9_]*\b)/g;
  let index = 0;

  for (const match of code.matchAll(pattern)) {
    const text = match[0];
    const start = match.index ?? 0;

    if (start > index) {
      tokens.push({ text: code.slice(index, start), kind: 'plain' });
    }

    tokens.push({ text, kind: tokenKind(text) });
    index = start + text.length;
  }

  if (index < code.length) {
    tokens.push({ text: code.slice(index), kind: 'plain' });
  }

  return tokens;
}

function tokenKind(text: string): CodeTokenKind {
  if (text.startsWith('//') || text.startsWith('/*') || text.startsWith('<!--')) {
    return 'comment';
  }

  if (text.startsWith('"') || text.startsWith("'") || text.startsWith('`')) {
    return 'string';
  }

  if (text.startsWith('<')) {
    return 'tag';
  }

  if (text.startsWith('[') || text.startsWith('(') || text.startsWith('@')) {
    return 'attr';
  }

  if (/^[A-Z]/.test(text)) {
    return 'type';
  }

  return 'keyword';
}
