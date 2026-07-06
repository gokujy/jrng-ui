import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  booleanAttribute,
  computed,
  contentChild,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { JTableColumn } from 'jrng-ui/table';
import { JTreeNode, JTreeSelectionMode } from 'jrng-ui/tree';

export interface JTreeTableCellContext {
  readonly $implicit: JTreeNode;
  readonly node: JTreeNode;
  readonly column: JTableColumn;
  readonly value: unknown;
  readonly level: number;
}

export interface JTreeTableLazyLoadEvent {
  readonly node: JTreeNode;
}

export interface JTreeTableSortEvent {
  readonly field: string;
  readonly order: 1 | -1 | 0;
}

interface JTreeTableEntry {
  readonly node: JTreeNode;
  readonly level: number;
  readonly key: string;
}

@Component({
  selector: 'j-tree-table',
  imports: [NgTemplateOutlet],
  template: `
    <section
      class="j-tree-table"
      [class]="styleClass()"
      data-jc-name="tree-table"
      data-jc-section="root"
    >
      @if (filter()) {
        <label class="j-tree-table__filter" data-jc-section="filter">
          <span class="j-hidden-accessible">Filter tree table</span>
          <input
            type="search"
            [value]="filterValue()"
            [placeholder]="filterPlaceholder()"
            (input)="setFilter($event)"
          />
        </label>
      }

      <div class="j-tree-table__scroll" data-jc-section="viewport">
        <table role="treegrid" [attr.aria-label]="ariaLabel()">
          <thead>
            <tr>
              @if (selectionMode() === 'checkbox') {
                <th class="j-tree-table__select-cell"></th>
              }
              @for (column of columns(); track column.field) {
                <th scope="col" [attr.aria-sort]="ariaSort(column)">
                  @if (column.sortable) {
                    <button class="j-tree-table__sort" type="button" (click)="toggleSort(column)">
                      {{ column.header }}
                    </button>
                  } @else {
                    {{ column.header }}
                  }
                </th>
              }
            </tr>
          </thead>
          <tbody>
            @for (entry of visibleEntries(); track entry.key) {
              <tr
                role="row"
                data-jc-section="row"
                [attr.aria-level]="entry.level"
                [attr.aria-expanded]="
                  hasChildren(entry.node) ? expandedKeys().has(entry.key) : null
                "
                [attr.aria-selected]="isSelected(entry.node)"
                [attr.data-j-selected]="isSelected(entry.node) ? 'true' : null"
                [attr.data-j-disabled]="entry.node.disabled ? 'true' : null"
                [attr.data-j-open]="expandedKeys().has(entry.key) ? 'true' : null"
              >
                @if (selectionMode() === 'checkbox') {
                  <td class="j-tree-table__select-cell">
                    <input
                      type="checkbox"
                      [checked]="isSelected(entry.node)"
                      [disabled]="entry.node.disabled"
                      (change)="toggleSelection(entry.node, $event)"
                    />
                  </td>
                }
                @for (column of columns(); track column.field; let columnIndex = $index) {
                  <td [attr.data-label]="column.header">
                    <div
                      class="j-tree-table__cell"
                      [style.padding-left.rem]="columnIndex === 0 ? (entry.level - 1) * 1.25 : 0"
                    >
                      @if (columnIndex === 0) {
                        <button
                          class="j-tree-table__toggle"
                          type="button"
                          [disabled]="!hasChildren(entry.node) || entry.node.disabled"
                          [attr.aria-label]="
                            expandedKeys().has(entry.key) ? 'Collapse row' : 'Expand row'
                          "
                          (click)="toggle(entry.node, entry.key)"
                        >
                          @if (hasChildren(entry.node)) {
                            {{ expandedKeys().has(entry.key) ? '-' : '+' }}
                          }
                        </button>
                      }
                      @if (cellTemplate(); as template) {
                        <ng-container
                          [ngTemplateOutlet]="template"
                          [ngTemplateOutletContext]="cellContext(entry.node, column, entry.level)"
                        />
                      } @else {
                        {{ cellValue(entry.node, column) }}
                      }
                    </div>
                  </td>
                }
              </tr>
            } @empty {
              <tr>
                <td
                  class="j-tree-table__empty"
                  [attr.colspan]="columns().length + (selectionMode() === 'checkbox' ? 1 : 0)"
                >
                  {{ emptyMessage() }}
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>
  `,
  styles: [
    `
      .j-tree-table {
        background: var(--j-color-card);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-lg);
        color: var(--j-color-card-foreground);
        overflow: hidden;
      }

      .j-tree-table__filter {
        border-bottom: 1px solid var(--j-color-border);
        display: block;
        padding: var(--j-spacing-3);
      }

      .j-tree-table__filter input {
        background: var(--j-color-surface);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-md);
        color: inherit;
        font: inherit;
        min-height: 2.5rem;
        padding: 0 var(--j-spacing-3);
        width: 100%;
      }

      .j-tree-table__scroll {
        overflow: auto;
      }

      table {
        border-collapse: collapse;
        min-width: 100%;
      }

      th,
      td {
        border-bottom: 1px solid var(--j-color-border);
        padding: var(--j-spacing-3);
        text-align: start;
      }

      th {
        background: var(--j-table-header-bg);
        color: var(--j-color-muted-foreground);
        font-weight: var(--j-font-weight-semibold);
      }

      .j-tree-table__cell {
        align-items: center;
        display: flex;
        gap: var(--j-spacing-2);
      }

      .j-tree-table__toggle,
      .j-tree-table__sort {
        background: transparent;
        border: 0;
        border-radius: var(--j-radius-sm);
        color: inherit;
        cursor: pointer;
        font: inherit;
      }

      .j-tree-table__toggle {
        height: 1.75rem;
        width: 1.75rem;
      }

      .j-tree-table__toggle:focus-visible,
      .j-tree-table__sort:focus-visible,
      .j-tree-table__filter input:focus-visible {
        box-shadow: var(--j-focus-ring);
        outline: none;
      }

      .j-tree-table__select-cell {
        text-align: center;
        width: 3rem;
      }

      .j-tree-table__empty {
        color: var(--j-color-muted-foreground);
        text-align: center;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JTreeTableComponent {
  readonly value = input<readonly JTreeNode[]>([]);
  readonly columns = input<readonly JTableColumn[]>([]);
  readonly selection = model<JTreeNode | readonly JTreeNode[] | null>(null);
  readonly selectionMode = input<JTreeSelectionMode>('single');
  readonly ariaLabel = input('Tree table');
  readonly filterPlaceholder = input('Filter');
  readonly emptyMessage = input('No records found.');
  readonly styleClass = input('');
  readonly filter = input(false, { transform: booleanAttribute });
  readonly lazy = input(false, { transform: booleanAttribute });

  readonly nodeExpand = output<JTreeNode>();
  readonly nodeCollapse = output<JTreeNode>();
  readonly lazyLoad = output<JTreeTableLazyLoadEvent>();
  readonly sortChange = output<JTreeTableSortEvent>();

  readonly cellTemplate = contentChild<unknown, TemplateRef<JTreeTableCellContext>>(
    'jTreeTableCell',
    { read: TemplateRef },
  );

  readonly filterValue = signal('');
  readonly sortField = signal('');
  readonly sortOrder = signal<1 | -1 | 0>(0);
  readonly expandedKeys = signal<ReadonlySet<string>>(new Set());

  readonly visibleEntries = computed(() => {
    const nodes = this.filterValue() ? this.filterNodes(this.value()) : this.value();
    const entries = this.flatten(nodes);
    if (!this.sortField() || this.sortOrder() === 0) {
      return entries;
    }
    return [...entries].sort(
      (a, b) =>
        String(
          this.cellValue(a.node, { field: this.sortField(), header: this.sortField() }),
        ).localeCompare(
          String(this.cellValue(b.node, { field: this.sortField(), header: this.sortField() })),
        ) * this.sortOrder(),
    );
  });

  setFilter(event: Event): void {
    this.filterValue.set((event.target as HTMLInputElement | null)?.value ?? '');
  }

  toggle(node: JTreeNode, key: string): void {
    const next = new Set(this.expandedKeys());
    if (next.has(key)) {
      next.delete(key);
      this.expandedKeys.set(next);
      this.nodeCollapse.emit(node);
      return;
    }
    next.add(key);
    this.expandedKeys.set(next);
    this.nodeExpand.emit(node);
    if (this.lazy() && node.children == null && !node.leaf) {
      this.lazyLoad.emit({ node });
    }
  }

  toggleSort(column: JTableColumn): void {
    const nextOrder =
      this.sortField() !== column.field
        ? 1
        : this.sortOrder() === 1
          ? -1
          : this.sortOrder() === -1
            ? 0
            : 1;
    this.sortOrder.set(nextOrder);
    this.sortField.set(nextOrder === 0 ? '' : column.field);
    this.sortChange.emit({ field: column.field, order: nextOrder });
  }

  ariaSort(column: JTableColumn): 'ascending' | 'descending' | 'none' | null {
    if (!column.sortable) {
      return null;
    }
    if (this.sortField() !== column.field || this.sortOrder() === 0) {
      return 'none';
    }
    return this.sortOrder() === 1 ? 'ascending' : 'descending';
  }

  hasChildren(node: JTreeNode): boolean {
    return !node.leaf && ((node.children?.length ?? 0) > 0 || this.lazy());
  }

  isSelected(node: JTreeNode): boolean {
    const currentSelection = this.selection();
    return this.isNodeArray(currentSelection)
      ? currentSelection.some((item) => this.sameNode(item, node))
      : !!currentSelection && this.sameNode(currentSelection, node);
  }

  toggleSelection(node: JTreeNode, event: Event): void {
    event.stopPropagation();
    if (node.disabled || node.selectable === false || this.selectionMode() === 'none') {
      return;
    }
    if (this.selectionMode() === 'single') {
      this.selection.set(node);
      return;
    }
    const currentSelection = this.selection();
    const current = this.isNodeArray(currentSelection) ? [...currentSelection] : [];
    const exists = current.some((item) => this.sameNode(item, node));
    const next = exists ? current.filter((item) => !this.sameNode(item, node)) : [...current, node];
    this.selection.set(next);
  }

  cellValue(node: JTreeNode, column: JTableColumn): unknown {
    if (column.field === 'label') {
      return node.label;
    }
    return typeof node.data === 'object' && node.data != null
      ? (node.data as Record<string, unknown>)[column.field]
      : '';
  }

  cellContext(node: JTreeNode, column: JTableColumn, level: number): JTreeTableCellContext {
    return { $implicit: node, node, column, value: this.cellValue(node, column), level };
  }

  private flatten(nodes: readonly JTreeNode[], level = 1, parent = 'root'): JTreeTableEntry[] {
    return nodes.flatMap((node, index) => {
      const key = node.key ?? `${parent}-${index}-${node.label}`;
      const children = this.expandedKeys().has(key)
        ? this.flatten(node.children ?? [], level + 1, key)
        : [];
      return [{ node, level, key }, ...children];
    });
  }

  private filterNodes(nodes: readonly JTreeNode[]): readonly JTreeNode[] {
    const query = this.filterValue().trim().toLowerCase();
    const filtered: JTreeNode[] = [];
    for (const node of nodes) {
      const children = node.children ? this.filterNodes(node.children) : [];
      if (node.label.toLowerCase().includes(query) || children.length) {
        filtered.push(children.length ? { ...node, children } : node);
      }
    }
    return filtered;
  }

  private sameNode(left: JTreeNode, right: JTreeNode): boolean {
    return left === right || (!!left.key && left.key === right.key);
  }

  private isNodeArray(
    value: JTreeNode | readonly JTreeNode[] | null,
  ): value is readonly JTreeNode[] {
    return Array.isArray(value);
  }
}
