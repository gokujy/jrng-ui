import { TestBed } from '@angular/core/testing';
import { JTableComponent } from './table.component';
import { JTableColumn } from './table.types';

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

  it('renders menu filter buttons in headers and none mode renders no filter UI', () => {
    const menu = render('menu');
    expect(menu.nativeElement.querySelector('th .j-table__filter-menu')).toBeTruthy();
    const none = render('none');
    expect(none.nativeElement.querySelector('.j-column-filter')).toBeNull();
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
});
