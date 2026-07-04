import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ContentChild, EventEmitter, Input, Output, TemplateRef, booleanAttribute } from '@angular/core';
import { JPaginatorComponent, JPaginatorPageChange } from '../paginator/paginator.component';

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
        <select [value]="sortField" (change)="changeSort($event)">
          <option value="">Sort</option>
          @for (option of sortOptions; track option.field) {
            <option [value]="option.field">{{ option.label }}</option>
          }
        </select>
        @if (layoutToggle) {
          <div class="j-data-view__toggle" role="group" aria-label="Layout">
            <button type="button" [class.is-active]="layout === 'list'" (click)="setLayout('list')">List</button>
            <button type="button" [class.is-active]="layout === 'grid'" (click)="setLayout('grid')">Grid</button>
          </div>
        }
      </header>

      <div class="j-data-view__items" [class.j-data-view__items--grid]="layout === 'grid'">
        @for (item of pageItems; track trackItem(item, $index); let index = $index) {
          @if (itemTemplate) {
            <ng-container
              [ngTemplateOutlet]="itemTemplate"
              [ngTemplateOutletContext]="itemContext(item, index)"
            />
          } @else {
            <article class="j-data-view__item">{{ item }}</article>
          }
        } @empty {
          <p class="j-data-view__empty">{{ emptyMessage }}</p>
        }
      </div>

      @if (paginator) {
        <j-paginator [first]="first" [rows]="rows" [totalRecords]="sortedItems.length" [rowsPerPageOptions]="rowsPerPageOptions" (pageChange)="handlePageChange($event)" />
      }
    </section>
  `,
  styles: [
    `
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
  @Input() value: readonly T[] = [];
  @Input() layout: JDataViewLayout = 'list';
  @Input() sortField = '';
  @Input() sortOptions: readonly { field: string; label: string }[] = [];
  @Input() rows = 12;
  @Input() first = 0;
  @Input() rowsPerPageOptions: readonly number[] = [12, 24, 48];
  @Input() emptyMessage = 'No items found.';
  @Input({ transform: booleanAttribute }) paginator = true;
  @Input({ transform: booleanAttribute }) layoutToggle = true;
  @ContentChild('jDataViewItem', { read: TemplateRef }) itemTemplate?: TemplateRef<JDataViewItemContext<T>>;

  @Output() layoutChange = new EventEmitter<JDataViewLayout>();
  @Output() sortChange = new EventEmitter<string>();
  @Output() pageChange = new EventEmitter<JPaginatorPageChange>();

  get sortedItems(): readonly T[] {
    if (!this.sortField) {
      return this.value;
    }
    return [...this.value].sort((a, b) => String(this.readField(a, this.sortField)).localeCompare(String(this.readField(b, this.sortField))));
  }

  get pageItems(): readonly T[] {
    return this.paginator ? this.sortedItems.slice(this.first, this.first + this.rows) : this.sortedItems;
  }

  setLayout(layout: JDataViewLayout): void {
    this.layout = layout;
    this.layoutChange.emit(layout);
  }

  changeSort(event: Event): void {
    this.sortField = (event.target as HTMLSelectElement | null)?.value ?? '';
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

  private readField(item: T, field: string): unknown {
    return typeof item === 'object' && item != null ? (item as Record<string, unknown>)[field] : item;
  }
}
