import { jTableActionsColumn, jTableIndexColumn } from './table-presets';

interface Row {
  id: number;
  actions: string;
}

describe('table column presets', () => {
  it('creates frozen edge columns without sharing mutable objects', () => {
    const index = jTableIndexColumn<Row>('id');
    const actions = jTableActionsColumn<Row>('actions');

    expect(index).toMatchObject({
      header: 'Index',
      frozen: true,
      frozenPosition: 'start',
      sortable: false,
    });
    expect(actions).toMatchObject({
      header: 'Actions',
      type: 'actions',
      frozen: true,
      frozenPosition: 'end',
      filterable: false,
    });
    expect(jTableIndexColumn<Row>('id')).not.toBe(index);
  });

  it('allows page-specific overrides', () => {
    expect(jTableActionsColumn<Row>('actions', { width: '6rem' }).width).toBe('6rem');
  });
});
