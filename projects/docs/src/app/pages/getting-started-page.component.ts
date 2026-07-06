import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-getting-started-page',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="docs-container">
      <section class="docs-section">
        <span class="docs-eyebrow">Getting Started</span>
        <h1>Install &amp; set up JRNG UI</h1>
        <p class="docs-lead">
          JRNG UI is a set of standalone Angular components. Install the package, add the theme
          once, then import the components you need from their secondary entrypoints.
        </p>
      </section>

      <section class="docs-section">
        <h2>1. Install</h2>
        <pre class="docs-code"><code>npm install jrng-ui</code></pre>
      </section>

      <section class="docs-section">
        <h2>2. Add the theme</h2>
        <p class="docs-lead">Import the stylesheet once in your global styles.</p>
        <pre class="docs-code"><code>{{ themeScss }}</code></pre>
        <p class="docs-lead">Or reference the compiled CSS in <code>angular.json</code>.</p>
        <pre class="docs-code"><code>{{ themeJson }}</code></pre>
      </section>

      <section class="docs-section">
        <h2>3. Configure providers (optional)</h2>
        <p class="docs-lead">
          Enable runtime theming and set the initial mode. See the
          <a routerLink="/themes">Theming</a> page for presets and the theme service.
        </p>
        <pre class="docs-code"><code>{{ providersTs }}</code></pre>
      </section>

      <section class="docs-section">
        <h2>4. Use a component</h2>
        <p class="docs-lead">Import standalone components from their entrypoints.</p>
        <pre class="docs-code"><code>{{ usageTs }}</code></pre>
      </section>

      <section class="docs-section">
        <h2>Dark mode</h2>
        <p class="docs-lead">
          Add <code>j-dark</code> to a root element, or let <code>JThemeService</code> manage it.
        </p>
        <pre class="docs-code"><code>{{ darkHtml }}</code></pre>
        <div class="docs-cta">
          <a class="docs-btn docs-btn--primary" routerLink="/docs/components">Explore components</a>
          <a class="docs-btn docs-btn--ghost" routerLink="/themes">Theming playground</a>
        </div>
      </section>
    </div>
  `,
})
export class GettingStartedPageComponent {
  readonly themeScss = `@use 'jrng-ui/styles';`;

  readonly themeJson = `{
  "styles": [
    "node_modules/jrng-ui/theme/jrng-ui.css",
    "src/styles.scss"
  ]
}`;

  readonly providersTs = `import { bootstrapApplication } from '@angular/platform-browser';
import { provideJrngUI } from 'jrng-ui/core';
import { provideJrngTheme } from 'jrng-ui/theming';

bootstrapApplication(App, {
  providers: [
    provideJrngUI({ themeMode: 'system' }),
    provideJrngTheme(),
  ],
});`;

  readonly usageTs = `import { Component } from '@angular/core';
import { JButtonComponent } from 'jrng-ui/button';
import { JInputComponent } from 'jrng-ui/input';

@Component({
  selector: 'app-example',
  imports: [JButtonComponent, JInputComponent],
  template: \`
    <j-input label="Email" placeholder="name@example.com" />
    <j-button label="Save" />
  \`,
})
export class ExampleComponent {}`;

  readonly darkHtml = `<main class="j-dark">
  <!-- components render in dark mode -->
</main>`;
}
