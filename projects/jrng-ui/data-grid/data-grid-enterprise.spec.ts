import { TestBed } from '@angular/core/testing';
import { JDataGridComponent } from './data-grid.component';

describe('JDataGridComponent enterprise views', () => {
  it('renders card view using shared client filtering and pagination', () => {
    const fixture = TestBed.createComponent(JDataGridComponent);
    fixture.componentRef.setInput('displayMode', 'card');
    fixture.componentRef.setInput('columns', [{ field: 'name', header: 'Name' }]);
    fixture.componentRef.setInput('value', [{ name: 'Alpha' }, { name: 'Beta' }]);
    fixture.componentRef.setInput('rows', 1);
    fixture.componentInstance.globalFilter = 'Alpha';
    fixture.componentRef.setInput('globalFilterFields', ['name']);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.j-data-grid__item')).toHaveLength(1);
    expect(fixture.nativeElement.textContent).toContain('Alpha');
    expect(fixture.nativeElement.textContent).not.toContain('Beta');
  });
});
