import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  contentChild,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  model,
  numberAttribute,
  OnDestroy,
  output,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { JDragDirective, JDragHandleDirective, JDropListDirective } from 'jrng-ui/drag-drop';

export interface JGridLayoutItem<T = unknown> {
  readonly id: string;
  readonly data?: T;
  readonly column?: number;
  readonly row?: number;
  readonly columnSpan?: number;
  readonly rowSpan?: number;
  readonly minColumnSpan?: number;
  readonly maxColumnSpan?: number;
  readonly minRowSpan?: number;
  readonly maxRowSpan?: number;
  readonly locked?: boolean;
}

export interface JGridLayoutItemContext<T = unknown> {
  readonly $implicit: T | undefined;
  readonly data: T | undefined;
  readonly item: JGridLayoutItem<T>;
  readonly index: number;
}

export interface JGridLayoutChange {
  readonly layout: readonly JGridLayoutItem[];
  readonly reason: 'drop' | 'move' | 'resize' | 'reset' | 'responsive';
}

@Directive({ selector: 'ng-template[jGridLayoutItem]' })
export class JGridLayoutItemTemplateDirective {
  readonly templateRef = inject<TemplateRef<JGridLayoutItemContext>>(TemplateRef);
}

@Directive({
  selector: '[jGridLayoutDragHandle]',
  hostDirectives: [JDragHandleDirective],
  host: { class: 'j-grid-layout__drag-handle' },
})
export class JGridLayoutDragHandleDirective {}

@Directive({
  selector: '[jGridLayoutResizeHandle]',
  host: { class: 'j-grid-layout__resize-handle' },
})
export class JGridLayoutResizeHandleDirective {}

@Component({
  selector: 'j-grid-layout',
  imports: [JDropListDirective, JDragDirective, JGridLayoutResizeHandleDirective, NgTemplateOutlet],
  template: `
    <div
      #grid
      class="j-grid-layout"
      [class]="styleClass()"
      [class.j-grid-layout--advanced]="layout().length"
      data-jc-name="grid-layout"
      data-jc-section="root"
      data-jc-extend="item drag-handle resize-handle placeholder"
      jDropList
      orientation="horizontal"
      [data]="layout()"
      [disabled]="!draggable()"
      (dataChange)="onReordered($event)"
      [style.--j-grid-columns]="columnCount()"
      [style.--j-grid-min]="minItemWidth()"
      [style.--j-grid-gap]="gap()"
      [style.--j-grid-row-height]="rowHeight() + 'px'"
    >
      @if (layout().length) {
        @for (item of layout(); track item.id; let index = $index) {
          <article
            class="j-grid-layout__item"
            jDrag
            [data]="item"
            [disabled]="!draggable() || item.locked"
            [dragLabel]="'Tile ' + item.id"
            [attr.data-j-grid-item]="item.id"
            [attr.aria-label]="'Tile ' + item.id"
            [attr.aria-disabled]="item.locked || null"
            [style.grid-column-start]="normalized(item).column"
            [style.grid-row-start]="normalized(item).row"
            [style.grid-column-end]="'span ' + normalized(item).columnSpan"
            [style.grid-row-end]="'span ' + normalized(item).rowSpan"
            (keydown)="onItemKeydown($event, item)"
          >
            @if (itemTemplate()) {
              <ng-container
                [ngTemplateOutlet]="itemTemplate()!.templateRef"
                [ngTemplateOutletContext]="{
                  $implicit: item.data,
                  data: item.data,
                  item,
                  index,
                }"
              />
            } @else {
              {{ item.id }}
            }
            @if (resizable() && !item.locked) {
              <button
                type="button"
                class="j-grid-layout__resize-default"
                jGridLayoutResizeHandle
                aria-label="Resize tile"
                (pointerdown)="startResize($event, item)"
              ></button>
            }
          </article>
        }
      } @else {
        <ng-content />
      }
    </div>
  `,
  styleUrl: './grid-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JGridLayoutComponent implements OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly grid = viewChild<ElementRef<HTMLElement>>('grid');
  private initialLayout?: readonly JGridLayoutItem[];
  private resizeCleanup: (() => void)[] = [];

  readonly columns = input(3, { transform: numberAttribute });
  readonly minItemWidth = input('16rem');
  readonly gap = input('var(--j-spacing-4)');
  readonly styleClass = input('');
  readonly rowHeight = input(96, { transform: numberAttribute });
  readonly draggable = input(false, { transform: booleanAttribute });
  readonly resizable = input(false, { transform: booleanAttribute });
  readonly collision = input<'push' | 'none'>('push');
  readonly compact = input(false, { transform: booleanAttribute });
  readonly responsiveLayouts = input<Readonly<Record<string, readonly JGridLayoutItem[]>>>({});
  readonly layout = model<readonly JGridLayoutItem[]>([]);
  readonly persistence = input<((layout: readonly JGridLayoutItem[]) => void) | null>(null);

  readonly layoutChangeEvent = output<JGridLayoutChange>();
  readonly resizeStarted = output<JGridLayoutItem>();
  readonly resizeEnded = output<JGridLayoutItem>();

  readonly itemTemplate = contentChild(JGridLayoutItemTemplateDirective);

  constructor() {
    effect(() => {
      const value = this.layout();
      if (!this.initialLayout && value.length) {
        this.initialLayout = value.map((item) => ({ ...item }));
      }
    });
  }

  columnCount(): number {
    const value = this.columns();
    return Number.isFinite(value) ? Math.max(1, Math.floor(value)) : 1;
  }

  normalized(
    item: JGridLayoutItem,
  ): Required<Pick<JGridLayoutItem, 'column' | 'row' | 'columnSpan' | 'rowSpan'>> {
    return {
      column: Math.max(1, Math.min(this.columnCount(), Math.floor(item.column ?? 1))),
      row: Math.max(1, Math.floor(item.row ?? 1)),
      columnSpan: this.clampSpan(
        item.columnSpan ?? 1,
        item.minColumnSpan ?? 1,
        item.maxColumnSpan ?? this.columnCount(),
      ),
      rowSpan: this.clampSpan(
        item.rowSpan ?? 1,
        item.minRowSpan ?? 1,
        item.maxRowSpan ?? Number.MAX_SAFE_INTEGER,
      ),
    };
  }

  moveItem(id: string, columnDelta: number, rowDelta: number): void {
    const current = this.layout().find((item) => item.id === id);
    if (!current || current.locked) return;
    const normalized = this.normalized(current);
    const next = this.layout().map((item) =>
      item.id === id
        ? {
            ...item,
            column: Math.max(
              1,
              Math.min(
                this.columnCount() - normalized.columnSpan + 1,
                normalized.column + columnDelta,
              ),
            ),
            row: Math.max(1, normalized.row + rowDelta),
          }
        : item,
    );
    this.commit(this.resolveCollisions(next, id), 'move');
  }

  resizeItem(id: string, columnDelta: number, rowDelta: number): void {
    const next = this.resizedLayout(this.layout(), id, columnDelta, rowDelta);
    if (!next) return;
    this.commit(this.resolveCollisions(next, id), 'resize');
  }

  private resizedLayout(
    source: readonly JGridLayoutItem[],
    id: string,
    columnDelta: number,
    rowDelta: number,
  ): readonly JGridLayoutItem[] | null {
    const current = source.find((item) => item.id === id);
    if (!current || current.locked) return null;
    const normalized = this.normalized(current);
    const maxColumns = Math.min(
      current.maxColumnSpan ?? this.columnCount(),
      this.columnCount() - normalized.column + 1,
    );
    const next = source.map((item) =>
      item.id === id
        ? {
            ...item,
            columnSpan: this.clampSpan(
              normalized.columnSpan + columnDelta,
              current.minColumnSpan ?? 1,
              maxColumns,
            ),
            rowSpan: this.clampSpan(
              normalized.rowSpan + rowDelta,
              current.minRowSpan ?? 1,
              current.maxRowSpan ?? Number.MAX_SAFE_INTEGER,
            ),
          }
        : item,
    );
    return next;
  }

  startResize(event: PointerEvent, item: JGridLayoutItem): void {
    if (!this.resizable() || item.locked || event.button !== 0) return;
    event.preventDefault();
    this.cancelResize();
    const start = { x: event.clientX, y: event.clientY };
    const original = this.layout().map((entry) => ({ ...entry }));
    const documentRef = this.host.ownerDocument;
    const move = (moveEvent: PointerEvent): void => {
      const gridWidth = this.grid()?.nativeElement.getBoundingClientRect().width ?? 1;
      const columnWidth = gridWidth / this.columnCount();
      const columnDelta = Math.round((moveEvent.clientX - start.x) / Math.max(1, columnWidth));
      const rowDelta = Math.round((moveEvent.clientY - start.y) / Math.max(1, this.rowHeight()));
      const next = this.resizedLayout(original, item.id, columnDelta, rowDelta);
      if (next) this.commit(this.resolveCollisions(next, item.id), 'resize');
    };
    const end = (): void => {
      this.cancelResize();
      const resized = this.layout().find((entry) => entry.id === item.id);
      if (resized) this.resizeEnded.emit(resized);
    };
    const cancel = (keyEvent: KeyboardEvent): void => {
      if (keyEvent.key !== 'Escape') return;
      this.cancelResize();
      this.commit(original, 'resize');
    };
    documentRef.addEventListener('pointermove', move, { passive: true });
    documentRef.addEventListener('pointerup', end, { passive: true });
    documentRef.addEventListener('pointercancel', end, { passive: true });
    documentRef.addEventListener('keydown', cancel);
    this.resizeCleanup = [
      () => documentRef.removeEventListener('pointermove', move),
      () => documentRef.removeEventListener('pointerup', end),
      () => documentRef.removeEventListener('pointercancel', end),
      () => documentRef.removeEventListener('keydown', cancel),
    ];
    this.resizeStarted.emit(item);
  }

  onItemKeydown(event: KeyboardEvent, item: JGridLayoutItem): void {
    if (!event.altKey || !event.key.startsWith('Arrow')) return;
    event.preventDefault();
    const columnDelta = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0;
    const rowDelta = event.key === 'ArrowUp' ? -1 : event.key === 'ArrowDown' ? 1 : 0;
    if (event.shiftKey && this.resizable()) this.resizeItem(item.id, columnDelta, rowDelta);
    else if (this.draggable()) this.moveItem(item.id, columnDelta, rowDelta);
  }

  onReordered(data: readonly unknown[]): void {
    if (!this.draggable() || data.length !== this.layout().length) return;
    const byId = new Map(this.layout().map((item) => [item.id, item]));
    const reordered = data
      .map((entry) =>
        typeof entry === 'object' && entry !== null && 'id' in entry
          ? byId.get(String((entry as { id: unknown }).id))
          : undefined,
      )
      .filter((item): item is JGridLayoutItem => Boolean(item));
    if (reordered.length !== this.layout().length) return;
    const next = this.compact() ? this.compactLayout(reordered) : reordered;
    this.commit(next, 'drop');
  }

  applyResponsiveLayout(name: string): boolean {
    const next = this.responsiveLayouts()[name];
    if (!next) return false;
    this.commit(
      next.map((item) => ({ ...item })),
      'responsive',
    );
    return true;
  }

  reset(): void {
    if (!this.initialLayout) return;
    this.commit(
      this.initialLayout.map((item) => ({ ...item })),
      'reset',
    );
  }

  ngOnDestroy(): void {
    this.cancelResize();
  }

  private commit(layout: readonly JGridLayoutItem[], reason: JGridLayoutChange['reason']): void {
    this.layout.set(layout);
    this.layoutChangeEvent.emit({ layout, reason });
    this.persistence()?.(layout);
  }

  private resolveCollisions(
    source: readonly JGridLayoutItem[],
    changedId: string,
  ): readonly JGridLayoutItem[] {
    if (this.collision() === 'none') return source;
    const changed = source.find((item) => item.id === changedId);
    if (!changed) return source;
    const changedRect = this.normalized(changed);
    return source.map((item) => {
      if (item.id === changedId || item.locked) return item;
      let candidate = { ...item };
      let candidateRect = this.normalized(candidate);
      while (this.overlaps(changedRect, candidateRect)) {
        candidate = { ...candidate, row: candidateRect.row + 1 };
        candidateRect = this.normalized(candidate);
      }
      return candidate;
    });
  }

  private overlaps(
    left: Required<Pick<JGridLayoutItem, 'column' | 'row' | 'columnSpan' | 'rowSpan'>>,
    right: Required<Pick<JGridLayoutItem, 'column' | 'row' | 'columnSpan' | 'rowSpan'>>,
  ): boolean {
    return !(
      left.column + left.columnSpan <= right.column ||
      right.column + right.columnSpan <= left.column ||
      left.row + left.rowSpan <= right.row ||
      right.row + right.rowSpan <= left.row
    );
  }

  private compactLayout(source: readonly JGridLayoutItem[]): readonly JGridLayoutItem[] {
    const occupied = new Set<string>();
    const result = new Map<string, JGridLayoutItem>();
    const occupy = (item: JGridLayoutItem): void => {
      const normalized = this.normalized(item);
      for (let row = normalized.row; row < normalized.row + normalized.rowSpan; row += 1) {
        for (
          let column = normalized.column;
          column < normalized.column + normalized.columnSpan;
          column += 1
        ) {
          occupied.add(`${column}:${row}`);
        }
      }
    };

    source
      .filter((item) => item.locked)
      .forEach((item) => {
        const normalized = this.normalized(item);
        const locked = { ...item, ...normalized };
        result.set(item.id, locked);
        occupy(locked);
      });

    source
      .filter((item) => !item.locked)
      .forEach((item) => {
        const normalized = this.normalized(item);
        const columnSpan = Math.min(normalized.columnSpan, this.columnCount());
        let row = 1;
        let column = 1;
        let placed = false;

        while (!placed) {
          for (column = 1; column <= this.columnCount() - columnSpan + 1; column += 1) {
            placed = true;
            for (let nextRow = row; nextRow < row + normalized.rowSpan; nextRow += 1) {
              for (let nextColumn = column; nextColumn < column + columnSpan; nextColumn += 1) {
                if (occupied.has(`${nextColumn}:${nextRow}`)) placed = false;
              }
            }
            if (placed) break;
          }
          if (!placed) row += 1;
        }

        const compacted = { ...item, column, row, columnSpan, rowSpan: normalized.rowSpan };
        result.set(item.id, compacted);
        occupy(compacted);
      });

    return source.map((item) => result.get(item.id) ?? item);
  }

  private clampSpan(value: number, minimum: number, maximum: number): number {
    const normalized = Number.isFinite(value) ? Math.floor(value) : minimum;
    return Math.max(1, Math.max(minimum, Math.min(maximum, normalized)));
  }

  private cancelResize(): void {
    this.resizeCleanup.splice(0).forEach((remove) => remove());
  }
}
