import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { JBadgeComponent } from 'jrng-ui/badge';
import { JButtonComponent } from 'jrng-ui/button';
import { JCardComponent } from 'jrng-ui/card';
import { JCheckboxComponent } from 'jrng-ui/checkbox';
import { JInputComponent } from 'jrng-ui/input';
import { JSwitchComponent } from 'jrng-ui/switch';
import { JTagComponent } from 'jrng-ui/tag';

interface Feature {
  readonly icon: string;
  readonly title: string;
  readonly text: string;
}

@Component({
  selector: 'app-home-page',
  imports: [
    RouterLink,
    JButtonComponent,
    JInputComponent,
    JCheckboxComponent,
    JSwitchComponent,
    JBadgeComponent,
    JTagComponent,
    JCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="docs-container">
      <section class="docs-hero">
        <span class="docs-eyebrow">Angular {{ angularMajor }} · standalone · zoneless</span>
        <h1>The complete <span class="docs-hero__gradient">Angular UI</span> component library</h1>
        <p class="docs-lead">
          120+ accessible, standalone components with a runtime design-token theming system. A
          dependency-free foundation for business and admin applications.
        </p>
        <div class="docs-cta">
          <a class="docs-btn docs-btn--primary" routerLink="/docs">Get started</a>
          <a class="docs-btn docs-btn--ghost" routerLink="/docs/components">Browse components</a>
        </div>
        <pre class="docs-code"><code>npm install jrng-ui</code></pre>
      </section>

      <section class="docs-section">
        <div class="docs-grid">
          @for (feature of features; track feature.title) {
            <article class="docs-card">
              <span class="docs-card__icon" aria-hidden="true">{{ feature.icon }}</span>
              <h3>{{ feature.title }}</h3>
              <p>{{ feature.text }}</p>
            </article>
          }
        </div>
      </section>

      <section class="docs-section">
        <span class="docs-eyebrow">Live</span>
        <h2>Themed by the library itself</h2>
        <p class="docs-lead">
          Everything below reacts to the theme controls in the header and the presets on the Theming
          page — because this docs site is built with JRNG UI.
        </p>
        <div class="docs-demo">
          <j-button label="Primary" />
          <j-button label="Raised" raised="true" />
          <j-button label="Outlined" outlined="true" />
          <j-button label="Text" text="true" />
          <j-input label="Email" placeholder="name@example.com" />
          <j-checkbox label="Subscribe" />
          <j-switch label="Notifications" />
          <j-badge value="New" />
          <j-tag label="Stable" />
          <j-card title="Card" subtitle="Composable surface" bordered="true">
            <p>Cards, inputs, and controls all share the active theme tokens.</p>
          </j-card>
        </div>
      </section>
    </div>
  `,
})
export class HomePageComponent {
  readonly angularMajor = 21;

  readonly features: readonly Feature[] = [
    {
      icon: '◆',
      title: '120+ components',
      text: 'Forms, overlays, data tables, navigation, charts and more.',
    },
    {
      icon: '◑',
      title: 'Runtime theming',
      text: 'Design-token engine with presets, dark mode and OS sync.',
    },
    {
      icon: '✓',
      title: 'Accessible',
      text: 'Keyboard support, ARIA roles and focus management by default.',
    },
    {
      icon: '◈',
      title: 'Standalone & tree-shakeable',
      text: 'Per-component secondary entrypoints, import only what you use.',
    },
    {
      icon: '⚡',
      title: 'Zoneless & SSR-ready',
      text: 'Signal-based, works with server-side rendering.',
    },
    {
      icon: '◐',
      title: 'Token-driven styles',
      text: 'CSS variables and layers for effortless customization.',
    },
  ];
}
