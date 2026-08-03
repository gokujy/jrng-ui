import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  Input,
  TemplateRef,
  booleanAttribute,
  input,
  output,
} from '@angular/core';
import { JPaginatorComponent, JPaginatorPageChange } from 'jrng-ui/paginator';

export type JDataViewLayout = 'list' | 'grid';

export interface JDataViewItemContext<T> {
  readonly $implicit: T;
  readonly item: T;
  readonly index: number;
  readonly layout: JDataViewLayout;
}

@Component({
  selector: 'j-data-view',
  imports: [NgTemplateOutlet, JPaginatorComponent],
  template: `
    <section class="j-data-view" data-jc-name="data-view" data-jc-section="root">
      <header class="j-data-view__toolbar">
        <select [value]="sortField" [attr.aria-label]="sortLabel()" (change)="changeSort($event)">
          <option value="">Sort</option>
          @for (option of sortOptions(); track option.field) {
            <option [value]="option.field">{{ option.label }}</option>
          }
        </select>
        @if (layoutToggle()) {
          <div class="j-data-view__toggle" role="group" [attr.aria-label]="layoutLabel()">
            <button
              type="button"
              [class.is-active]="layout === 'list'"
              [attr.aria-pressed]="layout === 'list'"
              (click)="setLayout('list')"
            >
              List
            </button>
            <button
              type="button"
              [class.is-active]="layout === 'grid'"
              [attr.aria-pressed]="layout === 'grid'"
              (click)="setLayout('grid')"
            >
              Grid
            </button>
          </div>
        }
      </header>

      <div class="j-data-view__items" [class.j-data-view__items--grid]="layout === 'grid'">
        @for (
          item of pageItems;
          track trackItem(item, resolvedFirst + $index);
          let index = $index
        ) {
          @if (itemTemplate) {
            <ng-container
              [ngTemplateOutlet]="itemTemplate"
              [ngTemplateOutletContext]="itemContext(item, resolvedFirst + index)"
            />
          } @else {
            <article class="j-data-view__item">{{ displayItem(item) }}</article>
          }
        } @empty {
          <p class="j-data-view__empty">{{ emptyMessage() }}</p>
        }
      </div>

      @if (paginator()) {
        <j-paginator
          [first]="resolvedFirst"
          [rows]="resolvedRows"
          [totalRecords]="sortedItems.length"
          [rowsPerPageOptions]="rowsPerPageOptions()"
          (pageChange)="handlePageChange($event)"
        />
      }
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
        inline-size: 100%;
        min-inline-size: 0;
      }

      .j-data-view {
        display: grid;
        gap: var(--j-spacing-3);
      }

      .j-data-view__toolbar {
        align-items: center;
        display: flex;
        gap: var(--j-spacing-2);
        justify-content: space-between;
      }

      .j-data-view__items {
        display: grid;
        gap: var(--j-spacing-3);
      }

      .j-data-view__items--grid {
        grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
      }

      .j-data-view__item {
        background: var(--j-color-card);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-lg);
        padding: var(--j-spacing-4);
      }

      .j-data-view__toggle button,
      .j-data-view__toolbar select {
        background: var(--j-color-card);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-md);
        color: inherit;
        font: inherit;
        min-height: 2.25rem;
        padding: 0 var(--j-spacing-3);
      }

      .j-data-view__toggle button.is-active {
        background: var(--j-color-primary);
        border-color: var(--j-color-primary);
        color: var(--j-color-primary-foreground);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JDataViewComponent<T = unknown> {
  readonly value = input<readonly T[]>([]);
  @Input() layout: JDataViewLayout = 'list';
  @Input() sortField = '';
  readonly sortOptions = input<readonly { field: string; label: string }[]>([]);
  @Input() rows = 12;
  @Input() first = 0;
  readonly rowsPerPageOptions = input<readonly number[]>([12, 24, 48]);
  readonly emptyMessage = input('No items found.');
  readonly sortLabel = input('Sort items');
  readonly layoutLabel = input('Layout');
  readonly paginator = input(true, { transform: booleanAttribute });
  readonly layoutToggle = input(true, { transform: booleanAttribute });
  @ContentChild('jDataViewItem', { read: TemplateRef }) itemTemplate?: TemplateRef<
    JDataViewItemContext<T>
  >;

  readonly layoutChange = output<JDataViewLayout>();
  readonly sortChange = output<string>();
  readonly pageChange = output<JPaginatorPageChange>();

  get sortedItems(): readonly T[] {
    if (!this.sortField) {
      return this.value();
    }
    return [...this.value()].sort((a, b) => {
      const left = this.readField(a, this.sortField);
      const right = this.readField(b, this.sortField);
      if (typeof left === 'number' && typeof right === 'number') {
        return left - right;
      }
      if (left instanceof Date && right instanceof Date) {
        return left.getTime() - right.getTime();
      }
      return String(left ?? '').localeCompare(String(right ?? ''), undefined, {
        numeric: true,
        sensitivity: 'base',
      });
    });
  }

  get pageItems(): readonly T[] {
    return this.paginator()
      ? this.sortedItems.slice(this.resolvedFirst, this.resolvedFirst + this.resolvedRows)
      : this.sortedItems;
  }

  get resolvedRows(): number {
    return Math.max(1, Number.isFinite(this.rows) ? Math.floor(this.rows) : 12);
  }

  get resolvedFirst(): number {
    const requested = Math.max(0, Number.isFinite(this.first) ? Math.floor(this.first) : 0);
    if (!this.sortedItems.length) return 0;
    const lastPageStart =
      Math.floor((this.sortedItems.length - 1) / this.resolvedRows) * this.resolvedRows;
    return Math.min(requested, lastPageStart);
  }

  setLayout(layout: JDataViewLayout): void {
    this.layout = layout;
    this.layoutChange.emit(layout);
  }

  changeSort(event: Event): void {
    this.sortField = (event.target as HTMLSelectElement | null)?.value ?? '';
    // Reset to the first page so re-sorting doesn't leave the user on a page
    // index that may now be out of range.
    this.first = 0;
    this.sortChange.emit(this.sortField);
  }

  handlePageChange(event: JPaginatorPageChange): void {
    this.first = event.first;
    this.rows = event.rows;
    this.pageChange.emit(event);
  }

  itemContext(item: T, index: number): JDataViewItemContext<T> {
    return { $implicit: item, item, index, layout: this.layout };
  }

  trackItem(item: T, index: number): unknown {
    return this.readField(item, 'id') ?? index;
  }

  displayItem(item: T): string {
    if (item == null) return '';
    if (typeof item !== 'object') return String(item);

    const record = item as Record<string, unknown>;
    const displayValue = record['label'] ?? record['name'] ?? record['title'] ?? record['value'];
    if (displayValue != null && typeof displayValue !== 'object') return String(displayValue);

    try {
      return JSON.stringify(item);
    } catch {
      return 'Item';
    }
  }

  private readField(item: T, field: string): unknown {
    return typeof item === 'object' && item != null
      ? (item as Record<string, unknown>)[field]
      : item;
  }
}
