import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { JTableComponent } from './table.component';
import { JTableColumn } from './table.types';

@Component({
  imports: [JTableComponent],
  template: `
    <j-table [columns]="columns" [value]="rows" [paginator]="false">
      <ng-template #jTableCaption let-table="table">
        <button type="button" (click)="table.resetFilters()">Clear request filters</button>
      </ng-template>
    </j-table>
  `,
})
class TableCaptionHostComponent {
  readonly columns: readonly JTableColumn[] = [{ field: 'name', header: 'Name' }];
  readonly rows = [{ name: 'Alpha' }];
}

describe('JTableComponent enterprise modes', () => {
  const columns: readonly JTableColumn[] = [
    { field: 'name', header: 'Name', sortable: true, filterable: true },
    { field: 'amount', header: 'Amount', type: 'number', filterable: true },
  ];

  function render(filterDisplay: 'toolbar' | 'row' | 'menu' | 'none') {
    const fixture = TestBed.createComponent(JTableComponent);
    fixture.componentRef.setInput('columns', columns);
    fixture.componentRef.setInput('value', [{ name: 'Alpha', amount: 10 }]);
    fixture.componentRef.setInput('filterDisplay', filterDisplay);
    fixture.detectChanges();
    return fixture;
  }

  it('renders toolbar filters independently', () => {
    const fixture = render('toolbar');
    expect(fixture.nativeElement.querySelector('.j-table__advanced-filters')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.j-table__filter-row')).toBeNull();
  });

  it('renders row filters with match buttons in the second row', () => {
    const fixture = render('row');
    const row = fixture.nativeElement.querySelector('.j-table__filter-row');
    expect(row).toBeTruthy();
    expect(row.querySelector('.j-column-filter__match-button')).toBeTruthy();
  });

  it('supports a caption template alias for table-level actions', () => {
    const fixture = TestBed.createComponent(TableCaptionHostComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.j-table__toolbar-content')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Clear request filters');
  });

  it('maps a displayed column filter to a different row or backend field', () => {
    const fixture = TestBed.createComponent(JTableComponent);
    const employeeColumn: JTableColumn = {
      field: 'employeeName',
      header: 'Employee',
      filterable: true,
      filter: { field: 'employeeId', type: 'select', operator: 'equals' },
    };
    fixture.componentRef.setInput('columns', [employeeColumn]);
    fixture.componentRef.setInput('value', [
      { employeeName: 'Alpha', employeeId: 1 },
      { employeeName: 'Beta', employeeId: 2 },
    ]);
    fixture.detectChanges();

    expect(fixture.componentInstance.filterFieldFor(employeeColumn)).toBe('employeeId');
    fixture.componentInstance.handleColumnFilterChange({
      field: 'employeeId',
      operator: 'equals',
      value: 2,
    });
    expect(fixture.componentInstance.visibleRows.map((row) => row['employeeName'])).toEqual([
      'Beta',
    ]);
  });

  it('renders menu filter buttons in headers and none mode renders no filter UI', () => {
    const menu = render('menu');
    expect(menu.nativeElement.querySelector('th .j-table__filter-menu')).toBeTruthy();
    const none = render('none');
    expect(none.nativeElement.querySelector('.j-column-filter')).toBeNull();
  });

  it('moves focus into an opened filter menu and restores it on Escape', async () => {
    const fixture = render('menu');
    const menu = fixture.nativeElement.querySelector('.j-table__filter-menu') as HTMLDetailsElement;
    const summary = menu.querySelector('summary') as HTMLElement;
    menu.open = true;
    menu.dispatchEvent(new Event('toggle'));
    await Promise.resolve();

    expect(menu.contains(document.activeElement)).toBe(true);
    expect(document.activeElement).not.toBe(summary);

    menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await Promise.resolve();
    expect(menu.open).toBe(false);
    expect(document.activeElement).toBe(summary);
  });

  it('reports malformed state instead of throwing', () => {
    const fixture = render('none');
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('stateKey', 'orders');
    fixture.componentRef.setInput('stateStorage', 'custom');
    fixture.componentRef.setInput('stateStorageAdapter', {
      get: () => '{not-json',
      set: () => undefined,
      remove: () => undefined,
    });
    const errors: unknown[] = [];
    component.error.subscribe((error) => errors.push(error));
    expect(() => component.restoreState()).not.toThrow();
    expect(errors).toHaveLength(1);
  });

  it('uses the inline filter row as the default for filterable columns', () => {
    const fixture = TestBed.createComponent(JTableComponent);
    fixture.componentRef.setInput('columns', columns);
    fixture.componentRef.setInput('value', [
      { name: 'Alpha', amount: 10 },
      { name: 'Beta', amount: 20 },
    ]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.j-table__filter-row')).toBeTruthy();
    expect(fixture.nativeElement.querySelectorAll('.j-column-filter__control')).toHaveLength(2);
  });

  it('debounces text filters without delaying typed numeric filters', () => {
    vi.useFakeTimers();
    const fixture = TestBed.createComponent(JTableComponent);
    fixture.componentRef.setInput('columns', columns);
    fixture.componentRef.setInput('value', [
      { name: 'Alpha', amount: 10 },
      { name: 'Beta', amount: 20 },
    ]);
    fixture.detectChanges();
    const table = fixture.componentInstance;

    table.handleColumnFilterChange({ field: 'name', operator: 'contains', value: 'beta' });
    expect(table.visibleRows).toHaveLength(2);
    vi.advanceTimersByTime(300);
    expect(table.visibleRows.map((row) => row['name'])).toEqual(['Beta']);

    table.handleColumnFilterChange({ field: 'amount', operator: 'equals', value: 20 });
    expect(table.visibleRows.map((row) => row['amount'])).toEqual([20]);
    vi.useRealTimers();
  });

  it('shows sort priority and keeps frozen filter cells aligned at both edges', () => {
    const fixture = TestBed.createComponent(JTableComponent);
    fixture.componentRef.setInput('columns', [
      { field: 'name', header: 'Name', sortable: true, filterable: true, frozen: true },
      { field: 'amount', header: 'Amount', sortable: true, filterable: true },
      {
        field: 'status',
        header: 'Status',
        sortable: true,
        filterable: true,
        frozen: true,
        frozenPosition: 'end',
      },
    ]);
    fixture.componentRef.setInput('value', [{ name: 'Alpha', amount: 10, status: 'Active' }]);
    fixture.componentInstance.sortBy('name', 1);
    fixture.componentInstance.sortBy('amount', -1);
    fixture.detectChanges();

    const priorities = Array.from(
      fixture.nativeElement.querySelectorAll('.j-sort-icon small'),
      (node: Element) => node.textContent?.trim(),
    );
    expect(priorities).toEqual(['1', '2']);
    const frozenFilters = fixture.nativeElement.querySelectorAll(
      '.j-table__filter-row .j-table__cell--frozen',
    ) as NodeListOf<HTMLElement>;
    expect(frozenFilters[0]?.style.insetInlineStart).toContain('--j-table-select-column-width');
    expect(frozenFilters[1]?.style.insetInlineEnd).toBe('0px');
  });

  it('supports pagination aliases, maximum scroll height, and configurable toolbar utilities', () => {
    const fixture = TestBed.createComponent(JTableComponent);
    fixture.componentRef.setInput('columns', columns);
    fixture.componentRef.setInput('value', [{ name: 'Alpha', amount: 10 }]);
    fixture.componentRef.setInput('maxScrollHeight', '20rem');
    fixture.componentRef.setInput('pageSize', 10);
    fixture.componentRef.setInput('pageSizeOptions', [10, 25]);
    fixture.componentRef.setInput('showPagination', false);
    fixture.componentRef.setInput('showGlobalFilter', false);
    fixture.componentRef.setInput('showColumnManager', false);
    fixture.componentRef.setInput('showExport', false);
    fixture.componentRef.setInput('maximizable', false);
    fixture.componentRef.setInput('toolbarActions', [
      { key: 'refresh', label: 'Refresh records', icon: 'refresh' },
    ]);
    const refreshes: unknown[] = [];
    fixture.componentInstance.refresh.subscribe((event) => refreshes.push(event));
    fixture.detectChanges();

    expect(fixture.componentInstance.rows).toBe(10);
    expect(fixture.componentInstance.rowsPerPageOptions).toEqual([10, 25]);
    expect(fixture.nativeElement.querySelector('.j-table__scroll').style.maxHeight).toBe('20rem');
    expect(fixture.nativeElement.querySelector('j-paginator')).toBeNull();
    const refresh = fixture.nativeElement.querySelector(
      'button[aria-label="Refresh records"]',
    ) as HTMLButtonElement;
    refresh.click();
    expect(refreshes).toHaveLength(1);
  });
});
