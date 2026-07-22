import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { JTableComponent } from './table.component';
import {
  JTableActionsTemplateDirective,
  JTableCellTemplateDirective,
  JTableFilterTemplateDirective,
  JTableHeaderTemplateDirective,
} from './table-template.directive';
import { JTableColumn } from './table.types';
import { JButtonComponent } from 'jrng-ui/button';

interface OrderRow {
  readonly id: number;
  readonly customer: string;
  readonly subtotal: number;
  readonly tax: number;
  readonly status: string;
  readonly actions: string;
}

@Component({
  imports: [
    JTableComponent,
    JTableActionsTemplateDirective,
    JTableCellTemplateDirective,
    JTableFilterTemplateDirective,
    JTableHeaderTemplateDirective,
    JButtonComponent,
  ],
  template: `
    <j-table variant="gridlines" filterDisplay="row" [columns]="columns" [value]="rows">
      <ng-template [jTableHeader]="columns[0]" let-column>
        <span class="custom-header">{{ column.header }} account</span>
      </ng-template>
      <ng-template [jTableCell]="columns[1]" let-row let-value="value">
        <strong class="custom-cell">{{ row.customer }}: {{ value }}</strong>
      </ng-template>
      <ng-template [jTableFilter]="columns[2]" let-apply="apply">
        <j-button class="custom-filter" variant="text" (onClick)="apply('Ready')"
          >Ready only</j-button
        >
      </ng-template>
      <ng-template [jTableActions]="columns[3]" let-row>
        <j-button class="custom-action" variant="text">Open {{ row.id }}</j-button>
      </ng-template>
    </j-table>
  `,
})
class TypedTableHostComponent {
  readonly columns: readonly JTableColumn<OrderRow>[] = [
    { field: 'customer', header: 'Customer', sortable: true },
    {
      field: 'subtotal',
      header: 'Total',
      templateKey: 'total',
      valueGetter: (row) => row.subtotal + row.tax,
      formatter: (value) => `$${Number(value).toFixed(2)}`,
    },
    { field: 'status', header: 'Status', type: 'status', filterable: true },
    { field: 'actions', header: 'Actions', type: 'actions' },
  ];
  readonly rows: readonly OrderRow[] = [
    { id: 1, customer: 'Northwind', subtotal: 100, tax: 18, status: 'Ready', actions: '' },
  ];
}

describe('JTableComponent typed columns and templates', () => {
  let fixture: ComponentFixture<TypedTableHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypedTableHostComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(TypedTableHostComponent);
    fixture.detectChanges();
  });

  it('renders typed columns with value getters and formatters', () => {
    const totalColumn = fixture.componentInstance.columns[1];
    const row = fixture.componentInstance.rows[0]!;
    const value = totalColumn?.valueGetter?.(row, totalColumn);

    expect(value).toBe(118);
    expect(totalColumn?.formatter?.(value, row, totalColumn)).toBe('$118.00');
  });

  it('renders custom header, cell and action templates', () => {
    expect(fixture.nativeElement.textContent).toContain('Customer account');
    expect(fixture.debugElement.query(By.css('.custom-cell'))?.nativeElement.textContent).toContain(
      'Northwind: 118',
    );
    expect(
      fixture.debugElement.query(By.css('.custom-action'))?.nativeElement.textContent,
    ).toContain('Open 1');
  });

  it('applies a custom filter template without replacing table filtering', () => {
    const filterButton = fixture.debugElement.query(By.css('.custom-filter button'))
      .nativeElement as HTMLButtonElement;
    const table = fixture.debugElement.query(By.directive(JTableComponent))
      .componentInstance as JTableComponent;

    filterButton.click();
    fixture.detectChanges();

    expect(table.filters['status']).toBe('Ready');
    expect(table.visibleRows).toHaveLength(1);
  });

  it('keeps semantic header and cell markup', () => {
    expect(fixture.debugElement.queryAll(By.css('th[scope="col"]'))).toHaveLength(4);
    expect(fixture.debugElement.queryAll(By.css('tbody td'))).toHaveLength(4);
    expect(fixture.debugElement.query(By.css('.j-table--gridlines'))).toBeTruthy();
  });
});
