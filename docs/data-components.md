# JRNG UI Data Components

JRNG UI data components provide generic, premium Angular data display patterns with standalone components, `j-*` selectors, `.j-*` classes, accessible roles, keyboard-friendly controls, and original token-driven styling.

## Imports

```ts
import { JTableComponent, JTableColumn } from 'jrng-ui/table';
import { JDataGridColumn, JDataGridComponent } from 'jrng-ui/data-grid';
import { JPaginatorComponent } from 'jrng-ui/paginator';
import { JColumnFilterComponent } from 'jrng-ui/column-filter';
import { JDataViewComponent } from 'jrng-ui/data-view';
import { JVirtualScrollerComponent } from 'jrng-ui/virtual-scroller';
```

Root imports are also supported from `jrng-ui`.

## j-table

```html
<j-table
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
/>
```

```ts
columns: readonly JTableColumn[] = [
  { field: 'orderNumber', header: 'Order', sortable: true, filterable: true },
  { field: 'customer', header: 'Customer', sortable: true, filterable: true, editable: true },
  { field: 'status', header: 'Status', type: 'tag', filterable: true },
  { field: 'total', header: 'Total', type: 'number', sortable: true, align: 'end' },
];
```

Supported table features include pagination, sorting, multi-sort metadata, global filter, column filter, loading state, empty state, row selection, checkbox selection, row expansion, row and cell editing hooks, column resize handles, column reorder events, row reorder events, frozen column styling, sticky header, scrollable table, responsive mode, column visibility manager, saved table state, CSV export, custom header/body/footer templates, row action menu, context menu hook, and lazy loading events.

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

## j-data-grid

`j-data-grid` composes the table foundation into a more app-like management surface with a toolbar, search, column controls, CSV export, state controls, bulk-action projection, loading and empty states. It keeps `j-table` as the rendering foundation and forwards table events for server-side data, selection, sorting, filtering, editing, expansion, column changes, export, state save/restore, and state restore errors.

```html
<j-data-grid
  title="Customers"
  description="Manage customer records"
  [value]="customers"
  [columns]="columns"
  sortMode="multiple"
  resizableColumns
  reorderableColumns
  stateKey="customers-grid"
  [(selection)]="selectedCustomers"
  (lazyLoad)="loadCustomers($event)"
  (stateError)="clearCorruptedGridState($event)"
>
  <j-button jDataGridActions>Create</j-button>
  <j-button jDataGridBulkActions>Archive selected</j-button>
</j-data-grid>
```

```ts
interface CustomerRow {
  readonly id: number;
  readonly name: string;
  readonly status: string;
  readonly totalOrders: number;
}

columns: readonly JDataGridColumn<CustomerRow>[] = [
  { field: 'name', header: 'Customer', sortable: true, filterable: true },
  { field: 'status', header: 'Status', type: 'tag', filterable: true },
  { field: 'totalOrders', header: 'Orders', type: 'number', sortable: true, align: 'end' },
];
```

State persistence is enabled only when a `stateKey` is provided. Malformed state is ignored, defaults are restored, and `stateError` emits without interrupting rendering.

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
