import { DOCUMENT, NgClass, NgStyle, NgTemplateOutlet, isPlatformBrowser } from '@angular/common';
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ContentChildren,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  Output,
  PLATFORM_ID,
  QueryList,
  SimpleChanges,
  TemplateRef,
  booleanAttribute,
  numberAttribute,
} from '@angular/core';
import { JActionMenuComponent } from './action-menu.component';
import { JColumnFilterChange, JColumnFilterComponent } from './column-filter.component';
import { JColumnComponent } from './column.component';
import { JPaginatorComponent, JPaginatorPageChange } from '../paginator/paginator.component';
import { JSortIconComponent } from './sort-icon.component';
import { JTableEmptyStateComponent } from './table-empty-state.component';
import { JTableSkeletonComponent } from './table-skeleton.component';
import {
  JTableActionEvent,
  JTableCellContext,
  JTableColumn,
  JTableColumnAlign,
  JTableColumnReorderEvent,
  JTableEditEvent,
  JTableFilterChange,
  JTableHeaderContext,
  JTableLazyLoadEvent,
  JTablePageChange,
  JTableReorderEvent,
  JTableRow,
  JTableRowClickEvent,
  JTableSelection,
  JTableSelectionMode,
  JTableSort,
} from './table.types';
import { JTableCellTemplateDirective, JTableHeaderTemplateDirective } from './table-template.directive';
import { JTableSortOrder } from '../core/types';

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
  @ContentChild('jTableExpandedRow') expandedRowTemplate?: TemplateRef<{ $implicit: JTableRow; row: JTableRow; index: number }>;
  @ContentChild('jTableFooter') footerTemplate?: TemplateRef<{ columns: readonly JTableColumn[]; rows: readonly JTableRow[] }>;
  @ContentChild('jTableToolbar') toolbarTemplate?: TemplateRef<{ table: JTableComponent }>;
  @ContentChildren(JColumnComponent) projectedColumns?: QueryList<JColumnComponent>;
  @ContentChildren(JTableCellTemplateDirective) cellTemplates?: QueryList<JTableCellTemplateDirective>;
  @ContentChildren(JTableHeaderTemplateDirective) headerTemplates?: QueryList<JTableHeaderTemplateDirective>;

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
  @Output() contextMenu = new EventEmitter<JTableRowClickEvent>();

  private legacyRows: readonly JTableRow[] = [];
  private pageRows = 10;
  hiddenColumnFields = new Set<string>();
  private expandedRows = new Set<string>();
  private dragRowIndex = -1;
  private dragColumnIndex = -1;
  private editingCellKey = '';

  constructor(
    @Inject(DOCUMENT) private readonly documentRef: Document,
    @Inject(PLATFORM_ID) private readonly platformId: object,
  ) {}

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
    return source.filter((column) => column.visible !== false && !this.hiddenColumnFields.has(column.field));
  }

  get sourceRows(): readonly JTableRow[] {
    return this.value.length ? this.value : this.legacyRows;
  }

  get filteredRows(): readonly JTableRow[] {
    if (this.lazy) {
      return this.sourceRows;
    }

    const activeFilters = Object.entries(this.filters).filter(([, value]) => !this.isEmptyFilter(value));
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
        this.globalFields.some((field) => String(row[field] ?? '').toLowerCase().includes(global));

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
      this.striped ? 'j-table--striped' : '',
      this.hover ? 'j-table--hover' : '',
      this.selectable ? 'j-table--selectable' : '',
      this.responsive ? 'j-table--responsive' : '',
      this.scrollable ? 'j-table--scrollable' : '',
      this.stickyHeader ? 'j-table--sticky' : '',
      this.expandableRows ? 'j-table--expandable' : '',
      this.loading ? 'is-loading' : '',
      this.styleClass,
    ].filter(Boolean);
  }

  get scrollStyles(): Record<string, string> | null {
    return this.scrollable && this.scrollHeight ? { 'max-height': this.scrollHeight } : null;
  }

  get colspan(): number {
    return this.resolvedColumns.length + (this.selectionMode === 'checkbox' ? 1 : 0) + (this.expandableRows ? 1 : 0) || 1;
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
    return projected.length ? projected : this.columns;
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
    this.emitLazyLoad();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.lazy && (changes['first'] || changes['rows'] || changes['sortField'] || changes['sortOrder'])) {
      this.emitLazyLoad();
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
      .find((projectedColumn) => projectedColumn.field === column.field || projectedColumn.templateKey === key);

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
      ? [...current, ...this.visibleRows.filter((row) => !current.some((item) => this.rowsEqual(item, row)))]
      : current.filter((row) => !this.visibleRows.some((visibleRow) => this.rowsEqual(visibleRow, row)));

    this.selection = next;
    this.selectionChange.emit(next);
  }

  handleRowClick(row: JTableRow, index: number, originalEvent: MouseEvent): void {
    this.rowClick.emit({ row, index, originalEvent });

    if (this.selectionMode === 'none' || this.selectionMode === 'checkbox') {
      return;
    }

    this.toggleSelection(row);
  }

  handleRowDoubleClick(row: JTableRow, index: number, originalEvent: MouseEvent): void {
    this.rowDoubleClick.emit({ row, index, originalEvent });
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
      return;
    }

    const current = this.isSelectionArray(this.selection) ? [...this.selection] : [];
    const exists = current.some((selected) => this.rowsEqual(selected, row));
    const next = exists ? current.filter((selected) => !this.rowsEqual(selected, row)) : [...current, row];
    this.selection = next;
    this.rowSelect.emit(row);
    this.selectionChange.emit(next);
  }

  toggleSort(column: JTableColumn): void {
    if (!column.sortable) {
      return;
    }

    const nextOrder: JTableSortOrder =
      this.sortField !== column.field ? 1 : this.sortOrder === 1 ? -1 : this.sortOrder === -1 ? 0 : 1;

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
    this.sortChange.emit(sort);
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
    return order === 1 ? 'ascending' : order === -1 ? 'descending' : column.sortable ? 'none' : null;
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
    this.filterChange.emit({ field: change.field, value: change.value, filters });
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
    this.emitLazyLoad();
  }

  handleActionClick(event: JTableActionEvent): void {
    this.actionClick.emit(event);
  }

  handleGlobalFilter(value: string): void {
    this.globalFilter = value;
    this.first = 0;
    this.filterChange.emit({ field: '*', value, filters: this.filters });
    this.emitLazyLoad();
  }

  toggleColumnVisibility(column: JTableColumn, event: Event): void {
    const checked = (event.target as HTMLInputElement | null)?.checked ?? true;
    checked ? this.hiddenColumnFields.delete(column.field) : this.hiddenColumnFields.add(column.field);
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

  handleCellEditKeydown(row: JTableRow, column: JTableColumn, index: number, event: KeyboardEvent): void {
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
      this.rowReorder.emit({ dragIndex: this.dragRowIndex, dropIndex: index, value: next });
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
      this.columnReorder.emit({ dragIndex: this.dragColumnIndex, dropIndex: index, columns: next });
    }
    this.dragColumnIndex = -1;
  }

  saveState(): void {
    if (!this.stateKey || !isPlatformBrowser(this.platformId)) {
      return;
    }
    this.documentRef.defaultView?.localStorage?.setItem(
      this.stateKey,
      JSON.stringify({
        first: this.first,
        rows: this.rows,
        sortField: this.sortField,
        sortOrder: this.sortOrder,
        multiSortMeta: this.multiSortMeta,
        filters: this.filters,
        globalFilter: this.globalFilter,
        hiddenColumns: [...this.hiddenColumnFields],
      }),
    );
  }

  restoreState(): void {
    if (!this.stateKey || !isPlatformBrowser(this.platformId)) {
      return;
    }
    const raw = this.documentRef.defaultView?.localStorage?.getItem(this.stateKey);
    if (!raw) {
      return;
    }
    const state = JSON.parse(raw) as Partial<{
      first: number;
      rows: number;
      sortField: string;
      sortOrder: JTableSortOrder;
      multiSortMeta: readonly JTableSort[];
      filters: Record<string, unknown>;
      globalFilter: string;
      hiddenColumns: readonly string[];
    }>;
    this.first = state.first ?? this.first;
    this.pageRows = state.rows ?? this.pageRows;
    this.sortField = state.sortField ?? this.sortField;
    this.sortOrder = state.sortOrder ?? this.sortOrder;
    this.multiSortMeta = state.multiSortMeta ?? this.multiSortMeta;
    this.filters = state.filters ?? this.filters;
    this.globalFilter = state.globalFilter ?? this.globalFilter;
    this.hiddenColumnFields = new Set(state.hiddenColumns ?? []);
  }

  exportCSV(): string {
    const columns = this.resolvedColumns.filter((column) => column.type !== 'action');
    const rows = this.sortedRows;
    const csv = [
      columns.map((column) => this.escapeCsv(column.header)).join(','),
      ...rows.map((row) => columns.map((column) => this.escapeCsv(this.formattedCellValue(row, column))).join(',')),
    ].join('\n');

    if (isPlatformBrowser(this.platformId)) {
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = this.documentRef.defaultView?.URL.createObjectURL(blob);
      if (url) {
        const anchor = this.documentRef.createElement('a');
        anchor.href = url;
        anchor.download = this.exportFilename;
        anchor.click();
        this.documentRef.defaultView?.URL.revokeObjectURL(url);
      }
    }

    return csv;
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

    return String(value ?? '').toLowerCase().includes(String(filter).toLowerCase());
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
  JTableColumnType,
  JTableEditEvent,
  JTableFilterChange,
  JTableHeaderContext,
  JTableLazyLoadEvent,
  JTablePageChange,
  JTableReorderEvent,
  JTableRow,
  JTableRowClickEvent,
  JTableSelection,
  JTableSelectionMode,
  JTableSort,
} from './table.types';
export type { JTableSortOrder } from '../core/types';
