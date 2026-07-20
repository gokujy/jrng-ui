import {
  JTableColumnManager,
  jCreateMemoryTableStorage,
  jMatchTableValue,
  jSerializeTableQuery,
} from './table-data';

describe('table data infrastructure', () => {
  it('serializes stable server queries with multi-sort and normalized dates', () => {
    const date = new Date('2026-01-02T00:00:00.000Z');
    expect(
      jSerializeTableQuery({
        first: 20,
        rows: 10,
        multiSortMeta: [
          { field: 'name', order: 1 },
          { field: 'created', order: -1 },
        ],
        globalFilter: ' test ',
        timezone: 'Asia/Calcutta',
        selectedColumns: ['name'],
        filterModel: {
          items: [{ field: 'created', operator: 'before', value: date }],
          logicOperator: 'and',
        },
      }),
    ).toEqual({
      pageIndex: 2,
      pageSize: 10,
      sorts: [
        { field: 'name', order: 1 },
        { field: 'created', order: -1 },
      ],
      globalSearch: 'test',
      filters: [
        {
          field: 'created',
          operator: 'and',
          constraints: [
            {
              value: { value: date.toISOString(), timezone: 'Asia/Calcutta' },
              matchMode: 'dateBefore',
            },
          ],
        },
      ],
      permanentFilters: [],
      hiddenFilters: [],
      selectedColumns: ['name'],
      timezone: 'Asia/Calcutta',
    });
  });

  it('matches data types and manages columns', () => {
    expect(jMatchTableValue(5, [1, 10], 'between')).toBe(true);
    expect(jMatchTableValue('Alpha', 'ph', 'contains')).toBe(true);
    const manager = new JTableColumnManager([
      { field: 'id', header: 'ID', required: true },
      { field: 'name', header: 'Name' },
    ]);
    manager.setVisible('id', false);
    manager.setVisible('name', false);
    expect(manager.state().map((column) => column.visible)).toEqual([true, false]);
    manager.move('name', 0);
    expect(manager.value()[0]?.field).toBe('name');
    manager.reset();
    expect(manager.value()[0]?.field).toBe('id');
  });

  it('provides isolated memory state storage', async () => {
    const storage = jCreateMemoryTableStorage();
    await storage.set('table', '{"version":2}');
    expect(await storage.get('table')).toBe('{"version":2}');
    await storage.remove('table');
    expect(await storage.get('table')).toBeNull();
  });

  it('groups AND/OR constraints by field', () => {
    const query = jSerializeTableQuery({
      first: 0,
      rows: 25,
      filterModel: {
        logicOperator: 'or',
        items: [
          { field: 'amount', operator: 'greaterThan', value: 10 },
          { field: 'amount', operator: 'lessThan', value: 100 },
        ],
      },
    });
    expect(query.filters).toEqual([
      {
        field: 'amount',
        operator: 'or',
        constraints: [
          { matchMode: 'greaterThan', value: 10 },
          { matchMode: 'lessThan', value: 100 },
        ],
      },
    ]);
  });
});
