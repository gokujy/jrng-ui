import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  booleanAttribute,
} from '@angular/core';
import { JTableComponent } from 'jrng-ui/table';
import {
  JTableActionEvent,
  JTableColumn,
  JTableColumnReorderEvent,
  JTableColumnResizeEvent,
  JTableColumnVisibilityChangeEvent,
  JTableConfig,
  JTableEditEvent,
  JTableExportEvent,
  JTableExportOptions,
  JTableFilterChange,
  JTableLazyLoadEvent,
  JTablePageChange,
  JTableReorderEvent,
  JTableRow,
  JTableRowClickEvent,
  JTableRowLockEvent,
  JTableSelection,
  JTableSelectionMode,
  JTableSize,
  JTableSort,
  JTableState,
  JTableStateRestoreError,
} from 'jrng-ui/table';

export type JDataGridSelection<TRow extends object = JTableRow> =
  | TRow
  | readonly TRow[]
  | null;

export interface JDataGridColumn<TRow extends object = JTableRow>
  extends Omit<JTableColumn, 'field'> {
  readonly field: Extract<keyof TRow, string> | string;
}

@Component({
  selector: 'j-data-grid',
  imports: [JTableComponent],
  template: `
    <section class="j-data-grid" data-jc-name="data-grid" data-jc-section="root">
      <header class="j-data-grid__toolbar" data-jc-section="toolbar">
        <div class="j-data-grid__heading">
          @if (title) {
            <h2>{{ title }}</h2>
          }
          @if (description) {
            <p>{{ description }}</p>
          }
        </div>
        <label class="j-data-grid__search">
          <span class="j-hidden-accessible">Search records</span>
          <input
            type="search"
            [value]="globalFilter"
            [placeholder]="searchPlaceholder"
            (input)="handleSearch($event)"
          />
        </label>
        <div class="j-data-grid__actions">
          <ng-content select="[jDataGridActions]"></ng-content>
        </div>
      </header>

      @if (bulkActions && selectionCount > 0) {
        <div class="j-data-grid__bulk" data-jc-section="bulk-actions">
          <span>{{ selectionCount }} selected</span>
          <ng-content select="[jDataGridBulkActions]"></ng-content>
        </div>
      }

      <j-table
        [value]="tableValue"
        [columns]="tableColumns"
        [totalRecords]="totalRecords"
        [rows]="rows"
        [first]="first"
        [rowsPerPageOptions]="rowsPerPageOptions"
        [paginator]="paginator"
        [lazy]="lazy"
        [loading]="loading"
        [sortField]="sortField"
        [sortOrder]="sortOrder"
        [sortMode]="sortMode"
        [multiSortMeta]="multiSortMeta"
        [filters]="filters"
        [selectionMode]="selectionMode"
        [selection]="tableSelection"
        [rowKey]="rowKey"
        [dataKey]="dataKey"
        [globalFilter]="globalFilter"
        [globalFilterFields]="globalFilterFields"
        [config]="config"
        [exportConfig]="exportConfig"
        [exportFilename]="exportFilename"
        [size]="size"
        [showGlobalFilter]="false"
        [showColumnManager]="showColumnManager"
        [showExport]="showExport"
        [showTableState]="!!stateKey"
        [stateKey]="stateKey"
        [scrollable]="scrollable"
        [scrollHeight]="scrollHeight"
        [stickyHeader]="stickyHeader"
        [resizableColumns]="resizableColumns"
        [reorderableColumns]="reorderableColumns"
        [reorderableRows]="reorderableRows"
        [expandableRows]="expandableRows"
        [rowEditing]="rowEditing"
        [cellEditing]="cellEditing"
        [filterRow]="filterRow"
        [lockableRows]="lockableRows"
        [lockedRowKeys]="lockedRowKeys"
        [maximizable]="maximizable"
        [striped]="striped"
        [hover]="hover"
        [responsive]="responsive"
        [emptyMessage]="emptyMessage"
        [loadingMessage]="loadingMessage"
        (selectionChange)="emitSelectionChange($event)"
        (sortChange)="sortChange.emit($event)"
        (pageChange)="pageChange.emit($event)"
        (filterChange)="filterChange.emit($event)"
        (lazyLoad)="lazyLoad.emit($event)"
        (actionClick)="actionClick.emit($event)"
        (rowClick)="emitRowClick($event)"
        (rowDoubleClick)="emitRowDoubleClick($event)"
        (rowSelect)="emitRowSelect($event)"
        (rowExpand)="emitRowExpand($event)"
        (rowCollapse)="emitRowCollapse($event)"
        (rowEditSave)="rowEditSave.emit($event)"
        (cellEditSave)="cellEditSave.emit($event)"
        (rowReorder)="rowReorder.emit($event)"
        (columnReorder)="columnReorder.emit($event)"
        (columnResize)="columnResize.emit($event)"
        (columnVisibilityChange)="columnVisibilityChange.emit($event)"
        (rowLock)="rowLock.emit($event)"
        (rowUnlock)="rowUnlock.emit($event)"
        (export)="export.emit($event)"
        (stateSave)="stateSave.emit($event)"
        (stateRestore)="stateRestore.emit($event)"
        (stateRestoreError)="stateRestoreError.emit($event)"
        (maximize)="maximize.emit()"
        (minimize)="minimize.emit()"
        (contextMenu)="contextMenu.emit($event)"
      />
    </section>
  `,
  styles: [
    `
      .j-data-grid {
        background: var(--j-color-card);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-lg);
        color: var(--j-color-card-foreground);
        overflow: hidden;
      }

      .j-data-grid__toolbar,
      .j-data-grid__bulk {
        align-items: center;
        border-bottom: 1px solid var(--j-color-border);
        display: flex;
        flex-wrap: wrap;
        gap: var(--j-spacing-3);
        padding: var(--j-spacing-4);
      }

      .j-data-grid__heading {
        flex: 1;
      }

      .j-data-grid__heading h2,
      .j-data-grid__heading p {
        margin: 0;
      }

      .j-data-grid__heading p {
        color: var(--j-color-muted-foreground);
        font-size: var(--j-font-size-sm);
        margin-top: var(--j-spacing-1);
      }

      .j-data-grid__search input {
        background: var(--j-color-surface);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-md);
        color: inherit;
        font: inherit;
        min-height: 2.5rem;
        padding: 0 var(--j-spacing-3);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JDataGridComponent<TRow extends object = JTableRow> {
  @Input() value: readonly TRow[] = [];
  @Input() columns: readonly JDataGridColumn<TRow>[] = [];
  @Input() totalRecords = 0;
  @Input() rows = 10;
  @Input() first = 0;
  @Input() rowsPerPageOptions: readonly number[] = [10, 25, 50];
  @Input() title = '';
  @Input() description = '';
  @Input() searchPlaceholder = 'Search';
  @Input() globalFilter = '';
  @Input() globalFilterFields: readonly string[] = [];
  @Input() sortField = '';
  @Input() sortOrder: -1 | 0 | 1 = 0;
  @Input() sortMode: 'single' | 'multiple' = 'single';
  @Input() multiSortMeta: readonly JTableSort[] = [];
  @Input() filters: Record<string, unknown> = {};
  @Input() selectionMode: JTableSelectionMode = 'checkbox';
  @Input() selection: JDataGridSelection<TRow> = null;
  @Input() rowKey = 'id';
  @Input() dataKey = '';
  @Input() stateKey = '';
  @Input() scrollHeight = '';
  @Input() emptyMessage = 'No records found.';
  @Input() loadingMessage = 'Loading records...';
  @Input() exportFilename = 'data-grid.csv';
  @Input() exportConfig: JTableExportOptions = {};
  @Input() config: JTableConfig | null = null;
  @Input() lockedRowKeys: readonly string[] = [];
  @Input() size: JTableSize = 'medium';
  @Input({ transform: booleanAttribute }) paginator = true;
  @Input({ transform: booleanAttribute }) lazy = false;
  @Input({ transform: booleanAttribute }) loading = false;
  @Input({ transform: booleanAttribute }) bulkActions = true;
  @Input({ transform: booleanAttribute }) scrollable = true;
  @Input({ transform: booleanAttribute }) stickyHeader = true;
  @Input({ transform: booleanAttribute }) showColumnManager = true;
  @Input({ transform: booleanAttribute }) showExport = true;
  @Input({ transform: booleanAttribute }) resizableColumns = false;
  @Input({ transform: booleanAttribute }) reorderableColumns = false;
  @Input({ transform: booleanAttribute }) reorderableRows = false;
  @Input({ transform: booleanAttribute }) expandableRows = false;
  @Input({ transform: booleanAttribute }) rowEditing = false;
  @Input({ transform: booleanAttribute }) cellEditing = false;
  @Input({ transform: booleanAttribute }) filterRow = true;
  @Input({ transform: booleanAttribute }) lockableRows = false;
  @Input({ transform: booleanAttribute }) maximizable = false;
  @Input({ transform: booleanAttribute }) striped = false;
  @Input({ transform: booleanAttribute }) hover = true;
  @Input({ transform: booleanAttribute }) responsive = true;

  @Output() globalFilterChange = new EventEmitter<string>();
  @Output() selectionChange = new EventEmitter<JDataGridSelection<TRow>>();
  @Output() sortChange = new EventEmitter<JTableSort>();
  @Output() pageChange = new EventEmitter<JTablePageChange>();
  @Output() filterChange = new EventEmitter<JTableFilterChange>();
  @Output() lazyLoad = new EventEmitter<JTableLazyLoadEvent>();
  @Output() actionClick = new EventEmitter<JTableActionEvent>();
  @Output() rowClick = new EventEmitter<JTableRowClickEvent>();
  @Output() rowDoubleClick = new EventEmitter<JTableRowClickEvent>();
  @Output() rowSelect = new EventEmitter<TRow>();
  @Output() rowExpand = new EventEmitter<TRow>();
  @Output() rowCollapse = new EventEmitter<TRow>();
  @Output() rowEditSave = new EventEmitter<JTableEditEvent>();
  @Output() cellEditSave = new EventEmitter<JTableEditEvent>();
  @Output() rowReorder = new EventEmitter<JTableReorderEvent>();
  @Output() columnReorder = new EventEmitter<JTableColumnReorderEvent>();
  @Output() columnResize = new EventEmitter<JTableColumnResizeEvent>();
  @Output() columnVisibilityChange = new EventEmitter<JTableColumnVisibilityChangeEvent>();
  @Output() rowLock = new EventEmitter<JTableRowLockEvent>();
  @Output() rowUnlock = new EventEmitter<JTableRowLockEvent>();
  @Output() export = new EventEmitter<JTableExportEvent>();
  @Output() stateSave = new EventEmitter<JTableState>();
  @Output() stateRestore = new EventEmitter<JTableState>();
  @Output() stateRestoreError = new EventEmitter<JTableStateRestoreError>();
  @Output() maximize = new EventEmitter<void>();
  @Output() minimize = new EventEmitter<void>();
  @Output() contextMenu = new EventEmitter<JTableRowClickEvent>();

  get selectionCount(): number {
    return Array.isArray(this.selection) ? this.selection.length : this.selection ? 1 : 0;
  }

  get tableValue(): readonly JTableRow[] {
    return this.value as unknown as readonly JTableRow[];
  }

  get tableColumns(): readonly JTableColumn[] {
    return this.columns as readonly JTableColumn[];
  }

  get tableSelection(): JTableSelection {
    return this.selection as JTableSelection;
  }

  handleSearch(event: Event): void {
    this.globalFilter = (event.target as HTMLInputElement | null)?.value ?? '';
    this.globalFilterChange.emit(this.globalFilter);
  }

  emitSelectionChange(selection: JTableSelection): void {
    this.selectionChange.emit(selection as JDataGridSelection<TRow>);
  }

  emitRowClick(event: JTableRowClickEvent): void {
    this.rowClick.emit(event);
  }

  emitRowDoubleClick(event: JTableRowClickEvent): void {
    this.rowDoubleClick.emit(event);
  }

  emitRowSelect(row: JTableRow): void {
    this.rowSelect.emit(row as TRow);
  }

  emitRowExpand(row: JTableRow): void {
    this.rowExpand.emit(row as TRow);
  }

  emitRowCollapse(row: JTableRow): void {
    this.rowCollapse.emit(row as TRow);
  }
}
