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
import {
  JTreeTableCellContext,
  JTreeTableCellTemplateDirective,
} from './tree-table-template.directive';

export type { JTreeTableCellContext } from './tree-table-template.directive';

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
  readonly parentKey: string;
  readonly position: number;
  readonly setSize: number;
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
        <table
          role="treegrid"
          [attr.aria-label]="ariaLabel()"
          [attr.aria-multiselectable]="isMultiSelect()"
          [attr.aria-rowcount]="visibleEntries().length + 1"
          [attr.aria-colcount]="visibleColumns().length + (selectionMode() === 'checkbox' ? 1 : 0)"
        >
          <thead>
            <tr>
              @if (selectionMode() === 'checkbox') {
                <th
                  class="j-tree-table__select-cell"
                  role="columnheader"
                  aria-label="Selection"
                ></th>
              }
              @for (column of visibleColumns(); track column.field) {
                <th
                  scope="col"
                  role="columnheader"
                  [class]="columnClass(column, true)"
                  [style.width]="column.width || null"
                  [style.min-width]="column.minWidth || null"
                  [style.max-width]="column.maxWidth || null"
                  [attr.aria-sort]="ariaSort(column)"
                >
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
                data-j-tree-row
                data-jc-section="row"
                [attr.aria-level]="entry.level"
                [attr.aria-posinset]="entry.position"
                [attr.aria-setsize]="entry.setSize"
                [attr.aria-rowindex]="$index + 2"
                [attr.aria-expanded]="
                  hasChildren(entry.node) ? expandedKeys().has(entry.key) : null
                "
                [attr.aria-selected]="selectionMode() === 'none' ? null : isSelected(entry.node)"
                [attr.data-j-selected]="isSelected(entry.node) ? 'true' : null"
                [attr.data-j-disabled]="entry.node.disabled ? 'true' : null"
                [attr.data-j-open]="expandedKeys().has(entry.key) ? 'true' : null"
                [attr.tabindex]="rowTabIndex(entry, $index)"
                (focus)="focusedKey.set(entry.key)"
                (click)="handleRowClick(entry.node, $event)"
                (keydown)="handleRowKeydown($event, entry, $index)"
              >
                @if (selectionMode() === 'checkbox') {
                  <td class="j-tree-table__select-cell" role="gridcell" aria-colindex="1">
                    <input
                      type="checkbox"
                      [checked]="isSelected(entry.node)"
                      [indeterminate]="isPartiallySelected(entry.node)"
                      [attr.aria-checked]="
                        isPartiallySelected(entry.node) ? 'mixed' : isSelected(entry.node)
                      "
                      [disabled]="entry.node.disabled"
                      [attr.aria-label]="'Select ' + entry.node.label"
                      (click)="$event.stopPropagation()"
                      (change)="toggleSelection(entry.node, $event)"
                    />
                  </td>
                }
                @for (column of visibleColumns(); track column.field; let columnIndex = $index) {
                  <td
                    role="gridcell"
                    [class]="columnClass(column)"
                    [style.width]="column.width || null"
                    [style.min-width]="column.minWidth || null"
                    [style.max-width]="column.maxWidth || null"
                    [attr.aria-colindex]="
                      columnIndex + 1 + (selectionMode() === 'checkbox' ? 1 : 0)
                    "
                    [attr.data-label]="column.header"
                  >
                    <div
                      class="j-tree-table__cell"
                      [style.padding-inline-start]="
                        columnIndex === togglerColumn() ? (entry.level - 1) * 1.25 + 'rem' : null
                      "
                    >
                      @if (columnIndex === togglerColumn()) {
                        <button
                          class="j-tree-table__toggle"
                          type="button"
                          [disabled]="!hasChildren(entry.node) || entry.node.disabled"
                          [attr.aria-label]="
                            expandedKeys().has(entry.key) ? 'Collapse row' : 'Expand row'
                          "
                          [attr.aria-expanded]="
                            hasChildren(entry.node) ? expandedKeys().has(entry.key) : null
                          "
                          (click)="toggle(entry.node, entry.key, $event)"
                        >
                          @if (hasChildren(entry.node)) {
                            {{ expandedKeys().has(entry.key) ? '-' : '+' }}
                          }
                        </button>
                      }
                      @if (resolvedCellTemplate(); as template) {
                        <ng-container
                          [ngTemplateOutlet]="template"
                          [ngTemplateOutletContext]="cellContext(entry.node, column, entry.level)"
                        />
                      } @else {
                        {{ formattedCellValue(entry.node, column) }}
                      }
                    </div>
                  </td>
                }
              </tr>
            } @empty {
              <tr>
                <td
                  class="j-tree-table__empty"
                  [attr.colspan]="
                    visibleColumns().length + (selectionMode() === 'checkbox' ? 1 : 0)
                  "
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

      .j-tree-table__align-center {
        text-align: center;
      }

      .j-tree-table__align-end {
        text-align: end;
      }

      .j-tree-table__frozen {
        background: var(--j-color-card);
        inset-inline-start: 0;
        position: sticky;
        z-index: 1;
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

      tbody tr[tabindex]:focus-visible {
        box-shadow: inset var(--j-focus-ring);
        outline: none;
      }

      tbody tr[data-j-disabled='true'] {
        opacity: var(--j-disabled-opacity, 0.55);
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
  readonly childrenField = input('children');
  readonly togglerColumn = input(0);
  readonly filter = input(false, { transform: booleanAttribute });
  readonly lazy = input(false, { transform: booleanAttribute });
  readonly propagateSelectionDown = input(false, { transform: booleanAttribute });
  readonly propagateSelectionUp = input(false, { transform: booleanAttribute });

  readonly nodeExpand = output<JTreeNode>();
  readonly nodeCollapse = output<JTreeNode>();
  readonly nodeSelect = output<JTreeNode>();
  readonly nodeUnselect = output<JTreeNode>();
  readonly lazyLoad = output<JTreeTableLazyLoadEvent>();
  readonly sortChange = output<JTreeTableSortEvent>();

  readonly cellTemplate = contentChild<unknown, TemplateRef<JTreeTableCellContext>>(
    'jTreeTableCell',
    { read: TemplateRef },
  );
  readonly typedCellTemplate = contentChild(JTreeTableCellTemplateDirective);

  readonly filterValue = signal('');
  readonly sortField = signal('');
  readonly sortOrder = signal<1 | -1 | 0>(0);
  readonly expandedKeys = model<ReadonlySet<string>>(new Set());
  readonly focusedKey = signal('');

  readonly visibleEntries = computed(() => {
    const nodes = this.filterValue() ? this.filterNodes(this.value()) : this.value();
    // Sorting happens per sibling group inside flatten(), so children stay
    // grouped under their parent instead of being interleaved by a global sort.
    return this.flatten(nodes);
  });
  readonly visibleColumns = computed(() =>
    this.columns().filter((column) => column.visible !== false && column.hidden !== true),
  );

  setFilter(event: Event): void {
    this.filterValue.set((event.target as HTMLInputElement | null)?.value ?? '');
  }

  resolvedCellTemplate(): TemplateRef<JTreeTableCellContext> | null {
    return (this.typedCellTemplate()?.templateRef ??
      this.cellTemplate() ??
      null) as TemplateRef<JTreeTableCellContext> | null;
  }

  isMultiSelect(): boolean {
    return this.selectionMode() === 'multiple' || this.selectionMode() === 'checkbox';
  }

  toggle(node: JTreeNode, key: string, event?: Event): void {
    event?.stopPropagation();
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
    if (this.lazy() && this.childrenOf(node).length === 0 && !node.leaf) {
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

  columnClass(column: JTableColumn, header = false): string {
    const align = header ? (column.headerAlign ?? column.align) : column.align;
    const normalized =
      align === 'center' ? 'center' : align === 'end' ? 'end' : 'start';
    return [`j-tree-table__align-${normalized}`, column.frozen ? 'j-tree-table__frozen' : '']
      .filter(Boolean)
      .join(' ');
  }

  hasChildren(node: JTreeNode): boolean {
    return !node.leaf && (this.childrenOf(node).length > 0 || this.lazy());
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
      const selected = this.isSelected(node);
      this.selection.set(selected ? null : node);
      (selected ? this.nodeUnselect : this.nodeSelect).emit(node);
      return;
    }
    const currentSelection = this.selection();
    let current = this.isNodeArray(currentSelection) ? [...currentSelection] : [];
    const exists = current.some((item) => this.sameNode(item, node));
    const affected =
      this.selectionMode() === 'checkbox' && this.propagateSelectionDown()
        ? [node, ...this.descendantsOf(node)]
        : [node];
    current = exists
      ? current.filter((item) => !affected.some((target) => this.sameNode(item, target)))
      : [
          ...current,
          ...affected.filter(
            (target) => !current.some((selected) => this.sameNode(selected, target)),
          ),
        ];
    if (this.selectionMode() === 'checkbox' && this.propagateSelectionUp()) {
      current = this.reconcileParentSelection(this.value(), current);
    }
    this.selection.set(current);
    (exists ? this.nodeUnselect : this.nodeSelect).emit(node);
  }

  handleRowClick(node: JTreeNode, event: MouseEvent): void {
    if (this.selectionMode() === 'checkbox' || this.selectionMode() === 'none') {
      return;
    }
    this.toggleSelection(node, event);
  }

  rowTabIndex(entry: JTreeTableEntry, index: number): number {
    return this.focusedKey() ? (this.focusedKey() === entry.key ? 0 : -1) : index === 0 ? 0 : -1;
  }

  handleRowKeydown(event: KeyboardEvent, entry: JTreeTableEntry, index: number): void {
    const entries = this.visibleEntries();
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.focusEntry(event, Math.min(entries.length - 1, index + 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.focusEntry(event, Math.max(0, index - 1));
    } else if (event.key === 'Home') {
      event.preventDefault();
      this.focusEntry(event, 0);
    } else if (event.key === 'End') {
      event.preventDefault();
      this.focusEntry(event, entries.length - 1);
    } else if (event.key === 'ArrowRight') {
      if (this.hasChildren(entry.node) && !this.expandedKeys().has(entry.key)) {
        event.preventDefault();
        this.toggle(entry.node, entry.key);
      } else if (this.expandedKeys().has(entry.key) && index < entries.length - 1) {
        event.preventDefault();
        this.focusEntry(event, index + 1);
      }
    } else if (event.key === 'ArrowLeft') {
      if (this.expandedKeys().has(entry.key)) {
        event.preventDefault();
        this.toggle(entry.node, entry.key);
      } else if (entry.parentKey !== 'root') {
        const parentIndex = entries.findIndex((candidate) => candidate.key === entry.parentKey);
        if (parentIndex >= 0) {
          event.preventDefault();
          this.focusEntry(event, parentIndex);
        }
      }
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggleSelection(entry.node, event);
    }
  }

  isPartiallySelected(node: JTreeNode): boolean {
    const children = this.childrenOf(node);
    if (!children.length) {
      return false;
    }
    const states = children.map((child) =>
      this.isSelected(child) ? 'selected' : this.isPartiallySelected(child) ? 'partial' : 'none',
    );
    return (
      states.some((state) => state !== 'none') && !states.every((state) => state === 'selected')
    );
  }

  cellValue(node: JTreeNode, column: JTableColumn): unknown {
    if (column.valueGetter && typeof node.data === 'object' && node.data != null) {
      return column.valueGetter(node.data as Record<string, unknown>, column);
    }
    if (column.field === 'label') {
      return node.label;
    }
    return typeof node.data === 'object' && node.data != null
      ? (node.data as Record<string, unknown>)[column.field]
      : '';
  }

  formattedCellValue(node: JTreeNode, column: JTableColumn): string {
    const value = this.cellValue(node, column);
    if (column.formatter && typeof node.data === 'object' && node.data != null) {
      const formatted = column.formatter(value, node.data as Record<string, unknown>, column);
      return formatted == null ? '' : String(formatted);
    }
    if (value instanceof Date) {
      return value.toLocaleDateString();
    }
    if (column.type === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    return value == null ? '' : String(value);
  }

  cellContext(node: JTreeNode, column: JTableColumn, level: number): JTreeTableCellContext {
    return {
      $implicit: node as JTreeNode<Record<string, unknown>>,
      node: node as JTreeNode<Record<string, unknown>>,
      column,
      value: this.cellValue(node, column),
      level,
      selected: this.isSelected(node),
      expanded: this.expandedKeys().has(this.keyForNode(node)),
      partial: this.isPartiallySelected(node),
    };
  }

  private flatten(nodes: readonly JTreeNode[], level = 1, parent = 'root'): JTreeTableEntry[] {
    // Pair each node with its original index so keys (and therefore expand
    // state) stay stable regardless of the active sort order.
    const ordered = this.sortSiblings(nodes.map((node, index) => ({ node, index })));
    return ordered.flatMap(({ node, index }) => {
      const key = node.key ?? `${parent}-${index}-${node.label}`;
      const children = this.expandedKeys().has(key)
        ? this.flatten(this.childrenOf(node), level + 1, key)
        : [];
      return [
        { node, level, key, parentKey: parent, position: index + 1, setSize: ordered.length },
        ...children,
      ];
    });
  }

  private sortSiblings(
    entries: { node: JTreeNode; index: number }[],
  ): { node: JTreeNode; index: number }[] {
    const field = this.sortField();
    const order = this.sortOrder();
    if (!field || order === 0) {
      return entries;
    }
    return [...entries].sort(
      (a, b) =>
        String(this.cellValue(a.node, { field, header: field })).localeCompare(
          String(this.cellValue(b.node, { field, header: field })),
        ) * order,
    );
  }

  private filterNodes(nodes: readonly JTreeNode[]): readonly JTreeNode[] {
    const query = this.filterValue().trim().toLowerCase();
    const filtered: JTreeNode[] = [];
    for (const node of nodes) {
      const nodeChildren = this.childrenOf(node);
      const children = nodeChildren.length ? this.filterNodes(nodeChildren) : [];
      if (node.label.toLowerCase().includes(query) || children.length) {
        filtered.push(children.length ? { ...node, children } : node);
      }
    }
    return filtered;
  }

  private sameNode(left: JTreeNode, right: JTreeNode): boolean {
    return left === right || (!!left.key && left.key === right.key);
  }

  private childrenOf(node: JTreeNode): readonly JTreeNode[] {
    if (node.children !== undefined || this.childrenField() === 'children') {
      return node.children ?? [];
    }
    const direct = (node as unknown as Record<string, unknown>)[this.childrenField()];
    if (Array.isArray(direct)) {
      return direct as readonly JTreeNode[];
    }
    if (typeof node.data === 'object' && node.data != null) {
      const nested = (node.data as Record<string, unknown>)[this.childrenField()];
      if (Array.isArray(nested)) {
        return nested as readonly JTreeNode[];
      }
    }
    return node.children ?? [];
  }

  private descendantsOf(node: JTreeNode): readonly JTreeNode[] {
    return this.childrenOf(node).flatMap((child) => [child, ...this.descendantsOf(child)]);
  }

  private reconcileParentSelection(
    nodes: readonly JTreeNode[],
    selection: readonly JTreeNode[],
  ): JTreeNode[] {
    let next = [...selection];
    for (const node of nodes) {
      const children = this.childrenOf(node);
      if (!children.length) {
        continue;
      }
      next = this.reconcileParentSelection(children, next);
      const allChildrenSelected = children.every((child) =>
        next.some((selected) => this.sameNode(selected, child)),
      );
      const parentIndex = next.findIndex((selected) => this.sameNode(selected, node));
      if (allChildrenSelected && parentIndex < 0) {
        next.push(node);
      } else if (!allChildrenSelected && parentIndex >= 0) {
        next.splice(parentIndex, 1);
      }
    }
    return next;
  }

  private focusEntry(event: KeyboardEvent, index: number): void {
    const rows = (event.currentTarget as HTMLElement | null)
      ?.closest('table')
      ?.querySelectorAll<HTMLElement>('tbody tr[data-j-tree-row]');
    const row = rows?.item(index);
    if (row) {
      this.focusedKey.set(this.visibleEntries()[index]?.key ?? '');
      row.focus();
    }
  }

  private keyForNode(node: JTreeNode): string {
    return node.key ?? node.label;
  }

  private isNodeArray(
    value: JTreeNode | readonly JTreeNode[] | null,
  ): value is readonly JTreeNode[] {
    return Array.isArray(value);
  }
}
