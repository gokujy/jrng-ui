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
  "styles": ["node_modules/jrng-ui/theme/jrng-ui.css", "src/styles.css"]
}
```

The default theme is light. Wrap any section or app root with `.j-theme-dark` to use
dark tokens when dark theme support is enabled.

```html
<section class="j-theme-dark">
  <j-button variant="primary">Save</j-button>
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
  template: `<j-button variant="primary" (jrPress)="save()">Save</j-button>`,
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
| Input     | `jrng-ui/input`  | `j-input`            | Text fields, search, email, number      |
| Textarea  | `jrng-ui/textarea` | `j-textarea`       | Multi-line text fields                  |
| Select    | `jrng-ui/select` | `j-select`           | Single-value dropdowns and forms        |
| Table     | `jrng-ui/table`  | `j-table`            | Data grids, sorting, pagination         |
| Card      | `jrng-ui/card`   | `jr-card`            | KPI blocks, panels, grouped content    |
| Dialog    | `jrng-ui/dialog` | `jr-dialog`          | Modals, confirmations, focused forms   |
| Toast     | `jrng-ui/toast`  | `jr-toast-container` | App notifications and feedback         |

## Button

```ts
import { ButtonComponent } from 'jrng-ui/button';
```

```html
<j-button variant="primary" size="md" (jrPress)="save()">Save</j-button>
<j-button variant="danger" [loading]="isDeleting">Delete</j-button>
<j-button variant="outline" fullWidth>Continue</j-button>
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

`j-input` and `j-textarea` implement `ControlValueAccessor`, so they work with Angular forms.

```ts
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from 'jrng-ui/input';
import { JTextareaComponent } from 'jrng-ui/textarea';

@Component({
  selector: 'app-form',
  imports: [ReactiveFormsModule, InputComponent, JTextareaComponent],
  template: `
    <j-input label="Email" type="email" [formControl]="email" />
    <j-textarea label="Notes" [rows]="4" hint="Visible to approvers" />
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
| `hint` / `error`             | `string`                                        | `''`    |
| `prefixIcon` / `suffixIcon`  | `string`                                        | `''`    |
| `readonly`                   | `boolean`                                       | `false` |
| `required`                   | `boolean`                                       | `false` |
| `disabled`                   | `boolean`                                       | `false` |
| `clearable`                  | `boolean`                                       | `false` |

## Select

`j-select` implements `ControlValueAccessor`, so it works with Angular reactive
forms.

```ts
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { JSelectOption, SelectComponent } from 'jrng-ui/select';

@Component({
  selector: 'app-status-filter',
  imports: [ReactiveFormsModule, SelectComponent],
  template: `<j-select label="Status" placeholder="All statuses" [options]="statuses" [formControl]="status" />`,
})
export class StatusFilterComponent {
  status = new FormControl('', { nonNullable: true });
  statuses: readonly JSelectOption[] = [
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
  ];
}
```

| Input                        | Type                       | Default |
| ---------------------------- | -------------------------- | ------- |
| `label`                      | `string`                   | `''`    |
| `placeholder`                | `string`                   | `''`    |
| `options`                    | `readonly JSelectOption[]` | `[]`    |
| `hint` / `error` / `success` | `string`                   | `''`    |
| `required`                   | `boolean`                  | `false` |
| `disabled`                   | `boolean`                  | `false` |

Output: `(valueChange)` emits the selected string value.

## Table

```ts
import { JTableColumn, JTableRow, TableComponent } from 'jrng-ui/table';
```

```html
<j-table
  caption="Recent invoices"
  [columns]="columns"
  [rows]="rows"
  selectable
  paginator
  [pageSize]="10"
  (rowSelect)="openInvoice($event)"
/>
```

```ts
columns: readonly JTableColumn[] = [
  { field: 'invoice', header: 'Invoice', sortable: true },
  { field: 'customer', header: 'Customer' },
  { field: 'amount', header: 'Amount', sortable: true, align: 'end' },
];

rows: readonly JTableRow[] = [
  { id: 1, invoice: 'INV-4024', customer: 'Aster Retail', amount: 'Rs. 42,000' },
];
```

| Input               | Type                      | Default             |
| ------------------- | ------------------------- | ------------------- |
| `columns`           | `readonly JTableColumn[]` | `[]`                |
| `rows`              | `readonly JTableRow[]`    | `[]`                |
| `caption`           | `string`                  | `''`                |
| `emptyMessage`      | `string`                  | `No records found.` |
| `loading`           | `boolean`                 | `false`             |
| `rowKey`            | `string`                  | `id`                |
| `striped`           | `boolean`                 | `false`             |
| `hoverable`         | `boolean`                 | `true`              |
| `selectable`        | `boolean`                 | `false`             |
| `paginator`         | `boolean`                 | `false`             |
| `page` / `pageSize` | `number`                  | `1` / `10`          |

Outputs: `(rowSelect)` emits the selected row, `(sortChange)` emits
`{ field, direction }`, and `(pageChange)` emits `{ page, pageSize }`.

Custom cell templates can be projected with a `#jTableCell` template reference.

```html
<j-table [columns]="columns" [rows]="rows">
  <ng-template #jTableCell let-value="value" let-column="column">
    @if (column.field === 'amount') {
      <strong>{{ value }}</strong>
    } @else {
      {{ value }}
    }
  </ng-template>
</j-table>
```

## Card

```ts
import { CardComponent } from 'jrng-ui/card';
```

```html
<j-card title="Revenue" subtitle="This month" variant="elevated">
  <strong>Rs. 48.2L</strong>
  <span jCardFooter>Updated just now</span>
</j-card>
```

| Input       | Type                                      | Default   |
| ----------- | ----------------------------------------- | --------- |
| `title`     | `string`                                  | `''`      |
| `subtitle`  | `string`                                  | `''`      |
| `variant`   | `default \| elevated \| bordered \| soft` | `default` |
| `clickable` | `boolean`                                 | `false`   |

Projection slots: `[jCardHeader]`, default body content, `[jCardBody]`, and
`[jCardFooter]`.

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

  <j-button jrDialogFooter variant="ghost" (jrPress)="archiveOpen = false"> Cancel </j-button>
  <j-button jrDialogFooter variant="danger" (jrPress)="archive()"> Archive </j-button>
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
    <j-button (jrPress)="saved()">Save</j-button>
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
import { SelectComponent } from 'jrng-ui/select';
import { TableComponent } from 'jrng-ui/table';
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

- Library source: `projects/jrng-ui/src/lib`
- Public API: `projects/jrng-ui/src/public-api.ts`
- Package metadata: `projects/jrng-ui/package.json`
- Docs app: `projects/docs/src/app`
- Theme tokens: `projects/jrng-ui/src/styles/jrng-ui.scss`

## License

MIT

