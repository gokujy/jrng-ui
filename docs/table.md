# JRNG UI Table

`j-table` is the main data grid component for JRNG UI. It is an independent Angular table implementation for sortable, pageable, accessible data views.

## Imports

```ts
import {
  JTableComponent,
  JTableColumn,
  JTableCellTemplateDirective,
  JTableEmptyTemplateDirective,
  JTableFilterTemplateDirective,
  JTableHeaderTemplateDirective,
  JTableLoadingTemplateDirective,
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
<j-table [value]="rows" [columns]="columns" dataKey="id" striped hover responsive />
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

Columns can opt into typed custom ordering with `sortComparator(left, right, column)`.

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
  dataMode="lazy"
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

Use `rowSelectable` to exclude disabled or permission-restricted rows. Select-all operates on eligible rows in the current filtered page (or the currently supplied lazy/virtual page), and exposes native checked/indeterminate state.

```html
<j-table selectionMode="checkbox" [rowSelectable]="canSelectOrder" [(selection)]="selectedRows" />
```

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

## Row grouping

```html
<j-table [value]="rows" [columns]="columns" groupRowsBy="department" collapsibleRowGroups>
  <ng-template #jTableGroupHeader let-department> {{ department }} department </ng-template>
</j-table>
```

Group headers use `scope="rowgroup"`. Optional `#jTableGroupHeader` and `#jTableGroupFooter` templates receive the group value, current row, and row index.

## Virtual scrolling

Virtual scrolling is opt-in and keeps simple tables unchanged:

```html
<j-table
  [value]="largeResultSet"
  [columns]="columns"
  virtualScroll
  [virtualItemSize]="44"
  [virtualOverscan]="4"
  scrollHeight="32rem"
>
</j-table>
```

For backend windows, combine `dataMode="virtual"` with the application’s lazy query handling.

## Row Actions

```ts
columns = [
  { field: 'code', header: 'Code' },
  {
    field: 'actions',
    header: 'Actions',
    type: 'actions',
    actions: [
      { key: 'view', label: 'View' },
      { key: 'delete', label: 'Delete', severity: 'danger' },
    ],
  },
];
```

```html
<j-table [value]="rows" [columns]="columns" (action)="handleAction($event)" />
```

## Custom Templates

Use keyed templates with the typed input column model:

```html
<j-table [value]="rows" [columns]="columns">
  <ng-template jTableCell="status" let-value="formattedValue">
    <span class="j-table-status">{{ value }}</span>
  </ng-template>

  <ng-template jTableHeader="amount" let-column> {{ column.header }} total </ng-template>
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
- Eligible-row select-all with checked and indeterminate states
- Responsive layout
- Basic text column filters
- Global filter toolbar
- Column manager
- State save and restore
- CSV export
- Row expansion
- Row grouping with custom, collapsible headers and footers
- Cell and row edit events
- Row and column reorder events
- Frozen row and column styling hooks
- Local and backend-window virtual scrolling

## Typed Column Configuration

For new implementations, prefer `JTableColumn<T>`. It supports checked fields, semantic types, dimensions, alignment, visibility, freezing, sorting, filtering, resizing, reordering, value getters, and formatters.

```ts
interface OrderRow {
  id: number;
  order: string;
  status: 'paid' | 'overdue';
  total: number;
}

columns: JTableColumn<OrderRow>[] = [
  { field: 'order', header: 'Order', sortable: true, minWidth: '9rem' },
  { field: 'status', header: 'Status', type: 'status', filterable: true },
  {
    field: 'total', header: 'Total', type: 'number', align: 'end',
    valueGetter: row => row.total,
    formatter: value => new Intl.NumberFormat('en', {
      style: 'currency', currency: 'USD'
    }).format(Number(value)),
  },
];
```

## Visual Variants and Density

`variant` selects a complete visual presentation. `density` controls spacing independently.

```html
<j-table [value]="rows" [columns]="columns" variant="striped" density="compact" />
<j-table [value]="rows" [columns]="columns" variant="gridlines" />
<j-table [value]="rows" [columns]="columns" variant="minimal" />
<j-table [value]="rows" [columns]="columns" variant="standard" density="spacious" />
```

## Integrated Loading

```html
<j-table loading loadingVariant="skeleton" [skeletonRows]="5" [value]="[]" [columns]="columns" />
<j-table loading loadingVariant="spinner" [value]="[]" [columns]="columns" />
<j-table loading loadingVariant="progress" [value]="[]" [columns]="columns" />
<j-table loading loadingVariant="overlay" [value]="rows" [columns]="columns" />
```

Skeleton, spinner, and progress replace rows. Overlay retains current rows during refresh. Empty content is not rendered while loading.

```html
<j-table loading [value]="[]" [columns]="columns">
  <ng-template jTableLoading let-variant let-rows="rows">
    <p role="status">Loading {{ rows }} rows with {{ variant }} presentation.</p>
  </ng-template>
</j-table>
```

## Integrated Empty and Error States

```html
<j-table
  [value]="[]"
  [columns]="columns"
  emptyTitle="No orders yet"
  emptyDescription="New orders will appear here."
  emptyActionLabel="Create order"
  (emptyAction)="createOrder()"
/>

<j-table
  [value]="rows"
  [columns]="columns"
  globalFilter="no-match"
  noResultsTitle="No matching orders"
/>

<j-table
  [value]="[]"
  [columns]="columns"
  [errorState]="loadError"
  emptyActionLabel="Retry"
  (emptyAction)="reload()"
/>
```

In `auto` mode, an active filter with zero rows selects `no-results`, an untouched empty dataset selects `no-data`, and an `error` value selects `error`. Server-side consumers can set `emptyState` explicitly.

```html
<j-table [value]="[]" [columns]="columns" emptyState="no-results">
  <ng-template jTableEmpty let-state let-title="title" let-action="action">
    <section>
      <h3>{{ title }}</h3>
      <p>Current state: {{ state }}</p>
      <button type="button" (click)="action()">Clear filters</button>
    </section>
  </ng-template>
</j-table>
```

## Tree Table

Hierarchical records use the separate `j-tree-table`. This keeps tree-grid keyboard behavior, levels, expansion, lazy children, partial selection, and propagation out of the flat Table API.

```html
<j-tree-table
  [value]="nodes"
  [columns]="treeColumns"
  [(expandedKeys)]="expandedKeys"
  selectionMode="checkbox"
  [propagateSelectionDown]="true"
  [propagateSelectionUp]="true"
/>

<j-tree-table
  [value]="lazyNodes"
  [columns]="treeColumns"
  lazy
  (nodeExpand)="loadChildren($event)"
/>
```
