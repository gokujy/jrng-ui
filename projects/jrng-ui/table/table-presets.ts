import { JTableColumn, JTableColumnField } from './table.types';

/** Creates the compact, frozen index column commonly used at the start of operational tables. */
export function jTableIndexColumn<T extends object>(
  field: JTableColumnField<T>,
  overrides: Partial<JTableColumn<T>> = {},
): JTableColumn<T> {
  return {
    field,
    header: 'Index',
    align: 'center',
    headerAlign: 'center',
    sortable: false,
    filterable: false,
    frozen: true,
    frozenPosition: 'start',
    width: '4.5rem',
    minWidth: '4.5rem',
    hideable: false,
    ...overrides,
  };
}

/** Creates the compact, frozen action column commonly used at the end of operational tables. */
export function jTableActionsColumn<T extends object>(
  field: JTableColumnField<T>,
  overrides: Partial<JTableColumn<T>> = {},
): JTableColumn<T> {
  return {
    field,
    header: 'Actions',
    type: 'actions',
    align: 'center',
    headerAlign: 'center',
    sortable: false,
    filterable: false,
    frozen: true,
    frozenPosition: 'end',
    width: '8.5rem',
    minWidth: '8.5rem',
    hideable: false,
    ...overrides,
  };
}
