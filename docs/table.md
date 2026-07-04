# JRNG UI Table

`j-table` is the main data grid component for JRNG UI. It is an independent Angular table implementation with PrimeNG-like practical coverage, not a PrimeNG wrapper.

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
  { field: 'invoice', header: 'Invoice', sortable: true },
  { field: 'customer', header: 'Customer', filterable: true },
  { field: 'amount', header: 'Amount', type: 'number', align: 'end', sortable: true },
  { field: 'status', header: 'Status', type: 'tag' },
];

rows = [
  { id: 1, invoice: 'INV-1001', customer: 'Aster Retail', amount: 42000, status: 'Paid' },
  { id: 2, invoice: 'INV-1002', customer: 'Northwind', amount: 88400, status: 'Pending' },
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
  (lazyLoad)="loadInvoices($event)"
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

## Row Actions

```ts
columns = [
  { field: 'invoice', header: 'Invoice' },
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
  <j-column field="customer" header="Customer" sortable>
    <ng-template let-row>
      <strong>{{ row.customer }}</strong>
      <small>{{ row.gstin }}</small>
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
    {{ column.header }} (INR)
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
- Lazy loading event support
- Row actions
- Custom cell templates
- Header templates
- Selection support
- Responsive layout
- Basic text column filters

## Pending Advanced Items

- Virtual scroll
- Row grouping
- Column resize behavior
- Column reorder behavior
- Frozen rows and columns
- CSV export
- Advanced filter match modes and menus

