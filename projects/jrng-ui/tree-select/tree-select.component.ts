import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  contentChild,
  Directive,
  ElementRef,
  forwardRef,
  inject,
  input,
  numberAttribute,
  OnDestroy,
  output,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  JAppendTo,
  JClickOutsideDirective,
  JOverlayHandle,
  JOverlayService,
  jCreateId,
} from 'jrng-ui/core';
import {
  JTreeComponent,
  JTreeLazyLoadEvent,
  JTreeNode,
  JTreeNodeContext,
  JTreeSelectionMode,
} from 'jrng-ui/tree';
import { JVirtualScrollerComponent } from 'jrng-ui/virtual-scroller';

export type JTreeSelectPropagation = 'none' | 'down' | 'up' | 'both';
export type JTreeSelectValue = JTreeNode | readonly JTreeNode[] | null;

export interface JTreeSelectValueContext {
  readonly $implicit: JTreeSelectValue;
  readonly value: JTreeSelectValue;
  readonly nodes: readonly JTreeNode[];
}

@Directive({ selector: 'ng-template[jTreeSelectNode]' })
export class JTreeSelectNodeDirective {
  readonly templateRef = inject<TemplateRef<JTreeNodeContext>>(TemplateRef);
}

@Directive({ selector: 'ng-template[jTreeSelectValue]' })
export class JTreeSelectValueDirective {
  readonly templateRef = inject<TemplateRef<JTreeSelectValueContext>>(TemplateRef);
}

interface JTreeSelectFlatNode {
  readonly node: JTreeNode;
  readonly level: number;
}

@Component({
  selector: 'j-tree-select',
  imports: [JTreeComponent, JVirtualScrollerComponent, JClickOutsideDirective, NgTemplateOutlet],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => JTreeSelectComponent),
      multi: true,
    },
  ],
  template: `
    <div class="j-tree-select" jClickOutside (jClickOutside)="close()">
      @if (label()) {
        <label class="j-tree-select__label" [for]="id()">{{ label() }}</label>
      }
      <button
        #trigger
        class="j-tree-select__trigger"
        type="button"
        [id]="id()"
        [disabled]="isDisabled()"
        [attr.aria-haspopup]="'tree'"
        [attr.aria-expanded]="openState()"
        [attr.aria-controls]="panelId"
        [attr.aria-invalid]="error() ? true : null"
        (click)="toggle()"
        (keydown)="onTriggerKeydown($event)"
        (blur)="onTouched()"
      >
        @if (valueTemplate()) {
          <ng-container
            [ngTemplateOutlet]="valueTemplate()!.templateRef"
            [ngTemplateOutletContext]="valueContext()"
          />
        } @else if (selectedNodes().length) {
          <span class="j-tree-select__values">
            @for (node of displayedNodes(); track node.key || node.label) {
              <span class="j-tree-select__chip">{{ node.label }}</span>
            }
            @if (overflowCount() > 0) {
              <span class="j-tree-select__overflow">+{{ overflowCount() }}</span>
            }
          </span>
        } @else {
          <span class="j-tree-select__placeholder">{{ placeholder() }}</span>
        }
        <span aria-hidden="true">⌄</span>
      </button>
      @if (clearable() && selectedNodes().length && !isDisabled()) {
        <button
          class="j-tree-select__clear"
          type="button"
          aria-label="Clear selection"
          (click)="clearValue($event)"
        >
          ×
        </button>
      }
      @if (hint() && !error()) {
        <small class="j-tree-select__hint">{{ hint() }}</small>
      }
      @if (error()) {
        <small class="j-tree-select__error" role="alert">{{ error() }}</small>
      }

      @if (openState()) {
        <section
          #panel
          class="j-tree-select__panel"
          [id]="panelId"
          tabindex="-1"
          [attr.aria-busy]="loading()"
          (keydown.escape)="close(true)"
        >
          @if (loading()) {
            <div class="j-tree-select__state" role="status">{{ loadingMessage() }}</div>
          } @else if (errorState()) {
            <div class="j-tree-select__state j-tree-select__state--error" role="alert">
              {{ errorState() }}
            </div>
          } @else if (!nodes().length) {
            <div class="j-tree-select__state">{{ emptyMessage() }}</div>
          } @else if (virtualScroll()) {
            <j-virtual-scroller
              [items]="flatNodes()"
              [itemSize]="virtualScrollItemSize()"
              [height]="scrollHeight()"
            >
              <ng-template #jVirtualScrollerItem let-entry>
                <button
                  class="j-tree-select__virtual-node"
                  type="button"
                  role="treeitem"
                  [style.padding-inline-start.rem]="entry.level * 1.25"
                  [disabled]="entry.node.disabled"
                  [attr.aria-level]="entry.level"
                  [attr.aria-selected]="isSelected(entry.node)"
                  (click)="selectVirtual(entry.node)"
                >
                  {{ entry.node.label }}
                </button>
              </ng-template>
            </j-virtual-scroller>
          } @else {
            <j-tree
              [value]="nodes()"
              [selection]="value"
              [selectionMode]="selectionMode()"
              [filter]="searchable()"
              [filterPlaceholder]="searchPlaceholder()"
              [emptyMessage]="emptyMessage()"
              [lazy]="lazy()"
              [ariaLabel]="ariaLabel()"
              (selectionChange)="onTreeSelection($event)"
              (lazyLoad)="lazyLoad.emit($event)"
            >
              @if (nodeTemplate()) {
                <ng-template
                  #jTreeNode
                  let-node
                  let-level="level"
                  let-selected="selected"
                  let-expanded="expanded"
                >
                  <ng-container
                    [ngTemplateOutlet]="nodeTemplate()!.templateRef"
                    [ngTemplateOutletContext]="{
                      $implicit: node,
                      node,
                      level,
                      selected,
                      expanded,
                    }"
                  />
                </ng-template>
              }
            </j-tree>
          }
        </section>
      }
    </div>
  `,
  styleUrl: './tree-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'j-tree-select-host',
    '[class.j-tree-select-host--disabled]': 'isDisabled()',
    'data-jc-name': 'tree-select',
    'data-jc-extend': 'trigger panel node chip',
  },
})
export class JTreeSelectComponent implements ControlValueAccessor, OnDestroy {
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly overlay = inject(JOverlayService);
  private overlayHandle?: JOverlayHandle;
  private readonly formDisabled = signal(false);

  readonly id = input(jCreateId('j-tree-select'));
  readonly nodes = input<readonly JTreeNode[]>([]);
  readonly label = input('');
  readonly placeholder = input('Select');
  readonly hint = input('');
  readonly error = input('');
  readonly errorState = input('');
  readonly loading = input(false, { transform: booleanAttribute });
  readonly loadingMessage = input('Loading options');
  readonly emptyMessage = input('No options found');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly clearable = input(false, { transform: booleanAttribute });
  readonly searchable = input(false, { transform: booleanAttribute });
  readonly searchPlaceholder = input('Search options');
  readonly lazy = input(false, { transform: booleanAttribute });
  readonly virtualScroll = input(false, { transform: booleanAttribute });
  readonly virtualScrollItemSize = input(40, { transform: numberAttribute });
  readonly scrollHeight = input('16rem');
  readonly selectionMode = input<JTreeSelectionMode>('single');
  readonly propagation = input<JTreeSelectPropagation>('none');
  readonly maxSelectedLabels = input(3, { transform: numberAttribute });
  readonly appendTo = input<JAppendTo | undefined>(undefined);
  readonly ariaLabel = input('Tree options');

  readonly valueChange = output<JTreeSelectValue>();
  readonly opened = output<void>();
  readonly closed = output<void>();
  readonly cleared = output<void>();
  readonly lazyLoad = output<JTreeLazyLoadEvent>();

  readonly nodeTemplate = contentChild(JTreeSelectNodeDirective);
  readonly valueTemplate = contentChild(JTreeSelectValueDirective);
  private readonly trigger = viewChild<ElementRef<HTMLButtonElement>>('trigger');
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');
  readonly openState = signal(false);
  readonly panelId = jCreateId('j-tree-select-panel');
  value: JTreeSelectValue = null;

  private onChange: (value: JTreeSelectValue) => void = () => undefined;
  onTouched: () => void = () => undefined;

  readonly isDisabled = () => this.disabled() || this.formDisabled();

  selectedNodes(): readonly JTreeNode[] {
    return this.isNodeArray(this.value) ? this.value : this.value ? [this.value] : [];
  }

  displayedNodes(): readonly JTreeNode[] {
    return this.selectedNodes().slice(0, Math.max(0, this.maxSelectedLabels()));
  }

  overflowCount(): number {
    return Math.max(0, this.selectedNodes().length - this.displayedNodes().length);
  }

  valueContext(): JTreeSelectValueContext {
    return { $implicit: this.value, value: this.value, nodes: this.selectedNodes() };
  }

  flatNodes(): readonly JTreeSelectFlatNode[] {
    const flatten = (nodes: readonly JTreeNode[], level: number): JTreeSelectFlatNode[] =>
      nodes.flatMap((node) => [{ node, level }, ...flatten(node.children ?? [], level + 1)]);
    return flatten(this.nodes(), 1);
  }

  writeValue(value: JTreeSelectValue): void {
    this.value = value ?? null;
    this.changeDetector.markForCheck();
  }

  registerOnChange(fn: (value: JTreeSelectValue) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
    if (disabled) this.close();
  }

  toggle(): void {
    this.openState() ? this.close() : this.open();
  }

  open(): void {
    if (this.isDisabled() || this.readonly() || this.openState()) return;
    this.openState.set(true);
    this.opened.emit();
    queueMicrotask(() => {
      const trigger = this.trigger()?.nativeElement;
      const panel = this.panel()?.nativeElement;
      if (trigger && panel) {
        this.overlayHandle = this.overlay.attach(trigger, panel, {
          appendTo: this.appendTo(),
          matchWidth: true,
        });
        panel.querySelector<HTMLElement>('input, [role="treeitem"]')?.focus();
      }
    });
  }

  close(restoreFocus = false): void {
    if (!this.openState()) return;
    this.openState.set(false);
    this.overlayHandle?.detach();
    this.overlayHandle = undefined;
    this.closed.emit();
    if (restoreFocus) queueMicrotask(() => this.trigger()?.nativeElement.focus());
  }

  onTriggerKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.open();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.close(true);
    }
  }

  onTreeSelection(selection: JTreeSelectValue): void {
    this.commit(this.propagate(selection));
    if (this.selectionMode() === 'single') this.close(true);
  }

  selectVirtual(node: JTreeNode): void {
    if (node.disabled || node.selectable === false) return;
    if (this.selectionMode() === 'single') {
      this.commit(node);
      this.close(true);
      return;
    }
    const current = [...this.selectedNodes()];
    const exists = current.some((item) => this.sameNode(item, node));
    const next = exists ? current.filter((item) => !this.sameNode(item, node)) : [...current, node];
    this.commit(this.propagate(next));
  }

  isSelected(node: JTreeNode): boolean {
    return this.selectedNodes().some((item) => this.sameNode(item, node));
  }

  clearValue(event?: Event): void {
    event?.stopPropagation();
    if (this.isDisabled() || this.readonly()) return;
    this.commit(null);
    this.cleared.emit();
  }

  ngOnDestroy(): void {
    this.overlayHandle?.detach();
  }

  private commit(value: JTreeSelectValue): void {
    this.value = value;
    this.onChange(value);
    this.valueChange.emit(value);
    this.changeDetector.markForCheck();
  }

  private propagate(selection: JTreeSelectValue): JTreeSelectValue {
    if (
      this.selectionMode() !== 'checkbox' ||
      this.propagation() === 'none' ||
      !Array.isArray(selection)
    ) {
      return selection;
    }
    const selected = new Map(selection.map((node) => [this.nodeKey(node), node]));
    const visit = (nodes: readonly JTreeNode[]): boolean =>
      nodes.every((node) => {
        const childrenSelected = node.children?.length ? visit(node.children) : false;
        if (
          selected.has(this.nodeKey(node)) &&
          (this.propagation() === 'down' || this.propagation() === 'both')
        ) {
          this.descendants(node).forEach((child) => selected.set(this.nodeKey(child), child));
        }
        if (
          childrenSelected &&
          (this.propagation() === 'up' || this.propagation() === 'both') &&
          !node.disabled
        ) {
          selected.set(this.nodeKey(node), node);
        }
        return selected.has(this.nodeKey(node));
      });
    visit(this.nodes());
    return [...selected.values()];
  }

  private descendants(node: JTreeNode): readonly JTreeNode[] {
    return (node.children ?? []).flatMap((child) => [child, ...this.descendants(child)]);
  }

  private nodeKey(node: JTreeNode): unknown {
    return node.key ?? node;
  }

  private sameNode(left: JTreeNode, right: JTreeNode): boolean {
    return left === right || (!!left.key && left.key === right.key);
  }

  private isNodeArray(value: JTreeSelectValue): value is readonly JTreeNode[] {
    return Array.isArray(value);
  }
}
