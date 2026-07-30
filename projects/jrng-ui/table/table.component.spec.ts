import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  JTableColumn,
  JTableComponent,
  JTableConfig,
  JTableExportEvent,
  JTableRow,
} from './table.component';

@Component({
  imports: [JTableComponent],
  template: `
    <j-table
      caption="Records"
      [columns]="columns"
      [value]="rows"
      [selectionMode]="selectionMode"
      [selection]="selection"
      [rowSelectable]="rowSelectable"
      [dataMode]="dataMode"
      [totalRecords]="totalRecords"
      [virtualFirst]="virtualFirst"
      [groupRowsBy]="groupRowsBy"
      [collapsibleRowGroups]="collapsibleRowGroups"
      [virtualScroll]="virtualScroll"
      [virtualItemSize]="44"
      [virtualOverscan]="2"
      scrollHeight="88px"
      [paginator]="paginator"
      [frozenRows]="frozenRows"
      [lockedRowKeys]="lockedRowKeys"
      [variant]="variant"
      [filterDisplay]="filterDisplay"
      [rows]="2"
      (rowSelect)="selected = $event"
      (selectionChange)="selection = $event"
      (sortChange)="sortField = $event.field"
      (pageChange)="page = $event.page"
      (lazyLoad)="lazyEvent = $event"
    />
  `,
})
class TableHostComponent {
  paginator = false;
  frozenRows = false;
  lockedRowKeys: readonly string[] = [];
  selected: JTableRow | null = null;
  selectionMode: 'single' | 'checkbox' = 'single';
  selection: JTableRow | readonly JTableRow[] | null = null;
  rowSelectable: ((row: JTableRow) => boolean) | null = null;
  dataMode: 'client' | 'lazy' | 'virtual' = 'client';
  lazyEvent: import('./table.types').JTableLazyLoadEvent | null = null;
  totalRecords = 0;
  virtualFirst = 0;
  groupRowsBy = '';
  collapsibleRowGroups = false;
  virtualScroll = false;
  sortField = '';
  page = 1;
  variant: 'standard' | 'gridlines' | 'enterprise' = 'standard';
  filterDisplay: 'none' | 'row' = 'none';
  columns: readonly JTableColumn[] = [
    { field: 'code', header: 'Code', sortable: true },
    { field: 'name', header: 'Name', filterable: true },
    { field: 'amount', header: 'Amount', sortable: true, align: 'end' },
  ];
  rows: readonly JTableRow[] = [
    { id: 1, code: 'REC-3', name: 'Record Gamma', amount: 300 },
    { id: 2, code: 'REC-1', name: 'Record Alpha', amount: 100 },
    { id: 3, code: 'REC-2', name: 'Record Beta', amount: 200 },
  ];
}

@Component({
  imports: [JTableComponent],
  template: `
    <j-table [columns]="columns" [value]="rows" selectionMode="radio" editMode="row" />
    <j-table [columns]="columns" [value]="rows" selectionMode="radio" editMode="row" />
  `,
})
class MultipleTablesHostComponent {
  columns: readonly JTableColumn[] = [{ field: 'name', header: 'Name', editable: true }];
  rows: readonly JTableRow[] = [{ id: 1, name: 'Shared row key' }];
}

describe('JTableComponent', () => {
  let fixture: ComponentFixture<TableHostComponent>;
  let host: TableHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TableHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function bodyRows(): HTMLElement[] {
    return fixture.debugElement
      .queryAll(By.css('tbody tr'))
      .map((row) => row.nativeElement as HTMLElement);
  }

  function detectHostChanges(): void {
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
  }

  it('renders headers and rows', () => {
    expect(fixture.nativeElement.textContent).toContain('Records');
    expect(bodyRows().length).toBe(3);
    expect(fixture.nativeElement.textContent).toContain('REC-3');
  });

  it('uses the standard presentation without implicit filters', () => {
    expect(fixture.debugElement.query(By.css('.j-table--standard'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('.j-table__filter-row'))).toBeNull();
    expect(fixture.debugElement.query(By.css('j-column-filter'))).toBeNull();
  });

  it('renders a dedicated accessible filter row when configured', () => {
    host.variant = 'gridlines';
    host.filterDisplay = 'row';
    detectHostChanges();

    expect(fixture.debugElement.query(By.css('.j-table--gridlines'))).toBeTruthy();
    const filterRow = fixture.debugElement.query(By.css('.j-table__filter-row'));
    expect(filterRow).toBeTruthy();
    expect(filterRow.query(By.css('[aria-label="Filter Name"]'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('thead tr:first-child j-column-filter'))).toBeNull();
  });

  it('renders the enterprise presentation as an additive visual variant', () => {
    host.variant = 'enterprise';
    host.filterDisplay = 'row';
    detectHostChanges();

    expect(fixture.debugElement.query(By.css('.j-table--enterprise'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('.j-table__filter-row'))).toBeTruthy();
  });

  it('sorts sortable columns and emits sortChange', () => {
    const amountSort = fixture.debugElement.queryAll(By.css('.j-table__sort'))[2]
      ?.nativeElement as HTMLButtonElement;

    amountSort.click();
    detectHostChanges();

    expect(host.sortField).toBe('amount');
    expect(bodyRows()[0]?.textContent).toContain('REC-1');
    expect(amountSort.closest('th')?.getAttribute('aria-sort')).toBe('ascending');
  });

  it('selects rows by click and keyboard', () => {
    bodyRows()[0]?.click();
    fixture.detectChanges();

    expect(host.selected?.['code']).toBe('REC-3');
    expect(bodyRows()[0]?.classList).toContain('is-active');

    bodyRows()[1]?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();

    expect(host.selected?.['code']).toBe('REC-1');
  });

  it('uses grid semantics and a roving row tab stop with arrow, Home, and End navigation', () => {
    const table = fixture.debugElement.query(By.css('table')).nativeElement as HTMLTableElement;
    const rows = fixture.debugElement
      .queryAll(By.css('tbody tr[data-j-table-row]'))
      .map((row) => row.nativeElement as HTMLElement);
    expect(table.getAttribute('role')).toBe('grid');
    expect(rows.map((row) => row.tabIndex)).toEqual([0, -1, -1]);

    rows[0]?.focus();
    rows[0]?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(rows[1]);

    rows[1]?.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(rows[2]);

    rows[2]?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(rows[0]);
  });

  it('does not activate a row from keyboard events owned by a nested selection control', () => {
    host.selectionMode = 'checkbox';
    detectHostChanges();
    const checkbox = fixture.debugElement.query(By.css('tbody input[type="checkbox"]'))
      .nativeElement as HTMLInputElement;

    checkbox.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();

    expect(host.selection).toBeNull();
    expect(checkbox.tabIndex).toBe(-1);
  });

  it('renders empty state', () => {
    host.rows = [];
    detectHostChanges();

    expect(bodyRows()[0]?.textContent).toContain('No records found.');
  });

  it('paginates rows and emits pageChange', () => {
    host.paginator = true;
    detectHostChanges();

    expect(bodyRows().length).toBe(2);

    const nextButton = fixture.debugElement.query(By.css('[aria-label="Next page"]'))
      ?.nativeElement as HTMLButtonElement;
    expect(nextButton.disabled).toBe(false);
    nextButton.click();
    detectHostChanges();

    expect(host.page).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('REC-2');
  });

  it('keeps keyed frozen rows visible outside pagination while preserving selection and sorting', () => {
    host.paginator = true;
    host.frozenRows = true;
    host.lockedRowKeys = ['3'];
    detectHostChanges();

    expect(bodyRows()).toHaveLength(3);
    const frozen = bodyRows().find((row) => row.dataset['jFrozen'] === 'true');
    expect(frozen?.textContent).toContain('REC-2');
    frozen?.click();
    fixture.detectChanges();
    expect(host.selected?.['code']).toBe('REC-2');

    const amountSort = fixture.debugElement.queryAll(By.css('.j-table__sort'))[2]
      ?.nativeElement as HTMLButtonElement;
    amountSort.click();
    detectHostChanges();
    expect(bodyRows().find((row) => row.dataset['jFrozen'] === 'true')?.textContent).toContain(
      'REC-2',
    );
  });

  it('tracks none, partial, and all eligible checkbox states', () => {
    host.selectionMode = 'checkbox';
    host.rowSelectable = (row) => row['id'] !== 2;
    detectHostChanges();
    const table = fixture.debugElement.query(By.directive(JTableComponent))
      .componentInstance as JTableComponent;
    const selectAll = fixture.nativeElement.querySelector(
      'thead [data-jc-section="selection-control"]',
    ) as HTMLInputElement;

    expect(selectAll.checked).toBe(false);
    expect(selectAll.indeterminate).toBe(false);
    expect(table.eligibleVisibleRows).toHaveLength(2);
    expect(
      (
        fixture.nativeElement.querySelectorAll(
          'tbody [data-jc-section="selection-control"]',
        )[1] as HTMLInputElement
      ).disabled,
    ).toBe(true);

    table.toggleSelection(host.rows[0]);
    fixture.detectChanges();
    expect(selectAll.checked).toBe(false);
    expect(selectAll.indeterminate).toBe(true);

    selectAll.checked = true;
    selectAll.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(selectAll.checked).toBe(true);
    expect(selectAll.indeterminate).toBe(false);
    expect(host.selection).toEqual([host.rows[0], host.rows[2]]);

    selectAll.checked = false;
    selectAll.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(host.selection).toEqual([]);
  });

  it('selects only the filtered current page and reconciles controlled selection after refresh', () => {
    host.selectionMode = 'checkbox';
    host.paginator = true;
    detectHostChanges();
    const table = fixture.debugElement.query(By.directive(JTableComponent))
      .componentInstance as JTableComponent;

    table.globalFilter = 'record';
    table.filters = { code: 'REC-1' };
    const event = { target: { checked: true } } as unknown as Event;
    table.toggleAllPageRows(event);
    expect(host.selection).toEqual([host.rows[1]]);

    host.rows = [
      { id: 2, code: 'REC-1', name: 'Record Alpha refreshed', amount: 125 },
      { id: 4, code: 'REC-4', name: 'Record Delta', amount: 400 },
    ];
    host.selection = [host.rows[0]];
    detectHostChanges();

    expect(table.allPageRowsSelected()).toBe(true);
    expect(table.somePageRowsSelected()).toBe(false);
  });

  it('uses the currently supplied lazy page as the select-all eligibility scope', () => {
    host.selectionMode = 'checkbox';
    detectHostChanges();
    const table = fixture.debugElement.query(By.directive(JTableComponent))
      .componentInstance as JTableComponent;
    host.dataMode = 'lazy';
    detectHostChanges();

    table.toggleAllPageRows({ target: { checked: true } } as unknown as Event);
    expect((host.selection as readonly JTableRow[]).length).toBe(3);
    expect(table.allPageRowsSelected()).toBe(true);
  });

  it('renders accessible row groups and supports programmatic collapse', () => {
    host.rows = [
      { id: 1, code: 'A-1', name: 'Alpha', amount: 10, team: 'North' },
      { id: 2, code: 'A-2', name: 'Beta', amount: 20, team: 'North' },
      { id: 3, code: 'B-1', name: 'Gamma', amount: 30, team: 'South' },
    ];
    host.groupRowsBy = 'team';
    host.collapsibleRowGroups = true;
    detectHostChanges();

    const table = fixture.debugElement.query(By.directive(JTableComponent))
      .componentInstance as JTableComponent;
    expect(fixture.nativeElement.querySelectorAll('[data-jc-section="group-header"]')).toHaveLength(
      2,
    );

    table.toggleRowGroup(host.rows[0]);
    fixture.detectChanges();
    expect(bodyRows().some((row) => row.textContent?.includes('A-1'))).toBe(false);
    expect(bodyRows().some((row) => row.textContent?.includes('B-1'))).toBe(true);
  });

  it('windows large row sets and preserves scroll height with spacer rows', () => {
    host.rows = Array.from({ length: 100 }, (_, index) => ({
      id: index + 1,
      code: `REC-${index + 1}`,
      name: `Record ${index + 1}`,
      amount: index,
    }));
    host.virtualScroll = true;
    detectHostChanges();
    const table = fixture.debugElement.query(By.directive(JTableComponent))
      .componentInstance as JTableComponent;

    table.handleVirtualScroll({
      currentTarget: { scrollTop: 440, clientHeight: 88 },
    } as unknown as Event);
    fixture.detectChanges();

    expect(table.virtualStart).toBe(8);
    expect(table.visibleRows).toHaveLength(6);
    expect(table.visibleRows[0]?.['id']).toBe(9);
    const spacers = fixture.nativeElement.querySelectorAll('.j-table__virtual-spacer td');
    expect(spacers).toHaveLength(2);
    expect((spacers[0] as HTMLElement).style.height).toBe('352px');
  });

  it('emits deduplicated lazy ranges for virtual data', () => {
    host.rows = Array.from({ length: 100 }, (_, index) => ({
      id: index + 1,
      code: `REC-${index + 1}`,
      name: `Record ${index + 1}`,
      amount: index,
    }));
    host.dataMode = 'virtual';
    detectHostChanges();
    const table = fixture.debugElement.query(By.directive(JTableComponent))
      .componentInstance as JTableComponent;
    const target = { scrollTop: 440, clientHeight: 88 };

    table.handleVirtualScroll({ currentTarget: target } as unknown as Event);
    expect(host.lazyEvent).toMatchObject({
      first: 8,
      rows: 6,
      virtualFirst: 8,
      virtualLast: 14,
    });
    const firstEvent = host.lazyEvent;
    table.handleVirtualScroll({ currentTarget: target } as unknown as Event);
    expect(host.lazyEvent).toBe(firstEvent);
  });

  it('renders inert placeholders around a loaded lazy virtual slice', () => {
    host.dataMode = 'virtual';
    host.totalRecords = 100;
    host.virtualFirst = 8;
    host.rows = [
      { id: 9, code: 'REC-9', name: 'Record 9', amount: 9 },
      { id: 10, code: 'REC-10', name: 'Record 10', amount: 10 },
    ];
    detectHostChanges();
    const table = fixture.debugElement.query(By.directive(JTableComponent))
      .componentInstance as JTableComponent;

    table.handleVirtualScroll({
      currentTarget: { scrollTop: 440, clientHeight: 88 },
    } as unknown as Event);
    fixture.detectChanges();

    expect(table.visibleRows).toHaveLength(6);
    expect(table.visibleRows.slice(0, 2).map((row) => row['id'])).toEqual([9, 10]);
    expect(fixture.nativeElement.querySelectorAll('.j-table__virtual-placeholder')).toHaveLength(4);
    expect(
      fixture.nativeElement
        .querySelector('.j-table__virtual-placeholder')
        ?.getAttribute('aria-hidden'),
    ).toBe('true');
  });

  it('filters rows with the global filter and emits filterChange', () => {
    const table = fixture.debugElement.query(By.directive(JTableComponent))
      .componentInstance as JTableComponent;
    const emitted: unknown[] = [];
    table.filterChange.subscribe((event) => emitted.push(event));

    table.handleGlobalFilter({ target: { value: 'alpha' } } as unknown as Event);
    expect(table.visibleRows.length).toBe(1);
    expect(table.visibleRows[0]?.['code']).toBe('REC-1');
    expect(emitted.length).toBe(1);
  });

  it('combines multiple constraints per field with independent AND and OR operators', () => {
    const table = fixture.debugElement.query(By.directive(JTableComponent))
      .componentInstance as JTableComponent;
    table.filterModel = {
      items: [],
      groups: [
        {
          field: 'amount',
          operator: 'and',
          constraints: [
            { value: 100, matchMode: 'greaterThan' },
            { value: 300, matchMode: 'lessThan' },
          ],
        },
      ],
    };
    expect(table.filteredRows.map((row) => row['amount'])).toEqual([200]);

    table.filterModel = {
      items: [],
      groups: [
        {
          field: 'name',
          operator: 'or',
          constraints: [
            { value: 'Record Gamma', matchMode: 'equals' },
            { value: 'Record Alpha', matchMode: 'equals' },
          ],
        },
      ],
    };
    expect(table.filteredRows.map((row) => row['name'])).toEqual(['Record Gamma', 'Record Alpha']);
  });

  it('tracks multiple sort metadata when sortMode is multiple', () => {
    const table = fixture.debugElement.query(By.directive(JTableComponent))
      .componentInstance as JTableComponent;
    table.sortMode = 'multiple';

    table.toggleSort(host.columns[0] as JTableColumn);
    table.toggleSort(host.columns[2] as JTableColumn);

    expect(table.multiSortMeta.map((sort) => sort.field)).toEqual(['code', 'amount']);
  });

  it('uses a typed column comparator for custom sorting', () => {
    const table = fixture.debugElement.query(By.directive(JTableComponent))
      .componentInstance as JTableComponent;
    host.columns = [
      {
        field: 'name',
        header: 'Name length',
        sortable: true,
        sortComparator: (left, right) => String(right['name']).localeCompare(String(left['name'])),
      },
    ];
    detectHostChanges();

    table.toggleSort(host.columns[0]);

    expect(table.sortedRows.map((row) => row['name'])).toEqual([
      'Record Gamma',
      'Record Beta',
      'Record Alpha',
    ]);
  });

  it('exports visible table data as CSV', () => {
    const table = fixture.debugElement.query(By.directive(JTableComponent))
      .componentInstance as JTableComponent;

    const csv = table.exportCSV();

    expect(csv).toContain('Code,Name,Amount');
    expect(csv).toContain('REC-3,Record Gamma,300');
  });

  it('applies comprehensive table settings', () => {
    const table = fixture.debugElement.query(By.directive(JTableComponent))
      .componentInstance as JTableComponent;
    const config: JTableConfig = {
      pagination: true,
      multiSort: true,
      filterDisplay: 'menu',
      globalSearch: true,
      columnManager: true,
      exportable: true,
      stateful: true,
      reorderableRows: true,
      lockableRows: true,
      reorderableColumns: true,
      resizableColumns: true,
      maximizable: true,
    };

    table.config = config;
    table.ngOnChanges({
      config: {
        currentValue: config,
        previousValue: null,
        firstChange: true,
        isFirstChange: () => true,
      },
    });

    expect(table.paginator).toBe(true);
    expect(table.sortMode).toBe('multiple');
    expect(table.resolvedFilterDisplay).toBe('menu');
    expect(table.showGlobalFilter).toBe(true);
    expect(table.showColumnManager).toBe(true);
    expect(table.showExport).toBe(true);
    expect(table.showTableState).toBe(true);
    expect(table.lockableRows).toBe(true);
    expect(table.maximizable).toBe(true);
  });

  it('emits rowLock once', () => {
    const table = fixture.debugElement.query(By.directive(JTableComponent))
      .componentInstance as JTableComponent;
    const locks: unknown[] = [];
    table.lockableRows = true;
    table.rowLock.subscribe((event) => locks.push(event));

    table.toggleRowLock(host.rows[0] as JTableRow, 0);

    expect(locks.length).toBe(1);
    expect(table.isRowLocked(host.rows[0] as JTableRow, 0)).toBe(true);
  });

  it('emits export before download and allows prevention', () => {
    const table = fixture.debugElement.query(By.directive(JTableComponent))
      .componentInstance as JTableComponent;
    const exportEvents: JTableExportEvent[] = [];
    table.export.subscribe((event) => {
      event.preventDefault();
      exportEvents.push(event);
    });

    const csv = table.exportCSV();

    expect(csv).toContain('REC-3');
    expect(exportEvents[0]?.defaultPrevented).toBe(true);
    expect(exportEvents[0]?.rows.length).toBe(3);
  });

  it('recovers safely from corrupted persisted state', () => {
    const table = fixture.debugElement.query(By.directive(JTableComponent))
      .componentInstance as JTableComponent;
    const errors: string[] = [];
    table.stateKey = 'j-table-corrupt-test';
    table.error.subscribe((event) => errors.push(event.reason));
    localStorage.setItem(table.stateKey, '{not-json');

    expect(() => table.restoreState()).not.toThrow();
    expect(errors).toEqual(['invalid-json']);
    expect(table.visibleRows.length).toBe(3);
    localStorage.removeItem(table.stateKey);
  });

  it('ignores unknown columns and invalid values during state restoration', () => {
    const table = fixture.debugElement.query(By.directive(JTableComponent))
      .componentInstance as JTableComponent;
    table.stateKey = 'j-table-validation-test';
    localStorage.setItem(
      table.stateKey,
      JSON.stringify({
        version: 1,
        first: -20,
        rows: 0,
        sortField: 'removed-column',
        sortOrder: 99,
        hiddenColumns: ['removed-column', 'name'],
        columnOrder: ['removed-column', 'amount'],
        columnWidths: { 'removed-column': '10px', amount: '12rem' },
      }),
    );

    table.restoreState();
    expect(table.first).toBe(0);
    expect(table.sortField).toBe('');
    expect(table.resolvedColumns.map((column) => column.field)).toEqual(['amount', 'code']);
    localStorage.removeItem(table.stateKey);
  });
});

describe('JTableComponent multiple-instance isolation', () => {
  it('uses distinct radio groups and scopes row-edit focus to the owning table', async () => {
    await TestBed.configureTestingModule({
      imports: [MultipleTablesHostComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(MultipleTablesHostComponent);
    fixture.detectChanges();
    const tableDebugElements = fixture.debugElement.queryAll(By.directive(JTableComponent));
    const tables = tableDebugElements.map(
      (debugElement) => debugElement.componentInstance as JTableComponent,
    );
    const radios = fixture.debugElement
      .queryAll(By.css('input[type="radio"]'))
      .map((radio) => radio.nativeElement as HTMLInputElement);

    expect(radios[0]?.name).toBeTruthy();
    expect(radios[0]?.name).not.toBe(radios[1]?.name);

    tables[0]?.startRowEdit({ id: 1, name: 'Shared row key' }, 0);
    fixture.detectChanges();
    await Promise.resolve();
    tables[1]?.startRowEdit({ id: 1, name: 'Shared row key' }, 0);
    fixture.detectChanges();
    await Promise.resolve();

    expect(tableDebugElements[1]?.nativeElement.contains(document.activeElement)).toBe(true);
  });
});
