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
  dataMode: 'client' | 'lazy' = 'client';
  groupRowsBy = '';
  collapsibleRowGroups = false;
  virtualScroll = false;
  sortField = '';
  page = 1;
  variant: 'standard' | 'gridlines' = 'standard';
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

  it('applies enterprise table config', () => {
    const table = fixture.debugElement.query(By.directive(JTableComponent))
      .componentInstance as JTableComponent;
    const config: JTableConfig = {
      pagination: true,
      multiSort: true,
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
