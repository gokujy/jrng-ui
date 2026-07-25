# JRNG UI Data Components

JRNG UI data components provide generic, premium Angular data display patterns with standalone components, `j-*` selectors, `.j-*` classes, accessible roles, keyboard-friendly controls, and original token-driven styling.

## Imports

```ts
import { JTableComponent, JTableColumn } from 'jrng-ui/table';
import { JPaginatorComponent } from 'jrng-ui/paginator';
import { JColumnFilterComponent } from 'jrng-ui/column-filter';
import { JDataViewComponent } from 'jrng-ui/data-view';
import { JVirtualScrollerComponent } from 'jrng-ui/virtual-scroller';
```

Root imports are also supported from `jrng-ui`.

## j-table

```html
<j-table
  title="Orders"
  description="Manage operational orders."
  [value]="orders"
  [columns]="columns"
  paginator
  [rows]="10"
  selectionMode="checkbox"
  [(selection)]="selectedOrders"
  showGlobalFilter
  showColumnManager
  showExport
  showTableState
  bulkActions
  stateKey="orders-table"
  expandableRows
  cellEditing
  reorderableRows
  reorderableColumns
  resizableColumns
  stickyHeader
  scrollable
  scrollHeight="32rem"
  (lazyLoad)="loadOrders($event)"
  (cellEditSave)="saveCell($event)"
  (rowReorder)="reorderRows($event)"
  (columnReorder)="reorderColumns($event)"
  (contextMenu)="openRowMenu($event)"
>
  <j-button jTableToolbarActions label="Create order" />
  <j-button jTableBulkActions label="Archive selected" variant="outlined" />
</j-table>
```

```ts
columns: readonly JTableColumn[] = [
  { field: 'orderNumber', header: 'Order', sortable: true, filterable: true },
  { field: 'customer', header: 'Customer', sortable: true, filterable: true, editable: true },
  { field: 'status', header: 'Status', type: 'tag', filterable: true },
  { field: 'total', header: 'Total', type: 'number', sortable: true, align: 'end' },
];
```

Supported table features include management headings, projected toolbar and bulk actions, pagination, sorting, multi-sort metadata, global filter, column filter, loading state, empty state, row selection, checkbox selection, row expansion, row and cell editing hooks, column resize handles, column reorder events, row reorder events, frozen column styling, sticky header, scrollable table, responsive card mode, column visibility manager, saved table state, CSV export, custom header/body/footer templates, row action menu, context menu hook, and lazy loading events.

Custom templates:

```html
<j-table [value]="customers" [columns]="columns">
  <ng-template #jTableExpandedRow let-row>
    <section>{{ row.notes }}</section>
  </ng-template>

  <ng-template #jTableFooter let-columns="columns">
    <tr>
      <td [attr.colspan]="columns.length">Summary</td>
    </tr>
  </ng-template>
</j-table>
```

The former Data Grid management surface is part of Table. Import `JTableComponent` and
`JTableColumn<T>` from `jrng-ui/table`; use `responsiveMode="card"` for compact card presentation.
State persistence is enabled only when a `stateKey` is provided. Malformed state is ignored,
defaults are restored, and Table's `error` output emits without interrupting rendering.

## j-paginator

```html
<j-paginator
  [first]="first"
  [rows]="rows"
  [totalRecords]="totalRecords"
  [rowsPerPageOptions]="[10, 25, 50]"
  showCurrentPageReport
  (pageChange)="page = $event"
/>
```

## j-column-filter

`j-column-filter` is available as a standalone column filter input and is used internally by `j-table`.

```html
<j-column-filter field="status" label="Status" (filterChange)="filter($event)" />
```

## j-data-view

`j-data-view` renders records in list or grid layout with layout toggle, sorting, pagination, and an item template.

```html
<j-data-view [value]="products" [sortOptions]="sortOptions" layout="grid">
  <ng-template #jDataViewItem let-item>
    <article class="product-card">
      <strong>{{ item.name }}</strong>
      <span>{{ item.category }}</span>
    </article>
  </ng-template>
</j-data-view>
```

## j-virtual-scroller

`j-virtual-scroller` renders large lists by only mounting the visible slice. It supports item size, lazy loading, and loading placeholders.

```html
<j-virtual-scroller
  [items]="tasks"
  [itemSize]="48"
  height="30rem"
  lazy
  (lazyLoad)="loadMoreTasks($event)"
>
  <ng-template #jVirtualScrollerItem let-item let-index="index">
    <div>{{ index + 1 }}. {{ item.title }}</div>
  </ng-template>
</j-virtual-scroller>
```
