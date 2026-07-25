import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { JTableComponent } from './table.component';
import {
  JTableActionEvent,
  JTableColumn,
  JTableExportEvent,
  JTableRow,
  JTableSelection,
} from './table.types';

@Component({
  imports: [JTableComponent],
  template: `
    <j-table
      title="Products"
      description="Manage the product catalogue."
      searchPlaceholder="Search products"
      [value]="rows"
      [columns]="columns"
      [globalFilterFields]="['name', 'status']"
      [selection]="selection"
      (globalFilterChange)="globalFilter = $event"
      (selectionChange)="selection = $event"
      (action)="lastAction = $event"
      (export)="preventDownload($event)"
    >
      <button jTableToolbarActions type="button">Create product</button>
      <button jTableBulkActions type="button">Archive selected</button>
    </j-table>
  `,
})
class TableManagementHostComponent {
  globalFilter = '';
  actionCommandCount = 0;
  lastAction: JTableActionEvent | null = null;
  exportCount = 0;
  columns: readonly JTableColumn[] = [
    { field: 'name', header: 'Name', sortable: true },
    { field: 'status', header: 'Status', filterable: true },
    { field: 'internal', header: 'Internal', visible: false },
    {
      field: 'actions',
      header: 'Actions',
      type: 'actions',
      actions: [
        {
          key: 'view',
          label: 'View product',
          command: () => {
            this.actionCommandCount += 1;
          },
        },
      ],
    },
  ];
  rows: readonly JTableRow[] = [
    { id: 1, name: 'Keyboard', status: 'Active' },
    { id: 2, name: 'Mouse', status: 'Archived' },
  ];
  selection: JTableSelection = [this.rows[0]];

  preventDownload(event: JTableExportEvent): void {
    this.exportCount += 1;
    event.preventDefault();
  }
}

describe('JTableComponent management surface', () => {
  let fixture: ComponentFixture<TableManagementHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableManagementHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TableManagementHostComponent);
    fixture.detectChanges();
  });

  it('renders the heading and projected toolbar and bulk actions', () => {
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Products');
    expect(text).toContain('Manage the product catalogue.');
    expect(text).toContain('Create product');
    expect(text).toContain('1 selected');
    expect(text).toContain('Archive selected');
  });

  it('uses the shared data-management defaults without an API dependency', () => {
    const table = fixture.debugElement.query(By.directive(JTableComponent))
      .componentInstance as JTableComponent;

    expect(table.rows).toBe(25);
    expect(table.rowsPerPageOptions).toEqual([5, 10, 25, 50, 100]);
    expect(table.paginator).toBe(true);
    expect(table.sortMode).toBe('multiple');
    expect(table.selectionMode).toBe('checkbox');
    expect(table.resizableColumns).toBe(true);
    expect(table.reorderableColumns).toBe(true);
    expect(table.showGlobalFilter).toBe(true);
    expect(table.showColumnManager).toBe(true);
    expect(table.showExport).toBe(true);
    expect(table.maximizable).toBe(true);
    expect(table.dataMode()).toBe('client');
  });

  it('emits global filter changes and uses the configured search placeholder', () => {
    const input = fixture.debugElement.query(By.css('.j-table__search input'))
      .nativeElement as HTMLInputElement;

    expect(input.placeholder).toBe('Search products');
    input.value = 'keyboard';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.componentInstance.globalFilter).toBe('keyboard');
    expect(fixture.nativeElement.textContent).toContain('Keyboard');
    expect(fixture.nativeElement.textContent).not.toContain('Mouse');
  });

  it('shows and runs row actions without changing table selection', async () => {
    const selectedBefore = fixture.componentInstance.selection;
    const trigger = fixture.debugElement.query(By.css('[aria-label="Open row actions"]'))
      .nativeElement as HTMLButtonElement;

    expect(trigger.querySelector('svg')).toBeTruthy();
    trigger.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const action = document.body.querySelector(
      '.j-action-menu__items--popup .j-action-menu__item',
    ) as HTMLButtonElement | null;
    expect(action).toBeTruthy();
    action?.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.actionCommandCount).toBe(1);
    expect(fixture.componentInstance.lastAction?.action.key).toBe('view');
    expect(fixture.componentInstance.lastAction?.row['name']).toBe('Keyboard');
    expect(fixture.componentInstance.selection).toBe(selectedBefore);
  });

  it('can show initially hidden columns and reset them to their declared visibility', () => {
    const table = fixture.debugElement.query(By.directive(JTableComponent))
      .componentInstance as JTableComponent;
    const root = fixture.nativeElement as HTMLElement;
    const checkbox = Array.from(
      root.querySelectorAll<HTMLInputElement>('.j-table__columns-panel input'),
    ).find((input) => input.parentElement?.textContent?.includes('Internal'));

    expect(table.resolvedColumns.some((column) => column.field === 'internal')).toBe(false);
    expect(checkbox?.checked).toBe(false);
    if (checkbox) {
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change'));
    }
    fixture.detectChanges();

    expect(table.resolvedColumns.some((column) => column.field === 'internal')).toBe(true);

    const reset = Array.from(root.querySelectorAll<HTMLButtonElement>('button')).find((button) =>
      button.textContent?.includes('Reset columns'),
    );
    reset?.click();
    fixture.detectChanges();

    expect(table.resolvedColumns.some((column) => column.field === 'internal')).toBe(false);
  });

  it('runs reset, export, and maximize controls from the toolbar', () => {
    const table = fixture.debugElement.query(By.directive(JTableComponent))
      .componentInstance as JTableComponent;
    const root = fixture.nativeElement as HTMLElement;
    const search = root.querySelector('.j-table__search input') as HTMLInputElement;
    search.value = 'mouse';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const button = (label: string) =>
      Array.from(root.querySelectorAll<HTMLButtonElement>('button')).find(
        (candidate) => candidate.textContent?.trim() === label,
      );

    button('Reset filters')?.click();
    fixture.detectChanges();
    expect(search.value).toBe('');
    expect(table.visibleRows).toHaveLength(2);

    button('Export CSV')?.click();
    expect(fixture.componentInstance.exportCount).toBe(1);

    button('Maximize')?.click();
    fixture.detectChanges();
    const tableHost = root.querySelector('j-table') as HTMLElement;
    const maximizedTable = document.body.querySelector(
      '.j-table.is-maximized[data-j-maximized-owner]',
    ) as HTMLElement | null;
    expect(table.maximized).toBe(true);
    expect(maximizedTable?.parentElement).toBe(document.body);
    expect(document.body.style.overflow).toBe('hidden');

    const minimize = Array.from(
      maximizedTable?.querySelectorAll<HTMLButtonElement>('button') ?? [],
    ).find((candidate) => candidate.textContent?.trim() === 'Minimize');
    minimize?.click();
    fixture.detectChanges();
    expect(table.maximized).toBe(false);
    expect(tableHost.querySelector(':scope > .j-table')).toBeTruthy();
    expect(document.body.style.overflow).toBe('');

    button('Maximize')?.click();
    fixture.detectChanges();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(table.maximized).toBe(false);
    expect(tableHost.querySelector(':scope > .j-table')).toBeTruthy();
    expect(document.body.querySelector('.j-table.is-maximized')).toBeNull();
  });
});
