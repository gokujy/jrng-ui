import {
  ChangeDetectionStrategy,
  Component,
  Input,
  booleanAttribute,
  computed,
  input,
  output,
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

export type JDataGridSelection<TRow extends object = JTableRow> = TRow | readonly TRow[] | null;

export interface JDataGridColumn<TRow extends object = JTableRow> extends Omit<
  JTableColumn,
  'field'
> {
  readonly field: Extract<keyof TRow, string> | string;
}

@Component({
  selector: 'j-data-grid',
  imports: [JTableComponent],
  template: `
    <section class="j-data-grid" data-jc-name="data-grid" data-jc-section="root">
      <header class="j-data-grid__toolbar" data-jc-section="toolbar">
        <div class="j-data-grid__heading">
          @if (title()) {
            <h2>{{ title() }}</h2>
          }
          @if (description()) {
            <p>{{ description() }}</p>
          }
        </div>
        <label class="j-data-grid__search">
          <span class="j-hidden-accessible">Search records</span>
          <input
            type="search"
            [value]="globalFilter"
            [placeholder]="searchPlaceholder()"
            (input)="handleSearch($event)"
          />
        </label>
        <div class="j-data-grid__actions">
          <ng-content select="[jDataGridActions]"></ng-content>
        </div>
      </header>

      @if (bulkActions() && selectionCount() > 0) {
        <div class="j-data-grid__bulk" data-jc-section="bulk-actions">
          <span>{{ selectionCount() }} selected</span>
          <ng-content select="[jDataGridBulkActions]"></ng-content>
        </div>
      }

      <j-table
        [value]="tableValue()"
        [columns]="tableColumns()"
        [totalRecords]="totalRecords()"
        [rows]="rows()"
        [first]="first"
        [rowsPerPageOptions]="rowsPerPageOptions()"
        [paginator]="paginator()"
        [lazy]="lazy()"
        [loading]="loading()"
        [sortField]="sortField()"
        [sortOrder]="sortOrder()"
        [sortMode]="sortMode()"
        [multiSortMeta]="multiSortMeta()"
        [filters]="filters()"
        [selectionMode]="selectionMode()"
        [selection]="tableSelection()"
        [rowKey]="rowKey()"
        [dataKey]="dataKey()"
        [globalFilter]="globalFilter"
        [globalFilterFields]="globalFilterFields()"
        [config]="config()"
        [exportConfig]="exportConfig()"
        [exportFilename]="exportFilename()"
        [size]="size()"
        [showGlobalFilter]="false"
        [showColumnManager]="showColumnManager()"
        [showExport]="showExport()"
        [showTableState]="!!stateKey()"
        [stateKey]="stateKey()"
        [scrollable]="scrollable()"
        [scrollHeight]="scrollHeight()"
        [stickyHeader]="stickyHeader()"
        [resizableColumns]="resizableColumns()"
        [reorderableColumns]="reorderableColumns()"
        [reorderableRows]="reorderableRows()"
        [expandableRows]="expandableRows()"
        [rowEditing]="rowEditing()"
        [cellEditing]="cellEditing()"
        [filterRow]="filterRow()"
        [lockableRows]="lockableRows()"
        [lockedRowKeys]="lockedRowKeys()"
        [maximizable]="maximizable()"
        [striped]="striped()"
        [hover]="hover()"
        [responsive]="responsive()"
        [emptyMessage]="emptyMessage()"
        [loadingMessage]="loadingMessage()"
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
  readonly value = input<readonly TRow[]>([]);
  readonly columns = input<readonly JDataGridColumn<TRow>[]>([]);
  readonly totalRecords = input(0);
  readonly rows = input(10);
  @Input() first = 0;
  readonly rowsPerPageOptions = input<readonly number[]>([10, 25, 50]);
  readonly title = input('');
  readonly description = input('');
  readonly searchPlaceholder = input('Search');
  @Input() globalFilter = '';
  readonly globalFilterFields = input<readonly string[]>([]);
  readonly sortField = input('');
  readonly sortOrder = input<-1 | 0 | 1>(0);
  readonly sortMode = input<'single' | 'multiple'>('single');
  readonly multiSortMeta = input<readonly JTableSort[]>([]);
  readonly filters = input<Record<string, unknown>>({});
  readonly selectionMode = input<JTableSelectionMode>('checkbox');
  readonly selection = input<JDataGridSelection<TRow>>(null);
  readonly rowKey = input('id');
  readonly dataKey = input('');
  readonly stateKey = input('');
  readonly scrollHeight = input('');
  readonly emptyMessage = input('No records found.');
  readonly loadingMessage = input('Loading records...');
  readonly exportFilename = input('data-grid.csv');
  readonly exportConfig = input<JTableExportOptions>({});
  readonly config = input<JTableConfig | null>(null);
  readonly lockedRowKeys = input<readonly string[]>([]);
  readonly size = input<JTableSize>('medium');
  readonly paginator = input(true, { transform: booleanAttribute });
  readonly lazy = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly bulkActions = input(true, { transform: booleanAttribute });
  readonly scrollable = input(true, { transform: booleanAttribute });
  readonly stickyHeader = input(true, { transform: booleanAttribute });
  readonly showColumnManager = input(true, { transform: booleanAttribute });
  readonly showExport = input(true, { transform: booleanAttribute });
  readonly resizableColumns = input(false, { transform: booleanAttribute });
  readonly reorderableColumns = input(false, { transform: booleanAttribute });
  readonly reorderableRows = input(false, { transform: booleanAttribute });
  readonly expandableRows = input(false, { transform: booleanAttribute });
  readonly rowEditing = input(false, { transform: booleanAttribute });
  readonly cellEditing = input(false, { transform: booleanAttribute });
  readonly filterRow = input(true, { transform: booleanAttribute });
  readonly lockableRows = input(false, { transform: booleanAttribute });
  readonly maximizable = input(false, { transform: booleanAttribute });
  readonly striped = input(false, { transform: booleanAttribute });
  readonly hover = input(true, { transform: booleanAttribute });
  readonly responsive = input(true, { transform: booleanAttribute });

  readonly globalFilterChange = output<string>();
  readonly selectionChange = output<JDataGridSelection<TRow>>();
  readonly sortChange = output<JTableSort>();
  readonly pageChange = output<JTablePageChange>();
  readonly filterChange = output<JTableFilterChange>();
  readonly lazyLoad = output<JTableLazyLoadEvent>();
  readonly actionClick = output<JTableActionEvent>();
  readonly rowClick = output<JTableRowClickEvent>();
  readonly rowDoubleClick = output<JTableRowClickEvent>();
  readonly rowSelect = output<TRow>();
  readonly rowExpand = output<TRow>();
  readonly rowCollapse = output<TRow>();
  readonly rowEditSave = output<JTableEditEvent>();
  readonly cellEditSave = output<JTableEditEvent>();
  readonly rowReorder = output<JTableReorderEvent>();
  readonly columnReorder = output<JTableColumnReorderEvent>();
  readonly columnResize = output<JTableColumnResizeEvent>();
  readonly columnVisibilityChange = output<JTableColumnVisibilityChangeEvent>();
  readonly rowLock = output<JTableRowLockEvent>();
  readonly rowUnlock = output<JTableRowLockEvent>();
  readonly export = output<JTableExportEvent>();
  readonly stateSave = output<JTableState>();
  readonly stateRestore = output<JTableState>();
  readonly stateRestoreError = output<JTableStateRestoreError>();
  readonly maximize = output<void>();
  readonly minimize = output<void>();
  readonly contextMenu = output<JTableRowClickEvent>();

  readonly selectionCount = computed<number>(() => {
    const selection = this.selection();
    return Array.isArray(selection) ? selection.length : selection ? 1 : 0;
  });

  readonly tableValue = computed<readonly JTableRow[]>(
    () => this.value() as unknown as readonly JTableRow[],
  );

  readonly tableColumns = computed<readonly JTableColumn[]>(
    () => this.columns() as readonly JTableColumn[],
  );

  readonly tableSelection = computed<JTableSelection>(() => this.selection() as JTableSelection);

  handleSearch(event: Event): void {
    this.globalFilter = (event.target as HTMLInputElement | null)?.value ?? '';
    // Reset to the first page so a new search doesn't strand the user on a
    // now-empty page.
    this.first = 0;
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
