import { JTableSortOrder } from 'jrng-ui/core';

export type JTableColumnAlign = 'start' | 'center' | 'end' | 'left' | 'right';
export type JTableColumnType =
  'text' | 'number' | 'date' | 'boolean' | 'badge' | 'tag' | 'action' | 'custom';
export type JTableSelectionMode = 'single' | 'multiple' | 'checkbox' | 'none';
export type JTableSize = 'small' | 'medium' | 'large';
export type JTableExportRows = 'all' | 'page' | 'selected';
export type JTableRow = Readonly<Record<string, unknown>>;

export interface JTableAction {
  readonly key?: string;
  readonly label: string;
  readonly icon?: string;
  readonly disabled?: boolean;
  readonly severity?:
    'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  readonly command?: (event: JTableActionEvent) => void;
}

export interface JTableColumn {
  readonly field: string;
  readonly header: string;
  readonly sortable?: boolean;
  readonly filterable?: boolean;
  readonly editable?: boolean;
  readonly reorderable?: boolean;
  readonly resizable?: boolean;
  readonly width?: string;
  readonly minWidth?: string;
  readonly align?: JTableColumnAlign;
  readonly type?: JTableColumnType;
  readonly visible?: boolean;
  readonly frozen?: boolean;
  readonly frozenAlign?: 'left' | 'right';
  readonly templateKey?: string;
  readonly actions?: readonly JTableAction[];
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
  readonly globalFilter?: string;
}

export interface JTableFilterChange {
  readonly field: string;
  readonly value: unknown;
  readonly filters: Record<string, unknown>;
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

export interface JTableCellContext {
  readonly $implicit: JTableRow;
  readonly row: JTableRow;
  readonly column: JTableColumn;
  readonly value: unknown;
  readonly formattedValue: string;
  readonly index: number;
}

export interface JTableHeaderContext {
  readonly $implicit: JTableColumn;
  readonly column: JTableColumn;
}

export type JTableSelection = JTableRow | readonly JTableRow[] | null;
