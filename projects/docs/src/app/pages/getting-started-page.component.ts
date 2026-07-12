import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CodeBlockComponent } from '../docs/code-block.component';

@Component({
  selector: 'app-getting-started-page',
  imports: [RouterLink, CodeBlockComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="docs-container">
      <section class="docs-section">
        <span class="docs-eyebrow">Five-minute setup</span>
        <h1>Get started with JRNG UI</h1>
        <p class="docs-lead">
          JRNG UI is a modern Angular component library for admin panels, dashboards and business
          applications. Install it, add one stylesheet, and import only the standalone components
          your application uses.
        </p>
        <div class="docs-cta">
          <a class="docs-btn docs-btn--primary" routerLink="/docs/components">View Components</a>
          <a class="docs-btn docs-btn--ghost" routerLink="/examples">Live Examples</a>
          <a class="docs-btn docs-btn--ghost" routerLink="/admin-starter">Admin Starter</a>
        </div>
      </section>

      <section class="docs-section">
        <h2>Requirements and compatibility</h2>
        <p class="docs-lead">
          The current release is verified with Angular 21.2.x. JRNG UI works with standalone
          applications, SSR, Reactive Forms, and zoneless change detection.
        </p>
        <div class="j-table-wrap">
          <table class="j-api-table">
            <thead>
              <tr>
                <th>JRNG UI version</th>
                <th>Supported Angular versions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>0.0.8 (current)</td>
                <td>Angular 21.2.x</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="docs-section">
        <h2>1. Installation</h2>
        <app-code-block label="Terminal" language="bash" code="npm install jrng-ui" />
      </section>

      <section class="docs-section">
        <h2>2. Theme and stylesheet setup</h2>
        <p class="docs-lead">Import the Sass entrypoint once in your global stylesheet.</p>
        <app-code-block label="src/styles.scss" language="scss" [code]="themeScss" />
        <p class="docs-lead">Projects that do not compile Sass can include the distributed CSS.</p>
        <app-code-block label="angular.json" language="json" [code]="themeJson" />
      </section>

      <section class="docs-section">
        <h2>3. Component import</h2>
        <p class="docs-lead">
          Import from modular entrypoints so application bundles include only the APIs they use.
        </p>
        <app-code-block label="app.component.ts" language="ts" [code]="componentTs" />
      </section>

      <section class="docs-section">
        <h2>4. Template usage</h2>
        <p class="docs-lead">Button activation uses the stable <code>(onClick)</code> output.</p>
        <app-code-block label="Template" language="html" [code]="buttonHtml" />
      </section>

      <section class="docs-section">
        <h2>5. Run the application</h2>
        <app-code-block label="Terminal" language="bash" code="npm start" />
      </section>

      <section class="docs-section">
        <h2>6. Continue with the complete documentation</h2>
        <p class="docs-lead">
          Open a component page for its live Preview, copyable Code, API reference, accessibility
          guidance, theme variables, and troubleshooting notes.
        </p>
        <div class="docs-cta">
          <a class="docs-btn docs-btn--primary" routerLink="/docs/components">Component API</a>
          <a class="docs-btn docs-btn--ghost" routerLink="/guides/reactive-forms"
            >Reactive Forms guide</a
          >
          <a class="docs-btn docs-btn--ghost" routerLink="/themes">Theme configuration</a>
        </div>
      </section>

      <section class="docs-section">
        <h2>Optional theme provider</h2>
        <app-code-block label="app.config.ts" language="ts" [code]="providersTs" />
      </section>

      <section class="docs-section">
        <h2>Reactive Forms</h2>
        <app-code-block label="profile-form.component.ts" language="ts" [code]="reactiveFormsTs" />
      </section>

      <section class="docs-section">
        <h2>SSR and zoneless applications</h2>
        <p class="docs-lead">
          Import components normally during server rendering. JRNG UI guards browser-only APIs;
          application code should still keep direct window, document, storage, and media access
          behind platform checks. Components use explicit state updates and do not require Zone.js.
        </p>
        <app-code-block label="app.config.ts" language="ts" [code]="zonelessTs" />
      </section>
    </div>
  `,
})
export class GettingStartedPageComponent {
  readonly themeScss = `@use 'jrng-ui/styles';`;

  readonly themeJson = `{
  "projects": {
    "app": {
      "architect": {
        "build": {
          "options": {
            "styles": [
              "node_modules/jrng-ui/theme/jrng-ui.css",
              "src/styles.scss"
            ]
          }
        }
      }
    }
  }
}`;

  readonly componentTs = `import { ChangeDetectionStrategy, Component } from '@angular/core';
import { JButtonComponent } from 'jrng-ui/button';

@Component({
  selector: 'app-root',
  imports: [JButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.component.html',
})
export class AppComponent {
  createReport(): void {
    // Start the application workflow.
  }
}`;

  readonly buttonHtml = `<j-button label="Create report" (onClick)="createReport()" />`;

  readonly providersTs = `import { ApplicationConfig } from '@angular/core';
import { provideJrngUI } from 'jrng-ui/core';
import { provideJrngTheme } from 'jrng-ui/theming';

export const appConfig: ApplicationConfig = {
  providers: [
    provideJrngUI({ themeMode: 'system' }),
    provideJrngTheme(),
  ],
};`;

  readonly reactiveFormsTs = `import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { JButtonComponent } from 'jrng-ui/button';
import { JInputComponent } from 'jrng-ui/input';

@Component({
  selector: 'app-profile-form',
  imports: [ReactiveFormsModule, JButtonComponent, JInputComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <form [formGroup]="form" (ngSubmit)="save()">
      <j-input
        label="Display name"
        formControlName="displayName"
        [invalid]="form.controls.displayName.touched && form.controls.displayName.invalid"
        error="A display name is required."
      />
      <j-button label="Save profile" type="submit" [disabled]="form.invalid" />
    </form>
  \`,
})
export class ProfileFormComponent {
  readonly form = new FormGroup({
    displayName: new FormControl('', { nonNullable: true, validators: Validators.required }),
  });

  save(): void {
    if (this.form.invalid) return;
    console.log(this.form.getRawValue());
  }
}`;

  readonly zonelessTs = `import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [provideZonelessChangeDetection()],
};`;
}
