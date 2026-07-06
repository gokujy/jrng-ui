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

export type JTreeSelectionMode = 'single' | 'multiple' | 'checkbox' | 'none';

export interface JTreeNode {
  readonly key?: string;
  readonly label: string;
  readonly icon?: string;
  readonly expandedIcon?: string;
  readonly collapsedIcon?: string;
  readonly disabled?: boolean;
  readonly selectable?: boolean;
  readonly leaf?: boolean;
  readonly loading?: boolean;
  readonly data?: unknown;
  readonly children?: readonly JTreeNode[];
}

export interface JTreeNodeContext {
  readonly $implicit: JTreeNode;
  readonly node: JTreeNode;
  readonly level: number;
  readonly selected: boolean;
  readonly expanded: boolean;
}

export interface JTreeLazyLoadEvent {
  readonly node: JTreeNode;
}

interface JTreeFlatEntry {
  readonly node: JTreeNode;
  readonly key: string;
  readonly index: number;
  readonly level: number;
  readonly parentKey: string;
}

@Component({
  selector: 'j-tree',
  imports: [NgTemplateOutlet],
  template: `
    <section
      class="j-tree"
      [class]="styleClass()"
      data-jc-name="tree"
      data-jc-section="root"
      role="tree"
      [attr.aria-label]="ariaLabel()"
      (keydown)="handleKeydown($event)"
    >
      @if (filter()) {
        <label class="j-tree__filter" data-jc-section="filter">
          <span class="j-hidden-accessible">Filter tree</span>
          <input
            type="search"
            [value]="filterValue()"
            [placeholder]="filterPlaceholder()"
            (input)="setFilter($event)"
          />
        </label>
      }

      <ng-container
        [ngTemplateOutlet]="treeList"
        [ngTemplateOutletContext]="{ nodes: visibleNodes(), level: 1, parentKey: 'root' }"
      />
    </section>

    <ng-template #treeList let-nodes="nodes" let-level="level" let-parentKey="parentKey">
      <ul class="j-tree__list" role="group">
        @for (node of nodes; track node.key || node.label || $index; let index = $index) {
          @let key = nodeKey(node, index, level, parentKey);
          <li
            class="j-tree__node"
            role="treeitem"
            data-jc-section="node"
            [attr.aria-level]="level"
            [attr.aria-expanded]="hasChildren(node) ? isExpandedKey(key) : null"
            [attr.aria-selected]="isSelected(node)"
            [attr.data-j-selected]="isSelected(node) ? 'true' : null"
            [attr.data-j-focused]="activeKey() === key ? 'true' : null"
            [attr.data-j-disabled]="node.disabled ? 'true' : null"
            [attr.data-j-open]="isExpandedKey(key) ? 'true' : null"
          >
            <div
              class="j-tree__row"
              [class.is-active]="activeKey() === key"
              [style.padding-left.rem]="(level - 1) * 1.25"
            >
              <button
                class="j-tree__toggle"
                type="button"
                [disabled]="!hasChildren(node) || node.disabled"
                [attr.aria-label]="isExpandedKey(key) ? 'Collapse node' : 'Expand node'"
                [attr.tabindex]="activeKey() === key ? 0 : -1"
                (click)="toggle(node, key)"
                (focus)="setActive(key)"
              >
                @if (hasChildren(node)) {
                  <span aria-hidden="true">{{ isExpandedKey(key) ? '-' : '+' }}</span>
                }
              </button>

              @if (selectionMode() === 'checkbox') {
                <input
                  class="j-tree__checkbox"
                  type="checkbox"
                  [disabled]="node.disabled || node.selectable === false"
                  [checked]="isSelected(node)"
                  (change)="toggleSelection(node, $event)"
                />
              }

              <button
                class="j-tree__label"
                type="button"
                [disabled]="node.disabled"
                [attr.tabindex]="activeKey() === key ? 0 : -1"
                (click)="selectNode(node, key, $event)"
                (focus)="setActive(key)"
              >
                @if (nodeTemplate(); as template) {
                  <ng-container
                    [ngTemplateOutlet]="template"
                    [ngTemplateOutletContext]="nodeContext(node, key, level)"
                  />
                } @else {
                  @if (node.icon || node.expandedIcon || node.collapsedIcon) {
                    <span class="j-tree__icon" aria-hidden="true">{{ iconFor(node, key) }}</span>
                  }
                  <span>{{ node.label }}</span>
                }
              </button>
            </div>

            @if (node.loading) {
              <div class="j-tree__loading" [style.padding-left.rem]="level * 1.25">Loading...</div>
            }

            @if (hasChildren(node) && isExpandedKey(key)) {
              <ng-container
                [ngTemplateOutlet]="treeList"
                [ngTemplateOutletContext]="{
                  nodes: filteredChildren(node),
                  level: level + 1,
                  parentKey: key,
                }"
              />
            }
          </li>
        } @empty {
          <li class="j-tree__empty" data-jc-section="empty">{{ emptyMessage() }}</li>
        }
      </ul>
    </ng-template>
  `,
  styles: [
    `
      .j-tree {
        color: var(--j-color-foreground);
        display: grid;
        gap: var(--j-spacing-2);
      }

      .j-tree__filter input {
        background: var(--j-color-card);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-md);
        color: inherit;
        font: inherit;
        min-height: 2.5rem;
        padding: 0 var(--j-spacing-3);
        width: 100%;
      }

      .j-tree__list {
        display: grid;
        gap: var(--j-spacing-1);
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .j-tree__row {
        align-items: center;
        border-radius: var(--j-radius-md);
        display: flex;
        gap: var(--j-spacing-1);
        min-height: 2.25rem;
      }

      .j-tree__row:hover,
      .j-tree__row.is-active {
        background: var(--j-color-muted);
      }

      .j-tree__toggle,
      .j-tree__label {
        background: transparent;
        border: 0;
        color: inherit;
        cursor: pointer;
        font: inherit;
      }

      .j-tree__toggle {
        border-radius: var(--j-radius-sm);
        height: 1.75rem;
        width: 1.75rem;
      }

      .j-tree__label {
        align-items: center;
        display: inline-flex;
        flex: 1;
        gap: var(--j-spacing-2);
        min-height: 2rem;
        text-align: left;
      }

      .j-tree__toggle:focus-visible,
      .j-tree__label:focus-visible,
      .j-tree__filter input:focus-visible {
        box-shadow: var(--j-focus-ring);
        outline: none;
      }

      .j-tree__label:disabled,
      .j-tree__toggle:disabled {
        cursor: default;
        opacity: var(--j-disabled-opacity);
      }

      .j-tree__empty,
      .j-tree__loading {
        color: var(--j-color-muted-foreground);
        font-size: var(--j-font-size-sm);
        padding: var(--j-spacing-2);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JTreeComponent {
  readonly value = input<readonly JTreeNode[]>([]);
  readonly selection = model<JTreeNode | readonly JTreeNode[] | null>(null);
  readonly selectionMode = input<JTreeSelectionMode>('single');
  readonly ariaLabel = input('Tree');
  readonly filterPlaceholder = input('Filter');
  readonly emptyMessage = input('No items found.');
  readonly styleClass = input('');
  readonly filter = input(false, { transform: booleanAttribute });
  readonly lazy = input(false, { transform: booleanAttribute });

  readonly nodeExpand = output<JTreeNode>();
  readonly nodeCollapse = output<JTreeNode>();
  readonly lazyLoad = output<JTreeLazyLoadEvent>();

  readonly nodeTemplate = contentChild<unknown, TemplateRef<JTreeNodeContext>>('jTreeNode', {
    read: TemplateRef,
  });

  readonly filterValue = signal('');
  readonly activeKey = signal('');
  private readonly expandedKeys = signal<ReadonlySet<string>>(new Set());

  readonly visibleNodes = computed(() =>
    this.filterValue() ? this.filterNodes(this.value()) : this.value(),
  );

  setFilter(event: Event): void {
    this.filterValue.set((event.target as HTMLInputElement | null)?.value ?? '');
  }

  setActive(key: string): void {
    this.activeKey.set(key);
  }

  toggle(node: JTreeNode, key: string): void {
    if (node.disabled || !this.hasChildren(node)) {
      return;
    }
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

  selectNode(node: JTreeNode, key: string, event: Event): void {
    if (node.disabled || node.selectable === false || this.selectionMode() === 'none') {
      return;
    }
    this.activeKey.set(key);
    if (this.selectionMode() === 'single') {
      this.selection.set(node);
      return;
    }
    this.toggleSelection(node, event);
  }

  toggleSelection(node: JTreeNode, event: Event): void {
    event.stopPropagation();
    if (node.disabled || node.selectable === false || this.selectionMode() === 'none') {
      return;
    }
    const currentSelection = this.selection();
    const current = this.isNodeArray(currentSelection) ? [...currentSelection] : [];
    const exists = current.some((item) => this.sameNode(item, node));
    const next = exists ? current.filter((item) => !this.sameNode(item, node)) : [...current, node];
    this.selection.set(next);
  }

  handleKeydown(event: KeyboardEvent): void {
    const flat = this.flatten(this.visibleNodes());
    if (!flat.length) {
      return;
    }
    const current = Math.max(
      0,
      flat.findIndex((entry) => entry.key === this.activeKey()),
    );

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const next =
        event.key === 'ArrowDown'
          ? Math.min(flat.length - 1, current + 1)
          : Math.max(0, current - 1);
      this.activeKey.set(flat[next]?.key ?? this.activeKey());
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      const entry = flat[current];
      if (entry && this.hasChildren(entry.node)) {
        this.expandedKeys.set(new Set(this.expandedKeys()).add(entry.key));
      }
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      const next = new Set(this.expandedKeys());
      next.delete(this.activeKey());
      this.expandedKeys.set(next);
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const entry = flat[current];
      if (entry) {
        this.selectNode(entry.node, entry.key, event);
      }
    }
  }

  hasChildren(node: JTreeNode): boolean {
    return !node.leaf && ((node.children?.length ?? 0) > 0 || this.lazy());
  }

  isExpandedKey(key: string): boolean {
    return this.expandedKeys().has(key);
  }

  isSelected(node: JTreeNode): boolean {
    const currentSelection = this.selection();
    return this.isNodeArray(currentSelection)
      ? currentSelection.some((item) => this.sameNode(item, node))
      : !!currentSelection && this.sameNode(currentSelection, node);
  }

  nodeContext(node: JTreeNode, key: string, level: number): JTreeNodeContext {
    return {
      $implicit: node,
      node,
      level,
      selected: this.isSelected(node),
      expanded: this.isExpandedKey(key),
    };
  }

  nodeKey(node: JTreeNode, index: number, level: number, parentKey: string): string {
    return node.key ?? `${parentKey}-${level}-${index}-${node.label}`;
  }

  iconFor(node: JTreeNode, key: string): string {
    return this.isExpandedKey(key)
      ? node.expandedIcon || node.icon || ''
      : node.collapsedIcon || node.icon || '';
  }

  filteredChildren(node: JTreeNode): readonly JTreeNode[] {
    return this.filterValue() && node.children
      ? this.filterNodes(node.children)
      : (node.children ?? []);
  }

  private filterNodes(nodes: readonly JTreeNode[]): readonly JTreeNode[] {
    const query = this.filterValue().trim().toLowerCase();
    if (!query) {
      return nodes;
    }
    const filtered: JTreeNode[] = [];
    for (const node of nodes) {
      const children = node.children ? this.filterNodes(node.children) : [];
      if (node.label.toLowerCase().includes(query) || children.length) {
        filtered.push(children.length ? { ...node, children } : node);
      }
    }
    return filtered;
  }

  private flatten(nodes: readonly JTreeNode[], level = 1, parentKey = 'root'): JTreeFlatEntry[] {
    return nodes.flatMap((node, index) => {
      const key = this.nodeKey(node, index, level, parentKey);
      const children = this.isExpandedKey(key)
        ? this.flatten(node.children ?? [], level + 1, key)
        : [];
      return [{ node, key, index, level, parentKey }, ...children];
    });
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
