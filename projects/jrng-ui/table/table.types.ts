import { JDensity, JTableSortOrder } from 'jrng-ui/core';

export type JTableColumnAlign = 'start' | 'center' | 'end';
export type JTableColumnType =
  | 'text'
  | 'number'
  | 'date'
  | 'boolean'
  | 'image'
  | 'status'
  | 'badge'
  | 'tag'
  | 'actions'
  | 'custom';
export type JTableFilterDisplay = 'toolbar' | 'row' | 'menu' | 'none';
export type JTableSelectionMode = 'none' | 'single' | 'multiple' | 'checkbox' | 'radio';
export type JTableEditMode = 'none' | 'cell' | 'row';
export type JTableDataMode = 'client' | 'server' | 'lazy' | 'virtual';
export type JTableResponsiveMode = 'scroll' | 'stack' | 'card' | 'none';
export type JTableMatchMode =
  | 'startsWith'
  | 'contains'
  | 'notContains'
  | 'endsWith'
  | 'equals'
  | 'notEquals'
  | 'isEmpty'
  | 'isNotEmpty'
  | 'lessThan'
  | 'lessThanOrEqual'
  | 'greaterThan'
  | 'greaterThanOrEqual'
  | 'between'
  | 'in'
  | 'notIn'
  | 'dateIs'
  | 'dateIsNot'
  | 'dateBefore'
  | 'dateAfter'
  | 'dateBetween';
export type JTableDensity = JDensity;
export type JTableVariant = 'standard' | 'gridlines' | 'striped' | 'minimal';
export type JTableLoadingVariant = 'skeleton' | 'spinner' | 'progress' | 'overlay';
export type JTableEmptyState = 'no-data' | 'no-results' | 'error';
export type JTableEmptyStateMode = 'auto' | JTableEmptyState;
export type JTableExportRows = 'all' | 'page' | 'selected';
export type JTableRow = Readonly<Record<string, unknown>>;
export type JTableColumnField<T extends object = JTableRow> = Extract<keyof T, string>;
export type JTableFilterType =
  'text' | 'number' | 'date' | 'date-time' | 'time' | 'boolean' | 'select' | 'multi-select';
export type JTableFilterOperator =
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith'
  | 'equals'
  | 'notEquals'
  | 'lessThan'
  | 'lessThanOrEqual'
  | 'greaterThan'
  | 'greaterThanOrEqual'
  | 'between'
  | 'before'
  | 'after'
  | 'in'
  | 'notIn'
  | 'isTrue'
  | 'isFalse'
  | 'isEmpty'
  | 'isNotEmpty';

export type JTableConstraintOperator = 'and' | 'or';
export type JTableStateStorage = 'local' | 'session' | 'memory' | 'custom';

export interface JTablePagination {
  readonly pageIndex: number;
  readonly pageSize: number;
  readonly total?: number;
}

export interface JTableFilterConstraint<TValue = unknown> {
  readonly value: TValue;
  readonly matchMode: JTableMatchMode | JTableFilterOperator;
  readonly operator?: JTableConstraintOperator;
}

export interface JTableFieldFilter<TValue = unknown> {
  readonly field: string;
  readonly constraints: readonly JTableFilterConstraint<TValue>[];
  readonly operator?: JTableConstraintOperator;
  readonly hidden?: boolean;
  readonly permanent?: boolean;
}

export interface JTableColumnState {
  readonly field: string;
  readonly visible: boolean;
  readonly order: number;
  readonly width?: string;
  readonly frozen?: boolean;
  readonly frozenAlign?: 'left' | 'right';
}

export interface JTableSelectionState<TKey = string> {
  readonly mode: JTableSelectionMode;
  readonly keys: readonly TKey[];
}

export interface JTableExpansionState<TKey = string> {
  readonly keys: readonly TKey[];
}
export interface JTableEditingState<TKey = string> {
  readonly mode: JTableEditMode;
  readonly rowKeys: readonly TKey[];
  readonly cells: readonly { rowKey: TKey; field: string }[];
}

export interface JTableServerQuery<TCustom = unknown> {
  readonly pageIndex: number;
  readonly pageSize: number;
  readonly sorts: readonly JTableSort[];
  readonly globalSearch?: string;
  readonly filters: readonly JTableFieldFilter[];
  readonly permanentFilters: readonly JTableFieldFilter[];
  readonly hiddenFilters: readonly JTableFieldFilter[];
  readonly selectedColumns: readonly string[];
  readonly timezone?: string;
  readonly custom?: TCustom;
}

export interface JTableServerResponse<TRow> {
  readonly data: readonly TRow[];
  readonly total: number;
  readonly pageIndex?: number;
  readonly pageSize?: number;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface JTableQuerySource {
  readonly first?: number;
  readonly rows?: number;
  readonly sortField?: string;
  readonly sortOrder?: JTableSortOrder;
  readonly multiSortMeta?: readonly JTableSort[];
  readonly globalFilter?: string;
  readonly filterModel?: JTableFilterModel;
  readonly permanentFilters?: readonly JTableFieldFilter[];
  readonly hiddenFilters?: readonly JTableFieldFilter[];
  readonly selectedColumns?: readonly string[];
  readonly timezone?: string;
}

export interface JTableQuerySerializerContext<TCustom = unknown> {
  readonly query: JTableServerQuery<TCustom>;
  readonly source: JTableQuerySource;
}

export type JTableQueryMapper<TMapped, TCustom = unknown> = (
  context: JTableQuerySerializerContext<TCustom>,
) => TMapped;

export interface JTableStateStorageAdapter {
  get(key: string): string | null | Promise<string | null>;
  set(key: string, value: string): void | Promise<void>;
  remove(key: string): void | Promise<void>;
}

export interface JTableCustomFilterDefinition<TValue = unknown> {
  readonly key: string;
  readonly label: string;
  readonly matchModes: readonly JTableMatchMode[];
  serialize?(value: TValue, constraint: JTableFilterConstraint<TValue>): unknown;
  predicate?(cellValue: unknown, filterValue: TValue): boolean;
}

export interface JTableExportAdapterContext<TRow extends object = JTableRow> {
  readonly rows: readonly TRow[];
  readonly columns: readonly JTableColumn<TRow>[];
  readonly filename: string;
  readonly format: 'excel' | 'pdf' | string;
}

export type JTableExportAdapter<TRow extends object = JTableRow> = (
  context: JTableExportAdapterContext<TRow>,
) => void | Promise<void>;

export interface JTableTemplateContext<TRow extends object = JTableRow> {
  readonly row: TRow;
  readonly column: JTableColumn<TRow>;
  readonly rowIndex: number;
  readonly columnIndex: number;
}

export interface JTableFilterOption<T = unknown> {
  readonly label: string;
  readonly value: T;
  readonly disabled?: boolean;
  readonly icon?: string;
}

export interface JTableColumnFilter {
  readonly type?: JTableFilterType;
  readonly operator?: JTableFilterOperator;
  readonly operators?: readonly JTableFilterOperator[];
  readonly options?: readonly JTableFilterOption[];
  readonly placeholder?: string;
  readonly ariaLabel?: string;
  readonly hideOperator?: boolean;
  readonly min?: number | string;
  readonly max?: number | string;
  readonly step?: number;
}

export interface JTableFilterItem {
  readonly id?: string;
  readonly field: string;
  readonly operator: JTableFilterOperator;
  readonly value?: unknown;
}

export interface JTableFilterModel {
  readonly items: readonly JTableFilterItem[];
  readonly logicOperator?: 'and' | 'or';
}

export interface JTableAction {
  readonly key?: string;
  readonly label: string;
  readonly icon?: string;
  readonly disabled?: boolean;
  readonly severity?:
    'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  readonly command?: (event: JTableActionEvent) => void;
}

export interface JTableColumn<T extends object = JTableRow> {
  readonly field: JTableColumnField<T>;
  readonly header: string;
  readonly sortable?: boolean;
  readonly filterable?: boolean;
  readonly filter?: JTableColumnFilter;
  readonly editable?: boolean;
  readonly readonly?: boolean;
  readonly required?: boolean;
  readonly hideable?: boolean;
  conditionalEditable?(row: T): boolean;
  validate?(value: unknown, row: T, column: JTableColumn<T>): string | null;
  validateAsync?(value: unknown, row: T, column: JTableColumn<T>): Promise<string | null>;
  readonly reorderable?: boolean;
  readonly resizable?: boolean;
  readonly width?: string;
  readonly minWidth?: string;
  readonly maxWidth?: string;
  readonly align?: JTableColumnAlign;
  readonly headerAlign?: JTableColumnAlign;
  readonly type?: JTableColumnType;
  readonly visible?: boolean;
  readonly hidden?: boolean;
  readonly frozen?: boolean;
  readonly frozenAlign?: 'left' | 'right';
  readonly templateKey?: string;
  readonly actions?: readonly JTableAction[];
  valueGetter?(row: T, column: JTableColumn<T>): unknown;
  formatter?(value: unknown, row: T, column: JTableColumn<T>): string | number | null | undefined;
  sortComparator?(left: T, right: T, column: JTableColumn<T>): number;
}

export interface JTableSkeletonColumn {
  readonly width?: string;
}

export interface JTableLoadingContext {
  readonly $implicit: JTableLoadingVariant;
  readonly variant: JTableLoadingVariant;
  readonly rows: number;
  readonly columns: number;
}

export interface JTableEmptyContext {
  readonly $implicit: JTableEmptyState;
  readonly state: JTableEmptyState;
  readonly title: string;
  readonly description: string;
  readonly icon: string;
  readonly error: unknown;
  readonly action: () => void;
}

export interface JTableEmptyActionEvent {
  readonly state: JTableEmptyState;
  readonly error: unknown;
}

export interface JTableExportOptions {
  readonly rows?: JTableExportRows;
  readonly visibleColumnsOnly?: boolean;
  readonly filename?: string;
  readonly valueFormatter?: (value: unknown, row: JTableRow, column: JTableColumn) => unknown;
  readonly serverExport?: (query: unknown) => void | Promise<void>;
}

export interface JTableConfig {
  readonly pagination?: boolean;
  readonly sortable?: boolean;
  readonly multiSort?: boolean;
  readonly filterDisplay?: JTableFilterDisplay;
  readonly columnFilter?: boolean;
  readonly headerFilter?: boolean;
  readonly globalSearch?: boolean;
  readonly reorderableRows?: boolean;
  readonly lockableRows?: boolean;
  readonly reorderableColumns?: boolean;
  readonly resizableColumns?: boolean;
  readonly frozenColumns?: boolean;
  readonly maximizable?: boolean;
  readonly exportable?: boolean;
  readonly stateful?: boolean;
  readonly columnManager?: boolean;
  readonly density?: JTableDensity;
  readonly pageSize?: number;
  readonly rowsPerPageOptions?: readonly number[];
  readonly selectionMode?: JTableSelectionMode;
  readonly export?: JTableExportOptions;
}

export interface JTableSort {
  readonly field: string;
  readonly order: JTableSortOrder;
  readonly direction?: 'asc' | 'desc' | 'none';
}

export interface JTablePageChange {
  readonly first: number;
  readonly rows: number;
  readonly page: number;
  readonly pageCount: number;
  readonly pageSize: number;
}

export interface JTableLazyLoadEvent {
  readonly first: number;
  readonly rows: number;
  readonly sortField?: string;
  readonly sortOrder?: JTableSortOrder;
  readonly multiSortMeta?: readonly JTableSort[];
  readonly filters?: Record<string, unknown>;
  readonly filterModel?: JTableFilterModel;
  readonly globalFilter?: string;
}

export interface JTableFilterChange {
  readonly field: string;
  readonly value: unknown;
  readonly filters: Record<string, unknown>;
  readonly filterItem?: JTableFilterItem;
  readonly filterModel?: JTableFilterModel;
}

export interface JTableRowClickEvent {
  readonly row: JTableRow;
  readonly index: number;
  readonly originalEvent: MouseEvent | KeyboardEvent;
}

export interface JTableEditEvent {
  readonly row: JTableRow;
  readonly column?: JTableColumn;
  readonly field?: string;
  readonly value?: unknown;
  readonly index: number;
  readonly originalEvent?: Event;
}

export interface JTableReorderEvent {
  readonly dragIndex: number;
  readonly dropIndex: number;
  readonly value: readonly JTableRow[];
}

export interface JTableColumnReorderEvent {
  readonly dragIndex: number;
  readonly dropIndex: number;
  readonly columns: readonly JTableColumn[];
}

export interface JTableColumnResizeEvent {
  readonly column: JTableColumn;
  readonly field: string;
  readonly width: string;
}

export interface JTableColumnVisibilityChangeEvent {
  readonly column: JTableColumn;
  readonly field: string;
  readonly visible: boolean;
  readonly visibleColumns: readonly JTableColumn[];
}

export interface JTableRowLockEvent {
  readonly row: JTableRow;
  readonly index: number;
  readonly key: string;
}

export interface JTableExportEvent {
  readonly filename: string;
  readonly options: JTableExportOptions;
  readonly rows: readonly JTableRow[];
  readonly columns: readonly JTableColumn[];
  readonly csv: string;
  defaultPrevented: boolean;
  preventDefault(): void;
}

export interface JTableState {
  readonly version: 1;
  readonly first: number;
  readonly rows: number;
  readonly sortField: string;
  readonly sortOrder: JTableSortOrder;
  readonly multiSortMeta: readonly JTableSort[];
  readonly filters: Record<string, unknown>;
  readonly globalFilter: string;
  readonly hiddenColumns: readonly string[];
  readonly columnOrder: readonly string[];
  readonly columnWidths: Record<string, string>;
  readonly lockedRows: readonly string[];
  readonly density: JTableDensity;
  readonly columns?: readonly JTableColumnState[];
  readonly expandedRows?: readonly string[];
  readonly selectionKeys?: readonly string[];
}

export interface JTableStateRestoreError {
  readonly key: string;
  readonly reason: 'storage-unavailable' | 'invalid-json' | 'invalid-shape';
  readonly error?: unknown;
}

export interface JTableActionEvent {
  readonly action: JTableAction;
  readonly row: JTableRow;
  readonly index: number;
  readonly originalEvent: MouseEvent | KeyboardEvent;
}

export interface JTableCellContext<T extends object = JTableRow> {
  readonly $implicit: T;
  readonly row: T;
  readonly column: JTableColumn<T>;
  readonly value: unknown;
  readonly formattedValue: string;
  readonly index: number;
}

export interface JTableHeaderContext<T extends object = JTableRow> {
  readonly $implicit: JTableColumn<T>;
  readonly column: JTableColumn<T>;
}

export interface JTableFilterContext<T extends object = JTableRow> extends JTableHeaderContext<T> {
  readonly value: unknown;
  readonly apply: (value: unknown) => void;
}

export type JTableSelection = JTableRow | readonly JTableRow[] | null;
