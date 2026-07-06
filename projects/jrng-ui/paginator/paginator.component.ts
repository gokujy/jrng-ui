import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  booleanAttribute,
  numberAttribute,
} from '@angular/core';

export interface JPaginatorPageChange {
  readonly first: number;
  readonly rows: number;
  readonly page: number;
  readonly pageCount: number;
}

export interface JPaginatorChange {
  readonly page: number;
  readonly pageSize: number;
}

@Component({
  selector: 'j-paginator',
  imports: [],
  template: `
    <nav class="j-paginator" aria-label="Pagination">
      @if (showCurrentPageReport) {
        <span class="j-paginator__report">{{ currentReport }}</span>
      }

      <div class="j-paginator__controls">
        <button
          type="button"
          class="j-paginator__button"
          aria-label="First page"
          [disabled]="currentPage <= 1"
          (click)="setPage(1)"
        >
          «
        </button>
        <button
          type="button"
          class="j-paginator__button"
          aria-label="Previous page"
          [disabled]="currentPage <= 1"
          (click)="setPage(currentPage - 1)"
        >
          Previous
        </button>

        @for (pageNumber of pageLinks; track pageNumber) {
          <button
            type="button"
            class="j-paginator__button"
            [class.is-active]="pageNumber === currentPage"
            [attr.aria-current]="pageNumber === currentPage ? 'page' : null"
            (click)="setPage(pageNumber)"
          >
            {{ pageNumber }}
          </button>
        }

        <button
          type="button"
          class="j-paginator__button"
          aria-label="Next page"
          [disabled]="currentPage >= pageCount"
          (click)="setPage(currentPage + 1)"
        >
          Next
        </button>
        <button
          type="button"
          class="j-paginator__button"
          aria-label="Last page"
          [disabled]="currentPage >= pageCount"
          (click)="setPage(pageCount)"
        >
          »
        </button>
      </div>

      @if (rowsPerPageOptions.length) {
        <label class="j-paginator__rows">
          <span>Rows</span>
          <select [value]="rows" (change)="setRows($event)">
            @for (option of rowsPerPageOptions; track option) {
              <option [value]="option">{{ option }}</option>
            }
          </select>
        </label>
      }
    </nav>
  `,
  styles: [
    `
      .j-paginator {
        align-items: center;
        background: var(--j-color-surface-muted, #f8fafc);
        color: var(--j-color-text-muted, #64748b);
        display: flex;
        flex-wrap: wrap;
        font-size: var(--j-font-size-sm, 0.875rem);
        gap: var(--j-spacing-md, 0.75rem);
        justify-content: space-between;
        padding: var(--j-spacing-md, 0.75rem) var(--j-spacing-lg, 1rem);
      }

      .j-paginator__controls,
      .j-paginator__rows {
        align-items: center;
        display: inline-flex;
        gap: var(--j-spacing-sm, 0.5rem);
      }

      .j-paginator__button,
      .j-paginator__rows select {
        background: var(--j-color-surface, #ffffff);
        border: 1px solid var(--j-color-border, #dbe2ea);
        border-radius: var(--j-radius-sm, 0.375rem);
        color: var(--j-color-text, #111827);
        font: inherit;
        min-height: 2rem;
        padding: 0 var(--j-spacing-sm, 0.5rem);
      }

      .j-paginator__button {
        cursor: pointer;
      }

      .j-paginator__button.is-active {
        background: var(--j-color-primary, #4f46e5);
        border-color: var(--j-color-primary, #4f46e5);
        color: var(--j-color-on-primary, #ffffff);
      }

      .j-paginator__button:disabled {
        cursor: not-allowed;
        opacity: var(--j-disabled-opacity, 0.55);
      }

      .j-paginator__button:focus-visible,
      .j-paginator__rows select:focus-visible {
        box-shadow: var(--j-focus-ring, 0 0 0 3px rgb(79 70 229 / 24%));
        outline: none;
      }

      @media (max-width: 640px) {
        .j-paginator {
          align-items: flex-start;
          flex-direction: column;
        }

        .j-paginator__controls {
          flex-wrap: wrap;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JPaginatorComponent {
  @Input({ transform: numberAttribute }) first = 0;
  @Input({ transform: numberAttribute }) rows = 10;
  @Input({ transform: numberAttribute }) totalRecords = 0;
  @Input() rowsPerPageOptions: readonly number[] = [];
  @Input({ transform: numberAttribute }) pageLinkSize = 5;
  @Input({ transform: booleanAttribute }) showCurrentPageReport = false;
  @Input() currentPageReportTemplate = 'Showing {first} to {last} of {totalRecords}';

  @Output() pageChange = new EventEmitter<JPaginatorPageChange>();

  @Input()
  set page(value: number) {
    this.first = Math.max(0, ((Number(value) || 1) - 1) * this.rows);
  }

  get page(): number {
    return this.currentPage;
  }

  @Input()
  set pageSize(value: number) {
    this.rows = Math.max(1, Number(value) || 10);
  }

  get pageSize(): number {
    return this.rows;
  }

  get pageCount(): number {
    return Math.max(1, Math.ceil(this.totalRecords / this.normalizedRows));
  }

  get currentPage(): number {
    return Math.min(this.pageCount, Math.floor(this.normalizedFirst / this.normalizedRows) + 1);
  }

  get pageLinks(): readonly number[] {
    const size = Math.max(1, this.pageLinkSize);
    const half = Math.floor(size / 2);
    const start = Math.max(1, Math.min(this.currentPage - half, this.pageCount - size + 1));
    const end = Math.min(this.pageCount, start + size - 1);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }

  get currentReport(): string {
    const first = this.totalRecords === 0 ? 0 : this.normalizedFirst + 1;
    const last = Math.min(this.normalizedFirst + this.normalizedRows, this.totalRecords);
    return this.currentPageReportTemplate
      .replace('{first}', String(first))
      .replace('{last}', String(last))
      .replace('{rows}', String(this.normalizedRows))
      .replace('{totalRecords}', String(this.totalRecords))
      .replace('{currentPage}', String(this.currentPage))
      .replace('{totalPages}', String(this.pageCount));
  }

  private get normalizedRows(): number {
    return Math.max(1, this.rows);
  }

  private get normalizedFirst(): number {
    return Math.max(0, Math.min(this.first, Math.max(0, this.totalRecords - 1)));
  }

  setPage(page: number): void {
    const nextPage = Math.min(Math.max(1, page), this.pageCount);
    this.emitChange((nextPage - 1) * this.normalizedRows, this.normalizedRows);
  }

  setRows(event: Event): void {
    const select = event.target as HTMLSelectElement | null;
    const rows = Math.max(1, Number(select?.value) || this.normalizedRows);
    this.emitChange(0, rows);
  }

  private emitChange(first: number, rows: number): void {
    this.first = first;
    this.rows = rows;
    this.pageChange.emit({
      first,
      rows,
      page: Math.floor(first / rows) + 1,
      pageCount: Math.max(1, Math.ceil(this.totalRecords / rows)),
    });
  }
}
