import { JDensity, JTableSortOrder } from 'jrng-ui/core';

export type JTableColumnAlign = 'start' | 'center' | 'end';
export type JTableColumnResizeMode = 'expand' | 'fit';
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
/** Where column filtering controls are rendered. `none` is retained as a compatibility escape hatch. */
export type JTableFilterDisplay = 'row' | 'menu' | 'toolbar' | 'none';
export type JTableSelectionMode = 'none' | 'single' | 'multiple' | 'checkbox' | 'radio';
export type JTableExpansionMode = 'single' | 'multiple';
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
export type JTableVariant = 'standard' | 'gridlines' | 'striped' | 'minimal' | 'enterprise';
export type JTableLoadingVariant = 'skeleton' | 'spinner' | 'progress' | 'overlay';
export type JTableEmptyState = 'no-data' | 'no-results' | 'error';
export type JTableEmptyStateMode = 'auto' | JTableEmptyState;
export type JTableExportRows = 'all' | 'filtered' | 'page' | 'selected' | 'visible';
export type JTableExportFormat = 'csv' | 'excel' | 'pdf' | (string & Record<never, never>);
export type JTableRow = Readonly<Record<string, unknown>>;
export type JTableColumnField<T extends object = JTableRow> = Extract<keyof T, string>;
export type JTableFilterType =
  | 'text'
  | 'number'
  | 'date'
  | 'date-range'
  | 'date-time'
  | 'time'
  | 'boolean'
  | 'enum'
  | 'select'
  | 'multi-select'
  | 'custom';
export type JTableFilterDataType = JTableFilterType;
export type JTableFilterValue =
  | string
  | number
  | boolean
  | Date
  | null
  | undefined
  | readonly unknown[]
  | Readonly<Record<string, unknown>>;
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

export type JTableCustomFilterMatcher<TRow extends object = JTableRow> = (
  cellValue: unknown,
  filterValue: JTableFilterValue,
  constraint: JTableFilterConstraint,
  row: TRow,
  field: string,
) => boolean;

export interface JTableFilterField<TValue extends JTableFilterValue = JTableFilterValue> {
  readonly field: string;
  readonly label: string;
  readonly dataType: JTableFilterDataType;
  readonly operator?: JTableFilterOperator;
  readonly operators?: readonly JTableFilterOperator[];
  readonly value?: TValue;
  readonly placeholder?: string;
  readonly options?: readonly JTableFilterOption[];
  readonly matcher?: JTableCustomFilterMatcher;
}

export interface JTablePagination {
  readonly pageIndex: number;
  readonly pageSize: number;
  readonly total?: number;
}

export interface JTableFilterConstraint<TValue = unknown> {
  readonly id?: string;
  readonly value: TValue;
  readonly matchMode: JTableMatchMode | JTableFilterOperator;
  readonly operator?: JTableConstraintOperator;
}

export interface JTableFilterMetadata<TValue = unknown> {
  readonly field?: string;
  readonly operator?: JTableConstraintOperator;
  readonly constraints: readonly JTableFilterConstraint<TValue>[];
}

export interface JTableActiveFilterMetadata<TValue = unknown> extends JTableFilterMetadata<TValue> {
  readonly field: string;
  readonly label: string;
  readonly dataType: JTableFilterDataType;
  readonly active: true;
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
  /**
   * Pins the column to a viewport edge. `start` and `end` follow the document
   * writing direction; `left` and `right` remain compatibility aliases.
   */
  readonly frozenAlign?: 'start' | 'end' | 'left' | 'right';
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
  /** Backend/row field used by this filter when it differs from the displayed column field. */
  readonly field?: string;
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
  readonly disabled?: boolean;
  readonly readonly?: boolean;
  readonly invalid?: boolean;
  readonly error?: string;
  readonly matcher?: JTableCustomFilterMatcher;
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
  /** Optional per-field constraint groups; each group applies its own AND/OR operator. */
  readonly groups?: readonly JTableFieldFilter[];
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
  /** Keeps long content on one line by default. Set to true to allow wrapping. */
  readonly wrap?: boolean;
  readonly type?: JTableColumnType;
  readonly visible?: boolean;
  readonly hidden?: boolean;
  readonly frozen?: boolean;
  readonly frozenAlign?: 'start' | 'end' | 'left' | 'right';
  /** Preferred alias for `frozenAlign`. */
  readonly frozenPosition?: 'start' | 'end' | 'left' | 'right';
  readonly responsivePriority?: number;
  readonly templateKey?: string;
  readonly actions?: readonly JTableAction[];
  cellClass?(row: T, column: JTableColumn<T>, index: number): string;
  rowSpan?(row: T, index: number, rows: readonly T[]): number;
  valueGetter?(row: T, column: JTableColumn<T>): unknown;
  formatter?(value: unknown, row: T, column: JTableColumn<T>): string | number | null | undefined;
  sortComparator?(left: T, right: T, column: JTableColumn<T>): number;
}

export type JTableToolbarActionKey =
  'columns' | 'filters' | 'clear-filters' | 'refresh' | 'export' | 'fullscreen';

export interface JTableToolbarAction {
  readonly key: JTableToolbarActionKey;
  readonly label?: string;
  readonly icon?: string;
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly severity?:
    'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
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

/** An export format displayed in the table toolbar. Omit a format to hide it. */
export interface JTableExportFormatOption {
  readonly format: JTableExportFormat;
  readonly label?: string;
  readonly icon?: string;
  readonly disabled?: boolean;
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
  /** Inclusive virtual-window start when emitted by virtual scrolling. */
  readonly virtualFirst?: number;
  /** Exclusive virtual-window end when emitted by virtual scrolling. */
  readonly virtualLast?: number;
  readonly sortField?: string;
  readonly sortOrder?: JTableSortOrder;
  readonly multiSortMeta?: readonly JTableSort[];
  readonly filters?: Record<string, unknown>;
  readonly filterModel?: JTableFilterModel;
  readonly filterMetadata?: Record<string, JTableFilterMetadata>;
  readonly globalFilter?: string;
}

export interface JTableFilterEvent {
  readonly filters: Record<string, JTableFilterMetadata>;
  readonly filteredValue?: readonly unknown[];
  readonly first: number;
  readonly rows: number;
  readonly sortField?: string;
  readonly sortOrder?: 1 | -1;
  readonly multiSortMeta?: readonly JTableSort[];
  readonly filterModel: JTableFilterModel;
}

export interface JTableFilterChange {
  readonly field: string;
  readonly value: unknown;
  /** Compatibility flat value map. Prefer `JTableFilterEvent.filters` for new integrations. */
  readonly filters: Record<string, unknown>;
  readonly metadata: Record<string, JTableFilterMetadata>;
  readonly filterItem?: JTableFilterItem;
  readonly filterModel: JTableFilterModel;
  readonly first: number;
  readonly rows: number;
  readonly filteredValue?: readonly unknown[];
}

export interface JTableLazyFilterRequest extends JTableFilterEvent {
  readonly filteredValue?: undefined;
  readonly globalFilter?: string;
}

export interface JTableRowClickEvent {
  readonly row: JTableRow;
  readonly index: number;
  readonly originalEvent: MouseEvent | KeyboardEvent;
}

export interface JTableHeaderContextMenuEvent {
  readonly column: JTableColumn;
  readonly index: number;
  readonly originalEvent: MouseEvent;
}

export interface JTableColumnGroupCell {
  readonly header: string;
  readonly colspan?: number;
  readonly rowspan?: number;
  readonly align?: JTableColumnAlign;
}

export type JTableColumnGroupRow = readonly JTableColumnGroupCell[];

export interface JTableSelectAllChangeEvent {
  readonly selected: boolean;
  readonly rows: readonly JTableRow[];
  readonly selection: JTableSelection;
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
  readonly filterModel?: JTableFilterModel;
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
  readonly operator: JTableFilterOperator;
  readonly updateValue: (value: unknown) => void;
  readonly updateOperator: (operator: JTableFilterOperator) => void;
  readonly apply: (value?: unknown) => void;
  readonly clear: () => void;
  readonly close: () => void;
  readonly active: boolean;
}

export type JTableSelection = JTableRow | readonly JTableRow[] | null;
