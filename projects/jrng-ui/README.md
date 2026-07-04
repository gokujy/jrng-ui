# jrng-ui

Premium standalone Angular UI components for dashboards, forms, data workflows,
and application shells.

- Package: `jrng-ui`
- Angular peer version: `^21.2.0`
- License: MIT

## Installation

```bash
npm install jrng-ui
```

`jrng-ui` expects Angular packages to be installed in your app. The package lists
`@angular/common`, `@angular/core`, and `@angular/forms` as peer dependencies.

## Add the Theme

Add the JRNG UI theme once in your global stylesheet, usually `src/styles.scss`.

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
  template: `<j-button severity="primary" (clicked)="save()">Save</j-button>`,
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
| Button    | `jrng-ui/button` | `j-button`           | Actions, submits, toolbar buttons      |
| Input     | `jrng-ui/input`  | `j-input`            | Text fields, search, email, number      |
| Textarea  | `jrng-ui/textarea` | `j-textarea`       | Multi-line text fields                  |
| Select    | `jrng-ui/select` | `j-select`           | Single-value dropdowns and forms        |
| Table     | `jrng-ui/table`  | `j-table`            | Data grids, sorting, pagination         |
| Card      | `jrng-ui/card`   | `j-card`             | Metric blocks, panels, grouped content |
| Dialog    | `jrng-ui/dialog` | `j-dialog`           | Modals, confirmations, focused forms   |
| Toast     | `jrng-ui/toast`  | `j-toast`            | App notifications and feedback         |

## Button

```ts
import { ButtonComponent } from 'jrng-ui/button';
```

```html
<j-button severity="primary" size="md" (clicked)="save()">Save</j-button>
<j-button severity="danger" [loading]="isDeleting">Delete</j-button>
<j-button severity="secondary" variant="outlined">Continue</j-button>
```

| Input                      | Type                                                            | Default   |
| -------------------------- | --------------------------------------------------------------- | --------- |
| `severity`                 | `primary \| secondary \| success \| warning \| danger \| info \| neutral` | `primary` |
| `variant`                  | `filled \| outlined \| text`                                    | `filled`  |
| `size`                     | `sm \| md \| lg`                                                | `md`      |
| `type`                     | `button \| submit \| reset`                                     | `button`  |
| `disabled`                 | `boolean`                                                       | `false`   |
| `loading`                  | `boolean`                                                       | `false`   |
| `icon`                     | `string`                                                        | `''`      |
| `iconPosition`             | `left \| right`                                                 | `left`    |
| `ariaLabel`                | `string`                                                        | `''`      |

Output: `(clicked)` emits a `MouseEvent`. It is not emitted while the button is
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
    <j-textarea label="Notes" [rows]="4" hint="Visible to reviewers" />
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
  caption="Recent records"
  [columns]="columns"
  [value]="rows"
  selectable
  paginator
  [pageSize]="10"
  (rowSelect)="openRecord($event)"
/>
```

```ts
columns: readonly JTableColumn[] = [
  { field: 'code', header: 'Code', sortable: true },
  { field: 'name', header: 'Name' },
  { field: 'amount', header: 'Amount', sortable: true, align: 'end' },
];

rows: readonly JTableRow[] = [
  { id: 1, code: 'REC-1001', name: 'Record Alpha', amount: '42,000' },
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
<j-card title="Metric" subtitle="This month" variant="elevated">
  <strong>48.2k</strong>
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
<j-dialog
  header="Archive record"
  size="sm"
  [(visible)]="archiveOpen"
  (jrClose)="handleClose($event)"
>
  <p>Archive the selected record?</p>

  <j-button jDialogFooter variant="text" (clicked)="archiveOpen = false"> Cancel </j-button>
  <j-button jDialogFooter severity="danger" (clicked)="archive()"> Archive </j-button>
</j-dialog>
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

Projection slots: `[jDialogHeader]`, default body content, `[jDialogBody]`,
and `[jDialogFooter]`.

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
    <j-toast position="top-right" />
    <j-button (clicked)="saved()">Save</j-button>
  `,
})
export class AppComponent {
  private readonly toast = inject(ToastService);

  saved(): void {
    this.toast.success('Record saved successfully');
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

`j-toast` supports `position`: `top-right`, `top-left`,
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

