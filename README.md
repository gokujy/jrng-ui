# jrng-ui

Standalone Angular UI components for ERP, admin panels, dashboards, and business
applications.

- Package: `jrng-ui`
- Angular peer version: `^21.2.0`
- License: MIT
- Repository: https://github.com/gokujy/jrng-ui

## Installation

```bash
npm install jrng-ui
```

`jrng-ui` expects Angular packages to be installed in your app. The package lists
`@angular/common`, `@angular/core`, and `@angular/forms` as peer dependencies.

## Add the Theme

Add the JR UI theme once in your global stylesheet, usually `src/styles.scss`.

```scss
@use 'jrng-ui/theme';
```

If your app uses plain CSS configuration, include the compiled theme file in
`angular.json`.

```json
{
  "styles": ["node_modules/jrng-ui/theme/jr-theme.css", "src/styles.css"]
}
```

The default theme is light. Wrap any section or app root with `.jr-dark` to use
dark tokens.

```html
<section class="jr-dark">
  <jr-button variant="primary">Save</jr-button>
</section>
```

## Quick Start

All components are standalone Angular components. Import only what you use.

```ts
import { Component } from '@angular/core';
import { ButtonComponent } from 'jrng-ui/button';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent],
  template: `<jr-button variant="primary" (jrPress)="save()">Save</jr-button>`,
})
export class ExampleComponent {
  save(): void {
    // Save your form or record here.
  }
}
```

You can also import from the package root, but secondary entrypoints keep imports
clear in larger apps.

```ts
import { ButtonComponent, InputComponent } from 'jrng-ui';
```

## Components

| Component | Import           | Selector             | Use for                                |
| --------- | ---------------- | -------------------- | -------------------------------------- |
| Button    | `jrng-ui/button` | `jr-button`          | Actions, submits, toolbar buttons      |
| Input     | `jrng-ui/input`  | `jr-input`           | Text fields, search, numbers, textarea |
| Card      | `jrng-ui/card`   | `jr-card`            | KPI blocks, panels, grouped content    |
| Dialog    | `jrng-ui/dialog` | `jr-dialog`          | Modals, confirmations, focused forms   |
| Toast     | `jrng-ui/toast`  | `jr-toast-container` | App notifications and feedback         |

## Button

```ts
import { ButtonComponent } from 'jrng-ui/button';
```

```html
<jr-button variant="primary" size="md" (jrPress)="save()">Save</jr-button>
<jr-button variant="danger" [loading]="isDeleting">Delete</jr-button>
<jr-button variant="outline" fullWidth>Continue</jr-button>
```

| Input                      | Type                                                            | Default   |
| -------------------------- | --------------------------------------------------------------- | --------- |
| `variant`                  | `primary \| secondary \| outline \| ghost \| danger \| success` | `primary` |
| `size`                     | `sm \| md \| lg`                                                | `md`      |
| `type`                     | `button \| submit \| reset`                                     | `button`  |
| `disabled`                 | `boolean`                                                       | `false`   |
| `loading`                  | `boolean`                                                       | `false`   |
| `fullWidth`                | `boolean`                                                       | `false`   |
| `iconBefore` / `iconAfter` | `string`                                                        | `''`      |
| `ariaLabel`                | `string`                                                        | `''`      |

Output: `(jrPress)` emits a `MouseEvent`. It is not emitted while the button is
disabled or loading.

## Input

`jr-input` implements `ControlValueAccessor`, so it works with Angular forms.

```ts
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from 'jrng-ui/input';

@Component({
  selector: 'app-form',
  imports: [ReactiveFormsModule, InputComponent],
  template: `
    <jr-input label="Email" type="email" [formControl]="email" />
    <jr-input label="Notes" multiline [rows]="4" hint="Visible to approvers" />
  `,
})
export class FormComponent {
  email = new FormControl('');
}
```

| Input                        | Type                                            | Default |
| ---------------------------- | ----------------------------------------------- | ------- |
| `type`                       | `text \| password \| search \| email \| number` | `text`  |
| `label`                      | `string`                                        | `''`    |
| `placeholder`                | `string`                                        | `''`    |
| `hint` / `error` / `success` | `string`                                        | `''`    |
| `prefixIcon` / `suffixIcon`  | `string`                                        | `''`    |
| `readonly`                   | `boolean`                                       | `false` |
| `required`                   | `boolean`                                       | `false` |
| `disabled`                   | `boolean`                                       | `false` |
| `multiline`                  | `boolean`                                       | `false` |
| `rows`                       | `number`                                        | `3`     |

## Card

```ts
import { CardComponent } from 'jrng-ui/card';
```

```html
<jr-card title="Revenue" subtitle="This month" variant="elevated">
  <strong>Rs. 48.2L</strong>
  <span jrCardFooter>Updated just now</span>
</jr-card>
```

| Input       | Type                                      | Default   |
| ----------- | ----------------------------------------- | --------- |
| `title`     | `string`                                  | `''`      |
| `subtitle`  | `string`                                  | `''`      |
| `variant`   | `default \| elevated \| bordered \| soft` | `default` |
| `clickable` | `boolean`                                 | `false`   |

Projection slots: `[jrCardHeader]`, default body content, `[jrCardBody]`, and
`[jrCardFooter]`.

## Dialog

```ts
import { DialogComponent } from 'jrng-ui/dialog';
```

```html
<jr-dialog
  title="Archive supplier"
  size="sm"
  [(open)]="archiveOpen"
  (jrClose)="handleClose($event)"
>
  <p>Archive the selected supplier record?</p>

  <jr-button jrDialogFooter variant="ghost" (jrPress)="archiveOpen = false"> Cancel </jr-button>
  <jr-button jrDialogFooter variant="danger" (jrPress)="archive()"> Archive </jr-button>
</jr-dialog>
```

| Input             | Type                   | Default |
| ----------------- | ---------------------- | ------- |
| `open`            | `boolean`              | `false` |
| `title`           | `string`               | `''`    |
| `size`            | `sm \| md \| lg \| xl` | `md`    |
| `showCloseButton` | `boolean`              | `true`  |
| `closeOnBackdrop` | `boolean`              | `true`  |
| `closeOnEscape`   | `boolean`              | `true`  |

Outputs: `(openChange)` emits the new open state. `(jrClose)` emits
`close-button`, `backdrop`, `escape`, or `api`.

Projection slots: `[jrDialogHeader]`, default body content, `[jrDialogBody]`,
and `[jrDialogFooter]`.

## Toast

Place one toast container near your application root.

```ts
import { Component, inject } from '@angular/core';
import { ButtonComponent } from 'jrng-ui/button';
import { ToastContainerComponent, ToastService } from 'jrng-ui/toast';

@Component({
  selector: 'app-root',
  imports: [ButtonComponent, ToastContainerComponent],
  template: `
    <jr-toast-container position="top-right" />
    <jr-button (jrPress)="saved()">Save</jr-button>
  `,
})
export class AppComponent {
  private readonly toast = inject(ToastService);

  saved(): void {
    this.toast.success('Invoice saved successfully');
  }
}
```

Toast service methods:

```ts
toast.show({ type: 'info', title: 'Report ready', message: 'Download can start.' });
toast.success('Saved');
toast.error('Could not sync');
toast.warning('Low stock');
toast.info('Export started');
toast.clear();
```

`jr-toast-container` supports `position`: `top-right`, `top-left`,
`bottom-right`, or `bottom-left`.

## Secondary Entrypoints

```ts
import { ButtonComponent } from 'jrng-ui/button';
import { InputComponent } from 'jrng-ui/input';
import { CardComponent } from 'jrng-ui/card';
import { DialogComponent, DialogService } from 'jrng-ui/dialog';
import { ToastContainerComponent, ToastService } from 'jrng-ui/toast';
```

Class names with the `Jr` prefix are also exported for teams that prefer explicit
library names, for example `JrButtonComponent` and `JrToastService`.

## Local Development

```bash
npm install
npm start
npm run build
npm run build:lib
npm run test
```

The docs app imports the local package through secondary entrypoints such as
`jrng-ui/button`, so `npm start`, `npm test`, and the docs-specific scripts build
the library first.

Workspace paths:

- Library source: `projects/jr/jrng-ui/src/lib`
- Public API: `projects/jr/jrng-ui/src/public-api.ts`
- Package metadata: `projects/jr/jrng-ui/package.json`
- Docs app: `projects/docs/src/app`
- Theme tokens: `projects/jr/jrng-ui/src/lib/theme/jr-theme.scss`

## License

MIT
