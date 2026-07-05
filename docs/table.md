# JRNG UI Table

`j-table` is the main data grid component for JRNG UI. It is an independent Angular table implementation for sortable, pageable, accessible data views.

## Imports

```ts
import {
  JTableComponent,
  JColumnComponent,
  JTableCellTemplateDirective,
  JTableHeaderTemplateDirective,
} from 'jrng-ui/table';
```

`j-paginator` can be used through the table or directly:

```ts
import { JPaginatorComponent } from 'jrng-ui/paginator';
```

## Basic Table

```ts
columns = [
  { field: 'code', header: 'Code', sortable: true },
  { field: 'name', header: 'Name', filterable: true },
  { field: 'amount', header: 'Amount', type: 'number', align: 'end', sortable: true },
  { field: 'status', header: 'Status', type: 'tag' },
];

rows = [
  { id: 1, code: 'REC-1001', name: 'Record Alpha', amount: 42000, status: 'Complete' },
  { id: 2, code: 'REC-1002', name: 'Record Beta', amount: 88400, status: 'Pending' },
];
```

```html
<j-table
  [value]="rows"
  [columns]="columns"
  dataKey="id"
  striped
  hover
  responsive
/>
```

## Pagination

```html
<j-table
  [value]="rows"
  [columns]="columns"
  [paginator]="true"
  [rows]="10"
  [rowsPerPageOptions]="[10, 25, 50]"
  (pageChange)="loadPage($event)"
/>
```

`pageChange` emits:

```ts
{
  first: number;
  rows: number;
  page: number;
  pageCount: number;
  pageSize: number;
}
```

## Sorting

```html
<j-table
  [value]="rows"
  [columns]="columns"
  sortField="amount"
  [sortOrder]="-1"
  (sortChange)="sort = $event"
/>
```

`sortOrder` is `1`, `-1`, or `0`.

For multi-column sorting, set `sortMode="multiple"` and listen to `sortChange`.

```html
<j-table
  [value]="rows"
  [columns]="columns"
  sortMode="multiple"
  [multiSortMeta]="multiSort"
  (sortChange)="sort = $event"
/>
```

## Filtering and Toolbar

```html
<j-table
  [value]="rows"
  [columns]="columns"
  showGlobalFilter
  showColumnManager
  showExport
  showTableState
  stateKey="orders-table"
  (filterChange)="filters = $event.filters"
/>
```

Set `filterable: true` on a column to show the column filter control.

## Lazy Loading

```html
<j-table
  [value]="pageRows"
  [columns]="columns"
  [lazy]="true"
  [paginator]="true"
  [first]="first"
  [rows]="25"
  [totalRecords]="totalRecords"
  (lazyLoad)="loadRecords($event)"
/>
```

Lazy load events use this shape:

```ts
{
  first: number;
  rows: number;
  sortField?: string;
  sortOrder?: 1 | -1 | 0;
  filters?: Record<string, unknown>;
  globalFilter?: string;
}
```

## Selection

```html
<j-table
  [value]="rows"
  [columns]="columns"
  selectionMode="checkbox"
  [(selection)]="selectedRows"
  dataKey="id"
/>
```

Supported modes are `single`, `multiple`, `checkbox`, and `none`.

## Expansion, Editing, and Reorder

```html
<j-table
  [value]="rows"
  [columns]="columns"
  expandableRows
  cellEditing
  reorderableRows
  reorderableColumns
  (cellEditSave)="saveCell($event)"
  (rowReorder)="rows = $event.value"
  (columnReorder)="columns = $event.columns"
>
  <ng-template #jTableExpandedRow let-row>
    <p>{{ row.name }} details</p>
  </ng-template>
</j-table>
```

## Row Actions

```ts
columns = [
  { field: 'code', header: 'Code' },
  {
    field: 'actions',
    header: 'Actions',
    type: 'action',
    actions: [
      { key: 'view', label: 'View' },
      { key: 'delete', label: 'Delete', severity: 'danger' },
    ],
  },
];
```

```html
<j-table
  [value]="rows"
  [columns]="columns"
  (actionClick)="handleAction($event)"
/>
```

## Custom Templates

Column templates can be declared with `j-column`:

```html
<j-table [value]="rows">
  <j-column field="name" header="Name" sortable>
    <ng-template let-row>
      <strong>{{ row.name }}</strong>
      <small>{{ row.code }}</small>
    </ng-template>
  </j-column>
</j-table>
```

Or by using keyed templates with an input column model:

```html
<j-table [value]="rows" [columns]="columns">
  <ng-template jTableCell="status" let-value="formattedValue">
    <span class="j-table-status">{{ value }}</span>
  </ng-template>

  <ng-template jTableHeader="amount" let-column>
    {{ column.header }} total
  </ng-template>
</j-table>
```

## Direct Paginator

```html
<j-paginator
  [first]="first"
  [rows]="rows"
  [totalRecords]="totalRecords"
  [rowsPerPageOptions]="[10, 25, 50]"
  [showCurrentPageReport]="true"
  (pageChange)="page = $event"
/>
```

## Current Core Coverage

- Basic table rendering
- Loading state
- Empty state
- Pagination
- Single-column sorting
- Multi-column sorting
- Lazy loading event support
- Row actions
- Custom cell templates
- Header templates
- Selection support
- Responsive layout
- Basic text column filters
- Global filter toolbar
- Column manager
- State save and restore
- CSV export
- Row expansion
- Cell and row edit events
- Row and column reorder events
- Frozen row and column styling hooks

## Not Included

- Virtual scroll is handled by `j-virtual-scroller`.
- Row grouping and advanced filter match-mode menus are not part of the current table API.
