import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { JTableColumn } from 'jrng-ui/table';
import { JTreeNode } from 'jrng-ui/tree';
import { JTreeTableComponent } from './tree-table.component';

interface FileData {
  readonly size: number;
  readonly status: string;
}

@Component({
  imports: [JTreeTableComponent],
  template: `
    <j-tree-table
      ariaLabel="Files"
      [value]="nodes"
      [columns]="columns"
      [selectionMode]="selectionMode"
      [(selection)]="selection"
      [(expandedKeys)]="expandedKeys"
      [lazy]="lazy"
      [propagateSelectionDown]="propagateDown"
      [propagateSelectionUp]="propagateUp"
      (lazyLoad)="lazyNode = $event.node"
    />
  `,
})
class TreeTableHostComponent {
  columns: readonly JTableColumn[] = [
    { field: 'label', header: 'Name', sortable: true },
    { field: 'size', header: 'Size', type: 'number', align: 'end' },
  ];
  nodes: readonly JTreeNode<FileData>[] = [
    {
      key: 'documents',
      label: 'Documents',
      data: { size: 2, status: 'Ready' },
      children: [
        {
          key: 'report',
          label: 'Report.pdf',
          data: { size: 18, status: 'Ready' },
          leaf: true,
        },
        {
          key: 'budget',
          label: 'Budget.xlsx',
          data: { size: 26, status: 'Draft' },
          leaf: true,
        },
      ],
    },
    { key: 'archive', label: 'Archive', data: { size: 0, status: 'Pending' } },
  ];
  selectionMode: 'single' | 'multiple' | 'checkbox' | 'none' = 'single';
  selection: JTreeNode | readonly JTreeNode[] | null = null;
  expandedKeys: ReadonlySet<string> = new Set();
  lazy = false;
  propagateDown = false;
  propagateUp = false;
  lazyNode: JTreeNode | null = null;
}

describe('JTreeTableComponent', () => {
  let fixture: ComponentFixture<TreeTableHostComponent>;
  let host: TreeTableHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TreeTableHostComponent] }).compileComponents();
    fixture = TestBed.createComponent(TreeTableHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function refresh(): void {
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
  }

  function rows(): HTMLElement[] {
    return fixture.debugElement
      .queryAll(By.css('tbody tr[data-j-tree-row]'))
      .map((row) => row.nativeElement as HTMLElement);
  }

  it('uses tree-grid semantics and expands and collapses nodes', () => {
    const table = fixture.debugElement.query(By.css('table')).nativeElement as HTMLElement;
    expect(table.getAttribute('role')).toBe('treegrid');
    expect(rows()[0]?.getAttribute('aria-expanded')).toBe('false');

    (
      fixture.debugElement.query(By.css('.j-tree-table__toggle')).nativeElement as HTMLElement
    ).click();
    refresh();
    expect(rows()).toHaveLength(4);
    expect(rows()[0]?.getAttribute('aria-expanded')).toBe('true');

    (
      fixture.debugElement.query(By.css('.j-tree-table__toggle')).nativeElement as HTMLElement
    ).click();
    refresh();
    expect(rows()).toHaveLength(2);
  });

  it('emits lazy child loading when an unloaded parent expands', () => {
    host.lazy = true;
    host.nodes = [{ key: 'remote', label: 'Remote files' }];
    refresh();
    (
      fixture.debugElement.query(By.css('.j-tree-table__toggle')).nativeElement as HTMLElement
    ).click();
    refresh();

    expect(host.lazyNode?.key).toBe('remote');
  });

  it('propagates checkbox selection and reports partial selection', () => {
    host.selectionMode = 'checkbox';
    host.propagateDown = true;
    host.propagateUp = true;
    host.expandedKeys = new Set(['documents']);
    refresh();
    const checkboxes = fixture.debugElement.queryAll(By.css('tbody input[type="checkbox"]'));

    (checkboxes[1]?.nativeElement as HTMLInputElement).click();
    refresh();
    expect((checkboxes[0]?.nativeElement as HTMLInputElement).indeterminate).toBe(true);

    (checkboxes[2]?.nativeElement as HTMLInputElement).click();
    refresh();
    expect((host.selection as readonly JTreeNode[]).map((node) => node.key)).toEqual(
      expect.arrayContaining(['documents', 'report', 'budget']),
    );
  });

  it('supports row keyboard navigation, expansion and selection', () => {
    const first = rows()[0]!;
    first.focus();
    first.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    refresh();
    expect(rows()).toHaveLength(4);

    rows()[0]?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    refresh();
    expect(document.activeElement).toBe(rows()[1]);

    rows()[1]?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    refresh();
    expect((host.selection as JTreeNode)?.key).toBe('report');
    expect(rows()[1]?.getAttribute('aria-selected')).toBe('true');
  });
});
