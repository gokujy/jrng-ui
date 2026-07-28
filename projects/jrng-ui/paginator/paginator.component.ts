import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  effect,
  input,
  numberAttribute,
  output,
  signal,
} from '@angular/core';

export interface JPaginatorPageChange {
  readonly first: number;
  readonly rows: number;
  readonly page: number;
  readonly pageCount: number;
}

export type JPaginatorVariant = 'standard' | 'simple';

@Component({
  selector: 'j-paginator',
  imports: [],
  template: `
    <nav
      [class]="'j-paginator j-paginator--' + variant()"
      [attr.data-j-variant]="variant()"
      aria-label="Pagination"
    >
      @if (showCurrentPageReport() || variant() === 'simple') {
        <span class="j-paginator__report">{{ currentReport }}</span>
      }

      <div class="j-paginator__controls">
        @if (showFirstLastPageButtons()) {
          <button
            type="button"
            class="j-paginator__button j-paginator__first"
            aria-label="First page"
            [disabled]="currentPage <= 1"
            (click)="setPage(1)"
          >
            &laquo;
          </button>
        }
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
            class="j-paginator__button j-paginator__page-link"
            [class.is-active]="pageNumber === currentPage"
            [attr.aria-current]="pageNumber === currentPage ? 'page' : null"
            (click)="setPage(pageNumber)"
          >
            {{ pageNumber }}
          </button>
        }

        <span class="j-paginator__page-count" aria-live="polite">
          Page {{ currentPage }} of {{ pageCount }}
        </span>

        <button
          type="button"
          class="j-paginator__button"
          aria-label="Next page"
          [disabled]="currentPage >= pageCount"
          (click)="setPage(currentPage + 1)"
        >
          Next
        </button>
        @if (showFirstLastPageButtons()) {
          <button
            type="button"
            class="j-paginator__button j-paginator__last"
            aria-label="Last page"
            [disabled]="currentPage >= pageCount"
            (click)="setPage(pageCount)"
          >
            &raquo;
          </button>
        }
      </div>

      @if (rowsPerPageOptions().length) {
        <label class="j-paginator__rows">
          <span>Rows</span>
          <select [value]="rows()" (change)="setRows($event)">
            @for (option of rowsPerPageOptions(); track option) {
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
        background: var(--j-color-surface-muted);
        color: var(--j-color-text-muted);
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
        background: var(--j-color-surface);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-sm, 0.375rem);
        color: var(--j-color-text);
        font: inherit;
        min-height: 2rem;
        padding: 0 var(--j-spacing-sm, 0.5rem);
      }

      .j-paginator__button {
        cursor: pointer;
      }

      .j-paginator__page-count {
        display: none;
      }

      .j-paginator--simple .j-paginator__controls {
        background: var(--j-color-surface);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-full, 999px);
        padding: var(--j-spacing-xs, 0.25rem);
      }

      .j-paginator--simple .j-paginator__first,
      .j-paginator--simple .j-paginator__last,
      .j-paginator--simple .j-paginator__page-link {
        display: none;
      }

      .j-paginator--simple .j-paginator__page-count {
        color: var(--j-color-text);
        display: inline-block;
        min-width: 6.5rem;
        text-align: center;
      }

      .j-paginator--simple .j-paginator__button {
        border: 0;
        border-radius: var(--j-radius-full, 999px);
      }

      .j-paginator__button.is-active {
        background: var(--j-color-primary);
        border-color: var(--j-color-primary);
        color: var(--j-color-on-primary);
      }

      .j-paginator__button:disabled {
        cursor: not-allowed;
        opacity: var(--j-disabled-opacity, 0.55);
      }

      .j-paginator__button:focus-visible,
      .j-paginator__rows select:focus-visible {
        box-shadow: var(--j-focus-ring);
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
  /** `first`/`rows` are inputs seeded once, then owned as internal mutable state. */
  // Public (not private/protected): these are bound as `first`/`rows` from
  // external templates, so Angular requires them to be publicly accessible.
  readonly firstInput = input(0, { alias: 'first', transform: numberAttribute });
  readonly rowsInput = input(10, { alias: 'rows', transform: numberAttribute });
  readonly totalRecords = input(0, { transform: numberAttribute });
  readonly rowsPerPageOptions = input<readonly number[]>([]);
  readonly pageLinkSize = input(5, { transform: numberAttribute });
  readonly showCurrentPageReport = input(false, { transform: booleanAttribute });
  readonly showFirstLastPageButtons = input(true, { transform: booleanAttribute });
  readonly currentPageReportTemplate = input('Showing {first} to {last} of {totalRecords}');
  readonly variant = input<JPaginatorVariant>('standard');

  readonly pageChange = output<JPaginatorPageChange>();

  protected readonly first = signal(0);
  protected readonly rows = signal(10);

  constructor() {
    effect(() => this.first.set(this.firstInput()));
    effect(() => this.rows.set(this.rowsInput()));
  }

  get pageCount(): number {
    return Math.max(1, Math.ceil(this.normalizedTotalRecords / this.normalizedRows));
  }

  get currentPage(): number {
    return Math.min(this.pageCount, Math.floor(this.normalizedFirst / this.normalizedRows) + 1);
  }

  get pageLinks(): readonly number[] {
    const requestedSize = this.pageLinkSize();
    const size = Math.max(1, Math.floor(Number.isFinite(requestedSize) ? requestedSize : 5));
    const half = Math.floor(size / 2);
    const start = Math.max(1, Math.min(this.currentPage - half, this.pageCount - size + 1));
    const end = Math.min(this.pageCount, start + size - 1);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }

  get currentReport(): string {
    const first = this.normalizedTotalRecords === 0 ? 0 : this.normalizedFirst + 1;
    const last = Math.min(this.normalizedFirst + this.normalizedRows, this.normalizedTotalRecords);
    return this.currentPageReportTemplate()
      .replace('{first}', String(first))
      .replace('{last}', String(last))
      .replace('{rows}', String(this.normalizedRows))
      .replace('{totalRecords}', String(this.normalizedTotalRecords))
      .replace('{currentPage}', String(this.currentPage))
      .replace('{totalPages}', String(this.pageCount));
  }

  private get normalizedRows(): number {
    const value = this.rows();
    return Math.max(1, Math.floor(Number.isFinite(value) ? value : 10));
  }

  private get normalizedFirst(): number {
    const value = this.first();
    const first = Math.max(0, Math.floor(Number.isFinite(value) ? value : 0));
    return Math.min(first, Math.max(0, this.normalizedTotalRecords - 1));
  }

  private get normalizedTotalRecords(): number {
    const value = this.totalRecords();
    return Math.max(0, Math.floor(Number.isFinite(value) ? value : 0));
  }

  setPage(page: number): void {
    const requested = Number.isFinite(page) ? Math.floor(page) : 1;
    const nextPage = Math.min(Math.max(1, requested), this.pageCount);
    this.emitChange((nextPage - 1) * this.normalizedRows, this.normalizedRows);
  }

  setRows(event: Event): void {
    const select = event.target as HTMLSelectElement | null;
    const rows = Math.max(1, Number(select?.value) || this.normalizedRows);
    this.emitChange(0, rows);
  }

  private emitChange(first: number, rows: number): void {
    this.first.set(first);
    this.rows.set(rows);
    this.pageChange.emit({
      first,
      rows,
      page: Math.floor(first / rows) + 1,
      pageCount: Math.max(1, Math.ceil(this.normalizedTotalRecords / rows)),
    });
  }
}
