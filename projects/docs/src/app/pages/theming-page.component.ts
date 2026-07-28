import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { JBadgeComponent } from 'jrng-ui/badge';
import { JButtonComponent } from 'jrng-ui/button';
import { JCardComponent } from 'jrng-ui/card';
import { JCheckboxComponent } from 'jrng-ui/checkbox';
import { JInputComponent } from 'jrng-ui/input';
import { JSelectComponent } from 'jrng-ui/select';
import { JSwitchComponent } from 'jrng-ui/switch';
import { JTagComponent } from 'jrng-ui/tag';
import {
  JPrimaryPaletteName,
  JSurfacePaletteName,
  JThemeColorScheme,
  JThemePresetId,
  JThemeScope,
  JThemeService,
} from 'jrng-ui/theming';

interface PresetOption {
  readonly id: JThemePresetId;
  readonly name: string;
  readonly description: string;
}

@Component({
  selector: 'app-theming-page',
  imports: [
    JButtonComponent,
    JInputComponent,
    JSelectComponent,
    JCheckboxComponent,
    JSwitchComponent,
    JBadgeComponent,
    JTagComponent,
    JCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="docs-container j-theme-guide">
      <section class="docs-section">
        <span class="docs-eyebrow">JRNG UI Themes</span>
        <h1>Three presets, one semantic token system</h1>
        <p class="docs-lead">
          Default, Material, and Nexus share the same component APIs and layered tokens. Preview
          every preset in an isolated scope, switch schemes without a reload, and copy the exact
          provider setup shown below.
        </p>
      </section>

      <section class="docs-section" aria-labelledby="available-presets">
        <h2 id="available-presets">Available presets</h2>
        <div class="j-theme-guide__preset-grid">
          @for (option of presets; track option.id) {
            <article class="j-theme-guide__preset-card">
              <span class="j-theme-guide__preset-name">{{ option.name }}</span>
              <code>{{ option.id }}</code>
              <p>{{ option.description }}</p>
            </article>
          }
        </div>
      </section>

      <section class="docs-section" aria-labelledby="interactive-preview">
        <div>
          <span class="docs-eyebrow">Documentation-only configurator</span>
          <h2 id="interactive-preview">Interactive preset preview</h2>
          <p class="docs-lead">
            These controls theme only the preview container. They do not persist preferences or
            configure application layout.
          </p>
        </div>

        <div class="j-theme-guide__controls">
          <label>
            <span>Preset</span>
            <select [value]="preset()" (change)="selectPreset($event)">
              @for (option of presets; track option.id) {
                <option [value]="option.id">{{ option.name }}</option>
              }
            </select>
          </label>
          <label>
            <span>Colour scheme</span>
            <select [value]="scheme()" (change)="selectScheme($event)">
              @for (option of schemes; track option) {
                <option [value]="option">{{ title(option) }}</option>
              }
            </select>
          </label>
          <label>
            <span>Primary</span>
            <select [value]="primary()" (change)="selectPrimary($event)">
              @for (option of primaryPalettes; track option) {
                <option [value]="option">{{ title(option) }}</option>
              }
            </select>
          </label>
          <label>
            <span>Surface</span>
            <select [value]="surface()" (change)="selectSurface($event)">
              @for (option of surfacePalettes; track option) {
                <option [value]="option">{{ title(option) }}</option>
              }
            </select>
          </label>
          <j-button label="Reset preview" variant="outlined" (onClick)="resetPreview()" />
        </div>

        <div #previewRoot class="j-theme-guide__preview">
          <header class="j-theme-guide__preview-header">
            <div>
              <span class="docs-eyebrow">{{ activePresetName() }}</span>
              <h3>{{ title(scheme()) }} preview</h3>
            </div>
            <nav aria-label="Preview navigation">
              <a href="#interactive-preview" class="is-active">Overview</a>
              <a href="#interactive-preview">Reports</a>
              <a href="#interactive-preview">Settings</a>
            </nav>
          </header>

          <div class="j-theme-guide__metrics">
            <j-card header="Revenue" subheader="This month" variant="outlined">
              <strong class="j-theme-guide__metric">$48,290</strong>
            </j-card>
            <j-card header="Open work" subheader="Across teams" variant="outlined">
              <strong class="j-theme-guide__metric">128</strong>
            </j-card>
            <j-card header="Availability" subheader="Last 30 days" variant="outlined">
              <strong class="j-theme-guide__metric">99.96%</strong>
            </j-card>
          </div>

          <section class="j-theme-guide__panel" aria-labelledby="preview-controls">
            <h4 id="preview-controls">Buttons, forms, and states</h4>
            <div class="j-theme-guide__actions">
              <j-button label="Primary action" />
              <j-button label="Secondary" variant="outlined" />
              <j-button label="Loading" [loading]="true" />
              <j-button label="Disabled" [disabled]="true" />
            </div>
            <div class="j-theme-guide__form">
              <j-input label="Customer" placeholder="Search customers" />
              <j-select label="Status" [options]="statuses" />
              <j-input label="Read-only reference" value="JRNG-2048" [readonly]="true" />
              <j-input label="Unavailable field" value="Disabled" [disabled]="true" />
              <j-checkbox label="Include archived records" />
              <j-switch label="Live updates" />
            </div>
          </section>

          <section class="j-theme-guide__panel" aria-labelledby="preview-table">
            <div class="j-theme-guide__section-heading">
              <h4 id="preview-table">Data and status components</h4>
              <div class="j-theme-guide__status-row" aria-label="Status examples">
                <j-tag label="Healthy" severity="success" />
                <j-tag label="Review" severity="warning" />
                <j-badge value="8" />
              </div>
            </div>
            <div class="j-theme-guide__table-wrap">
              <table>
                <thead>
                  <tr><th>Account</th><th>Status</th><th>Owner</th><th>Value</th></tr>
                </thead>
                <tbody>
                  <tr><td>Northstar</td><td>Active</td><td>R. Shah</td><td>$32,400</td></tr>
                  <tr><td>Harbor Labs</td><td>Review</td><td>M. Chen</td><td>$18,750</td></tr>
                  <tr><td>Canopy</td><td>Active</td><td>A. Patel</td><td>$11,920</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section class="j-theme-guide__panel" aria-labelledby="preview-overlay">
            <h4 id="preview-overlay">Overlay, typography, radius, elevation, and density</h4>
            <div class="j-theme-guide__overlay">
              <span class="docs-eyebrow">Confirmation</span>
              <h4>Publish this report?</h4>
              <p>The preview surface uses the active preset's overlay and shadow tokens.</p>
              <div class="j-theme-guide__actions">
                <j-button label="Cancel" variant="text" />
                <j-button label="Publish" />
              </div>
            </div>
          </section>
        </div>
      </section>

      <section class="docs-section">
        <h2>Installation and provider setup</h2>
        <pre><code>import &#123; provideJrngTheme &#125; from 'jrng-ui/theming';

export const appConfig: ApplicationConfig = &#123;
  providers: [
    provideJrngTheme(&#123;
      preset: '{{ preset() }}',
      colorScheme: '{{ scheme() }}',
      primary: '{{ primary() }}',
      surface: '{{ surface() }}'
    &#125;)
  ]
&#125;;</code></pre>
      </section>

      <section class="docs-section j-theme-guide__reference">
        <h2>Theme reference</h2>
        <article>
          <h3>Runtime switching</h3>
          <p>
            Inject <code>JThemeService</code>, then call <code>setPreset()</code>,
            <code>setColorScheme()</code>, <code>setPrimaryPalette()</code>, or
            <code>setSurfacePalette()</code>. Changes are signal-driven and require no reload.
          </p>
        </article>
        <article>
          <h3>Semantic and component tokens</h3>
          <p>
            Use <code>applyTokens()</code> for product-level meaning and
            <code>applyComponentTokens()</code> for a specific component family. Semantic values
            take precedence over primitives; explicit component values take final precedence.
          </p>
        </article>
        <article>
          <h3>Scoped themes</h3>
          <p>
            Call <code>createScope(element, options)</code> for independently themed regions.
            Destroy the returned handle with the host lifecycle to remove managed variables.
          </p>
        </article>
        <article>
          <h3>SSR and initial theme flash</h3>
          <p>
            Theme resolution is deterministic without browser globals. Serialize
            <code>getInitialState().css</code> during SSR and place it before application styles
            when the server controls the initial scheme.
          </p>
        </article>
        <article>
          <h3>Accessibility</h3>
          <p>
            Every preset provides visible focus, semantic disabled states, RTL-safe spacing,
            reduced-motion behavior, and forced-colour support. Applications remain responsible
            for accessible names and contrast when overriding tokens.
          </p>
        </article>
        <article>
          <h3>Reset and application preferences</h3>
          <p>
            <code>reset()</code> restores provider defaults. Persistence, user profiles, menus,
            sidebars, and layout modes remain application responsibilities.
          </p>
        </article>
      </section>
    </div>
  `,
  styles: `
    .j-theme-guide { padding-block-end: var(--j-spacing-8, 3rem); }
    .j-theme-guide__preset-grid,
    .j-theme-guide__metrics,
    .j-theme-guide__reference {
      display: grid;
      gap: var(--j-spacing-4);
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
    .j-theme-guide__preset-card,
    .j-theme-guide__panel {
      background: var(--j-color-card);
      border: 1px solid var(--j-color-border);
      border-radius: var(--j-radius-lg);
      display: grid;
      gap: var(--j-spacing-3);
      padding: var(--j-spacing-5);
    }
    .j-theme-guide__preset-name { font-size: var(--j-font-size-lg); font-weight: 700; }
    .j-theme-guide__preset-card p,
    .j-theme-guide__panel p,
    .j-theme-guide__reference p { color: var(--j-color-muted-foreground); line-height: 1.6; }
    .j-theme-guide__controls {
      align-items: end;
      background: var(--j-color-card);
      border: 1px solid var(--j-color-border);
      border-radius: var(--j-radius-lg);
      display: grid;
      gap: var(--j-spacing-3);
      grid-template-columns: repeat(4, minmax(8rem, 1fr)) auto;
      padding: var(--j-spacing-4);
    }
    .j-theme-guide__controls label { display: grid; gap: var(--j-spacing-2); }
    .j-theme-guide__controls label > span { font-size: var(--j-font-size-sm); font-weight: 600; }
    .j-theme-guide__controls select {
      background: var(--j-input-bg, var(--j-color-card));
      border: 1px solid var(--j-input-border-color, var(--j-color-border));
      border-radius: var(--j-input-radius, var(--j-radius-md));
      color: var(--j-color-foreground);
      font: inherit;
      min-height: var(--j-input-height-md, 2.5rem);
      padding-inline: var(--j-spacing-3);
    }
    .j-theme-guide__controls select:focus-visible { outline: var(--j-focus-ring); outline-offset: 2px; }
    .j-theme-guide__preview {
      background: var(--j-color-background);
      border: 1px solid var(--j-color-border);
      border-radius: var(--j-radius-xl);
      color: var(--j-color-foreground);
      display: grid;
      gap: var(--j-spacing-4);
      overflow: hidden;
      padding: var(--j-spacing-5);
    }
    .j-theme-guide__preview-header,
    .j-theme-guide__section-heading,
    .j-theme-guide__actions,
    .j-theme-guide__status-row {
      align-items: center;
      display: flex;
      flex-wrap: wrap;
      gap: var(--j-spacing-3);
      justify-content: space-between;
    }
    .j-theme-guide__preview-header nav { display: flex; flex-wrap: wrap; gap: var(--j-spacing-2); }
    .j-theme-guide__preview-header a {
      border-radius: var(--j-radius-md);
      color: var(--j-color-muted-foreground);
      padding: var(--j-spacing-2) var(--j-spacing-3);
    }
    .j-theme-guide__preview-header a.is-active {
      background: var(--j-color-selection);
      color: var(--j-color-primary);
    }
    .j-theme-guide__metric { display: block; font-size: var(--j-font-size-2xl, 1.75rem); }
    .j-theme-guide__form {
      display: grid;
      gap: var(--j-spacing-4);
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .j-theme-guide__table-wrap { overflow-x: auto; }
    .j-theme-guide__table-wrap table { border-collapse: collapse; min-width: 38rem; width: 100%; }
    .j-theme-guide__table-wrap th,
    .j-theme-guide__table-wrap td {
      border-bottom: 1px solid var(--j-table-border-color, var(--j-color-border));
      padding: var(--j-table-cell-padding, var(--j-spacing-3));
      text-align: start;
    }
    .j-theme-guide__table-wrap th {
      background: var(--j-table-header-bg, var(--j-color-muted));
      color: var(--j-table-header-color, var(--j-color-foreground));
    }
    .j-theme-guide__overlay {
      background: var(--j-color-popover);
      border: 1px solid var(--j-color-border);
      border-radius: var(--j-overlay-radius, var(--j-radius-lg));
      box-shadow: var(--j-dialog-shadow, var(--j-shadow-lg));
      display: grid;
      gap: var(--j-spacing-3);
      margin: var(--j-spacing-3) auto;
      max-width: 28rem;
      padding: var(--j-dialog-padding, var(--j-spacing-5));
    }
    .j-theme-guide pre {
      background: var(--j-color-muted);
      border: 1px solid var(--j-color-border);
      border-radius: var(--j-radius-lg);
      overflow-x: auto;
      padding: var(--j-spacing-5);
    }
    .j-theme-guide__reference { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .j-theme-guide__reference article { display: grid; gap: var(--j-spacing-2); }
    @media (max-width: 860px) {
      .j-theme-guide__controls { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .j-theme-guide__preset-grid,
      .j-theme-guide__metrics { grid-template-columns: 1fr; }
    }
    @media (max-width: 560px) {
      .j-theme-guide__controls,
      .j-theme-guide__form,
      .j-theme-guide__reference { grid-template-columns: 1fr; }
      .j-theme-guide__preview { padding: var(--j-spacing-3); }
    }
    @media (prefers-reduced-motion: reduce) {
      .j-theme-guide__preview * { scroll-behavior: auto !important; }
    }
    @media (forced-colors: active) {
      .j-theme-guide__preview,
      .j-theme-guide__panel,
      .j-theme-guide__overlay { border-color: CanvasText; }
    }
  `,
})
export class ThemingPageComponent implements AfterViewInit, OnDestroy {
  private readonly theme = inject(JThemeService);
  private readonly previewRoot = viewChild.required<ElementRef<HTMLElement>>('previewRoot');
  private previewScope?: JThemeScope;

  readonly presets: readonly PresetOption[] = [
    {
      id: 'default',
      name: 'Default',
      description: 'JRNG’s modern, balanced, friendly visual identity for general applications.',
    },
    {
      id: 'material',
      name: 'Material',
      description: 'A JRNG preset inspired by Material Design principles and structured surfaces.',
    },
    {
      id: 'nexus',
      name: 'Nexus',
      description: 'JRNG’s compact enterprise preset for data-heavy professional applications.',
    },
  ];
  readonly schemes: readonly JThemeColorScheme[] = ['light', 'dark', 'system'];
  readonly primaryPalettes: readonly JPrimaryPaletteName[] = [
    'blue',
    'indigo',
    'violet',
    'emerald',
    'teal',
    'orange',
    'rose',
  ];
  readonly surfacePalettes: readonly JSurfacePaletteName[] = ['cool', 'neutral', 'warm'];
  readonly statuses = ['Active', 'Pending', 'Archived'];

  readonly preset = signal<JThemePresetId>('default');
  readonly scheme = signal<JThemeColorScheme>('light');
  readonly primary = signal<JPrimaryPaletteName>('indigo');
  readonly surface = signal<JSurfacePaletteName>('cool');
  readonly activePresetName = computed(
    () => this.presets.find((option) => option.id === this.preset())?.name ?? 'Default',
  );

  ngAfterViewInit(): void {
    this.previewScope = this.theme.createScope(this.previewRoot().nativeElement, {
      preset: this.preset(),
      colorScheme: this.scheme(),
      primary: this.primary(),
      surface: this.surface(),
    });
  }

  ngOnDestroy(): void {
    this.previewScope?.destroy();
  }

  selectPreset(event: Event): void {
    this.preset.set((event.target as HTMLSelectElement).value as JThemePresetId);
    this.updatePreview();
  }

  selectScheme(event: Event): void {
    this.scheme.set((event.target as HTMLSelectElement).value as JThemeColorScheme);
    this.updatePreview();
  }

  selectPrimary(event: Event): void {
    this.primary.set((event.target as HTMLSelectElement).value as JPrimaryPaletteName);
    this.updatePreview();
  }

  selectSurface(event: Event): void {
    this.surface.set((event.target as HTMLSelectElement).value as JSurfacePaletteName);
    this.updatePreview();
  }

  resetPreview(): void {
    this.preset.set('default');
    this.scheme.set('light');
    this.primary.set('indigo');
    this.surface.set('cool');
    this.updatePreview();
  }

  title(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  private updatePreview(): void {
    this.previewScope?.update({
      preset: this.preset(),
      colorScheme: this.scheme(),
      primary: this.primary(),
      surface: this.surface(),
    });
  }
}
