import { JTableSortOrder } from '../core/types';

export type JTableColumnAlign = 'start' | 'center' | 'end' | 'left' | 'right';
export type JTableColumnType =
  | 'text'
  | 'number'
  | 'date'
  | 'boolean'
  | 'badge'
  | 'tag'
  | 'action'
  | 'custom';
export type JTableSelectionMode = 'single' | 'multiple' | 'checkbox' | 'none';
export type JTableRow = Readonly<Record<string, unknown>>;

export interface JTableAction {
  readonly key?: string;
  readonly label: string;
  readonly icon?: string;
  readonly disabled?: boolean;
  readonly severity?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  readonly command?: (event: JTableActionEvent) => void;
}

export interface JTableColumn {
  readonly field: string;
  readonly header: string;
  readonly sortable?: boolean;
  readonly filterable?: boolean;
  readonly width?: string;
  readonly minWidth?: string;
  readonly align?: JTableColumnAlign;
  readonly type?: JTableColumnType;
  readonly visible?: boolean;
  readonly frozen?: boolean;
  readonly templateKey?: string;
  readonly actions?: readonly JTableAction[];
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
