# Enterprise data controls

Phase 2 extends the existing JRNG controls. All examples import from modular `jrng-ui/*` entrypoints and keep the pre-existing defaults intact.

## Table variants and density

### Preview

Render the same columns as standard, gridlines, striped, or minimal, with compact, comfortable, or spacious density.

### Code

```html
<j-table [columns]="columns" [value]="orders" variant="standard" density="comfortable" />
<j-table [columns]="columns" [value]="orders" variant="gridlines" density="compact" />
<j-table [columns]="columns" [value]="orders" variant="striped" density="spacious" />
<j-table [columns]="columns" [value]="orders" variant="minimal" />
```

## Toolbar filter

### Preview

The toolbar combines global search, advanced filters, active chips, Apply, and Reset. On narrow screens the details panel remains keyboard-operable and retains its model.

### Code

```html
<j-table filterDisplay="toolbar" [columns]="columns" [value]="orders" />
```

## Two-row column filter

### Preview

Headers and sorting remain in row one. Inputs remain visible in row two and each match-mode button is positioned beside its input.

### Code

```html
<j-table filterDisplay="row" [columns]="columns" [value]="orders" />
```

## Menu popup filter

### Preview

The header icon opens a focusable popup containing match mode, the type-specific control, then Clear and Apply.

### Code

```html
<j-table filterDisplay="menu" [columns]="columns" [value]="orders" />
```

## Match modes by data type

### Preview

Text supports contains and equality modes; numbers support comparisons and between; dates support date equality, before, after, and ranges; select and boolean columns use equality/inclusion modes.

### Code

```ts
const columns: JTableColumn<Order>[] = [
  { field: 'customer', header: 'Customer', filterable: true, filter: { type: 'text' } },
  {
    field: 'total',
    header: 'Total',
    filterable: true,
    filter: { type: 'number', operators: ['equals', 'between', 'greaterThan'] },
  },
  {
    field: 'placedAt',
    header: 'Placed',
    filterable: true,
    filter: { type: 'date', operators: ['dateIs', 'dateBefore', 'dateBetween'] },
  },
];
```

## Server query mapping

### Preview

Client, server, lazy, and virtual data modes serialize the same stable state. A mapper adapts it to an application's backend without coupling JRNG to that backend.

### Code

```ts
import { jSerializeTableQuery } from 'jrng-ui/table';

const query = jSerializeTableQuery({
  first: 20,
  rows: 10,
  multiSortMeta: [{ field: 'createdAt', order: -1 }],
  filterModel,
  permanentFilters: [
    {
      field: 'workspaceId',
      operator: 'and',
      constraints: [{ matchMode: 'equals', value: activeWorkspaceId }],
    },
  ],
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
});
```

## Saved state and column manager

### Preview

State can use local, session, memory, or a custom adapter. Malformed state emits `stateError` and falls back safely. The column manager preserves required columns while supporting search, visibility, reorder, widths, and frozen state.

### Code

```html
<j-table
  stateKey="orders-v2"
  stateStorage="local"
  [stateVersion]="2"
  [showColumnManager]="true"
  [columns]="columns"
  [value]="orders"
/>
```

## Editing, selection, expansion, and export

### Preview

Cell validators may return synchronously or asynchronously. Radio, checkbox, single, and multiple selection coexist with expansion, reorder, action menus, CSV, server export, and optional Excel/PDF adapters.

### Code

```html
<j-table
  [cellEditing]="true"
  selectionMode="checkbox"
  [expandableRows]="true"
  [exportAdapters]="{ excel: excelAdapter, pdf: pdfAdapter }"
  (cellEditSave)="saveCell($event)"
/>
```

## Responsive table and Data Grid

### Preview

Tables support scroll, stack, card, or none. Data Grid reuses the same table query/filter/state infrastructure while remaining a separate component.

### Code

```html
<j-table responsiveMode="card" [columns]="columns" [value]="orders" />
<j-data-grid
  displayMode="grid"
  dataMode="server"
  filterDisplay="toolbar"
  [columns]="columns"
  [value]="orders"
/>
```

## Async Select, Multiselect, and Autocomplete

### Preview

All three controls share cancellation, caching, retry, pagination, selected-value hydration, and accessible loading/error announcements. The application owns the data source; no `HttpClient` or URL is embedded in JRNG.

### Code

```ts
import { JAsyncDataSource, JAsyncOptionsQuery } from 'jrng-ui/async-data';

const peopleSource: JAsyncDataSource<Person, JAsyncOptionsQuery> = {
  load: ({ search, page, pageSize }) => peopleApi.search({ search, page, pageSize }),
  hydrate: (ids) => peopleApi.byIds(ids),
};
```

```html
<j-select [dataSource]="peopleSource" [searchable]="true" />
<j-multiselect [dataSource]="peopleSource" [filter]="true" />
<j-autocomplete [dataSource]="peopleSource" />
```

## Avatar fallback and group overflow

### Preview

Avatar falls back from an image to initials or an icon and supports presence, shape, size, and opt-in lazy loading. Avatar Group supports stacked/spaced layouts and a keyboard-accessible `+N` overflow popover.

### Code

```html
<j-avatar image="/missing.png" label="Ada Lovelace" status="online" imageLoading="lazy" />
<j-avatar-group [items]="people" [maxVisible]="4" mode="stacked" overlap="0.625rem" />
```

## File upload adapter

### Preview

The existing basic/advanced uploader now supports paste, remote files, rename/metadata/reorder methods, retry/cancel, per-file progress, adapter uploads, and chunk adapter hooks.

### Code

```ts
const uploadAdapter: JFileUploadAdapter<RemoteFile> = {
  upload: (file, { signal, metadata, reportProgress }) =>
    uploader.upload(file, { signal, metadata, onProgress: reportProgress }),
};
```

```html
<j-file-upload [multiple]="true" [uploadAdapter]="uploadAdapter" [existingFiles]="remoteFiles" />
```

## Page Header patterns

### Preview

Page and Section Header retain their existing content while adding compact/hero, sticky, loading, status, metadata, action-menu, and start/center/end projection points. Both stack responsively.

### Code

```html
<j-page-header title="Orders" subtitle="Current fulfilment queue" variant="compact" [sticky]="true">
  <j-status-chip jPageStatus severity="success">Healthy</j-status-chip>
  <button jPagePrimaryAction type="button">Create order</button>
</j-page-header>
```

## Accessibility behavior

Filter popups use native keyboard-operable disclosure controls, restore browser focus naturally, and expose active state. Loading and failures announce through status/alert regions. Disabled and readonly states remain semantic, focus uses the high-contrast theme ring, motion respects `prefers-reduced-motion`, and storage/upload browser APIs are guarded or injected so server rendering does not access them directly.
