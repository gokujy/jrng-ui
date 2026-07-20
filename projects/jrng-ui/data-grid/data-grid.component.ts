import {
  ChangeDetectionStrategy,
  Component,
  Input,
  booleanAttribute,
  computed,
  input,
  output,
  ContentChild,
  TemplateRef,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { JTableComponent } from 'jrng-ui/table';
import {
  JTableActionEvent,
  JTableColumn,
  JTableColumnReorderEvent,
  JTableColumnResizeEvent,
  JTableColumnVisibilityChangeEvent,
  JTableConfig,
  JTableEditEvent,
  JTableEditMode,
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
  JTableDataMode,
  JTableDensity,
  JTableFilterDisplay,
  JTableResponsiveMode,
  JTableSort,
  JTableState,
  JTableStateRestoreError,
  JTableVariant,
  jProcessTableData,
} from 'jrng-ui/table';

export type JDataGridDisplayMode = 'grid' | 'list' | 'card';

export type JDataGridSelection<TRow extends object = JTableRow> = TRow | readonly TRow[] | null;

export interface JDataGridColumn<TRow extends object = JTableRow> extends Omit<
  JTableColumn<TRow>,
  'field'
> {
  readonly field: Extract<keyof TRow, string> | string;
}

@Component({
  selector: 'j-data-grid',
  imports: [JTableComponent, NgTemplateOutlet],
  template: `
    <section
      [class]="'j-data-grid j-data-grid--' + displayMode()"
      data-jc-name="data-grid"
      data-jc-section="root"
    >
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

      @if (displayMode() === 'list') {
        <j-table
          [value]="tableValue()"
          [columns]="tableColumns()"
          [totalRecords]="totalRecords()"
          [rows]="rows()"
          [first]="first"
          [rowsPerPageOptions]="rowsPerPageOptions()"
          [paginator]="paginator()"
          [loading]="loading()"
          [errorState]="error()"
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
          [variant]="variant()"
          [density]="density"
          [filterDisplay]="filterDisplay()"
          [dataMode]="dataMode()"
          [responsiveMode]="responsiveMode()"
          [showGlobalFilter]="false"
          [showColumnManager]="showColumnManager()"
          [showExport]="showExport()"
          [showTableState]="!!stateKey()"
          [stateKey]="stateKey()"
          [scrollHeight]="scrollHeight()"
          [stickyHeader]="stickyHeader()"
          [resizableColumns]="resizableColumns()"
          [reorderableColumns]="reorderableColumns()"
          [reorderableRows]="reorderableRows()"
          [expandableRows]="expandableRows()"
          [editMode]="editMode()"
          [lockableRows]="lockableRows()"
          [lockedRowKeys]="lockedRowKeys()"
          [maximizable]="maximizable()"
          [hover]="hover()"
          [emptyMessage]="emptyMessage()"
          [loadingMessage]="loadingMessage()"
          (selectionChange)="emitSelectionChange($event)"
          (sortChange)="sortChange.emit($event)"
          (pageChange)="pageChange.emit($event)"
          (filterChange)="filterChange.emit($event)"
          (lazyLoad)="lazyLoad.emit($event)"
          (action)="action.emit($event)"
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
          (error)="stateError.emit($event)"
          (maximize)="maximize.emit()"
          (minimize)="minimize.emit()"
          (contextMenu)="contextMenu.emit($event)"
        />
      } @else {
        <div
          [class]="'j-data-grid__items j-data-grid__items--' + displayMode()"
          role="list"
          [attr.aria-busy]="loading() ? 'true' : null"
        >
          @if (loading()) {
            <div class="j-data-grid__state" role="status">{{ loadingMessage() }}</div>
          } @else if (error()) {
            <div class="j-data-grid__state" role="alert">{{ errorMessage() }}</div>
          } @else if (!gridRows().length) {
            <div class="j-data-grid__state">{{ emptyMessage() }}</div>
          }
          @for (row of gridRows(); track rowIdentity(row, $index); let index = $index) {
            <article
              class="j-data-grid__item"
              role="listitem"
              [attr.tabindex]="selectionMode() === 'none' ? null : 0"
              [class.is-selected]="isSelected(row)"
              (click)="toggleGridSelection(row)"
              (keydown)="handleGridKeydown($event, row)"
            >
              @if (itemTemplate) {
                <ng-container
                  [ngTemplateOutlet]="itemTemplate"
                  [ngTemplateOutletContext]="{
                    $implicit: row,
                    item: row,
                    index: index,
                    selected: isSelected(row),
                  }"
                />
              } @else {
                @for (column of tableColumns(); track column.field) {
                  <div>
                    <strong>{{ column.header }}</strong
                    ><span>{{ cellValue(row, column.field) }}</span>
                  </div>
                }
              }
            </article>
          }
        </div>
        @if (paginator() && dataMode() === 'client' && processedRows().length > rows()) {
          <nav class="j-data-grid__pager" aria-label="Data grid pages">
            <button type="button" [disabled]="first === 0" (click)="changeGridPage(-1)">
              Previous
            </button>
            <span>Page {{ Math.floor(first / rows()) + 1 }}</span>
            <button
              type="button"
              [disabled]="first + rows() >= processedRows().length"
              (click)="changeGridPage(1)"
            >
              Next
            </button>
          </nav>
        }
      }
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

      .j-data-grid--grid,
      .j-data-grid--card {
        --j-table-card-shadow: var(--j-elevation-sm);
      }
      .j-data-grid__items {
        display: grid;
        gap: var(--j-spacing-3);
        padding: var(--j-spacing-4);
      }
      .j-data-grid__items--grid {
        grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
      }
      .j-data-grid__item {
        background: var(--j-color-card);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-lg);
        display: grid;
        gap: var(--j-spacing-2);
        padding: var(--j-spacing-4);
      }
      .j-data-grid__item.is-selected {
        box-shadow: var(--j-focus-ring);
      }
      .j-data-grid__item > div {
        display: flex;
        gap: var(--j-spacing-2);
        justify-content: space-between;
      }
      .j-data-grid__pager {
        align-items: center;
        border-top: 1px solid var(--j-color-border);
        display: flex;
        gap: var(--j-spacing-3);
        justify-content: flex-end;
        padding: var(--j-spacing-3);
      }
      .j-data-grid__state {
        grid-column: 1 / -1;
        padding: var(--j-spacing-6);
        text-align: center;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JDataGridComponent<TRow extends object = JTableRow> {
  readonly Math = Math;
  @ContentChild('jDataGridItem', { read: TemplateRef }) itemTemplate?: TemplateRef<{
    readonly $implicit: TRow;
    readonly item: TRow;
    readonly index: number;
    readonly selected: boolean;
  }>;
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
  readonly errorMessage = input('Unable to load records.');
  readonly exportFilename = input('data-grid.csv');
  readonly exportConfig = input<JTableExportOptions>({});
  readonly config = input<JTableConfig | null>(null);
  readonly lockedRowKeys = input<readonly string[]>([]);
  readonly displayMode = input<JDataGridDisplayMode>('list');
  readonly variant = input<JTableVariant>('standard');
  @Input() density: JTableDensity = 'comfortable';
  readonly filterDisplay = input<JTableFilterDisplay>('none');
  readonly dataMode = input<JTableDataMode>('client');
  readonly editMode = input<JTableEditMode>('none');
  readonly responsiveMode = input<JTableResponsiveMode>('scroll');
  readonly error = input<unknown>(null);
  readonly paginator = input(true, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly bulkActions = input(true, { transform: booleanAttribute });
  readonly stickyHeader = input(true, { transform: booleanAttribute });
  readonly showColumnManager = input(true, { transform: booleanAttribute });
  readonly showExport = input(true, { transform: booleanAttribute });
  readonly resizableColumns = input(false, { transform: booleanAttribute });
  readonly reorderableColumns = input(false, { transform: booleanAttribute });
  readonly reorderableRows = input(false, { transform: booleanAttribute });
  readonly expandableRows = input(false, { transform: booleanAttribute });
  readonly lockableRows = input(false, { transform: booleanAttribute });
  readonly maximizable = input(false, { transform: booleanAttribute });
  readonly hover = input(true, { transform: booleanAttribute });

  readonly globalFilterChange = output<string>();
  readonly selectionChange = output<JDataGridSelection<TRow>>();
  readonly sortChange = output<JTableSort>();
  readonly pageChange = output<JTablePageChange>();
  readonly filterChange = output<JTableFilterChange>();
  readonly lazyLoad = output<JTableLazyLoadEvent>();
  readonly action = output<JTableActionEvent>();
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
  readonly stateError = output<JTableStateRestoreError>();
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
  processedRows(): readonly TRow[] {
    return this.dataMode() === 'client'
      ? jProcessTableData(this.value(), {
          filters: this.filters(),
          globalFilter: this.globalFilter,
          globalFields: this.globalFilterFields(),
          sorts:
            this.sortMode() === 'multiple'
              ? this.multiSortMeta()
              : [{ field: this.sortField(), order: this.sortOrder() }],
        })
      : this.value();
  }
  gridRows(): readonly TRow[] {
    return this.paginator() && this.dataMode() === 'client'
      ? this.processedRows().slice(this.first, this.first + this.rows())
      : this.processedRows();
  }

  rowIdentity(row: TRow, index: number): unknown {
    return (row as Record<string, unknown>)[this.dataKey() || this.rowKey()] ?? index;
  }
  cellValue(row: TRow, field: string): unknown {
    return (row as Readonly<Record<string, unknown>>)[field];
  }
  isSelected(row: TRow): boolean {
    const selected = this.selection();
    return Array.isArray(selected) ? selected.includes(row) : selected === row;
  }
  toggleGridSelection(row: TRow): void {
    if (this.selectionMode() === 'none') return;
    if (this.selectionMode() === 'single' || this.selectionMode() === 'radio')
      this.selectionChange.emit(row);
    else {
      const current = Array.isArray(this.selection())
        ? [...(this.selection() as readonly TRow[])]
        : [];
      this.selectionChange.emit(
        current.includes(row) ? current.filter((item) => item !== row) : [...current, row],
      );
    }
    this.rowSelect.emit(row);
  }
  handleGridKeydown(event: KeyboardEvent, row: TRow): void {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    this.toggleGridSelection(row);
  }
  changeGridPage(direction: -1 | 1): void {
    this.first = Math.max(
      0,
      Math.min(this.first + direction * this.rows(), Math.max(0, this.processedRows().length - 1)),
    );
    this.pageChange.emit({
      first: this.first,
      rows: this.rows(),
      page: Math.floor(this.first / this.rows()),
      pageCount: Math.ceil(this.processedRows().length / this.rows()),
      pageSize: this.rows(),
    });
  }

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
