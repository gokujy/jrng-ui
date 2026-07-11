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
      [selectable]="selectable"
      [paginator]="paginator"
      [rows]="2"
      (rowSelect)="selected = $event"
      (sortChange)="sortField = $event.field"
      (pageChange)="page = $event.page"
    />
  `,
})
class TableHostComponent {
  selectable = true;
  paginator = false;
  selected: JTableRow | null = null;
  sortField = '';
  page = 1;
  columns: readonly JTableColumn[] = [
    { field: 'code', header: 'Code', sortable: true },
    { field: 'name', header: 'Name' },
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

  it('filters rows with the global filter and emits filterChange', () => {
    const table = fixture.debugElement.query(By.directive(JTableComponent))
      .componentInstance as JTableComponent;
    const emitted: unknown[] = [];
    table.filterChange.subscribe((event) => emitted.push(event));

    table.handleGlobalFilter('alpha');
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
      size: 'small',
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
    expect(table.size).toBe('small');
  });

  it('emits row lock aliases', () => {
    const table = fixture.debugElement.query(By.directive(JTableComponent))
      .componentInstance as JTableComponent;
    const locks: unknown[] = [];
    const onLocks: unknown[] = [];
    table.lockableRows = true;
    table.rowLock.subscribe((event) => locks.push(event));
    table.onRowLock.subscribe((event) => onLocks.push(event));

    table.toggleRowLock(host.rows[0] as JTableRow, 0);

    expect(locks.length).toBe(1);
    expect(onLocks.length).toBe(1);
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
    table.stateRestoreError.subscribe((event) => errors.push(event.reason));
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
