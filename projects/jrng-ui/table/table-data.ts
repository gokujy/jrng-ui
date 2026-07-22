import {
  JTableColumn,
  JTableColumnState,
  JTableFieldFilter,
  JTableFilterItem,
  JTableMatchMode,
  JTableQueryMapper,
  JTableQuerySource,
  JTableRow,
  JTableServerQuery,
  JTableSort,
  JTableStateStorageAdapter,
} from './table.types';

export interface JTableSerializeOptions<TMapped = JTableServerQuery> {
  readonly customFilterSerializers?: Readonly<Record<string, (item: JTableFilterItem) => unknown>>;
  readonly map?: JTableQueryMapper<TMapped>;
}

export interface JTableProcessOptions {
  readonly filters?: Readonly<Record<string, unknown>>;
  readonly filterModel?: {
    readonly items: readonly JTableFilterItem[];
    readonly logicOperator?: 'and' | 'or';
  };
  readonly globalFilter?: string;
  readonly globalFields?: readonly string[];
  readonly sorts?: readonly JTableSort[];
}

export function jProcessTableData<TRow extends object>(
  rows: readonly TRow[],
  options: JTableProcessOptions = {},
): readonly TRow[] {
  const fieldFilters = Object.entries(options.filters ?? {}).filter(
    ([, value]) => value != null && value !== '',
  );
  const constraints = options.filterModel?.items ?? [];
  const global = options.globalFilter?.trim().toLocaleLowerCase() ?? '';
  const filtered = rows.filter((row) => {
    const record = row as Readonly<Record<string, unknown>>;
    const matchesFieldFilters = fieldFilters.every(([field, value]) =>
      jMatchTableValue(record[field], value, 'contains'),
    );
    const matches = constraints.map((item) =>
      jMatchTableValue(record[item.field], item.value, normalizeMatchMode(item.operator)),
    );
    const matchesConstraints =
      !matches.length ||
      (options.filterModel?.logicOperator === 'or'
        ? matches.some(Boolean)
        : matches.every(Boolean));
    const matchesGlobal =
      !global ||
      (options.globalFields ?? []).some((field) =>
        String(record[field] ?? '')
          .toLocaleLowerCase()
          .includes(global),
      );
    return matchesFieldFilters && matchesConstraints && matchesGlobal;
  });
  const sorts = (options.sorts ?? []).filter((sort) => sort.order !== 0);
  return sorts.length
    ? [...filtered].sort((left, right) => {
        const first = left as Readonly<Record<string, unknown>>;
        const second = right as Readonly<Record<string, unknown>>;
        for (const sort of sorts) {
          const result = compare(first[sort.field], second[sort.field]) * sort.order;
          if (result) return result;
        }
        return 0;
      })
    : filtered;
}

export function jSerializeTableQuery<TMapped = JTableServerQuery>(
  source: JTableQuerySource,
  options: JTableSerializeOptions<TMapped> = {},
): TMapped | JTableServerQuery {
  const pageSize = Math.max(1, Math.trunc(source.rows ?? 10));
  const sorts = normalizeSorts(source);
  const grouped = new Map<string, JTableFilterItem[]>();
  for (const item of source.filterModel?.items ?? []) {
    grouped.set(item.field, [...(grouped.get(item.field) ?? []), item]);
  }
  const filters = [...grouped.entries()].map(
    ([field, items]) =>
      ({
        field,
        operator: source.filterModel?.logicOperator ?? 'and',
        constraints: items.map((item) => ({
          value: serializeFilterValue(
            item,
            source.timezone,
            options.customFilterSerializers?.[item.field],
          ),
          matchMode: normalizeMatchMode(item.operator),
        })),
      }) satisfies JTableFieldFilter,
  );
  const query: JTableServerQuery = {
    pageIndex: Math.max(0, Math.floor(Math.max(0, source.first ?? 0) / pageSize)),
    pageSize,
    sorts,
    globalSearch: source.globalFilter?.trim() || undefined,
    filters,
    permanentFilters: source.permanentFilters ?? [],
    hiddenFilters: source.hiddenFilters ?? [],
    selectedColumns: source.selectedColumns ?? [],
    timezone: source.timezone,
  };
  return options.map ? options.map({ query, source }) : query;
}

export function jMatchTableValue(
  value: unknown,
  filter: unknown,
  mode: JTableMatchMode | string,
): boolean {
  const left = String(value ?? '').toLocaleLowerCase();
  const right = String(filter ?? '').toLocaleLowerCase();
  switch (mode) {
    case 'startsWith':
      return left.startsWith(right);
    case 'contains':
      return left.includes(right);
    case 'notContains':
      return !left.includes(right);
    case 'endsWith':
      return left.endsWith(right);
    case 'equals':
    case 'dateIs':
      return compare(value, filter) === 0;
    case 'notEquals':
    case 'dateIsNot':
      return compare(value, filter) !== 0;
    case 'isEmpty':
      return value == null || value === '';
    case 'isNotEmpty':
      return value != null && value !== '';
    case 'lessThan':
    case 'dateBefore':
      return compare(value, filter) < 0;
    case 'lessThanOrEqual':
      return compare(value, filter) <= 0;
    case 'greaterThan':
    case 'dateAfter':
      return compare(value, filter) > 0;
    case 'greaterThanOrEqual':
      return compare(value, filter) >= 0;
    case 'between':
    case 'dateBetween':
      return (
        Array.isArray(filter) &&
        filter.length >= 2 &&
        compare(value, filter[0]) >= 0 &&
        compare(value, filter[1]) <= 0
      );
    case 'in':
      return Array.isArray(filter) && filter.some((item) => compare(value, item) === 0);
    case 'notIn':
      return Array.isArray(filter) && filter.every((item) => compare(value, item) !== 0);
    default:
      return true;
  }
}

export function jCreateMemoryTableStorage(): JTableStateStorageAdapter {
  const state = new Map<string, string>();
  return {
    get: (key) => state.get(key) ?? null,
    set: (key, value) => void state.set(key, value),
    remove: (key) => void state.delete(key),
  };
}

export class JTableColumnManager<TRow extends object = JTableRow> {
  private initial: readonly JTableColumn<TRow>[];
  private columns: JTableColumn<TRow>[];
  constructor(columns: readonly JTableColumn<TRow>[]) {
    this.initial = [...columns];
    this.columns = [...columns];
  }
  value(): readonly JTableColumn<TRow>[] {
    return this.columns;
  }
  search(query: string): readonly JTableColumn<TRow>[] {
    const normalized = query.trim().toLocaleLowerCase();
    return normalized
      ? this.columns.filter((column) =>
          `${column.header} ${column.field}`.toLocaleLowerCase().includes(normalized),
        )
      : this.columns;
  }
  setVisible(field: string, visible: boolean): void {
    this.columns = this.columns.map((column) =>
      column.field === field && column.hideable !== false && !column.required
        ? { ...column, visible }
        : column,
    );
  }
  selectAll(visible = true): void {
    this.columns = this.columns.map((column) =>
      column.hideable === false || column.required ? column : { ...column, visible },
    );
  }
  move(field: string, toIndex: number): void {
    const from = this.columns.findIndex((column) => column.field === field);
    if (from < 0) return;
    const next = [...this.columns];
    const [column] = next.splice(from, 1);
    if (column) next.splice(Math.max(0, Math.min(toIndex, next.length)), 0, column);
    this.columns = next;
  }
  freeze(field: string, frozen = true): void {
    this.columns = this.columns.map((column) =>
      column.field === field ? { ...column, frozen } : column,
    );
  }
  reset(): void {
    this.columns = [...this.initial];
  }
  state(): readonly JTableColumnState[] {
    return this.columns.map((column, order) => ({
      field: column.field,
      visible: column.visible !== false && column.hidden !== true,
      order,
      width: column.width,
      frozen: column.frozen,
      frozenAlign: column.frozenAlign,
    }));
  }
}

function normalizeSorts(source: JTableQuerySource): readonly JTableSort[] {
  if (source.multiSortMeta?.length) return source.multiSortMeta.filter((sort) => sort.order !== 0);
  return source.sortField && source.sortOrder
    ? [{ field: source.sortField, order: source.sortOrder }]
    : [];
}
function normalizeMatchMode(operator: string): JTableMatchMode {
  const aliases: Record<string, JTableMatchMode> = { before: 'dateBefore', after: 'dateAfter' };
  return aliases[operator] ?? (operator as JTableMatchMode);
}
function serializeFilterValue(
  item: JTableFilterItem,
  timezone?: string,
  custom?: (item: JTableFilterItem) => unknown,
): unknown {
  if (custom) return custom(item);
  const normalize = (value: unknown): unknown => {
    if (value instanceof Date) return { value: value.toISOString(), timezone };
    if (Array.isArray(value)) return value.map(normalize);
    return value;
  };
  return normalize(item.value);
}
function compare(left: unknown, right: unknown): number {
  const leftDate = dateNumber(left);
  const rightDate = dateNumber(right);
  if (
    leftDate != null &&
    rightDate != null &&
    (left instanceof Date ||
      right instanceof Date ||
      (typeof left === 'string' && /^\d{4}-\d{2}-\d{2}/.test(left)))
  )
    return leftDate - rightDate;
  if (typeof left === 'number' && typeof right === 'number') return left - right;
  return String(left ?? '').localeCompare(String(right ?? ''), undefined, {
    numeric: true,
    sensitivity: 'base',
  });
}
function dateNumber(value: unknown): number | null {
  if (!(value instanceof Date) && typeof value !== 'string' && typeof value !== 'number')
    return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.getTime();
}
