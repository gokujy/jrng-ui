import { JTableSortOrder } from 'jrng-ui/core';

export type JTableColumnAlign = 'start' | 'center' | 'end' | 'left' | 'right';
export type JTableColumnType =
  | 'text'
  | 'number'
  | 'date'
  | 'boolean'
  | 'image'
  | 'status'
  | 'actions'
  | 'custom'
  // Backward-compatible aliases.
  | 'badge'
  | 'tag'
  | 'action';
export type JTableSelectionMode = 'single' | 'multiple' | 'checkbox' | 'none';
export type JTableSize = 'small' | 'medium' | 'large';
export type JTableDensity = 'compact' | 'comfortable' | 'spacious';
export type JTableVariant =
  | 'default'
  | 'striped'
  | 'bordered'
  | 'minimal'
  | 'card'
  // Backward-compatible presentation names.
  | 'gridlines'
  | 'operations';
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
}

export interface JTableConfig {
  readonly pagination?: boolean;
  readonly sortable?: boolean;
  readonly multiSort?: boolean;
  readonly filterRow?: boolean;
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
  readonly size?: JTableSize;
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
  readonly version?: 1;
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
  readonly size: JTableSize;
  readonly density?: JTableDensity;
}

export interface JTableStateRestoreError {
  readonly key: string;
  readonly reason: 'storage-unavailable' | 'invalid-json' | 'invalid-shape' | 'unsupported-version';
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
