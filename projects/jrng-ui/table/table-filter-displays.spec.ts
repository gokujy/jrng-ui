import { TestBed } from '@angular/core/testing';
import { JTableComponent } from './table.component';
import { JTableColumn, JTableFilterEvent } from './table.types';

describe('JTableComponent filter displays', () => {
  const columns: readonly JTableColumn[] = [
    { field: 'name', header: 'Customer Name', filterable: true, sortable: true },
    { field: 'id', header: 'Customer ID', filterable: true },
    { field: 'balance', header: 'Balance', type: 'number', filterable: true },
    { field: 'joined', header: 'Joined Date', type: 'date', filterable: true },
    { field: 'active', header: 'Active', type: 'boolean', filterable: true },
    {
      field: 'status',
      header: 'Status',
      filterable: true,
      filter: {
        type: 'multi-select',
        options: [
          { label: 'Current', value: 'current' },
          { label: 'Review', value: 'review' },
        ],
      },
    },
    { field: 'actions', header: 'Actions', type: 'actions', filterable: true },
  ];
  const rows = [
    {
      name: 'Aster Lane',
      id: 'CUS-201',
      balance: 40,
      joined: '2026-01-10',
      active: true,
      status: 'current',
      actions: '',
    },
    {
      name: 'Birch Stone',
      id: 'CUS-202',
      balance: 125,
      joined: '2026-04-18',
      active: false,
      status: 'review',
      actions: '',
    },
    {
      name: 'Cedar Vale',
      id: 'CUS-203',
      balance: 260,
      joined: '2026-07-02',
      active: true,
      status: 'current',
      actions: '',
    },
  ];

  function render(display: 'row' | 'menu' | 'toolbar' = 'row') {
    const fixture = TestBed.createComponent(JTableComponent);
    fixture.componentRef.setInput('columns', columns);
    fixture.componentRef.setInput('value', rows);
    fixture.componentRef.setInput('filterDisplay', display);
    fixture.componentRef.setInput('filterDebounce', 0);
    fixture.componentRef.setInput('paginator', false);
    fixture.detectChanges();
    return fixture;
  }

  it('renders each display in its own location and omits action filters', () => {
    const row = render('row');
    expect(row.nativeElement.querySelectorAll('.j-table__filter-row j-column-filter')).toHaveLength(
      6,
    );
    expect(row.nativeElement.querySelector('th .j-table__filter-menu')).toBeNull();

    const menu = render('menu');
    expect(menu.nativeElement.querySelectorAll('th .j-table__filter-menu')).toHaveLength(6);
    expect(menu.nativeElement.querySelector('.j-table__filter-row')).toBeNull();

    const toolbar = render('toolbar');
    expect(toolbar.nativeElement.querySelector('.j-table__filter-toolbar')).toBeTruthy();
    expect(toolbar.nativeElement.querySelector('thead .j-table__filter-toolbar')).toBeNull();
    expect(toolbar.nativeElement.querySelector('.j-table__toolbar .j-table__search')).toBeNull();
    expect(
      toolbar.nativeElement.querySelector('.j-table__filter-toolbar-search > span')?.textContent,
    ).toContain('Search table');
    expect(
      toolbar.nativeElement.querySelectorAll(
        '.j-table__filter-toolbar j-column-filter .j-column-filter__fields',
      ),
    ).toHaveLength(6);
  });

  it('uses compact inline header actions and a complete labelled menu panel', () => {
    const fixture = render('menu');
    const header = fixture.nativeElement.querySelector('th:has(.j-table__filter-menu)');
    const menu = header.querySelector('.j-table__filter-menu') as HTMLDetailsElement;
    menu.open = true;
    fixture.detectChanges();

    const panel = menu.querySelector('.j-table__filter-menu-popup') as HTMLElement;
    expect(header.querySelector('.j-table__sort')).toBeTruthy();
    expect(menu.querySelector('summary j-icon')).toBeTruthy();
    expect(panel.getAttribute('role')).toBe('dialog');
    expect(panel.querySelector('.j-column-filter__label')?.textContent).toContain(
      'Filter Customer Name',
    );
    expect(panel.querySelector('.j-column-filter__operator')).toBeTruthy();
    expect(panel.querySelector('.j-column-filter__control')).toBeTruthy();
    expect(panel.querySelector('.j-column-filter__actions')).toBeTruthy();
  });

  it('supports text, numeric, date, boolean, select, and multi-select operators', () => {
    const table = render().componentInstance;

    table.setFilterModel({ items: [{ field: 'name', operator: 'startsWith', value: 'Birch' }] });
    expect(table.filteredRows.map((row) => row['id'])).toEqual(['CUS-202']);

    table.setFilterModel({
      items: [{ field: 'balance', operator: 'between', value: [100, 300] }],
    });
    expect(table.filteredRows.map((row) => row['id'])).toEqual(['CUS-202', 'CUS-203']);

    table.setFilterModel({ items: [{ field: 'joined', operator: 'before', value: '2026-05-01' }] });
    expect(table.filteredRows.map((row) => row['id'])).toEqual(['CUS-201', 'CUS-202']);

    table.setFilterModel({ items: [{ field: 'active', operator: 'isFalse' }] });
    expect(table.filteredRows.map((row) => row['id'])).toEqual(['CUS-202']);

    table.setFilterModel({ items: [{ field: 'status', operator: 'in', value: ['current'] }] });
    expect(table.filteredRows.map((row) => row['id'])).toEqual(['CUS-201', 'CUS-203']);
  });

  it('combines multiple fields and grouped AND/OR constraints', () => {
    const table = render().componentInstance;
    table.setFilterModel({
      items: [{ field: 'active', operator: 'isTrue' }],
      groups: [
        {
          field: 'balance',
          operator: 'or',
          constraints: [
            { value: 50, matchMode: 'lessThan' },
            { value: 200, matchMode: 'greaterThan' },
          ],
        },
      ],
      logicOperator: 'and',
    });
    expect(table.filteredRows.map((row) => row['id'])).toEqual(['CUS-201', 'CUS-203']);
  });

  it('drafts menu changes, applies once, and exposes contextual ARIA state', async () => {
    const fixture = render('menu');
    const table = fixture.componentInstance;
    const events: JTableFilterEvent[] = [];
    table.filterEvent.subscribe((event) => events.push(event));
    const menu = fixture.nativeElement.querySelector('.j-table__filter-menu') as HTMLDetailsElement;
    const trigger = menu.querySelector('summary') as HTMLElement;

    menu.open = true;
    menu.dispatchEvent(new Event('toggle'));
    await Promise.resolve();
    expect(trigger.getAttribute('aria-label')).toBe('Filter Customer Name');
    expect(
      (menu.querySelector('.j-table__filter-menu-popup') as HTMLElement).style.getPropertyValue(
        '--j-table-filter-menu-left',
      ),
    ).toBeTruthy();
    table.handleFilterMenuDraft({ field: 'name', operator: 'contains', value: 'cedar' });
    expect(table.filteredRows).toHaveLength(3);

    table.applyFilterMenu(
      columns[0] as JTableColumn,
      { field: 'name', operator: 'contains', value: 'cedar' },
      menu,
    );
    fixture.detectChanges();
    await Promise.resolve();
    expect(table.filteredRows.map((row) => row['id'])).toEqual(['CUS-203']);
    expect(events).toHaveLength(1);
    expect(trigger.getAttribute('aria-label')).toContain('filter applied');
    expect(document.activeElement).toBe(trigger);
  });

  it('applies menu drafts on Enter and closes on outside click', async () => {
    const fixture = render('menu');
    const table = fixture.componentInstance;
    const menu = fixture.nativeElement.querySelector('.j-table__filter-menu') as HTMLDetailsElement;
    menu.open = true;
    menu.dispatchEvent(new Event('toggle'));
    await Promise.resolve();
    table.handleFilterMenuDraft({ field: 'name', operator: 'endsWith', value: 'Stone' });
    table.handleFilterMenuKeydown(
      new KeyboardEvent('keydown', { key: 'Enter' }),
      menu,
      columns[0] as JTableColumn,
    );
    expect(table.filteredRows.map((row) => row['id'])).toEqual(['CUS-202']);
    expect(menu.open).toBe(false);

    menu.open = true;
    table.handleDocumentClick({ target: document.body } as unknown as MouseEvent);
    expect(menu.open).toBe(false);
  });

  it('commits toolbar drafts together, clears all, and supports collapse state', () => {
    const fixture = render('toolbar');
    const table = fixture.componentInstance;
    table.handleFilterMenuDraft({ field: 'active', operator: 'isTrue' });
    table.handleFilterMenuDraft({ field: 'balance', operator: 'greaterThan', value: 100 });
    expect(table.filteredRows).toHaveLength(3);
    table.applyFilters();
    expect(table.filteredRows.map((row) => row['id'])).toEqual(['CUS-203']);

    table.toggleFilterToolbar();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.j-table__filter-toolbar-grid')).toBeNull();
    table.resetFilters();
    expect(table.filteredRows).toHaveLength(3);
  });

  it('emits normalized controlled state and omits client results in lazy mode', () => {
    const fixture = render();
    fixture.componentRef.setInput('dataMode', 'lazy');
    const table = fixture.componentInstance;
    const events: JTableFilterEvent[] = [];
    const models: unknown[] = [];
    table.filterEvent.subscribe((event) => events.push(event));
    table.filterModelChange.subscribe((model) => models.push(model));

    table.filter('balance', 100, 'greaterThan');

    expect(events[0]?.filters['balance']?.constraints[0]).toEqual({
      value: 100,
      matchMode: 'greaterThan',
    });
    expect(events[0]?.filteredValue).toBeUndefined();
    expect(models).toHaveLength(1);
  });

  it('resets pagination by default and permits retaining the current page', () => {
    const fixture = render();
    const table = fixture.componentInstance;
    table.first = 20;
    table.filter('name', 'Aster');
    expect(table.first).toBe(0);

    fixture.componentRef.setInput('resetPageOnFilter', false);
    table.first = 20;
    table.filter('name', 'Cedar');
    expect(table.first).toBe(20);
  });

  it('persists and restores the complete filter model', () => {
    const fixture = render();
    fixture.componentRef.setInput('stateKey', 'customer-filter-test');
    fixture.componentRef.setInput('stateStorage', 'memory');
    const table = fixture.componentInstance;
    table.setFilterModel({
      items: [{ field: 'status', operator: 'in', value: ['current'] }],
      groups: [
        {
          field: 'balance',
          operator: 'and',
          constraints: [{ value: 100, matchMode: 'greaterThan' }],
        },
      ],
      logicOperator: 'and',
    });
    table.saveState();
    table.resetFilters();
    expect(table.filterModel.items).toHaveLength(0);

    table.restoreState();

    expect(table.filterModel.items[0]).toEqual({
      field: 'status',
      operator: 'in',
      value: ['current'],
    });
    expect(table.filterModel.groups?.[0]?.field).toBe('balance');
  });

  it('uses a column custom matcher without changing the shared engine', () => {
    const fixture = TestBed.createComponent(JTableComponent);
    fixture.componentRef.setInput('columns', [
      {
        field: 'name',
        header: 'Customer Name',
        filterable: true,
        filter: {
          type: 'custom',
          matcher: (cellValue, filterValue) => String(cellValue).length === Number(filterValue),
        },
      },
    ] satisfies readonly JTableColumn[]);
    fixture.componentRef.setInput('value', rows);
    fixture.detectChanges();

    fixture.componentInstance.filter('name', 10, 'equals');
    expect(fixture.componentInstance.filteredRows.map((row) => row['name'])).toEqual([
      'Aster Lane',
      'Cedar Vale',
    ]);
  });
});
