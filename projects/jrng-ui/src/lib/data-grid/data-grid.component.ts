import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, booleanAttribute } from '@angular/core';
import { JTableComponent } from '../table/table.component';
import {
  JTableActionEvent,
  JTableColumn,
  JTableFilterChange,
  JTableLazyLoadEvent,
  JTablePageChange,
  JTableRow,
  JTableSelection,
  JTableSelectionMode,
  JTableSort,
} from '../table/table.types';

@Component({
  selector: 'j-data-grid',
  imports: [JTableComponent],
  template: `
    <section class="j-data-grid" data-jc-name="data-grid" data-jc-section="root">
      <header class="j-data-grid__toolbar" data-jc-section="toolbar">
        <div class="j-data-grid__heading">
          @if (title) {
            <h2>{{ title }}</h2>
          }
          @if (description) {
            <p>{{ description }}</p>
          }
        </div>
        <label class="j-data-grid__search">
          <span class="j-hidden-accessible">Search records</span>
          <input type="search" [value]="globalFilter" [placeholder]="searchPlaceholder" (input)="handleSearch($event)" />
        </label>
        <div class="j-data-grid__actions">
          <ng-content select="[jDataGridActions]"></ng-content>
        </div>
      </header>

      @if (bulkActions && selectionCount > 0) {
        <div class="j-data-grid__bulk" data-jc-section="bulk-actions">
          <span>{{ selectionCount }} selected</span>
          <ng-content select="[jDataGridBulkActions]"></ng-content>
        </div>
      }

      <j-table
        [value]="value"
        [columns]="columns"
        [totalRecords]="totalRecords"
        [rows]="rows"
        [first]="first"
        [paginator]="paginator"
        [lazy]="lazy"
        [loading]="loading"
        [selectionMode]="selectionMode"
        [selection]="selection"
        [globalFilter]="globalFilter"
        [globalFilterFields]="globalFilterFields"
        [showColumnManager]="true"
        [showExport]="true"
        [showTableState]="!!stateKey"
        [stateKey]="stateKey"
        [scrollable]="scrollable"
        [stickyHeader]="stickyHeader"
        [emptyMessage]="emptyMessage"
        (selectionChange)="selectionChange.emit($event)"
        (sortChange)="sortChange.emit($event)"
        (pageChange)="pageChange.emit($event)"
        (filterChange)="filterChange.emit($event)"
        (lazyLoad)="lazyLoad.emit($event)"
        (actionClick)="actionClick.emit($event)"
      />
    </section>
  `,
  styles: [
    `
      .j-data-grid {
        background: var(--j-color-card);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-lg);
        color: var(--j-color-card-foreground);
        overflow: hidden;
      }

      .j-data-grid__toolbar,
      .j-data-grid__bulk {
        align-items: center;
        border-bottom: 1px solid var(--j-color-border);
        display: flex;
        flex-wrap: wrap;
        gap: var(--j-spacing-3);
        padding: var(--j-spacing-4);
      }

      .j-data-grid__heading {
        flex: 1;
      }

      .j-data-grid__heading h2,
      .j-data-grid__heading p {
        margin: 0;
      }

      .j-data-grid__heading p {
        color: var(--j-color-muted-foreground);
        font-size: var(--j-font-size-sm);
        margin-top: var(--j-spacing-1);
      }

      .j-data-grid__search input {
        background: var(--j-color-surface);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-md);
        color: inherit;
        font: inherit;
        min-height: 2.5rem;
        padding: 0 var(--j-spacing-3);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JDataGridComponent {
  @Input() value: readonly JTableRow[] = [];
  @Input() columns: readonly JTableColumn[] = [];
  @Input() totalRecords = 0;
  @Input() rows = 10;
  @Input() first = 0;
  @Input() title = '';
  @Input() description = '';
  @Input() searchPlaceholder = 'Search';
  @Input() globalFilter = '';
  @Input() globalFilterFields: readonly string[] = [];
  @Input() selectionMode: JTableSelectionMode = 'checkbox';
  @Input() selection: JTableSelection = null;
  @Input() stateKey = '';
  @Input() emptyMessage = 'No records found.';
  @Input({ transform: booleanAttribute }) paginator = true;
  @Input({ transform: booleanAttribute }) lazy = false;
  @Input({ transform: booleanAttribute }) loading = false;
  @Input({ transform: booleanAttribute }) bulkActions = true;
  @Input({ transform: booleanAttribute }) scrollable = true;
  @Input({ transform: booleanAttribute }) stickyHeader = true;

  @Output() globalFilterChange = new EventEmitter<string>();
  @Output() selectionChange = new EventEmitter<JTableSelection>();
  @Output() sortChange = new EventEmitter<JTableSort>();
  @Output() pageChange = new EventEmitter<JTablePageChange>();
  @Output() filterChange = new EventEmitter<JTableFilterChange>();
  @Output() lazyLoad = new EventEmitter<JTableLazyLoadEvent>();
  @Output() actionClick = new EventEmitter<JTableActionEvent>();

  get selectionCount(): number {
    return Array.isArray(this.selection) ? this.selection.length : this.selection ? 1 : 0;
  }

  handleSearch(event: Event): void {
    this.globalFilter = (event.target as HTMLInputElement | null)?.value ?? '';
    this.globalFilterChange.emit(this.globalFilter);
  }
}
