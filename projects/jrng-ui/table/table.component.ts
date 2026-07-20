import { DOCUMENT, NgClass, NgStyle, NgTemplateOutlet, isPlatformBrowser } from '@angular/common';
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ContentChildren,
  DestroyRef,
  HostListener,
  Input,
  OnChanges,
  PLATFORM_ID,
  QueryList,
  SimpleChanges,
  TemplateRef,
  booleanAttribute,
  inject,
  input,
  numberAttribute,
  output,
} from '@angular/core';
import { JActionMenuComponent } from './action-menu.component';
import { JColumnFilterChange, JColumnFilterComponent } from './column-filter.component';
import { JPaginatorComponent, JPaginatorPageChange } from 'jrng-ui/paginator';
import { JSortIconComponent } from './sort-icon.component';
import { JTableEmptyStateComponent } from './table-empty-state.component';
import { JTableSkeletonComponent } from './table-skeleton.component';
import {
  JTableActionEvent,
  JTableCellContext,
  JTableColumn,
  JTableColumnAlign,
  JTableColumnReorderEvent,
  JTableColumnResizeEvent,
  JTableColumnVisibilityChangeEvent,
  JTableConfig,
  JTableDensity,
  JTableEditEvent,
  JTableEditMode,
  JTableEmptyActionEvent,
  JTableEmptyContext,
  JTableEmptyState,
  JTableEmptyStateMode,
  JTableExportEvent,
  JTableExportOptions,
  JTableExportRows,
  JTableFilterChange,
  JTableFilterDisplay,
  JTableFieldFilter,
  JTableFilterItem,
  JTableFilterModel,
  JTableFilterType,
  JTableHeaderContext,
  JTableLazyLoadEvent,
  JTableLoadingContext,
  JTableLoadingVariant,
  JTablePageChange,
  JTableReorderEvent,
  JTableRow,
  JTableRowClickEvent,
  JTableRowLockEvent,
  JTableSkeletonColumn,
  JTableSelection,
  JTableSelectionMode,
  JTableDataMode,
  JTableResponsiveMode,
  JTableQueryMapper,
  JTableExportAdapter,
  JTableServerQuery,
  JTableStateStorage,
  JTableStateStorageAdapter,
  JTableVariant,
  JTableSort,
  JTableState,
  JTableStateRestoreError,
} from './table.types';
import { jCreateMemoryTableStorage, jSerializeTableQuery } from './table-data';
import {
  JTableActionsTemplateDirective,
  JTableCellTemplateDirective,
  JTableEmptyTemplateDirective,
  JTableFilterTemplateDirective,
  JTableHeaderTemplateDirective,
  JTableLoadingTemplateDirective,
} from './table-template.directive';
import { JTableSortOrder } from 'jrng-ui/core';
import { JButtonComponent } from 'jrng-ui/button';

export type JTableSortDirection = 'asc' | 'desc';

@Component({
  selector: 'j-table',
  imports: [
    NgClass,
    NgStyle,
    NgTemplateOutlet,
    JActionMenuComponent,
    JColumnFilterComponent,
    JPaginatorComponent,
    JSortIconComponent,
    JTableEmptyStateComponent,
    JTableSkeletonComponent,
    JButtonComponent,
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JTableComponent implements AfterContentInit, OnChanges {
  @ContentChild('jTableExpandedRow') expandedRowTemplate?: TemplateRef<{
    $implicit: JTableRow;
    row: JTableRow;
    index: number;
  }>;
  @ContentChild('jTableFooter') footerTemplate?: TemplateRef<{
    columns: readonly JTableColumn[];
    rows: readonly JTableRow[];
  }>;
  @ContentChild('jTableToolbar') toolbarTemplate?: TemplateRef<{ table: JTableComponent }>;
  @ContentChild('jTableGroupHeader') groupHeaderTemplate?: TemplateRef<{
    $implicit: unknown;
    value: unknown;
    row: JTableRow;
    index: number;
    collapsed: boolean;
  }>;
  @ContentChild('jTableGroupFooter') groupFooterTemplate?: TemplateRef<{
    $implicit: unknown;
    value: unknown;
    row: JTableRow;
    index: number;
  }>;
  @ContentChildren(JTableCellTemplateDirective)
  cellTemplates?: QueryList<JTableCellTemplateDirective>;
  @ContentChildren(JTableHeaderTemplateDirective)
  headerTemplates?: QueryList<JTableHeaderTemplateDirective>;
  @ContentChildren(JTableFilterTemplateDirective)
  filterTemplates?: QueryList<JTableFilterTemplateDirective>;
  @ContentChildren(JTableActionsTemplateDirective)
  actionTemplates?: QueryList<JTableActionsTemplateDirective>;
  @ContentChild(JTableEmptyTemplateDirective)
  emptyTemplate?: JTableEmptyTemplateDirective;
  @ContentChild(JTableLoadingTemplateDirective)
  loadingTemplate?: JTableLoadingTemplateDirective;

  readonly value = input<readonly object[]>([]);
  // Angular templates cannot infer the component's row generic, so this boundary
  // deliberately accepts every strongly typed JTableColumn<TRow> instance.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly columns = input<readonly JTableColumn<any>[]>([]);
  readonly totalRecords = input(0);
  @Input({ transform: numberAttribute }) first = 0;
  @Input() rowsPerPageOptions: readonly number[] = [10, 25, 50];
  @Input() sortField = '';
  @Input() sortOrder: JTableSortOrder = 0;
  @Input() sortMode: 'single' | 'multiple' = 'single';
  @Input() multiSortMeta: readonly JTableSort[] = [];
  @Input() filters: Record<string, unknown> = {};
  @Input() filterModel: JTableFilterModel = { items: [], logicOperator: 'and' };
  @Input() globalFilter = '';
  readonly globalFilterFields = input<readonly string[]>([]);
  @Input() selectionMode: JTableSelectionMode = 'none';
  @Input() selection: JTableSelection = null;
  readonly rowSelectable = input<((row: JTableRow, index: number) => boolean) | null>(null);
  readonly rowKey = input('id');
  readonly dataKey = input('');
  readonly scrollHeight = input('');
  readonly virtualScroll = input(false, { transform: booleanAttribute });
  readonly virtualItemSize = input(44, { transform: numberAttribute });
  readonly virtualOverscan = input(4, { transform: numberAttribute });
  readonly styleClass = input('');
  readonly emptyMessage = input('No records found.');
  readonly loadingMessage = input('Loading records...');
  readonly emptyState = input<JTableEmptyStateMode>('auto');
  readonly emptyTitle = input('No records');
  readonly emptyDescription = input('');
  readonly emptyIcon = input('table');
  readonly emptyActionLabel = input('');
  readonly noResultsTitle = input('No matching records');
  readonly noResultsDescription = input('Try adjusting your search or filters.');
  readonly noResultsIcon = input('search');
  readonly errorState = input<unknown>(null);
  readonly errorTitle = input('Unable to load records');
  readonly errorDescription = input('Try again or contact support if the problem continues.');
  readonly errorIcon = input('error');
  readonly caption = input('');
  @Input() stateKey = '';
  readonly exportFilename = input('table-data.csv');
  @Input() config: JTableConfig | null = null;
  @Input() exportConfig: JTableExportOptions = {};
  readonly exportAdapters = input<Readonly<Record<string, JTableExportAdapter>>>({});
  @Input() lockedRowKeys: readonly string[] = [];
  @Input() density: JTableDensity = 'comfortable';
  readonly variant = input<JTableVariant>('standard');
  readonly filterDisplay = input<JTableFilterDisplay>('none');
  readonly dataMode = input<JTableDataMode>('client');
  readonly editMode = input<JTableEditMode>('none');
  readonly responsiveMode = input<JTableResponsiveMode>('scroll');
  readonly permanentFilters = input<readonly JTableFieldFilter[]>([]);
  readonly hiddenFilters = input<readonly JTableFieldFilter[]>([]);
  readonly timezone = input<string | undefined>(undefined);
  readonly queryMapper = input<JTableQueryMapper<unknown> | null>(null);
  readonly stateStorage = input<JTableStateStorage>('local');
  readonly stateStorageAdapter = input<JTableStateStorageAdapter | null>(null);
  readonly restoreSelection = input(false, { transform: booleanAttribute });
  readonly groupRowsBy = input('');
  readonly collapsibleRowGroups = input(false, { transform: booleanAttribute });

  readonly loading = input(false, { transform: booleanAttribute });
  readonly loadingVariant = input<JTableLoadingVariant>('skeleton');
  readonly skeletonRows = input(5, { transform: numberAttribute });
  readonly skeletonColumns = input<readonly JTableSkeletonColumn[]>([]);
  @Input({ transform: booleanAttribute }) paginator = false;
  @Input({ transform: booleanAttribute }) hover = true;
  @Input({ transform: booleanAttribute }) resizableColumns = false;
  @Input({ transform: booleanAttribute }) reorderableColumns = false;
  @Input({ transform: booleanAttribute }) reorderableRows = false;
  readonly expandableRows = input(false, { transform: booleanAttribute });
  readonly stickyHeader = input(false, { transform: booleanAttribute });
  @Input({ transform: booleanAttribute }) showGlobalFilter = false;
  @Input({ transform: booleanAttribute }) showColumnManager = false;
  @Input({ transform: booleanAttribute }) showExport = false;
  @Input({ transform: booleanAttribute }) showTableState = false;
  readonly frozenRows = input(false, { transform: booleanAttribute });
  @Input({ transform: booleanAttribute }) lockableRows = false;
  @Input({ transform: booleanAttribute }) maximizable = false;

  readonly lazyLoad = output<JTableLazyLoadEvent>();
  readonly sortChange = output<JTableSort>();
  readonly pageChange = output<JTablePageChange>();
  readonly filterChange = output<JTableFilterChange>();
  readonly rowClick = output<JTableRowClickEvent>();
  readonly rowDoubleClick = output<JTableRowClickEvent>();
  readonly selectionChange = output<JTableSelection>();
  readonly action = output<JTableActionEvent>();
  readonly rowSelect = output<JTableRow>();
  readonly rowExpand = output<JTableRow>();
  readonly rowCollapse = output<JTableRow>();
  readonly rowEditSave = output<JTableEditEvent>();
  readonly cellEditSave = output<JTableEditEvent>();
  readonly editValidationError = output<JTableEditEvent & { readonly error: string }>();
  readonly rowReorder = output<JTableReorderEvent>();
  readonly columnReorder = output<JTableColumnReorderEvent>();
  readonly columnResize = output<JTableColumnResizeEvent>();
  readonly columnVisibilityChange = output<JTableColumnVisibilityChangeEvent>();
  readonly rowLock = output<JTableRowLockEvent>();
  readonly rowUnlock = output<JTableRowLockEvent>();
  readonly export = output<JTableExportEvent>();
  readonly exportProgress = output<{ readonly format: string; readonly active: boolean }>();
  readonly stateSave = output<JTableState>();
  readonly stateRestore = output<JTableState>();
  readonly error = output<JTableStateRestoreError>();
  readonly serverQuery = output<JTableServerQuery | unknown>();
  readonly maximize = output<void>();
  readonly minimize = output<void>();
  readonly contextMenu = output<JTableRowClickEvent>();
  readonly emptyAction = output<JTableEmptyActionEvent>();
  readonly rowGroupToggle = output<{ readonly value: unknown; readonly collapsed: boolean }>();

  private pageRows = 10;
  hiddenColumnFields = new Set<string>();
  private expandedRows = new Set<string>();
  private dragRowIndex = -1;
  private dragColumnIndex = -1;
  private editingCellKey = '';
  private columnOrder: readonly string[] = [];
  private columnWidths: Record<string, string> = {};
  private internalLockedRowKeys = new Set<string>();
  private collapsedRowGroups = new Set<string>();
  private stopColumnResize: (() => void) | null = null;
  maximized = false;
  virtualStart = 0;
  virtualWindowSize = 20;

  private readonly documentRef = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly memoryStorage = jCreateMemoryTableStorage();

  constructor() {
    this.destroyRef.onDestroy(() => this.cleanupColumnResize());
  }

  @Input({ transform: numberAttribute })
  set rows(value: number) {
    this.pageRows = Math.max(1, Number(value) || 10);
  }

  get rows(): number {
    return this.pageRows;
  }

  get resolvedColumns(): readonly JTableColumn[] {
    const source = this.columns() as unknown as readonly JTableColumn[];
    return this.orderColumns(source)
      .filter(
        (column) =>
          column.visible !== false &&
          column.hidden !== true &&
          !this.hiddenColumnFields.has(column.field),
      )
      .map((column) => ({
        ...column,
        width: this.columnWidths[column.field] ?? column.width,
      }));
  }

  get sourceRows(): readonly JTableRow[] {
    return this.value() as readonly JTableRow[];
  }

  get filteredRows(): readonly JTableRow[] {
    if (this.dataMode() === 'lazy') {
      return this.sourceRows;
    }

    const activeFilters = Object.entries(this.filters).filter(
      ([field, value]) =>
        !this.filterModel.items.some((item) => item.field === field) && !this.isEmptyFilter(value),
    );
    const activeModelFilters = this.filterModel.items.filter(
      (item) => !this.isEmptyFilterItem(item),
    );
    const global = this.globalFilter.trim().toLowerCase();

    if (!activeFilters.length && !activeModelFilters.length && !global) {
      return this.sourceRows;
    }

    return this.sourceRows.filter((row) => {
      const matchesFieldFilters = activeFilters.every(([field, value]) =>
        this.valueMatchesFilter(row[field], value),
      );
      const modelMatches = activeModelFilters.map((item) =>
        this.valueMatchesOperator(row[item.field], item),
      );
      const matchesColumns =
        matchesFieldFilters &&
        (!modelMatches.length ||
          (this.filterModel.logicOperator === 'or'
            ? modelMatches.some(Boolean)
            : modelMatches.every(Boolean)));
      const matchesGlobal =
        !global ||
        this.globalFields.some((field) =>
          String(row[field] ?? '')
            .toLowerCase()
            .includes(global),
        );

      return matchesColumns && matchesGlobal;
    });
  }

  get sortedRows(): readonly JTableRow[] {
    if (this.dataMode() === 'lazy' || !this.sortField || this.sortOrder === 0) {
      if (
        this.dataMode() !== 'lazy' &&
        this.sortMode === 'multiple' &&
        this.activeMultiSort.length
      ) {
        return [...this.filteredRows].sort((first, second) => {
          for (const sort of this.activeMultiSort) {
            const result = this.compareRows(first, second, sort.field) * sort.order;
            if (result !== 0) {
              return result;
            }
          }
          return 0;
        });
      }
      return this.filteredRows;
    }

    const direction = this.sortOrder;
    const field = this.sortField;

    return [...this.filteredRows].sort((first, second) => {
      return this.compareRows(first, second, field) * direction;
    });
  }

  get pageVisibleRows(): readonly JTableRow[] {
    if (!this.frozenRows()) {
      return !this.paginator || this.dataMode() === 'lazy'
        ? this.sortedRows
        : this.sortedRows.slice(this.normalizedFirst, this.normalizedFirst + this.pageRows);
    }
    const frozen = this.sortedRows.filter((row, index) => this.isRowLocked(row, index));
    const regular = this.sortedRows.filter((row, index) => !this.isRowLocked(row, index));
    const page =
      !this.paginator || this.dataMode() === 'lazy'
        ? regular
        : regular.slice(this.normalizedFirst, this.normalizedFirst + this.pageRows);
    return [...frozen, ...page];
  }

  get visibleRows(): readonly JTableRow[] {
    if (!this.usesVirtualScroll) return this.pageVisibleRows;
    const start = Math.min(this.virtualStart, Math.max(0, this.pageVisibleRows.length - 1));
    return this.pageVisibleRows.slice(start, start + this.virtualWindowSize);
  }

  get usesVirtualScroll(): boolean {
    return this.virtualScroll() || this.dataMode() === 'virtual';
  }

  get virtualBeforeHeight(): number {
    return this.usesVirtualScroll ? this.virtualStart * Math.max(1, this.virtualItemSize()) : 0;
  }

  get virtualAfterHeight(): number {
    if (!this.usesVirtualScroll) return 0;
    const remaining = Math.max(
      0,
      this.pageVisibleRows.length - this.virtualStart - this.visibleRows.length,
    );
    return remaining * Math.max(1, this.virtualItemSize());
  }

  handleVirtualScroll(event: Event): void {
    if (!this.usesVirtualScroll) return;
    const target = event.currentTarget as HTMLElement;
    const itemSize = Math.max(1, this.virtualItemSize());
    const overscan = Math.max(0, this.virtualOverscan());
    this.virtualStart = Math.max(0, Math.floor(target.scrollTop / itemSize) - overscan);
    this.virtualWindowSize = Math.max(1, Math.ceil(target.clientHeight / itemSize) + overscan * 2);
    this.changeDetectorRef.markForCheck();
  }

  get totalItems(): number {
    if (this.dataMode() === 'lazy') return this.totalRecords();
    return this.frozenRows()
      ? this.sortedRows.filter((row, index) => !this.isRowLocked(row, index)).length
      : this.sortedRows.length;
  }

  get currentPage(): number {
    return Math.floor(this.normalizedFirst / this.pageRows) + 1;
  }

  get hasRows(): boolean {
    return this.visibleRows.length > 0;
  }

  get resolvedEmptyState(): JTableEmptyState {
    if (this.emptyState() !== 'auto') {
      return this.emptyState() as JTableEmptyState;
    }
    if (this.errorState() != null) {
      return 'error';
    }
    return this.hasActiveFilters ? 'no-results' : 'no-data';
  }

  get hasActiveFilters(): boolean {
    return (
      this.globalFilter.trim().length > 0 ||
      Object.values(this.filters).some((value) => !this.isEmptyFilter(value)) ||
      this.filterModel.items.some((item) => !this.isEmptyFilterItem(item))
    );
  }

  get resolvedEmptyTitle(): string {
    return this.resolvedEmptyState === 'error'
      ? this.errorTitle()
      : this.resolvedEmptyState === 'no-results'
        ? this.noResultsTitle()
        : this.emptyTitle();
  }

  get resolvedEmptyDescription(): string {
    if (this.resolvedEmptyState === 'error') {
      const error = this.errorState();
      return error instanceof Error && error.message ? error.message : this.errorDescription();
    }
    return this.resolvedEmptyState === 'no-results'
      ? this.noResultsDescription()
      : this.emptyDescription() || this.emptyMessage();
  }

  get resolvedEmptyIcon(): string {
    return this.resolvedEmptyState === 'error'
      ? this.errorIcon()
      : this.resolvedEmptyState === 'no-results'
        ? this.noResultsIcon()
        : this.emptyIcon();
  }

  get emptyContext(): JTableEmptyContext {
    return {
      $implicit: this.resolvedEmptyState,
      state: this.resolvedEmptyState,
      title: this.resolvedEmptyTitle,
      description: this.resolvedEmptyDescription,
      icon: this.resolvedEmptyIcon,
      error: this.errorState(),
      action: () => this.triggerEmptyAction(),
    };
  }

  get loadingContext(): JTableLoadingContext {
    return {
      $implicit: this.loadingVariant(),
      variant: this.loadingVariant(),
      rows: Math.max(1, this.skeletonRows()),
      columns: Math.max(1, this.skeletonColumns().length || this.resolvedColumns.length),
    };
  }

  get replacesRowsWhileLoading(): boolean {
    return this.loading() && this.loadingVariant() !== 'overlay';
  }

  get showingStart(): number {
    return this.totalItems === 0 ? 0 : this.normalizedFirst + 1;
  }

  get showingEnd(): number {
    return Math.min(this.normalizedFirst + this.pageRows, this.totalItems);
  }

  get tableClasses(): string[] {
    return [
      'j-table',
      `j-table--${this.variant()}`,
      `j-table--density-${this.density}`,
      `j-table--responsive-${this.responsiveMode()}`,
      this.variant() === 'striped' ? 'j-table--striped' : '',
      this.hover ? 'j-table--hover' : '',
      this.selectionMode !== 'none' ? 'j-table--selectable' : '',
      this.responsiveMode() === 'stack' || this.responsiveMode() === 'card'
        ? 'j-table--responsive'
        : '',
      this.stickyHeader() || this.scrollHeight() ? 'j-table--sticky' : '',
      this.expandableRows() ? 'j-table--expandable' : '',
      this.loading() ? 'is-loading' : '',
      this.maximized ? 'is-maximized' : '',
      this.styleClass(),
    ].filter(Boolean);
  }

  get usesDedicatedFilterRow(): boolean {
    return this.resolvedFilterDisplay === 'row';
  }

  get resolvedFilterDisplay(): JTableFilterDisplay {
    return this.filterDisplay();
  }

  get activeFilterItems(): readonly JTableFilterItem[] {
    return this.filterModel.items.filter((item) => !this.isEmptyFilterItem(item));
  }

  get hasFilterableColumns(): boolean {
    return this.resolvedColumns.some((column) => this.isColumnFilterable(column));
  }

  get scrollStyles(): Record<string, string> | null {
    return this.scrollHeight() ? { 'max-height': this.scrollHeight() } : null;
  }

  get colspan(): number {
    return (
      this.resolvedColumns.length +
        (this.selectionMode === 'checkbox' || this.selectionMode === 'radio' ? 1 : 0) +
        (this.expandableRows() ? 1 : 0) +
        (this.lockableRows ? 1 : 0) || 1
    );
  }

  get normalizedFirst(): number {
    // Clamp a stale/over-range `first` down to the start of the last page (a
    // multiple of the page size), not to `totalItems - 1`, so we render a full
    // last page and report the correct "X to Y of Z" range.
    const lastPageStart = Math.max(
      0,
      Math.ceil(this.totalItems / this.pageRows) * this.pageRows - this.pageRows,
    );
    return Math.max(0, Math.min(this.first, lastPageStart));
  }

  private get globalFields(): readonly string[] {
    return this.globalFilterFields().length
      ? this.globalFilterFields()
      : this.resolvedColumns.map((column) => column.field);
  }

  get activeMultiSort(): readonly JTableSort[] {
    return this.multiSortMeta.filter((sort) => sort.order !== 0);
  }

  get columnManagerColumns(): readonly JTableColumn[] {
    return this.orderColumns(this.columns() as unknown as readonly JTableColumn[]);
  }

  get tableContext(): { table: JTableComponent } {
    return { table: this };
  }

  ngAfterContentInit(): void {
    this.applyConfig();
    this.syncLockedRows();
    this.emitLazyLoad();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config']) {
      this.applyConfig();
    }
    if (changes['lockedRowKeys']) {
      this.syncLockedRows();
    }
    if (
      this.dataMode() === 'lazy' &&
      (changes['first'] || changes['rows'] || changes['sortField'] || changes['sortOrder'])
    ) {
      this.emitLazyLoad();
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleDocumentKeydown(event: KeyboardEvent): void {
    if (this.maximized && event.key === 'Escape') {
      event.preventDefault();
      this.setMaximized(false);
    }
  }

  trackByColumn = (index: number, column: JTableColumn): string => {
    return column.field || String(index);
  };

  trackByRow = (index: number, row: JTableRow): string => {
    return this.rowId(row, index);
  };

  cellValue(row: JTableRow, column: JTableColumn): unknown {
    return column.valueGetter ? column.valueGetter(row, column) : row[column.field];
  }

  formattedCellValue(row: JTableRow, column: JTableColumn): string {
    const value = this.cellValue(row, column);

    if (column.formatter) {
      const formatted = column.formatter(value, row, column);
      return formatted == null ? '' : String(formatted);
    }

    if (value == null) {
      return '';
    }

    if (value instanceof Date) {
      return value.toLocaleDateString();
    }

    if (column.type === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    return String(value);
  }

  cellImageSource(row: JTableRow, column: JTableColumn): string {
    const value = this.cellValue(row, column);
    return typeof value === 'string' ? value : '';
  }

  cellTemplateFor(column: JTableColumn): TemplateRef<JTableCellContext> | null {
    const key = column.templateKey || column.field;
    const directive = this.cellTemplates?.find((template) => template.resolvedKey() === key);
    return directive?.templateRef ?? null;
  }

  headerTemplateFor(column: JTableColumn): TemplateRef<JTableHeaderContext> | null {
    const key = column.templateKey || column.field;
    return (
      this.headerTemplates?.find((template) => template.resolvedKey() === key)?.templateRef ?? null
    );
  }

  filterTemplateFor(column: JTableColumn): TemplateRef<unknown> | null {
    const key = column.templateKey || column.field;
    return (
      this.filterTemplates?.find((template) => template.resolvedKey() === key)?.templateRef ?? null
    );
  }

  actionTemplateFor(column: JTableColumn): TemplateRef<JTableCellContext> | null {
    const key = column.templateKey || column.field;
    return (
      this.actionTemplates?.find((template) => template.resolvedKey() === key)?.templateRef ?? null
    );
  }

  cellContext(row: JTableRow, column: JTableColumn, index: number): JTableCellContext {
    return {
      $implicit: row,
      row,
      column,
      value: this.cellValue(row, column),
      formattedValue: this.formattedCellValue(row, column),
      index,
    };
  }

  headerContext(column: JTableColumn): JTableHeaderContext {
    return { $implicit: column, column };
  }

  filterContext(column: JTableColumn): {
    $implicit: JTableColumn;
    column: JTableColumn;
    value: unknown;
    apply: (value: unknown) => void;
  } {
    return {
      $implicit: column,
      column,
      value: this.filterValue(column.field),
      apply: (value: unknown) => this.applyTemplateFilter(column, value),
    };
  }

  columnClass(column: JTableColumn): string {
    const align = this.normalizeAlign(column.align);
    return [
      'j-table__cell',
      `j-table__cell--${align}`,
      column.frozen ? 'j-table__cell--frozen' : '',
      column.frozenAlign === 'right' ? 'j-table__cell--frozen-right' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  headerColumnClass(column: JTableColumn): string {
    const align = this.normalizeAlign(column.headerAlign ?? column.align);
    return `${this.columnClass(column)} j-table__header--${align}`;
  }

  triggerEmptyAction(): void {
    this.emptyAction.emit({ state: this.resolvedEmptyState, error: this.errorState() });
  }

  rowId(row: JTableRow, index: number): string {
    const key = this.dataKey() || this.rowKey();
    const value = row[key];
    return value == null ? String(index) : String(value);
  }

  isSelected(row: JTableRow): boolean {
    if (this.isSelectionArray(this.selection)) {
      return this.selection.some((selected) => this.rowsEqual(selected, row));
    }

    const selected = this.selection;
    return selected != null && this.rowsEqual(selected, row);
  }

  allPageRowsSelected(): boolean {
    const eligible = this.eligibleVisibleRows;
    return eligible.length > 0 && eligible.every((row) => this.isSelected(row));
  }

  somePageRowsSelected(): boolean {
    const eligible = this.eligibleVisibleRows;
    const selectedCount = eligible.filter((row) => this.isSelected(row)).length;
    return selectedCount > 0 && selectedCount < eligible.length;
  }

  get eligibleVisibleRows(): readonly JTableRow[] {
    const predicate = this.rowSelectable();
    return this.visibleRows.filter((row, index) => predicate?.(row, index) !== false);
  }

  isRowSelectable(row: JTableRow): boolean {
    const index = this.visibleRows.indexOf(row);
    return this.rowSelectable()?.(row, index) !== false;
  }

  groupValue(row: JTableRow): unknown {
    const field = this.groupRowsBy();
    return field ? row[field] : null;
  }

  groupLabel(row: JTableRow): string {
    return String(this.groupValue(row) ?? 'Unspecified');
  }

  isGroupStart(row: JTableRow, index: number): boolean {
    if (!this.groupRowsBy()) return false;
    return (
      index === 0 || !Object.is(this.groupValue(this.visibleRows[index - 1]), this.groupValue(row))
    );
  }

  isGroupEnd(row: JTableRow, index: number): boolean {
    if (!this.groupRowsBy()) return false;
    return (
      index === this.visibleRows.length - 1 ||
      !Object.is(this.groupValue(this.visibleRows[index + 1]), this.groupValue(row))
    );
  }

  isGroupCollapsed(row: JTableRow): boolean {
    return this.collapsedRowGroups.has(this.groupKey(this.groupValue(row)));
  }

  toggleRowGroup(row: JTableRow, event?: Event): void {
    event?.stopPropagation();
    if (!this.collapsibleRowGroups()) return;
    const value = this.groupValue(row);
    const key = this.groupKey(value);
    const collapsed = !this.collapsedRowGroups.has(key);
    if (collapsed) this.collapsedRowGroups.add(key);
    else this.collapsedRowGroups.delete(key);
    this.rowGroupToggle.emit({ value, collapsed });
    this.changeDetectorRef.markForCheck();
  }

  private groupKey(value: unknown): string {
    return `${typeof value}:${String(value)}`;
  }

  toggleAllPageRows(event: Event): void {
    const checkbox = event.target as HTMLInputElement | null;
    const selected = checkbox?.checked ?? false;
    const current = this.isSelectionArray(this.selection) ? [...this.selection] : [];
    const next = selected
      ? [
          ...current,
          ...this.eligibleVisibleRows.filter(
            (row) => !current.some((item) => this.rowsEqual(item, row)),
          ),
        ]
      : current.filter(
          (row) => !this.eligibleVisibleRows.some((visibleRow) => this.rowsEqual(visibleRow, row)),
        );

    this.selection = next;
    this.selectionChange.emit(next);
  }

  handleRowClick(row: JTableRow, index: number, originalEvent: MouseEvent): void {
    const event = { row, index, originalEvent };
    this.rowClick.emit(event);

    if (this.selectionMode === 'none' || this.selectionMode === 'checkbox') {
      return;
    }

    this.toggleSelection(row);
  }

  handleRowDoubleClick(row: JTableRow, index: number, originalEvent: MouseEvent): void {
    const event = { row, index, originalEvent };
    this.rowDoubleClick.emit(event);
    if (this.editMode() === 'row') {
      this.rowEditSave.emit({ row, index, originalEvent });
    }
  }

  handleRowKeydown(event: KeyboardEvent, row: JTableRow): void {
    if (this.selectionMode === 'none' || (event.key !== 'Enter' && event.key !== ' ')) {
      return;
    }

    event.preventDefault();
    this.toggleSelection(row);
  }

  handleCheckboxChange(row: JTableRow, event: Event): void {
    event.stopPropagation();
    this.toggleSelection(row);
  }

  toggleSelection(row: JTableRow): void {
    if (this.selectionMode === 'none' || !this.isRowSelectable(row)) {
      return;
    }

    if (this.selectionMode === 'single' || this.selectionMode === 'radio') {
      this.selection = row;
      this.rowSelect.emit(row);
      this.selectionChange.emit(row);
      return;
    }

    const current = this.isSelectionArray(this.selection) ? [...this.selection] : [];
    const exists = current.some((selected) => this.rowsEqual(selected, row));
    const next = exists
      ? current.filter((selected) => !this.rowsEqual(selected, row))
      : [...current, row];
    this.selection = next;
    this.rowSelect.emit(row);
    this.selectionChange.emit(next);
  }

  toggleSort(column: JTableColumn): void {
    if (!this.isColumnSortable(column)) {
      return;
    }
    this.virtualStart = 0;

    const nextOrder: JTableSortOrder =
      this.sortField !== column.field
        ? 1
        : this.sortOrder === 1
          ? -1
          : this.sortOrder === -1
            ? 0
            : 1;

    if (this.sortMode === 'multiple') {
      this.multiSortMeta = [
        ...this.multiSortMeta.filter((sort) => sort.field !== column.field),
        ...(nextOrder === 0
          ? []
          : [
              {
                field: column.field,
                order: nextOrder,
                direction: nextOrder === 1 ? 'asc' : nextOrder === -1 ? 'desc' : 'none',
              } satisfies JTableSort,
            ]),
      ];
    } else {
      this.sortField = nextOrder === 0 ? '' : column.field;
      this.sortOrder = nextOrder;
    }

    const sort: JTableSort = {
      field: column.field,
      order: nextOrder,
      direction: nextOrder === 1 ? 'asc' : nextOrder === -1 ? 'desc' : 'none',
    };
    this.emitSort(sort);
    this.emitLazyLoad();
  }

  sortOrderFor(column: JTableColumn): JTableSortOrder {
    if (this.sortMode === 'multiple') {
      return this.multiSortMeta.find((sort) => sort.field === column.field)?.order ?? 0;
    }
    return this.sortField === column.field ? this.sortOrder : 0;
  }

  ariaSort(column: JTableColumn): 'ascending' | 'descending' | 'none' | null {
    const order = this.sortOrderFor(column);
    return order === 1
      ? 'ascending'
      : order === -1
        ? 'descending'
        : this.isColumnSortable(column)
          ? 'none'
          : null;
  }

  handleFilterModelChange(change: JColumnFilterChange): void {
    this.virtualStart = 0;
    const filters = { ...this.filters };

    if (this.isEmptyFilter(change.value)) {
      delete filters[change.field];
    } else {
      filters[change.field] = change.value;
    }

    this.filters = filters;
    const items = this.filterModel.items.filter((item) => item.field !== change.field);
    if (!this.isEmptyFilterItem(change)) {
      items.push(change);
    }
    this.filterModel = { ...this.filterModel, items };
    this.first = 0;
    this.emitFilter({
      field: change.field,
      value: change.value,
      filters,
      filterItem: change,
      filterModel: this.filterModel,
    });
    this.emitLazyLoad();
  }

  applyTemplateFilter(column: JTableColumn, value: unknown): void {
    this.handleFilterModelChange({
      field: column.field,
      operator: column.filter?.operator ?? 'contains',
      value,
    });
  }

  filterValue(field: string): unknown {
    return this.filters[field] ?? '';
  }

  filterTypeFor(column: JTableColumn): JTableFilterType {
    return (
      column.filter?.type ??
      (column.type === 'number'
        ? 'number'
        : column.type === 'date'
          ? 'date'
          : column.type === 'boolean'
            ? 'boolean'
            : 'text')
    );
  }

  isFilterActive(field: string): boolean {
    return (
      this.filterModel.items.some(
        (item) => item.field === field && !this.isEmptyFilterItem(item),
      ) || !this.isEmptyFilter(this.filters[field])
    );
  }

  filterLabel(field: string): string {
    return this.columnManagerColumns.find((column) => column.field === field)?.header ?? field;
  }

  clearFilter(field: string): void {
    const filters = { ...this.filters };
    delete filters[field];
    this.filters = filters;
    this.filterModel = {
      ...this.filterModel,
      items: this.filterModel.items.filter((item) => item.field !== field),
    };
    this.emitFilter({ field, value: '', filters, filterModel: this.filterModel });
    this.emitLazyLoad();
  }

  handlePageChange(event: JPaginatorPageChange): void {
    this.virtualStart = 0;
    this.first = event.first;
    this.pageRows = event.rows;

    const pageEvent: JTablePageChange = {
      first: event.first,
      rows: event.rows,
      page: event.page,
      pageCount: event.pageCount,
      pageSize: event.rows,
    };
    this.pageChange.emit(pageEvent);
    this.emitLazyLoad();
  }

  handleActionClick(event: JTableActionEvent): void {
    this.action.emit(event);
  }

  handleGlobalFilter(event: Event): void {
    const value = (event.target as HTMLInputElement | null)?.value ?? '';
    this.globalFilter = value;
    this.first = 0;
    this.virtualStart = 0;
    this.emitFilter({ field: '*', value, filters: this.filters });
    this.emitLazyLoad();
  }

  toggleColumnVisibility(column: JTableColumn, event: Event): void {
    const checked = (event.target as HTMLInputElement | null)?.checked ?? true;
    checked
      ? this.hiddenColumnFields.delete(column.field)
      : this.hiddenColumnFields.add(column.field);
    const visibilityEvent: JTableColumnVisibilityChangeEvent = {
      column,
      field: column.field,
      visible: checked,
      visibleColumns: this.resolvedColumns,
    };
    this.columnVisibilityChange.emit(visibilityEvent);
  }

  resetColumns(): void {
    this.hiddenColumnFields.clear();
    this.columnOrder = [];
    this.columnWidths = {};
  }

  resetFilters(): void {
    this.filters = {};
    this.filterModel = { items: [], logicOperator: this.filterModel.logicOperator ?? 'and' };
    this.globalFilter = '';
    this.first = 0;
    this.emitFilter({ field: '*', value: '', filters: this.filters });
    this.emitLazyLoad();
  }

  applyFilters(): void {
    this.emitFilter({ field: '*', value: this.globalFilter, filters: this.filters });
    this.emitLazyLoad();
  }

  closeFilterMenu(menu: HTMLDetailsElement): void {
    menu.open = false;
    queueMicrotask(() => menu.querySelector<HTMLElement>('summary')?.focus());
  }

  toggleRowExpansion(row: JTableRow, index: number, event?: Event): void {
    event?.stopPropagation();
    const key = this.rowId(row, index);
    if (this.expandedRows.has(key)) {
      this.expandedRows.delete(key);
      this.rowCollapse.emit(row);
    } else {
      this.expandedRows.add(key);
      this.rowExpand.emit(row);
    }
  }

  isExpanded(row: JTableRow, index: number): boolean {
    return this.expandedRows.has(this.rowId(row, index));
  }

  startCellEdit(row: JTableRow, column: JTableColumn, index: number, event: Event): void {
    if (
      this.editMode() !== 'cell' ||
      column.editable === false ||
      column.readonly ||
      column.conditionalEditable?.(row) === false ||
      this.isActionColumn(column)
    ) {
      return;
    }
    event.stopPropagation();
    this.editingCellKey = `${this.rowId(row, index)}:${column.field}`;
  }

  isEditingCell(row: JTableRow, column: JTableColumn, index: number): boolean {
    return this.editingCellKey === `${this.rowId(row, index)}:${column.field}`;
  }

  async commitCellEdit(
    row: JTableRow,
    column: JTableColumn,
    index: number,
    event: Event,
  ): Promise<void> {
    const input = event.target as HTMLInputElement | null;
    const editEvent = {
      row,
      column,
      field: column.field,
      value: input?.value,
      index,
      originalEvent: event,
    } satisfies JTableEditEvent;
    const error = column.validate?.(editEvent.value, row, column);
    const asyncError = error ? null : await column.validateAsync?.(editEvent.value, row, column);
    if (error || asyncError) {
      this.editValidationError.emit({
        ...editEvent,
        error: error ?? asyncError ?? 'Invalid value',
      });
      return;
    }
    this.editingCellKey = '';
    this.cellEditSave.emit(editEvent);
  }

  handleCellEditKeydown(
    row: JTableRow,
    column: JTableColumn,
    index: number,
    event: KeyboardEvent,
  ): void {
    if (event.key === 'Enter') {
      void this.commitCellEdit(row, column, index, event);
    }
    if (event.key === 'Escape') {
      this.editingCellKey = '';
    }
  }

  handleContextMenu(row: JTableRow, index: number, originalEvent: MouseEvent): void {
    this.contextMenu.emit({ row, index, originalEvent });
  }

  startRowDrag(index: number): void {
    this.dragRowIndex = index;
  }

  dropRow(index: number, event: DragEvent): void {
    event.preventDefault();
    if (this.dragRowIndex < 0 || this.dragRowIndex === index) {
      this.dragRowIndex = -1;
      return;
    }
    // The drag/drop indices are positions in the *visible* (sorted/filtered/
    // paginated) rows; map them back to the source array by row identity so we
    // reorder the rows the user actually dragged.
    const visible = this.visibleRows;
    const dragged = visible[this.dragRowIndex];
    const target = visible[index];
    this.dragRowIndex = -1;
    if (!dragged || !target) {
      return;
    }
    const next = [...this.sourceRows];
    const from = next.indexOf(dragged);
    const to = next.indexOf(target);
    if (from < 0 || to < 0) {
      return;
    }
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    const reorder = { dragIndex: from, dropIndex: to, value: next };
    this.rowReorder.emit(reorder);
  }

  startColumnDrag(index: number): void {
    this.dragColumnIndex = index;
  }

  dropColumn(index: number, event: DragEvent): void {
    event.preventDefault();
    if (this.dragColumnIndex < 0 || this.dragColumnIndex === index) {
      return;
    }
    const next = [...this.resolvedColumns];
    const [moved] = next.splice(this.dragColumnIndex, 1);
    if (moved) {
      next.splice(index, 0, moved);
      this.columnOrder = next.map((column) => column.field);
      const event = { dragIndex: this.dragColumnIndex, dropIndex: index, columns: next };
      this.columnReorder.emit(event);
    }
    this.dragColumnIndex = -1;
  }

  saveState(): void {
    if (!this.stateKey) {
      return;
    }
    const state = this.currentState();
    try {
      const result = this.resolveStateStorage()?.set(this.stateKey, JSON.stringify(state));
      if (result instanceof Promise)
        result.catch((error) =>
          this.emitStateError({ key: this.stateKey, reason: 'storage-unavailable', error }),
        );
    } catch (error) {
      this.emitStateError({ key: this.stateKey, reason: 'storage-unavailable', error });
      return;
    }
    this.stateSave.emit(state);
  }

  restoreState(): void {
    if (!this.stateKey) {
      return;
    }
    try {
      const result = this.resolveStateStorage()?.get(this.stateKey) ?? null;
      if (result instanceof Promise) {
        void result
          .then((raw) => this.applyStoredState(raw))
          .catch((error) =>
            this.emitStateError({ key: this.stateKey, reason: 'storage-unavailable', error }),
          );
      } else {
        this.applyStoredState(result);
      }
    } catch (error) {
      this.emitStateError({ key: this.stateKey, reason: 'storage-unavailable', error });
    }
  }

  clearState(): void {
    if (!this.stateKey) return;
    try {
      const result = this.resolveStateStorage()?.remove(this.stateKey);
      if (result instanceof Promise)
        void result.catch((error) =>
          this.emitStateError({ key: this.stateKey, reason: 'storage-unavailable', error }),
        );
    } catch (error) {
      this.emitStateError({ key: this.stateKey, reason: 'storage-unavailable', error });
    }
  }

  createServerQuery(): JTableServerQuery | unknown {
    return jSerializeTableQuery(
      {
        first: this.first,
        rows: this.pageRows,
        sortField: this.sortField || undefined,
        sortOrder: this.sortOrder,
        multiSortMeta: this.multiSortMeta,
        globalFilter: this.globalFilter || undefined,
        filterModel: this.filterModel,
        permanentFilters: this.permanentFilters(),
        hiddenFilters: this.hiddenFilters(),
        selectedColumns: this.resolvedColumns.map((column) => column.field),
        timezone: this.timezone(),
      },
      { map: this.queryMapper() ?? undefined },
    );
  }

  private applyStoredState(raw: string | null): void {
    if (!raw) {
      return;
    }
    let state: Partial<JTableState>;
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        this.emitStateError({ key: this.stateKey, reason: 'invalid-shape' });
        return;
      }
      state = parsed as Partial<JTableState>;
    } catch (error) {
      this.emitStateError({ key: this.stateKey, reason: 'invalid-json', error });
      return;
    }
    if (state.version !== 1) {
      this.emitStateError({ key: this.stateKey, reason: 'invalid-shape' });
      return;
    }
    const fields = new Set(this.columns().map((column) => column.field));
    const rows =
      typeof state.rows === 'number' && state.rows > 0 ? Math.trunc(state.rows) : this.pageRows;
    const maxFirst = Math.max(
      0,
      Math.ceil(Math.max(this.totalRecords(), this.value().length) / rows) * rows - rows,
    );
    this.first =
      typeof state.first === 'number'
        ? Math.min(Math.max(0, Math.trunc(state.first)), maxFirst)
        : this.first;
    this.pageRows = rows;
    this.sortField =
      typeof state.sortField === 'string' && fields.has(state.sortField)
        ? state.sortField
        : this.sortField;
    this.sortOrder =
      state.sortOrder === 1 || state.sortOrder === -1 || state.sortOrder === 0
        ? state.sortOrder
        : this.sortOrder;
    this.multiSortMeta = Array.isArray(state.multiSortMeta)
      ? state.multiSortMeta.filter(
          (sort) => fields.has(sort.field) && (sort.order === 1 || sort.order === -1),
        )
      : this.multiSortMeta;
    this.filters =
      state.filters && typeof state.filters === 'object' && !Array.isArray(state.filters)
        ? Object.fromEntries(Object.entries(state.filters).filter(([field]) => fields.has(field)))
        : this.filters;
    this.globalFilter =
      typeof state.globalFilter === 'string' ? state.globalFilter : this.globalFilter;
    this.hiddenColumnFields = new Set(
      Array.isArray(state.hiddenColumns)
        ? state.hiddenColumns.filter((field) => fields.has(field))
        : [],
    );
    this.columnOrder = Array.isArray(state.columnOrder)
      ? state.columnOrder.filter((field) => fields.has(field))
      : this.columnOrder;
    this.columnWidths =
      state.columnWidths &&
      typeof state.columnWidths === 'object' &&
      !Array.isArray(state.columnWidths)
        ? Object.fromEntries(
            Object.entries(state.columnWidths).filter(
              ([field, width]) => fields.has(field) && typeof width === 'string',
            ),
          )
        : this.columnWidths;
    this.internalLockedRowKeys = new Set(
      Array.isArray(state.lockedRows)
        ? state.lockedRows.filter((key) => typeof key === 'string')
        : [],
    );
    this.density =
      state.density === 'compact' || state.density === 'comfortable' || state.density === 'spacious'
        ? state.density
        : this.density;
    this.expandedRows = new Set(
      Array.isArray(state.expandedRows)
        ? state.expandedRows.filter((key) => typeof key === 'string')
        : [],
    );
    if (this.restoreSelection() && Array.isArray(state.selectionKeys)) {
      const keys = new Set(state.selectionKeys.filter((key) => typeof key === 'string'));
      const selected = this.sourceRows.filter((row, index) => keys.has(this.rowId(row, index)));
      this.selection =
        this.selectionMode === 'single' || this.selectionMode === 'radio'
          ? (selected[0] ?? null)
          : selected;
      this.selectionChange.emit(this.selection);
    }
    const restored = this.currentState();
    this.stateRestore.emit(restored);
  }

  exportCSV(): string {
    const options: JTableExportOptions = {
      rows: 'all',
      visibleColumnsOnly: true,
      filename: this.exportFilename(),
      ...this.exportConfig,
      ...(this.config?.export ?? {}),
    };
    const sourceColumns =
      options.visibleColumnsOnly === false ? this.columnManagerColumns : this.resolvedColumns;
    const columns = sourceColumns.filter((column) => column.type !== 'actions');
    const rows = this.exportRows(options.rows ?? 'all');
    const csv = [
      columns.map((column) => this.escapeCsv(column.header)).join(','),
      ...rows.map((row) =>
        columns
          .map((column) => {
            const value = this.formattedCellValue(row, column);
            return this.escapeCsv(options.valueFormatter?.(value, row, column) ?? value);
          })
          .join(','),
      ),
    ].join('\n');
    const exportEvent: JTableExportEvent = {
      filename: options.filename ?? this.exportFilename(),
      options,
      rows,
      columns,
      csv,
      defaultPrevented: false,
      preventDefault() {
        this.defaultPrevented = true;
      },
    };
    this.export.emit(exportEvent);

    if (options.serverExport && this.dataMode() !== 'client') {
      this.exportProgress.emit({ format: 'server', active: true });
      Promise.resolve(options.serverExport(this.createServerQuery()))
        .catch((error: unknown) =>
          this.emitStateError({ key: this.stateKey, reason: 'storage-unavailable', error }),
        )
        .finally(() => this.exportProgress.emit({ format: 'server', active: false }));
      return csv;
    }

    if (isPlatformBrowser(this.platformId) && !exportEvent.defaultPrevented) {
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = this.documentRef.defaultView?.URL.createObjectURL(blob);
      if (url) {
        const anchor = this.documentRef.createElement('a');
        anchor.href = url;
        anchor.download = exportEvent.filename;
        anchor.click();
        this.documentRef.defaultView?.URL.revokeObjectURL(url);
      }
    }

    return csv;
  }

  async exportWithAdapter(format: string): Promise<void> {
    const adapter = this.exportAdapters()[format];
    if (!adapter) return;
    const options = { ...this.exportConfig, ...(this.config?.export ?? {}) };
    const columns = (
      options.visibleColumnsOnly === false ? this.columnManagerColumns : this.resolvedColumns
    ).filter((column) => column.type !== 'actions');
    this.exportProgress.emit({ format, active: true });
    try {
      await adapter({
        rows: this.exportRows(options.rows ?? 'all'),
        columns,
        filename: options.filename ?? this.exportFilename(),
        format,
      });
    } finally {
      this.exportProgress.emit({ format, active: false });
    }
  }

  setMaximized(value: boolean): void {
    if (this.maximized === value) {
      return;
    }
    this.maximized = value;
    if (value) {
      this.maximize.emit();
    } else {
      this.minimize.emit();
    }
  }

  toggleRowLock(row: JTableRow, index: number, event?: Event): void {
    event?.stopPropagation();
    const key = this.rowId(row, index);
    const locked = this.internalLockedRowKeys.has(key);
    const lockEvent: JTableRowLockEvent = { row, index, key };
    if (locked) {
      this.internalLockedRowKeys.delete(key);
      this.rowUnlock.emit(lockEvent);
      return;
    }
    this.internalLockedRowKeys.add(key);
    this.rowLock.emit(lockEvent);
  }

  isRowLocked(row: JTableRow, index: number): boolean {
    return this.internalLockedRowKeys.has(this.rowId(row, index));
  }

  isFrozenRow(row: JTableRow, index: number): boolean {
    return this.frozenRows() && this.isRowLocked(row, index);
  }

  isColumnSortable(column: JTableColumn): boolean {
    return (
      !this.isActionColumn(column) &&
      (column.sortable === true || (this.config?.sortable === true && column.sortable !== false))
    );
  }

  isColumnFilterable(column: JTableColumn): boolean {
    const configured = this.config?.columnFilter === true || this.config?.headerFilter === true;
    return (
      !this.isActionColumn(column) &&
      (column.filterable === true || (configured && column.filterable !== false))
    );
  }

  startColumnResize(event: PointerEvent, column: JTableColumn): void {
    if (!this.resizableColumns && !column.resizable) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.cleanupColumnResize();
    const header = (event.target as HTMLElement).closest('th');
    const startX = event.clientX;
    const startWidth = header?.getBoundingClientRect().width ?? 120;
    const move = (moveEvent: PointerEvent) => {
      const width = `${Math.max(48, startWidth + moveEvent.clientX - startX)}px`;
      this.columnWidths = { ...this.columnWidths, [column.field]: width };
      // Native pointermove runs outside zoneless change detection; repaint the
      // new width mid-drag.
      this.changeDetectorRef.markForCheck();
    };
    const up = () => {
      this.cleanupColumnResize();
      const width = this.columnWidths[column.field] ?? column.width ?? `${startWidth}px`;
      const resizeEvent: JTableColumnResizeEvent = { column, field: column.field, width };
      this.columnResize.emit(resizeEvent);
    };
    this.documentRef.addEventListener('pointermove', move);
    this.documentRef.addEventListener('pointerup', up);
    this.stopColumnResize = () => {
      this.documentRef.removeEventListener('pointermove', move);
      this.documentRef.removeEventListener('pointerup', up);
      this.stopColumnResize = null;
    };
  }

  private cleanupColumnResize(): void {
    this.stopColumnResize?.();
  }

  private applyConfig(): void {
    const config = this.config;
    if (!config) {
      return;
    }
    this.paginator = config.pagination ?? this.paginator;
    this.sortMode = config.multiSort ? 'multiple' : this.sortMode;
    this.showGlobalFilter = config.globalSearch ?? this.showGlobalFilter;
    this.reorderableRows = config.reorderableRows ?? this.reorderableRows;
    this.lockableRows = config.lockableRows ?? this.lockableRows;
    this.reorderableColumns = config.reorderableColumns ?? this.reorderableColumns;
    this.resizableColumns = config.resizableColumns ?? this.resizableColumns;
    this.maximizable = config.maximizable ?? this.maximizable;
    this.showExport = config.exportable ?? this.showExport;
    this.showTableState = config.stateful ?? this.showTableState;
    this.showColumnManager = config.columnManager ?? config.frozenColumns ?? this.showColumnManager;
    this.density = config.density ?? this.density;
    this.selectionMode = config.selectionMode ?? this.selectionMode;
    this.pageRows = config.pageSize ?? this.pageRows;
    this.rowsPerPageOptions = config.rowsPerPageOptions ?? this.rowsPerPageOptions;
    this.exportConfig = config.export ?? this.exportConfig;
  }

  private syncLockedRows(): void {
    this.internalLockedRowKeys = new Set(this.lockedRowKeys);
  }

  private emitSort(event: JTableSort): void {
    this.sortChange.emit(event);
  }

  private emitFilter(event: JTableFilterChange): void {
    this.filterChange.emit(event);
  }

  private exportRows(mode: JTableExportRows): readonly JTableRow[] {
    if (mode === 'page') {
      return this.visibleRows;
    }
    if (mode === 'selected') {
      if (this.isSelectionArray(this.selection)) {
        return this.selection;
      }
      return this.selection ? [this.selection] : [];
    }
    return this.sortedRows;
  }

  private currentState(): JTableState {
    return {
      version: 1,
      first: this.first,
      rows: this.rows,
      sortField: this.sortField,
      sortOrder: this.sortOrder,
      multiSortMeta: this.multiSortMeta,
      filters: this.filters,
      globalFilter: this.globalFilter,
      hiddenColumns: [...this.hiddenColumnFields],
      columnOrder: this.columnOrder,
      columnWidths: this.columnWidths,
      lockedRows: [...this.internalLockedRowKeys],
      density: this.density,
      columns: this.columnManagerColumns.map((column, order) => ({
        field: column.field,
        visible:
          !this.hiddenColumnFields.has(column.field) &&
          column.visible !== false &&
          column.hidden !== true,
        order,
        width: this.columnWidths[column.field] ?? column.width,
        frozen: column.frozen,
        frozenAlign: column.frozenAlign,
      })),
      expandedRows: [...this.expandedRows],
      selectionKeys: this.restoreSelection()
        ? (this.isSelectionArray(this.selection)
            ? this.selection
            : this.selection
              ? [this.selection]
              : []
          ).map((row) => this.rowId(row, this.sourceRows.indexOf(row)))
        : undefined,
    };
  }

  private resolveStateStorage(): JTableStateStorageAdapter | null {
    if (this.stateStorage() === 'custom') return this.stateStorageAdapter();
    if (this.stateStorage() === 'memory') return this.memoryStorage;
    if (!isPlatformBrowser(this.platformId)) return null;
    const storage =
      this.stateStorage() === 'session'
        ? this.documentRef.defaultView?.sessionStorage
        : this.documentRef.defaultView?.localStorage;
    return storage
      ? {
          get: (key) => storage.getItem(key),
          set: (key, value) => storage.setItem(key, value),
          remove: (key) => storage.removeItem(key),
        }
      : null;
  }

  private emitStateError(error: JTableStateRestoreError): void {
    this.error.emit(error);
  }

  private orderColumns(columns: readonly JTableColumn[]): readonly JTableColumn[] {
    if (!this.columnOrder.length) {
      return columns;
    }
    const order = new Map(this.columnOrder.map((field, index) => [field, index]));
    return [...columns].sort((first, second) => {
      const firstIndex = order.get(first.field) ?? Number.MAX_SAFE_INTEGER;
      const secondIndex = order.get(second.field) ?? Number.MAX_SAFE_INTEGER;
      return firstIndex - secondIndex;
    });
  }

  private emitLazyLoad(): void {
    if (!['server', 'lazy', 'virtual'].includes(this.dataMode())) {
      return;
    }

    this.lazyLoad.emit({
      first: this.first,
      rows: this.pageRows,
      sortField: this.sortField || undefined,
      sortOrder: this.sortOrder,
      multiSortMeta: this.multiSortMeta,
      filters: this.filters,
      filterModel: this.filterModel,
      globalFilter: this.globalFilter || undefined,
    });
    this.serverQuery.emit(this.createServerQuery());
  }

  private isActionColumn(column: JTableColumn): boolean {
    return column.type === 'actions';
  }

  private valueMatchesFilter(value: unknown, filter: unknown): boolean {
    if (this.isEmptyFilter(filter)) {
      return true;
    }

    return String(value ?? '')
      .toLowerCase()
      .includes(String(filter).toLowerCase());
  }

  private valueMatchesOperator(value: unknown, item: JTableFilterItem): boolean {
    const filter = item.value;
    const left = String(value ?? '').toLocaleLowerCase();
    const right = String(filter ?? '').toLocaleLowerCase();

    switch (item.operator) {
      case 'contains':
        return left.includes(right);
      case 'notContains':
        return !left.includes(right);
      case 'startsWith':
        return left.startsWith(right);
      case 'endsWith':
        return left.endsWith(right);
      case 'equals':
        return value === filter || left === right;
      case 'notEquals':
        return !(value === filter || left === right);
      case 'lessThan':
        return this.compareValues(value, filter) < 0;
      case 'lessThanOrEqual':
        return this.compareValues(value, filter) <= 0;
      case 'greaterThan':
        return this.compareValues(value, filter) > 0;
      case 'greaterThanOrEqual':
        return this.compareValues(value, filter) >= 0;
      case 'before':
        return this.dateValue(value) < this.dateValue(filter);
      case 'after':
        return this.dateValue(value) > this.dateValue(filter);
      case 'in':
        return Array.isArray(filter) && filter.map(String).includes(String(value));
      case 'notIn':
        return Array.isArray(filter) && !filter.map(String).includes(String(value));
      case 'between': {
        const range = Array.isArray(filter) ? filter : [];
        return (
          range.length === 2 &&
          this.compareValues(value, range[0]) >= 0 &&
          this.compareValues(value, range[1]) <= 0
        );
      }
      case 'isTrue':
        return value === true;
      case 'isFalse':
        return value === false;
      case 'isEmpty':
        return this.isEmptyFilter(value);
      case 'isNotEmpty':
        return !this.isEmptyFilter(value);
    }
  }

  private isEmptyFilterItem(item: JTableFilterItem): boolean {
    return (
      !['isEmpty', 'isNotEmpty', 'isTrue', 'isFalse'].includes(item.operator) &&
      (Array.isArray(item.value) ? item.value.length === 0 : this.isEmptyFilter(item.value))
    );
  }

  private dateValue(value: unknown): number {
    const parsed = value instanceof Date ? value : new Date(String(value ?? ''));
    return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
  }

  private isEmptyFilter(value: unknown): boolean {
    return value == null || String(value).trim() === '';
  }

  private compareValues(first: unknown, second: unknown): number {
    if (typeof first === 'number' && typeof second === 'number') {
      return first - second;
    }

    return String(first ?? '').localeCompare(String(second ?? ''), undefined, {
      numeric: true,
      sensitivity: 'base',
    });
  }

  private compareRows(first: JTableRow, second: JTableRow, field: string): number {
    const column = (this.columns() as readonly JTableColumn[]).find(
      (candidate) => candidate.field === field,
    );
    return column?.sortComparator
      ? column.sortComparator(first, second, column)
      : this.compareValues(first[field], second[field]);
  }

  private rowsEqual(first: JTableRow, second: JTableRow): boolean {
    const key = this.dataKey() || this.rowKey();
    const firstValue = first[key];
    const secondValue = second[key];

    if (firstValue != null || secondValue != null) {
      return firstValue === secondValue;
    }

    return first === second;
  }

  private isSelectionArray(selection: JTableSelection): selection is readonly JTableRow[] {
    return Array.isArray(selection);
  }

  private normalizeAlign(align: JTableColumnAlign | undefined): 'start' | 'center' | 'end' {
    if (align === 'end') {
      return 'end';
    }

    if (align === 'center') {
      return 'center';
    }

    return 'start';
  }

  private escapeCsv(value: unknown): string {
    const text = String(value ?? '');
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }
}

export type {
  JTableAction,
  JTableActionEvent,
  JTableCellContext,
  JTableColumn,
  JTableColumnAlign,
  JTableColumnField,
  JTableColumnReorderEvent,
  JTableColumnResizeEvent,
  JTableColumnVisibilityChangeEvent,
  JTableColumnType,
  JTableConfig,
  JTableDensity,
  JTableEditEvent,
  JTableEmptyActionEvent,
  JTableEmptyContext,
  JTableEmptyState,
  JTableEmptyStateMode,
  JTableExportEvent,
  JTableExportOptions,
  JTableExportRows,
  JTableFilterChange,
  JTableHeaderContext,
  JTableLazyLoadEvent,
  JTableLoadingContext,
  JTableLoadingVariant,
  JTablePageChange,
  JTableReorderEvent,
  JTableRow,
  JTableRowClickEvent,
  JTableRowLockEvent,
  JTableSelection,
  JTableSelectionMode,
  JTableSkeletonColumn,
  JTableSort,
  JTableState,
} from './table.types';
export type { JTableSortOrder } from 'jrng-ui/core';
