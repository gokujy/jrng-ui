import { DOCUMENT, NgClass, NgStyle, NgTemplateOutlet, isPlatformBrowser } from '@angular/common';
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ContentChildren,
  DestroyRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  PLATFORM_ID,
  QueryList,
  SimpleChanges,
  TemplateRef,
  booleanAttribute,
  inject,
  numberAttribute,
} from '@angular/core';
import { JActionMenuComponent } from './action-menu.component';
import { JColumnFilterChange, JColumnFilterComponent } from './column-filter.component';
import { JColumnComponent } from './column.component';
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
  JTableEditEvent,
  JTableExportEvent,
  JTableExportOptions,
  JTableExportRows,
  JTableFilterChange,
  JTableHeaderContext,
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
} from './table.types';
import {
  JTableCellTemplateDirective,
  JTableHeaderTemplateDirective,
} from './table-template.directive';
import { JTableSortOrder } from 'jrng-ui/core';

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
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JTableComponent implements AfterContentInit, OnChanges {
  @ContentChild('jTableCell') legacyCellTemplate?: TemplateRef<JTableCellContext>;
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
  @ContentChildren(JColumnComponent) projectedColumns?: QueryList<JColumnComponent>;
  @ContentChildren(JTableCellTemplateDirective)
  cellTemplates?: QueryList<JTableCellTemplateDirective>;
  @ContentChildren(JTableHeaderTemplateDirective)
  headerTemplates?: QueryList<JTableHeaderTemplateDirective>;

  @Input() value: readonly JTableRow[] = [];
  @Input() columns: readonly JTableColumn[] = [];
  @Input() totalRecords = 0;
  @Input({ transform: numberAttribute }) first = 0;
  @Input() rowsPerPageOptions: readonly number[] = [10, 25, 50];
  @Input() sortField = '';
  @Input() sortOrder: JTableSortOrder = 0;
  @Input() sortMode: 'single' | 'multiple' = 'single';
  @Input() multiSortMeta: readonly JTableSort[] = [];
  @Input() filters: Record<string, unknown> = {};
  @Input() globalFilter = '';
  @Input() globalFilterFields: readonly string[] = [];
  @Input() selectionMode: JTableSelectionMode = 'none';
  @Input() selection: JTableSelection = null;
  @Input() rowKey = 'id';
  @Input() dataKey = '';
  @Input() scrollHeight = '';
  @Input() styleClass = '';
  @Input() emptyMessage = 'No records found.';
  @Input() loadingMessage = 'Loading records...';
  @Input() caption = '';
  @Input() stateKey = '';
  @Input() exportFilename = 'table-data.csv';
  @Input() config: JTableConfig | null = null;
  @Input() exportConfig: JTableExportOptions = {};
  @Input() lockedRowKeys: readonly string[] = [];
  @Input() size: JTableSize = 'medium';

  @Input({ transform: booleanAttribute }) loading = false;
  @Input({ transform: booleanAttribute }) paginator = false;
  @Input({ transform: booleanAttribute }) lazy = false;
  @Input({ transform: booleanAttribute }) striped = false;
  @Input({ transform: booleanAttribute }) hover = true;
  @Input({ transform: booleanAttribute }) responsive = true;
  @Input({ transform: booleanAttribute }) scrollable = false;
  @Input({ transform: booleanAttribute }) resizableColumns = false;
  @Input({ transform: booleanAttribute }) reorderableColumns = false;
  @Input({ transform: booleanAttribute }) reorderableRows = false;
  @Input({ transform: booleanAttribute }) expandableRows = false;
  @Input({ transform: booleanAttribute }) rowEditing = false;
  @Input({ transform: booleanAttribute }) cellEditing = false;
  @Input({ transform: booleanAttribute }) stickyHeader = false;
  @Input({ transform: booleanAttribute }) showGlobalFilter = false;
  @Input({ transform: booleanAttribute }) showColumnManager = false;
  @Input({ transform: booleanAttribute }) showExport = false;
  @Input({ transform: booleanAttribute }) showTableState = false;
  @Input({ transform: booleanAttribute }) frozenRows = false;
  @Input({ transform: booleanAttribute }) filterRow = true;
  @Input({ transform: booleanAttribute }) lockableRows = false;
  @Input({ transform: booleanAttribute }) maximizable = false;

  @Output() lazyLoad = new EventEmitter<JTableLazyLoadEvent>();
  @Output() sortChange = new EventEmitter<JTableSort>();
  @Output() pageChange = new EventEmitter<JTablePageChange>();
  @Output() filterChange = new EventEmitter<JTableFilterChange>();
  @Output() rowClick = new EventEmitter<JTableRowClickEvent>();
  @Output() rowDoubleClick = new EventEmitter<JTableRowClickEvent>();
  @Output() selectionChange = new EventEmitter<JTableSelection>();
  @Output() actionClick = new EventEmitter<JTableActionEvent>();
  @Output() rowSelect = new EventEmitter<JTableRow>();
  @Output() rowExpand = new EventEmitter<JTableRow>();
  @Output() rowCollapse = new EventEmitter<JTableRow>();
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

  @Output() onFilterChange = new EventEmitter<JTableFilterChange>();
  @Output() onSortChange = new EventEmitter<JTableSort>();
  @Output() onPageChange = new EventEmitter<JTablePageChange>();
  @Output() onExport = new EventEmitter<JTableExportEvent>();
  @Output() onRowReorder = new EventEmitter<JTableReorderEvent>();
  @Output() onRowLock = new EventEmitter<JTableRowLockEvent>();
  @Output() onRowUnlock = new EventEmitter<JTableRowLockEvent>();
  @Output() onColumnReorder = new EventEmitter<JTableColumnReorderEvent>();
  @Output() onColumnResize = new EventEmitter<JTableColumnResizeEvent>();
  @Output() onColumnVisibilityChange = new EventEmitter<JTableColumnVisibilityChangeEvent>();
  @Output() onStateSave = new EventEmitter<JTableState>();
  @Output() onStateRestore = new EventEmitter<JTableState>();
  @Output() onRowClick = new EventEmitter<JTableRowClickEvent>();
  @Output() onRowDoubleClick = new EventEmitter<JTableRowClickEvent>();
  @Output() onSelectionChange = new EventEmitter<JTableSelection>();
  @Output() onMaximize = new EventEmitter<void>();
  @Output() onMinimize = new EventEmitter<void>();

  private legacyRows: readonly JTableRow[] = [];
  private pageRows = 10;
  hiddenColumnFields = new Set<string>();
  private expandedRows = new Set<string>();
  private dragRowIndex = -1;
  private dragColumnIndex = -1;
  private editingCellKey = '';
  private columnOrder: readonly string[] = [];
  private columnWidths: Record<string, string> = {};
  private internalLockedRowKeys = new Set<string>();
  private stopColumnResize: (() => void) | null = null;
  maximized = false;

  private readonly documentRef = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.destroyRef.onDestroy(() => this.cleanupColumnResize());
  }

  @Input()
  set rows(value: number | readonly JTableRow[]) {
    if (Array.isArray(value)) {
      this.legacyRows = value;
      return;
    }

    this.pageRows = Math.max(1, Number(value) || 10);
  }

  get rows(): number {
    return this.pageRows;
  }

  @Input()
  set pageSize(value: number) {
    this.pageRows = Math.max(1, Number(value) || 10);
  }

  get pageSize(): number {
    return this.pageRows;
  }

  @Input()
  set page(value: number) {
    this.first = Math.max(0, ((Number(value) || 1) - 1) * this.pageRows);
  }

  get page(): number {
    return this.currentPage;
  }

  @Input({ transform: booleanAttribute })
  set selectable(value: boolean) {
    this.selectionMode = value ? 'single' : 'none';
  }

  get selectable(): boolean {
    return this.selectionMode !== 'none';
  }

  @Input({ transform: booleanAttribute })
  set hoverable(value: boolean) {
    this.hover = value;
  }

  get hoverable(): boolean {
    return this.hover;
  }

  get resolvedColumns(): readonly JTableColumn[] {
    const projected = this.projectedColumnModels;
    const source = projected.length ? projected : this.columns;
    return this.orderColumns(source)
      .filter((column) => column.visible !== false && !this.hiddenColumnFields.has(column.field))
      .map((column) => ({
        ...column,
        width: this.columnWidths[column.field] ?? column.width,
      }));
  }

  get sourceRows(): readonly JTableRow[] {
    return this.value.length ? this.value : this.legacyRows;
  }

  get filteredRows(): readonly JTableRow[] {
    if (this.lazy) {
      return this.sourceRows;
    }

    const activeFilters = Object.entries(this.filters).filter(
      ([, value]) => !this.isEmptyFilter(value),
    );
    const global = this.globalFilter.trim().toLowerCase();

    if (!activeFilters.length && !global) {
      return this.sourceRows;
    }

    return this.sourceRows.filter((row) => {
      const matchesColumns = activeFilters.every(([field, value]) =>
        this.valueMatchesFilter(row[field], value),
      );
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
    if (this.lazy || !this.sortField || this.sortOrder === 0) {
      if (!this.lazy && this.sortMode === 'multiple' && this.activeMultiSort.length) {
        return [...this.filteredRows].sort((first, second) => {
          for (const sort of this.activeMultiSort) {
            const result = this.compareValues(first[sort.field], second[sort.field]) * sort.order;
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
      return this.compareValues(first[field], second[field]) * direction;
    });
  }

  get visibleRows(): readonly JTableRow[] {
    if (!this.paginator || this.lazy) {
      return this.sortedRows;
    }

    return this.sortedRows.slice(this.normalizedFirst, this.normalizedFirst + this.pageRows);
  }

  get totalItems(): number {
    return this.lazy ? this.totalRecords : this.sortedRows.length;
  }

  get currentPage(): number {
    return Math.floor(this.normalizedFirst / this.pageRows) + 1;
  }

  get hasRows(): boolean {
    return this.visibleRows.length > 0;
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
      `j-table--${this.size}`,
      this.striped ? 'j-table--striped' : '',
      this.hover ? 'j-table--hover' : '',
      this.selectable ? 'j-table--selectable' : '',
      this.responsive ? 'j-table--responsive' : '',
      this.scrollable ? 'j-table--scrollable' : '',
      this.stickyHeader ? 'j-table--sticky' : '',
      this.expandableRows ? 'j-table--expandable' : '',
      this.loading ? 'is-loading' : '',
      this.maximized ? 'is-maximized' : '',
      this.styleClass,
    ].filter(Boolean);
  }

  get scrollStyles(): Record<string, string> | null {
    return this.scrollable && this.scrollHeight ? { 'max-height': this.scrollHeight } : null;
  }

  get colspan(): number {
    return (
      this.resolvedColumns.length +
        (this.selectionMode === 'checkbox' ? 1 : 0) +
        (this.expandableRows ? 1 : 0) +
        (this.lockableRows ? 1 : 0) || 1
    );
  }

  get normalizedFirst(): number {
    return Math.max(0, Math.min(this.first, Math.max(0, this.totalItems - 1)));
  }

  private get globalFields(): readonly string[] {
    return this.globalFilterFields.length
      ? this.globalFilterFields
      : this.resolvedColumns.map((column) => column.field);
  }

  get activeMultiSort(): readonly JTableSort[] {
    return this.multiSortMeta.filter((sort) => sort.order !== 0);
  }

  get columnManagerColumns(): readonly JTableColumn[] {
    const projected = this.projectedColumnModels;
    return this.orderColumns(projected.length ? projected : this.columns);
  }

  get tableContext(): { table: JTableComponent } {
    return { table: this };
  }

  private get projectedColumnModels(): readonly JTableColumn[] {
    return (this.projectedColumns?.toArray() ?? []).map((column) => ({
      field: column.field,
      header: column.header || column.field,
      sortable: column.sortable,
      filterable: column.filterable,
      width: column.width || undefined,
      minWidth: column.minWidth || undefined,
      align: column.align,
      type: column.type,
      visible: column.visible,
      frozen: column.frozen,
      templateKey: column.templateKey || column.field,
      actions: column.actions,
    }));
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
      this.lazy &&
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
    return row[column.field];
  }

  formattedCellValue(row: JTableRow, column: JTableColumn): string {
    const value = this.cellValue(row, column);

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

  cellTemplateFor(column: JTableColumn): TemplateRef<JTableCellContext> | null {
    const key = column.templateKey || column.field;
    const directive = this.cellTemplates?.find((template) => template.key === key);
    const projected = this.projectedColumns
      ?.toArray()
      .find(
        (projectedColumn) =>
          projectedColumn.field === column.field || projectedColumn.templateKey === key,
      );

    const projectedTemplate = projected?.template as TemplateRef<JTableCellContext> | undefined;
    return directive?.templateRef ?? projectedTemplate ?? this.legacyCellTemplate ?? null;
  }

  headerTemplateFor(column: JTableColumn): TemplateRef<JTableHeaderContext> | null {
    const key = column.templateKey || column.field;
    return this.headerTemplates?.find((template) => template.key === key)?.templateRef ?? null;
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

  rowId(row: JTableRow, index: number): string {
    const key = this.dataKey || this.rowKey;
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
    return this.visibleRows.length > 0 && this.visibleRows.every((row) => this.isSelected(row));
  }

  toggleAllPageRows(event: Event): void {
    const checkbox = event.target as HTMLInputElement | null;
    const selected = checkbox?.checked ?? false;
    const current = this.isSelectionArray(this.selection) ? [...this.selection] : [];
    const next = selected
      ? [
          ...current,
          ...this.visibleRows.filter((row) => !current.some((item) => this.rowsEqual(item, row))),
        ]
      : current.filter(
          (row) => !this.visibleRows.some((visibleRow) => this.rowsEqual(visibleRow, row)),
        );

    this.selection = next;
    this.selectionChange.emit(next);
    this.onSelectionChange.emit(next);
  }

  handleRowClick(row: JTableRow, index: number, originalEvent: MouseEvent): void {
    const event = { row, index, originalEvent };
    this.rowClick.emit(event);
    this.onRowClick.emit(event);

    if (this.selectionMode === 'none' || this.selectionMode === 'checkbox') {
      return;
    }

    this.toggleSelection(row);
  }

  handleRowDoubleClick(row: JTableRow, index: number, originalEvent: MouseEvent): void {
    const event = { row, index, originalEvent };
    this.rowDoubleClick.emit(event);
    this.onRowDoubleClick.emit(event);
    if (this.rowEditing) {
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
    if (this.selectionMode === 'none') {
      return;
    }

    if (this.selectionMode === 'single') {
      this.selection = row;
      this.rowSelect.emit(row);
      this.selectionChange.emit(row);
      this.onSelectionChange.emit(row);
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
    this.onSelectionChange.emit(next);
  }

  toggleSort(column: JTableColumn): void {
    if (!this.isColumnSortable(column)) {
      return;
    }

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

  handleFilterChange(change: JColumnFilterChange): void {
    const filters = { ...this.filters };

    if (this.isEmptyFilter(change.value)) {
      delete filters[change.field];
    } else {
      filters[change.field] = change.value;
    }

    this.filters = filters;
    this.first = 0;
    this.emitFilter({ field: change.field, value: change.value, filters });
    this.emitLazyLoad();
  }

  filterValue(field: string): unknown {
    return this.filters[field] ?? '';
  }

  handlePageChange(event: JPaginatorPageChange): void {
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
    this.onPageChange.emit(pageEvent);
    this.emitLazyLoad();
  }

  handleActionClick(event: JTableActionEvent): void {
    this.actionClick.emit(event);
  }

  handleGlobalFilter(value: string): void {
    this.globalFilter = value;
    this.first = 0;
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
    this.onColumnVisibilityChange.emit(visibilityEvent);
  }

  resetColumns(): void {
    this.hiddenColumnFields.clear();
    this.columnOrder = [];
    this.columnWidths = {};
  }

  resetFilters(): void {
    this.filters = {};
    this.globalFilter = '';
    this.first = 0;
    this.emitFilter({ field: '*', value: '', filters: this.filters });
    this.emitLazyLoad();
  }

  applyFilters(): void {
    this.emitFilter({ field: '*', value: this.globalFilter, filters: this.filters });
    this.emitLazyLoad();
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
    if (!this.cellEditing || column.editable === false || column.type === 'action') {
      return;
    }
    event.stopPropagation();
    this.editingCellKey = `${this.rowId(row, index)}:${column.field}`;
  }

  isEditingCell(row: JTableRow, column: JTableColumn, index: number): boolean {
    return this.editingCellKey === `${this.rowId(row, index)}:${column.field}`;
  }

  commitCellEdit(row: JTableRow, column: JTableColumn, index: number, event: Event): void {
    const input = event.target as HTMLInputElement | null;
    this.editingCellKey = '';
    this.cellEditSave.emit({
      row,
      column,
      field: column.field,
      value: input?.value,
      index,
      originalEvent: event,
    });
  }

  handleCellEditKeydown(
    row: JTableRow,
    column: JTableColumn,
    index: number,
    event: KeyboardEvent,
  ): void {
    if (event.key === 'Enter') {
      this.commitCellEdit(row, column, index, event);
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
      return;
    }
    const next = [...this.sourceRows];
    const [moved] = next.splice(this.dragRowIndex, 1);
    if (moved) {
      next.splice(index, 0, moved);
      const event = { dragIndex: this.dragRowIndex, dropIndex: index, value: next };
      this.rowReorder.emit(event);
      this.onRowReorder.emit(event);
    }
    this.dragRowIndex = -1;
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
      this.onColumnReorder.emit(event);
    }
    this.dragColumnIndex = -1;
  }

  saveState(): void {
    if (!this.stateKey || !isPlatformBrowser(this.platformId)) {
      return;
    }
    const state = this.currentState();
    try {
      this.documentRef.defaultView?.localStorage?.setItem(this.stateKey, JSON.stringify(state));
    } catch (error) {
      this.stateRestoreError.emit({ key: this.stateKey, reason: 'storage-unavailable', error });
      return;
    }
    this.stateSave.emit(state);
    this.onStateSave.emit(state);
  }

  restoreState(): void {
    if (!this.stateKey || !isPlatformBrowser(this.platformId)) {
      return;
    }
    let raw: string | null = null;
    try {
      raw = this.documentRef.defaultView?.localStorage?.getItem(this.stateKey) ?? null;
    } catch (error) {
      this.stateRestoreError.emit({ key: this.stateKey, reason: 'storage-unavailable', error });
      return;
    }
    if (!raw) {
      return;
    }
    let state: Partial<JTableState>;
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        this.stateRestoreError.emit({ key: this.stateKey, reason: 'invalid-shape' });
        return;
      }
      state = parsed as Partial<JTableState>;
    } catch (error) {
      this.stateRestoreError.emit({ key: this.stateKey, reason: 'invalid-json', error });
      return;
    }
    if (state.version !== undefined && state.version !== 1) {
      this.stateRestoreError.emit({ key: this.stateKey, reason: 'unsupported-version' });
      return;
    }
    const fields = new Set(this.columns.map((column) => column.field));
    const rows =
      typeof state.rows === 'number' && state.rows > 0 ? Math.trunc(state.rows) : this.pageRows;
    const maxFirst = Math.max(
      0,
      Math.ceil(Math.max(this.totalRecords, this.value.length) / rows) * rows - rows,
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
    this.size =
      state.size === 'small' || state.size === 'medium' || state.size === 'large'
        ? state.size
        : this.size;
    const restored = this.currentState();
    this.stateRestore.emit(restored);
    this.onStateRestore.emit(restored);
  }

  exportCSV(): string {
    const options: JTableExportOptions = {
      rows: 'all',
      visibleColumnsOnly: true,
      filename: this.exportFilename,
      ...this.exportConfig,
      ...(this.config?.export ?? {}),
    };
    const sourceColumns =
      options.visibleColumnsOnly === false ? this.columnManagerColumns : this.resolvedColumns;
    const columns = sourceColumns.filter((column) => column.type !== 'action');
    const rows = this.exportRows(options.rows ?? 'all');
    const csv = [
      columns.map((column) => this.escapeCsv(column.header)).join(','),
      ...rows.map((row) =>
        columns.map((column) => this.escapeCsv(this.formattedCellValue(row, column))).join(','),
      ),
    ].join('\n');
    const exportEvent: JTableExportEvent = {
      filename: options.filename ?? this.exportFilename,
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
    this.onExport.emit(exportEvent);

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

  setMaximized(value: boolean): void {
    if (this.maximized === value) {
      return;
    }
    this.maximized = value;
    if (value) {
      this.maximize.emit();
      this.onMaximize.emit();
    } else {
      this.minimize.emit();
      this.onMinimize.emit();
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
      this.onRowUnlock.emit(lockEvent);
      return;
    }
    this.internalLockedRowKeys.add(key);
    this.rowLock.emit(lockEvent);
    this.onRowLock.emit(lockEvent);
  }

  isRowLocked(row: JTableRow, index: number): boolean {
    return this.internalLockedRowKeys.has(this.rowId(row, index));
  }

  isColumnSortable(column: JTableColumn): boolean {
    return (
      column.type !== 'action' &&
      (column.sortable === true || (this.config?.sortable === true && column.sortable !== false))
    );
  }

  isColumnFilterable(column: JTableColumn): boolean {
    const configured = this.config?.columnFilter === true || this.config?.headerFilter === true;
    return (
      column.type !== 'action' &&
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
    };
    const up = () => {
      this.cleanupColumnResize();
      const width = this.columnWidths[column.field] ?? column.width ?? `${startWidth}px`;
      const resizeEvent: JTableColumnResizeEvent = { column, field: column.field, width };
      this.columnResize.emit(resizeEvent);
      this.onColumnResize.emit(resizeEvent);
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
    this.filterRow = config.filterRow ?? this.filterRow;
    this.showGlobalFilter = config.globalSearch ?? this.showGlobalFilter;
    this.reorderableRows = config.reorderableRows ?? this.reorderableRows;
    this.lockableRows = config.lockableRows ?? this.lockableRows;
    this.reorderableColumns = config.reorderableColumns ?? this.reorderableColumns;
    this.resizableColumns = config.resizableColumns ?? this.resizableColumns;
    this.maximizable = config.maximizable ?? this.maximizable;
    this.showExport = config.exportable ?? this.showExport;
    this.showTableState = config.stateful ?? this.showTableState;
    this.showColumnManager = config.columnManager ?? config.frozenColumns ?? this.showColumnManager;
    this.size = config.size ?? this.size;
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
    this.onSortChange.emit(event);
  }

  private emitFilter(event: JTableFilterChange): void {
    this.filterChange.emit(event);
    this.onFilterChange.emit(event);
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
      size: this.size,
    };
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
    if (!this.lazy) {
      return;
    }

    this.lazyLoad.emit({
      first: this.first,
      rows: this.pageRows,
      sortField: this.sortField || undefined,
      sortOrder: this.sortOrder,
      multiSortMeta: this.multiSortMeta,
      filters: this.filters,
      globalFilter: this.globalFilter || undefined,
    });
  }

  private valueMatchesFilter(value: unknown, filter: unknown): boolean {
    if (this.isEmptyFilter(filter)) {
      return true;
    }

    return String(value ?? '')
      .toLowerCase()
      .includes(String(filter).toLowerCase());
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

  private rowsEqual(first: JTableRow, second: JTableRow): boolean {
    const key = this.dataKey || this.rowKey;
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
    if (align === 'right' || align === 'end') {
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
  JTableColumnReorderEvent,
  JTableColumnResizeEvent,
  JTableColumnVisibilityChangeEvent,
  JTableColumnType,
  JTableConfig,
  JTableEditEvent,
  JTableExportEvent,
  JTableExportOptions,
  JTableExportRows,
  JTableFilterChange,
  JTableHeaderContext,
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
} from './table.types';
export type { JTableSortOrder } from 'jrng-ui/core';
