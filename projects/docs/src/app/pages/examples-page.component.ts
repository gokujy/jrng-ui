import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CodeBlockComponent } from '../docs/code-block.component';

@Component({
  selector: 'app-examples-page',
  imports: [RouterLink, CodeBlockComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="docs-container">
    <header class="j-page-hero j-page-hero--docs">
      <span class="j-page-eyebrow">Live examples</span>
      <h1>Copyable JRNG UI Angular examples</h1>
      <p>
        These examples use published package imports and stable APIs. Copy them into an Angular 21.2
        application after installing <code>jrng-ui</code>.
      </p>
    </header>
    <section class="docs-section">
      <h2>Minimal Angular starter</h2>
      <app-code-block label="app.component.ts" language="ts" [code]="minimal" />
    </section>
    <section class="docs-section">
      <h2>Basic component</h2>
      <app-code-block label="action.component.ts" language="ts" [code]="button" />
    </section>
    <section class="docs-section">
      <h2>Reactive Forms</h2>
      <app-code-block label="profile-form.component.ts" language="ts" [code]="form" />
    </section>
    <section class="docs-section">
      <h2>Data table</h2>
      <app-code-block label="users-table.component.ts" language="ts" [code]="table" />
    </section>
    <section class="docs-section">
      <h2>Theme configuration</h2>
      <app-code-block label="app.config.ts" language="ts" [code]="theme" />
    </section>
    <section class="docs-section">
      <p class="docs-lead">
        Online-editor links are intentionally omitted until a generated project can be continuously
        validated against the published package.
      </p>
      <a class="docs-btn docs-btn--primary" routerLink="/docs">Installation guide</a>
    </section>
  </div>`,
})
export class ExamplesPageComponent {
  readonly minimal = `import { Component } from '@angular/core';
import { JButtonComponent } from 'jrng-ui/button';

@Component({
  selector: 'app-root',
  imports: [JButtonComponent],
  template: \`<j-button label="Create report" (onClick)="createReport()" />\`,
})
export class AppComponent {
  createReport(): void {}
}`;
  readonly button = `import { Component, signal } from '@angular/core';
import { JButtonComponent } from 'jrng-ui/button';

@Component({
  selector: 'app-action',
  imports: [JButtonComponent],
  template: \`<j-button label="Save" [loading]="saving()" (onClick)="save()" />\`,
})
export class ActionComponent {
  readonly saving = signal(false);
  save(): void { this.saving.set(true); }
}`;
  readonly form = `import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { JButtonComponent } from 'jrng-ui/button';
import { JInputComponent } from 'jrng-ui/input';

@Component({
  selector: 'app-profile-form',
  imports: [ReactiveFormsModule, JButtonComponent, JInputComponent],
  template: \`<form [formGroup]="form"><j-input label="Name" formControlName="name" /><j-button label="Save" type="submit" /></form>\`,
})
export class ProfileFormComponent {
  readonly form = new FormGroup({ name: new FormControl('', { nonNullable: true, validators: Validators.required }) });
}`;
  readonly table = `import { Component } from '@angular/core';
import { JTableColumn, JTableComponent } from 'jrng-ui/table';

@Component({
  selector: 'app-users-table',
  imports: [JTableComponent],
  template: \`<j-table [value]="users" [columns]="columns" />\`,
})
export class UsersTableComponent {
  readonly users: readonly Readonly<Record<string, unknown>>[] = [{ name: 'Avery Morgan', role: 'Manager' }];
  readonly columns: readonly JTableColumn[] = [{ field: 'name', header: 'Name' }, { field: 'role', header: 'Role' }];
}`;
  readonly theme = `import { ApplicationConfig } from '@angular/core';
import { provideJrngUI } from 'jrng-ui/core';
import { provideJrngTheme } from 'jrng-ui/theming';

export const appConfig: ApplicationConfig = {
  providers: [provideJrngUI({ themeMode: 'system' }), provideJrngTheme()],
};`;
}
