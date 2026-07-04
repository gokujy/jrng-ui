import { DOCUMENT, NgTemplateOutlet, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  PLATFORM_ID,
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

type SitePage = 'home' | 'docs' | 'components' | 'themes' | 'support';

interface PageMeta {
  readonly eyebrow: string;
  readonly title: string;
  readonly intro: string;
}

interface LinkCard {
  readonly title: string;
  readonly description: string;
}

interface ComponentCategory {
  readonly title: string;
  readonly description: string;
  readonly items: readonly string[];
}

interface FeatureItem {
  readonly title: string;
  readonly description: string;
}

function isSitePage(value: unknown): value is SitePage {
  return value === 'home' || value === 'docs' || value === 'components' || value === 'themes' || value === 'support';
}

@Component({
  selector: 'app-code-block',
  imports: [],
  template: `
    <div class="j-code-block">
      <button type="button" (click)="copy()">{{ copied() ? 'Copied' : 'Copy' }}</button>
      <pre><code>{{ code() }}</code></pre>
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
  readonly copied = signal(false);

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
  imports: [RouterLink, NgTemplateOutlet, CodeBlockComponent, JButtonComponent, JInputComponent, JCardComponent, JBadgeComponent],
  template: `
    @switch (currentPage()) {
      @case ('home') {
        <section class="j-home-hero">
          <div class="j-home-hero__content">
            <span class="j-page-eyebrow">Angular UI Library</span>
            <h1>JRNG UI</h1>
            <p>A modern Angular UI component library for building clean, fast, and accessible web applications.</p>
            <div class="j-hero-actions">
              <a class="j-button-link j-button-link--primary" routerLink="/docs">Get Started</a>
              <a class="j-button-link" routerLink="/components">Components</a>
              <a class="j-button-link" [href]="githubLink" target="_blank" rel="noopener noreferrer">GitHub</a>
            </div>
          </div>
          <j-card title="Reusable primitives" subtitle="Generic controls for application screens" elevated>
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
            <h2 id="install-heading">Add JRNG UI to an Angular project</h2>
          </div>
          <app-code-block [code]="installCode" />
        </section>

        <section class="j-page-section" aria-labelledby="usage-heading">
          <div class="j-section-heading">
            <span class="j-page-eyebrow">Usage</span>
            <h2 id="usage-heading">Import standalone components</h2>
          </div>
          <div class="j-two-column">
            <app-code-block [code]="typescriptUsageCode" />
            <app-code-block [code]="htmlUsageCode" />
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
            <h2 id="preview-heading">Small interface sample</h2>
          </div>
          <div class="j-preview-panel">
            <j-card title="Order summary" subtitle="Current period" bordered>
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

        <section class="j-page-section j-support-strip" aria-labelledby="home-support-heading">
          <div>
            <span class="j-page-eyebrow">Optional support</span>
            <h2 id="home-support-heading">Support JRNG UI</h2>
            <p>
              JRNG UI is free to use. Your optional ₹100 support helps improve components, documentation, examples,
              and future updates.
            </p>
            <small>Optional support contribution. Docs, components, and examples are free to access.</small>
          </div>
          <a class="j-button-link j-button-link--primary" [href]="supportLink" target="_blank" rel="noopener noreferrer">
            Support JRNG UI ₹100
          </a>
        </section>
      }

      @case ('docs') {
        <ng-container [ngTemplateOutlet]="pageHero" />
        <section class="j-page-section">
          <div class="j-docs-layout">
            <nav class="j-docs-jump" aria-label="Documentation sections">
              @for (section of docsSections; track section.title) {
                <a [href]="'/docs#' + slug(section.title)">{{ section.title }}</a>
              }
            </nav>
            <div class="j-docs-content">
              @for (section of docsSections; track section.title) {
                <article class="j-info-card" [id]="slug(section.title)">
                  <h2>{{ section.title }}</h2>
                  <p>{{ section.description }}</p>
                </article>
              }
            </div>
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
                <ul class="j-clean-list">
                  @for (item of category.items; track item) {
                    <li>{{ item }}</li>
                  }
                </ul>
              </article>
            }
          </div>
        </section>
      }

      @case ('themes') {
        <ng-container [ngTemplateOutlet]="pageHero" />
        <section class="j-page-section">
          <div class="j-card-grid j-card-grid--three">
            @for (item of themeSections; track item.title) {
              <article class="j-info-card">
                <h2>{{ item.title }}</h2>
                <p>{{ item.description }}</p>
              </article>
            }
          </div>
        </section>
        <section class="j-page-section j-page-section--narrow">
          <div class="j-section-heading">
            <span class="j-page-eyebrow">Theme setup</span>
            <h2>Import styles once</h2>
          </div>
          <app-code-block [code]="themeCode" />
        </section>
      }

      @case ('support') {
        <ng-container [ngTemplateOutlet]="pageHero" />
        <section class="j-page-section j-support-page" aria-labelledby="support-heading">
          <article class="j-info-card">
            <span class="j-page-eyebrow">Optional contribution</span>
            <h2 id="support-heading">Support JRNG UI</h2>
            <p>
              JRNG UI is free to use. Optional support helps improve components, documentation, examples, and future
              updates.
            </p>
            <p>There are no payment walls. Docs, components, examples, and usage guides remain free to access.</p>
            <a class="j-button-link j-button-link--primary" [href]="supportLink" target="_blank" rel="noopener noreferrer">
              Support JRNG UI ₹100
            </a>
            <small>No extra user data is collected by this website for support contributions.</small>
          </article>
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
  readonly githubLink = 'https://github.com/jrng-ui/jrng-ui';
  readonly supportLink = 'https://rzp.io/rzp/9nKAyUq';

  readonly installCode = 'npm install jrng-ui';
  readonly typescriptUsageCode = `import { JButtonComponent } from 'jrng-ui/button';
import { JInputComponent } from 'jrng-ui/input';`;
  readonly htmlUsageCode = `<j-button label="Save"></j-button>
<j-input label="Email" placeholder="Enter email"></j-input>`;
  readonly themeCode = `@use 'jrng-ui/styles';

/* Optional angular.json style path */
"styles": ["node_modules/jrng-ui/theme/jrng-ui.css", "src/styles.scss"]`;

  readonly pageMeta: Record<SitePage, PageMeta> = {
    home: {
      eyebrow: 'Home',
      title: 'JRNG UI',
      intro: 'A modern Angular UI component library for building clean, fast, and accessible web applications.',
    },
    docs: {
      eyebrow: 'Documentation',
      title: 'Documentation',
      intro: 'Start with installation, theme setup, configuration, accessibility, and component usage patterns.',
    },
    components: {
      eyebrow: 'Components',
      title: 'Component Catalog',
      intro: 'Explore generic component categories for forms, data, overlays, navigation, layout, media, and advanced screens.',
    },
    themes: {
      eyebrow: 'Themes',
      title: 'Theme System',
      intro: 'Use light and dark modes, design tokens, CSS variables, and component tokens to shape the interface.',
    },
    support: {
      eyebrow: 'Support',
      title: 'Support JRNG UI',
      intro: 'Support is optional and helps improve the free component library, documentation, examples, and future updates.',
    },
  };

  readonly features: readonly FeatureItem[] = [
    { title: 'Modern Angular standalone components', description: 'Import only the components needed by each screen.' },
    { title: 'Clean j-* selectors', description: 'Selectors are short, predictable, and easy to scan in templates.' },
    { title: 'Premium dashboard-friendly design', description: 'Calm spacing, subtle borders, rounded cards, and clear hierarchy.' },
    { title: 'Light and dark theme support', description: 'Themes are token-driven and ready for application-level toggles.' },
    { title: 'Design tokens', description: 'Primitive, semantic, and component tokens keep customization maintainable.' },
    { title: 'Accessible components', description: 'Semantic structure, focus states, ARIA, and keyboard patterns are built in.' },
    { title: 'Reactive Forms support', description: 'Form controls are designed to work with Angular Reactive Forms.' },
    { title: 'SSR-safe and zoneless-friendly', description: 'Browser APIs are guarded and interactions avoid unnecessary assumptions.' },
    { title: 'Secondary entrypoints', description: 'Use focused imports such as jrng-ui/button and jrng-ui/input.' },
  ];

  readonly docsSections: readonly LinkCard[] = [
    { title: 'Getting Started', description: 'Install the package and import standalone components from secondary entrypoints.' },
    { title: 'Installation', description: 'Add the npm package and include the JRNG UI styles once in the Angular workspace.' },
    { title: 'Theme Setup', description: 'Enable light or dark mode and connect the token system to global styles.' },
    { title: 'Configuration', description: 'Configure defaults for theme mode, density, locale, overlays, and animation.' },
    { title: 'Components', description: 'Review component categories, selectors, imports, variants, and examples.' },
    { title: 'Forms', description: 'Use ControlValueAccessor components with Reactive Forms and validation states.' },
    { title: 'Data', description: 'Build tables, grids, paginated views, charts, trees, and virtualized lists.' },
    { title: 'Overlay', description: 'Use dialogs, drawers, popovers, tooltips, toasts, and confirmation flows.' },
    { title: 'Navigation', description: 'Compose menus, tabs, breadcrumbs, accordions, steppers, sidebars, and topbars.' },
    { title: 'Layout', description: 'Build application shells, page headers, containers, stacks, and responsive grids.' },
    { title: 'Advanced', description: 'Explore editor, upload, gallery, carousel, Kanban, Gantt, and scheduler components.' },
    { title: 'Accessibility', description: 'Follow keyboard, screen reader, contrast, focus, and reduced-motion guidance.' },
    { title: 'API Reference', description: 'Use API tables for inputs, outputs, pass-through attributes, and theme tokens.' },
  ];

  readonly componentCategories: readonly ComponentCategory[] = [
    { title: 'Basic', description: 'Foundational display and feedback components.', items: ['Button', 'Card', 'Badge', 'Tag', 'Avatar', 'Divider', 'Loader', 'Skeleton', 'Empty State'] },
    { title: 'Forms', description: 'Inputs and form controls for Angular Reactive Forms.', items: ['Input', 'Textarea', 'Password', 'Select', 'Multiselect', 'Checkbox', 'Radio Group', 'Switch', 'Date Picker'] },
    { title: 'Data', description: 'Components for displaying, filtering, and navigating data.', items: ['Table', 'Data Grid', 'Paginator', 'Data View', 'Tree', 'Tree Table', 'Chart', 'Virtual Scroller'] },
    { title: 'Overlay', description: 'Layered interaction and feedback components.', items: ['Dialog', 'Drawer', 'Popover', 'Tooltip', 'Toast', 'Confirm Dialog', 'Command Palette'] },
    { title: 'Navigation', description: 'Navigation components for application structure.', items: ['Menu', 'Menubar', 'Breadcrumb', 'Tabs', 'Accordion', 'Stepper', 'Sidebar Nav', 'Topbar'] },
    { title: 'Layout', description: 'Reusable page and application layout blocks.', items: ['App Shell', 'Dashboard Layout', 'Page Header', 'Container', 'Stack', 'Grid Layout', 'Splitter'] },
    { title: 'Media', description: 'Content and media presentation controls.', items: ['Image', 'Image Preview', 'Gallery', 'Carousel', 'Video Player', 'File Preview'] },
    { title: 'Advanced', description: 'Productivity components for complex application screens.', items: ['Editor', 'File Upload', 'Dropzone', 'Kanban', 'Gantt', 'Calendar Scheduler'] },
  ];

  readonly themeSections: readonly LinkCard[] = [
    { title: 'Light theme', description: 'The default theme uses clean surfaces, soft borders, and accessible contrast.' },
    { title: 'Dark theme', description: 'Add the j-dark class to enable dark semantic tokens for supported surfaces.' },
    { title: 'Design tokens', description: 'Primitive, semantic, and component tokens provide a stable customization model.' },
    { title: 'Customization', description: 'Override CSS variables at application, layout, or component scope.' },
    { title: 'CSS variables', description: 'Theme values are exposed through predictable --j-* custom properties.' },
    { title: 'Component tokens', description: 'Tune component-specific values such as height, radius, border, shadow, and color.' },
  ];

  readonly tablePreviewRows = [
    { product: 'Product Alpha', status: 'Ready', total: '$128.00' },
    { product: 'Product Beta', status: 'Pending', total: '$86.00' },
    { product: 'Product Gamma', status: 'Complete', total: '$214.00' },
  ] as const;

  constructor() {
    this.route.data.pipe(takeUntilDestroyed()).subscribe((data) => {
      const page = data['page'];
      this.currentPage.set(isSitePage(page) ? page : 'home');
    });
  }

  meta(): PageMeta {
    return this.pageMeta[this.currentPage()];
  }

  slug(value: string): string {
    return value.toLowerCase().replaceAll(' ', '-');
  }
}
