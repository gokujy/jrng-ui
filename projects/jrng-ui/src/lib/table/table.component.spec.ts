import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { JTableColumn, JTableComponent, JTableRow } from './table.component';

@Component({
  imports: [JTableComponent],
  template: `
    <j-table
      caption="Invoices"
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
    { field: 'invoice', header: 'Invoice', sortable: true },
    { field: 'customer', header: 'Customer' },
    { field: 'amount', header: 'Amount', sortable: true, align: 'end' },
  ];
  rows: readonly JTableRow[] = [
    { id: 1, invoice: 'INV-3', customer: 'Aster', amount: 300 },
    { id: 2, invoice: 'INV-1', customer: 'Northwind', amount: 100 },
    { id: 3, invoice: 'INV-2', customer: 'Patel', amount: 200 },
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
    expect(fixture.nativeElement.textContent).toContain('Invoices');
    expect(bodyRows().length).toBe(3);
    expect(fixture.nativeElement.textContent).toContain('INV-3');
  });

  it('sorts sortable columns and emits sortChange', () => {
    const amountSort = fixture.debugElement.queryAll(By.css('.j-table__sort'))[2]
      ?.nativeElement as HTMLButtonElement;

    amountSort.click();
    detectHostChanges();

    expect(host.sortField).toBe('amount');
    expect(bodyRows()[0]?.textContent).toContain('INV-1');
    expect(amountSort.closest('th')?.getAttribute('aria-sort')).toBe('ascending');
  });

  it('selects rows by click and keyboard', () => {
    bodyRows()[0]?.click();
    fixture.detectChanges();

    expect(host.selected?.['invoice']).toBe('INV-3');
    expect(bodyRows()[0]?.classList).toContain('is-active');

    bodyRows()[1]?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();

    expect(host.selected?.['invoice']).toBe('INV-1');
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
    expect(fixture.nativeElement.textContent).toContain('INV-2');
  });
});
