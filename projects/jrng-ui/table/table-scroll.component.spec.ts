import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { JTableComponent } from './table.component';
import { JTableColumn, JTableRow } from './table.types';

@Component({
  imports: [JTableComponent],
  template: `
    <div [attr.dir]="direction">
      <j-table
        [value]="rows"
        [columns]="columns"
        [scrollable]="scrollable"
        [scrollHeight]="scrollHeight"
        [tableStyle]="tableStyle"
        [loading]="loading"
        loadingVariant="overlay"
        [paginator]="false"
        [showGlobalFilter]="false"
        [showColumnManager]="false"
        [showExport]="false"
        [maximizable]="false"
      />
    </div>
  `,
})
class ScrollTableHostComponent {
  scrollable = true;
  scrollHeight = '';
  loading = false;
  direction: 'ltr' | 'rtl' = 'ltr';
  tableStyle: Readonly<Record<string, string>> | null = { 'min-width': '110rem' };
  columns: readonly JTableColumn[] = [
    { field: 'id', header: 'ID', frozen: true, width: '6rem' },
    { field: 'account.name', header: 'Name', sortable: true, filterable: true, minWidth: '14rem' },
    { field: 'company', header: 'Company', frozen: true, width: '16rem' },
    {
      field: 'actions',
      header: 'Actions',
      frozen: true,
      frozenAlign: 'end',
      width: '9rem',
    },
  ];
  rows: readonly JTableRow[] = [
    { id: 1, account: { name: 'Zulu' }, company: 'Northstar', actions: 'View' },
    { id: 2, account: { name: 'Alpha' }, company: 'Blue Cedar', actions: 'View' },
  ];
}

describe('JTableComponent scrolling architecture', () => {
  let fixture: ComponentFixture<ScrollTableHostComponent>;
  let table: JTableComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScrollTableHostComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ScrollTableHostComponent);
    fixture.detectChanges();
    table = fixture.debugElement.query(By.directive(JTableComponent))
      .componentInstance as JTableComponent;
  });

  function detectHostChanges(): void {
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
  }

  it('owns horizontal overflow and applies an explicit minimum table width', () => {
    const viewport = fixture.nativeElement.querySelector('.j-table__scroll') as HTMLElement;
    const element = viewport.querySelector('.j-table__element') as HTMLTableElement;

    expect(viewport.getAttribute('role')).toBe('region');
    expect(viewport.tabIndex).toBe(0);
    expect(viewport.getAttribute('aria-label')).toBe('Scrollable table');
    expect(getComputedStyle(viewport).overflow).toBe('auto');
    expect(element.style.minWidth).toBe('110rem');
  });

  it('removes unnecessary overflow behavior when scrolling is disabled', () => {
    fixture.componentInstance.scrollable = false;
    detectHostChanges();

    const root = fixture.nativeElement.querySelector('.j-table') as HTMLElement;
    const viewport = fixture.nativeElement.querySelector('.j-table__scroll') as HTMLElement;
    expect(root.classList).toContain('j-table--not-scrollable');
    expect(viewport.hasAttribute('tabindex')).toBe(false);
    expect(viewport.hasAttribute('role')).toBe(false);
    expect(getComputedStyle(viewport).overflow).toBe('visible');
  });

  it('supports a flex-height viewport without emitting invalid max-height CSS', () => {
    fixture.componentInstance.scrollHeight = 'flex';
    detectHostChanges();

    const root = fixture.nativeElement.querySelector('.j-table') as HTMLElement;
    const viewport = fixture.nativeElement.querySelector('.j-table__scroll') as HTMLElement;
    expect(root.classList).toContain('j-table--flex-scroll');
    expect(viewport.style.height).toBe('100%');
    expect(viewport.style.maxHeight).toBe('none');
  });

  it('uses logical sticky offsets for start/end frozen columns in RTL', () => {
    fixture.componentInstance.direction = 'rtl';
    detectHostChanges();

    const headers = [
      ...fixture.nativeElement.querySelectorAll('thead [data-jc-section="header-cell"]'),
    ] as HTMLElement[];
    expect(headers[0]?.style.insetInlineStart).toContain('--j-table-select-column-width');
    expect(headers[2]?.style.insetInlineStart).toContain('6rem');
    expect(headers[2]?.style.insetInlineStart).toContain('--j-table-select-column-width');
    expect(headers[3]?.style.insetInlineEnd).toBe('0px');
    expect(headers[0]?.style.left).toBe('');
    expect(headers[3]?.style.right).toBe('');
  });

  it('updates width and sticky structure when dynamic columns change', () => {
    fixture.componentInstance.columns = fixture.componentInstance.columns.slice(0, 2);
    fixture.componentInstance.tableStyle = { 'min-width': '44rem' };
    detectHostChanges();

    expect(
      fixture.nativeElement.querySelectorAll('thead [data-jc-section="header-cell"]').length,
    ).toBe(2);
    expect(
      (fixture.nativeElement.querySelector('.j-table__element') as HTMLElement).style.minWidth,
    ).toBe('44rem');
  });

  it('renders, sorts, and filters nested fields through one value-access path', () => {
    expect(fixture.nativeElement.textContent).toContain('Zulu');
    table.sortMode = 'single';
    table.sortBy('account.name', 1);
    fixture.detectChanges();
    expect(table.visibleRows[0]?.['id']).toBe(2);

    table.filter('account.name', 'zul');
    fixture.detectChanges();
    expect(table.visibleRows.map((row) => row['id'])).toEqual([1]);
  });

  it('removes the overlay after loading without changing the scroll viewport', () => {
    const viewport = fixture.nativeElement.querySelector('.j-table__scroll') as HTMLElement;
    fixture.componentInstance.loading = true;
    detectHostChanges();
    expect(viewport.querySelector('.j-table__loading-overlay')).toBeTruthy();

    fixture.componentInstance.loading = false;
    detectHostChanges();
    expect(viewport.querySelector('.j-table__loading-overlay')).toBeNull();
    expect(viewport.tabIndex).toBe(0);
  });
});
