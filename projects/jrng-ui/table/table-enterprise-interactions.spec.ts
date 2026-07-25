import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { JTableComponent } from './table.component';
import {
  JTableColumn,
  JTableColumnGroupRow,
  JTableEditEvent,
  JTableReorderEvent,
  JTableRow,
  JTableSelection,
  JTableSelectAllChangeEvent,
} from './table.types';

@Component({
  imports: [JTableComponent],
  template: `
    <j-table
      [value]="rows"
      [columns]="columns"
      [columnGroups]="columnGroups"
      [selection]="selection"
      selectionMode="checkbox"
      dataKey="id"
      editMode="row"
      expandableRows
      reorderableRows
      [rowReorderable]="canReorder"
      [paginator]="false"
      [showGlobalFilter]="false"
      [showColumnManager]="false"
      [showExport]="false"
      [maximizable]="false"
      (selectionChange)="selection = $event"
      (selectAllChange)="selectAllEvent = $event"
      (rowUnselect)="unselectedRow = $event"
      (rowEditInit)="editInit = $event"
      (rowEditSave)="saveEdit($event)"
      (rowEditCancel)="editCancel = $event"
      (rowReorder)="applyReorder($event)"
    />
  `,
})
class EnterpriseTableHostComponent {
  rows: readonly JTableRow[] = [
    { id: 1, name: 'Atlas', amount: 20, locked: false },
    { id: 2, name: 'Beacon', amount: 30, locked: true },
    { id: 3, name: 'Comet', amount: 40, locked: false },
  ];
  columns: readonly JTableColumn[] = [
    { field: 'name', header: 'Name', sortable: true, filterable: true, editable: true },
    {
      field: 'amount',
      header: 'Amount',
      type: 'number',
      sortable: true,
      editable: true,
      responsivePriority: 4,
      validate: (value) => (Number(value) > 0 ? null : 'Amount must be positive.'),
    },
  ];
  columnGroups: readonly JTableColumnGroupRow[] = [[{ header: 'Account', colspan: 2 }]];
  selection: JTableSelection = [this.rows[0]];
  selectAllEvent: JTableSelectAllChangeEvent | null = null;
  unselectedRow: JTableRow | null = null;
  editInit: JTableEditEvent | null = null;
  editCancel: JTableEditEvent | null = null;
  savedEdit: JTableEditEvent | null = null;
  readonly canReorder = (row: JTableRow) => row['locked'] !== true;

  saveEdit(event: JTableEditEvent): void {
    this.savedEdit = event;
    this.rows = this.rows.map((row) => (row['id'] === event.row['id'] ? event.row : row));
  }

  applyReorder(event: JTableReorderEvent): void {
    this.rows = event.value;
  }
}

describe('JTableComponent enterprise interactions', () => {
  let fixture: ComponentFixture<EnterpriseTableHostComponent>;
  let table: JTableComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnterpriseTableHostComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(EnterpriseTableHostComponent);
    fixture.detectChanges();
    table = fixture.debugElement.query(By.directive(JTableComponent))
      .componentInstance as JTableComponent;
  });

  it('renders grouped and responsive-priority columns with an indeterminate select-all state', () => {
    const root = fixture.nativeElement as HTMLElement;
    const selectAll = root.querySelector(
      '[data-jc-section="selection-header"] input',
    ) as HTMLInputElement;

    expect(root.querySelector('[scope="colgroup"]')?.textContent).toContain('Account');
    expect(root.querySelectorAll('.j-table__cell--priority-4').length).toBeGreaterThan(0);
    expect(selectAll.checked).toBe(false);
    expect(selectAll.indeterminate).toBe(true);

    selectAll.checked = true;
    selectAll.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(fixture.componentInstance.selectAllEvent?.selected).toBe(true);
    expect((fixture.componentInstance.selection as readonly JTableRow[]).length).toBe(3);
  });

  it('emits row unselect and supports programmatic sort, filter, pagination, and expansion', () => {
    table.toggleSelection(fixture.componentInstance.rows[0]);
    expect(fixture.componentInstance.unselectedRow?.['id']).toBe(1);

    table.sortBy('amount', -1);
    expect(table.visibleRows[0]?.['amount']).toBe(40);
    table.filter('name', 'bea', 'contains');
    expect(table.visibleRows.map((row) => row['name'])).toEqual(['Beacon']);
    table.resetFilters();
    table.first = 25;
    table.resetPagination();
    expect(table.first).toBe(0);

    table.expandAllRows();
    expect(table.isExpanded(fixture.componentInstance.rows[2], 2)).toBe(true);
    table.collapseAllRows();
    expect(table.isExpanded(fixture.componentInstance.rows[2], 2)).toBe(false);
  });

  it('validates, saves, and cancels row editing with accessible invalid feedback', async () => {
    const row = fixture.componentInstance.rows[0];
    table.startRowEdit(row, 0);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.componentInstance.editInit?.row['id']).toBe(1);

    const amount = fixture.nativeElement.querySelector(
      '[data-j-table-row-edit-field="amount"]',
    ) as HTMLInputElement;
    amount.value = '0';
    amount.dispatchEvent(new Event('input'));
    await table.saveRowEdit(row, 0);
    fixture.detectChanges();

    expect(amount.getAttribute('aria-invalid')).toBe('true');
    expect(fixture.nativeElement.textContent).toContain('Amount must be positive.');
    expect(fixture.componentInstance.savedEdit).toBeNull();

    amount.value = '55';
    amount.dispatchEvent(new Event('input'));
    await table.saveRowEdit(row, 0);
    fixture.detectChanges();
    expect(fixture.componentInstance.savedEdit?.row['amount']).toBe(55);

    table.startRowEdit(fixture.componentInstance.rows[2], 2);
    table.cancelRowEdit(fixture.componentInstance.rows[2], 2);
    expect(fixture.componentInstance.editCancel?.row['id']).toBe(3);
  });

  it('blocks disabled row reordering and provides drag and keyboard alternatives', () => {
    const root = fixture.nativeElement as HTMLElement;
    const lockedRow = root.querySelectorAll('tbody tr')[1] as HTMLTableRowElement;
    const lockedHandle = lockedRow.querySelector('.j-table__drag-handle') as HTMLElement;
    const lockedUp = lockedRow.querySelector('[aria-label="Move row up"]') as HTMLButtonElement;

    expect(lockedHandle.getAttribute('aria-disabled')).toBe('true');
    expect(lockedUp.disabled).toBe(true);

    const thirdRowUp = root.querySelectorAll<HTMLButtonElement>('[aria-label="Move row up"]')[2];
    thirdRowUp.click();
    fixture.detectChanges();

    // The locked second row cannot be displaced.
    expect(fixture.componentInstance.rows.map((row) => row['id'])).toEqual([1, 2, 3]);
  });

  it('marks row-edit controls and expansion controls with accessible names and state', () => {
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('[aria-label="Expand row"]')?.getAttribute('aria-expanded')).toBe(
      'false',
    );
    expect(root.querySelector('[aria-label="Drag row 1 to reorder"]')).toBeTruthy();
    expect(
      Array.from(root.querySelectorAll('button')).some(
        (button) => button.textContent?.trim() === 'Edit',
      ),
    ).toBe(true);
  });
});
