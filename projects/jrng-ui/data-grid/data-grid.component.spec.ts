import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { JTableComponent, JTableStateRestoreError } from 'jrng-ui/table';
import { JDataGridColumn, JDataGridComponent, JDataGridSelection } from './data-grid.component';

interface ProductRow {
  readonly id: number;
  readonly name: string;
  readonly status: string;
}

@Component({
  imports: [JDataGridComponent],
  template: `
    <j-data-grid
      title="Products"
      [value]="rows"
      [columns]="columns"
      [globalFilterFields]="['name', 'status']"
      [sortMode]="'multiple'"
      [resizableColumns]="true"
      [reorderableColumns]="true"
      [stateKey]="stateKey"
      [selection]="selection"
      (globalFilterChange)="globalFilter = $event"
      (selectionChange)="selection = $event"
      (stateError)="restoreError = $event"
    />
  `,
})
class DataGridHostComponent {
  stateKey = 'products-grid';
  globalFilter = '';
  restoreError: JTableStateRestoreError | null = null;
  selection: JDataGridSelection<ProductRow> = null;
  columns: readonly JDataGridColumn<ProductRow>[] = [
    { field: 'name', header: 'Name', sortable: true },
    { field: 'status', header: 'Status', filterable: true },
  ];
  rows: readonly ProductRow[] = [
    { id: 1, name: 'Keyboard', status: 'Active' },
    { id: 2, name: 'Mouse', status: 'Archived' },
  ];
}

describe('JDataGridComponent', () => {
  let fixture: ComponentFixture<DataGridHostComponent>;
  let host: DataGridHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataGridHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DataGridHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function table(): JTableComponent {
    return fixture.debugElement.query(By.directive(JTableComponent))
      .componentInstance as JTableComponent;
  }

  it('renders typed rows through the table wrapper', () => {
    expect(fixture.nativeElement.textContent).toContain('Products');
    expect(fixture.nativeElement.textContent).toContain('Keyboard');
    expect(fixture.nativeElement.textContent).toContain('Archived');
  });

  it('emits global filter changes from the toolbar search', () => {
    const input = fixture.debugElement.query(By.css('.j-data-grid__search input'))
      .nativeElement as HTMLInputElement;

    input.value = 'keyboard';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(host.globalFilter).toBe('keyboard');
  });

  it('passes advanced table options through to j-table', () => {
    const instance = table();

    expect(instance.sortMode).toBe('multiple');
    expect(instance.resizableColumns).toBe(true);
    expect(instance.reorderableColumns).toBe(true);
    expect(instance.showColumnManager).toBe(true);
    expect(instance.showExport).toBe(true);
    expect(instance.showTableState).toBe(true);
  });

  it('forwards table state restore errors', () => {
    const error: JTableStateRestoreError = {
      key: 'products-grid',
      reason: 'invalid-json',
      error: new SyntaxError('Invalid JSON'),
    };

    table().error.emit(error);

    expect(host.restoreError).toBe(error);
  });
});
