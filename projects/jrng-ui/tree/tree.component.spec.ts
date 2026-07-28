import { Component, reflectComponentType } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { JTreeComponent, JTreeNode } from './tree.component';

@Component({
  imports: [JTreeComponent],
  template: `
    <j-tree
      ariaLabel="Files"
      [value]="nodes"
      [filter]="filter"
      [selectionMode]="selectionMode"
      [(selection)]="selection"
      (nodeExpand)="expanded = $event"
    />
  `,
})
class TreeHostComponent {
  nodes: readonly JTreeNode[] = [
    {
      label: 'Documents',
      children: [
        { label: 'Report.pdf', leaf: true },
        { label: 'Budget.xlsx', leaf: true },
      ],
    },
    { label: 'Archive', leaf: true },
  ];
  selection: JTreeNode | readonly JTreeNode[] | null = null;
  expanded: JTreeNode | null = null;
  filter = false;
  selectionMode: 'single' | 'multiple' | 'checkbox' | 'none' = 'single';
}

describe('JTreeComponent', () => {
  const metadata = reflectComponentType(JTreeComponent);
  let fixture: ComponentFixture<TreeHostComponent>;
  let host: TreeHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TreeHostComponent] }).compileComponents();
    fixture = TestBed.createComponent(TreeHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function items(): HTMLElement[] {
    return fixture.debugElement
      .queryAll(By.css('[role="treeitem"]'))
      .map((item) => item.nativeElement as HTMLElement);
  }

  function refresh(): void {
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
  }

  it('keeps its public selector stable', () => {
    expect(metadata).not.toBeNull();
    expect(metadata?.selector).toBe('j-tree');
  });

  it('publishes unambiguous input, output, and projection metadata', () => {
    const inputs = metadata?.inputs.map((item) => item.propName) ?? [];
    const outputs = metadata?.outputs.map((item) => item.propName) ?? [];
    expect(new Set(inputs).size).toBe(inputs.length);
    expect(new Set(outputs).size).toBe(outputs.length);
    expect(metadata?.ngContentSelectors).toBeDefined();
  });

  it('uses a single treeitem tab stop and moves DOM focus with arrow, Home, and End keys', () => {
    expect(items().map((item) => item.tabIndex)).toEqual([0, -1]);

    items()[0]?.focus();
    items()[0]?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(items()[1]);

    items()[1]?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(items()[0]);

    items()[0]?.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(items()[1]);
  });

  it('expands with ArrowRight, moves into children, and returns to the parent', () => {
    items()[0]?.focus();
    items()[0]?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();
    expect(host.expanded).toBe(host.nodes[0]);
    expect(items()).toHaveLength(4);

    items()[0]?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(items()[1]);

    items()[1]?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(items()[0]);
  });

  it('preserves selection identity when a descendant filter keeps its parent visible', () => {
    host.filter = true;
    refresh();
    const search = fixture.debugElement.query(By.css('input[type="search"]'))
      .nativeElement as HTMLInputElement;
    search.value = 'Report';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    (
      fixture.debugElement.query(By.css('.j-tree__label')).nativeElement as HTMLButtonElement
    ).click();
    fixture.detectChanges();
    expect(host.selection).toBe(host.nodes[0]);
  });

  it('does not expose selection semantics when selection is disabled', () => {
    host.selectionMode = 'none';
    refresh();

    expect(items()[0]?.hasAttribute('aria-selected')).toBe(false);
  });
});
