import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { JDatePickerComponent, JDatePickerValue } from 'jrng-ui/date-picker';

export interface JFilterBarValue {
  readonly search: string;
  readonly status: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly advanced: boolean;
}

@Component({
  selector: 'j-filter-bar',
  imports: [FormsModule, JDatePickerComponent],
  template: `
    <section
      class="j-filter-bar"
      [class.is-advanced]="advanced()"
      data-jc-name="filter-bar"
      data-jc-section="root"
    >
      <label class="j-filter-bar__search">
        <span>{{ searchLabel() }}</span>
        <input
          type="search"
          [placeholder]="searchPlaceholder()"
          [value]="search()"
          (input)="updateSearch($event)"
          (keydown.enter)="applyFilters()"
        />
      </label>

      @if (statuses().length) {
        <label class="j-filter-bar__field">
          <span>{{ statusLabel() }}</span>
          <select [value]="status()" (change)="updateStatus($event)">
            <option value="">{{ allStatusesLabel() }}</option>
            @for (option of statuses(); track option) {
              <option [value]="option">{{ option }}</option>
            }
          </select>
        </label>
      }

      @if (showDateRange()) {
        <j-date-picker
          [label]="startDateLabel()"
          [ngModel]="startDateValue()"
          (ngModelChange)="updateStartDate($event)"
          [maxDate]="endDateValue()"
          dateFormat="yyyy-MM-dd"
          [showIcon]="true"
          [showButtonBar]="true"
        />
        <j-date-picker
          [label]="endDateLabel()"
          [ngModel]="endDateValue()"
          (ngModelChange)="updateEndDate($event)"
          [minDate]="startDateValue()"
          dateFormat="yyyy-MM-dd"
          [showIcon]="true"
          [showButtonBar]="true"
        />
      }

      <div class="j-filter-bar__custom">
        <ng-content select="[jFilterBarFilters]"></ng-content>
      </div>

      <div class="j-filter-bar__actions">
        @if (showAdvancedToggle()) {
          <button
            type="button"
            class="j-filter-bar__button"
            [attr.aria-expanded]="advanced()"
            (click)="toggleAdvanced()"
          >
            {{ advanced() ? hideAdvancedLabel() : showAdvancedLabel() }}
          </button>
        }
        <button type="button" class="j-filter-bar__button" (click)="resetFilters()">
          {{ resetLabel() }}
        </button>
        <button
          type="button"
          class="j-filter-bar__button j-filter-bar__button--primary"
          (click)="applyFilters()"
        >
          {{ applyLabel() }}
        </button>
        @if (showExport()) {
          <button type="button" class="j-filter-bar__button" (click)="export.emit(value())">
            {{ exportLabel() }}
          </button>
        }
        <ng-content select="[jFilterBarActions]"></ng-content>
      </div>

      @if (advanced()) {
        <div class="j-filter-bar__advanced">
          <ng-content select="[jFilterBarAdvanced]"></ng-content>
        </div>
      }
    </section>
  `,
  styles: [
    `
      .j-filter-bar {
        align-items: end;
        background: var(--j-filter-bar-bg, var(--j-color-card, #ffffff));
        border: 1px solid var(--j-filter-bar-border-color, var(--j-color-border, #e2e8f0));
        border-radius: var(--j-filter-bar-radius, var(--j-radius-lg, 0.75rem));
        color: var(--j-filter-bar-color, var(--j-color-card-foreground, #111827));
        display: grid;
        gap: var(--j-spacing-3, 0.75rem);
        grid-template-columns: minmax(14rem, 1.5fr) repeat(3, minmax(9rem, 1fr));
        padding: var(--j-spacing-4, 1rem);
      }

      .j-filter-bar__search,
      .j-filter-bar__field {
        display: grid;
        gap: var(--j-spacing-1, 0.25rem);
      }

      .j-filter-bar j-date-picker {
        min-width: 0;
      }

      .j-filter-bar__search span,
      .j-filter-bar__field span {
        color: var(--j-filter-bar-label-color, var(--j-color-muted-foreground, #64748b));
        font-size: var(--j-font-size-xs, 0.75rem);
        font-weight: var(--j-font-weight-semibold, 600);
      }

      .j-filter-bar input,
      .j-filter-bar select {
        background: var(--j-filter-bar-control-bg, var(--j-color-card, #ffffff));
        border: 1px solid var(--j-filter-bar-control-border-color, var(--j-color-border, #e2e8f0));
        border-radius: var(--j-radius-md, 0.5rem);
        color: var(--j-filter-bar-control-color, var(--j-color-foreground, #111827));
        font: inherit;
        min-height: 2.5rem;
        padding: 0 var(--j-spacing-3, 0.75rem);
      }

      .j-filter-bar__custom:empty,
      .j-filter-bar__advanced:empty {
        display: none;
      }

      .j-filter-bar__actions {
        display: flex;
        flex-wrap: wrap;
        gap: var(--j-spacing-2, 0.5rem);
        grid-column: 1 / -1;
        justify-content: flex-end;
      }

      .j-filter-bar__button {
        background: var(--j-filter-bar-button-bg, var(--j-color-card, #ffffff));
        border: 1px solid var(--j-filter-bar-button-border-color, var(--j-color-border, #e2e8f0));
        border-radius: var(--j-radius-md, 0.5rem);
        color: var(--j-filter-bar-button-color, var(--j-color-foreground, #111827));
        cursor: pointer;
        font: inherit;
        min-height: 2.5rem;
        padding: 0 var(--j-spacing-3, 0.75rem);
      }

      .j-filter-bar__button--primary {
        background: var(--j-filter-bar-primary-bg, var(--j-color-primary, #2563eb));
        border-color: var(--j-filter-bar-primary-bg, var(--j-color-primary, #2563eb));
        color: var(--j-filter-bar-primary-color, var(--j-color-primary-foreground, #ffffff));
      }

      .j-filter-bar__advanced {
        border-top: 1px solid var(--j-color-border, #e2e8f0);
        grid-column: 1 / -1;
        padding-top: var(--j-spacing-3, 0.75rem);
      }

      .j-filter-bar input:focus-visible,
      .j-filter-bar select:focus-visible,
      .j-filter-bar__button:focus-visible {
        box-shadow: var(--j-focus-ring);
        outline: none;
      }

      @media (max-width: 900px) {
        .j-filter-bar {
          grid-template-columns: 1fr;
        }

        .j-filter-bar__actions {
          justify-content: stretch;
        }

        .j-filter-bar__button {
          flex: 1 1 auto;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JFilterBarComponent {
  readonly searchLabel = input('Search');
  readonly searchPlaceholder = input('Search records');
  readonly statusLabel = input('Status');
  readonly allStatusesLabel = input('All statuses');
  readonly startDateLabel = input('Start date');
  readonly endDateLabel = input('End date');
  readonly resetLabel = input('Reset');
  readonly applyLabel = input('Apply');
  readonly exportLabel = input('Export');
  readonly showAdvancedLabel = input('Advanced');
  readonly hideAdvancedLabel = input('Hide advanced');
  readonly statuses = input<readonly string[]>([]);
  readonly showDateRange = input(false, { transform: booleanAttribute });
  readonly showExport = input(false, { transform: booleanAttribute });
  readonly showAdvancedToggle = input(false, { transform: booleanAttribute });

  readonly filterChange = output<JFilterBarValue>();
  readonly apply = output<JFilterBarValue>();
  readonly reset = output<void>();
  readonly export = output<JFilterBarValue>();

  readonly search = signal('');
  readonly status = signal('');
  readonly startDate = signal('');
  readonly endDate = signal('');
  readonly advanced = signal(false);

  readonly value = computed(() => ({
    search: this.search(),
    status: this.status(),
    startDate: this.startDate(),
    endDate: this.endDate(),
    advanced: this.advanced(),
  }));

  updateSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
    this.emitChange();
  }

  updateStatus(event: Event): void {
    this.status.set((event.target as HTMLSelectElement).value);
    this.emitChange();
  }

  readonly startDateValue = computed(() => this.parseDate(this.startDate()));
  readonly endDateValue = computed(() => this.parseDate(this.endDate()));

  updateStartDate(value: JDatePickerValue): void {
    this.startDate.set(this.toDateString(value));
    this.emitChange();
  }

  updateEndDate(value: JDatePickerValue): void {
    this.endDate.set(this.toDateString(value));
    this.emitChange();
  }

  toggleAdvanced(): void {
    this.advanced.update((value) => !value);
    this.emitChange();
  }

  applyFilters(): void {
    this.apply.emit(this.value());
  }

  resetFilters(): void {
    this.search.set('');
    this.status.set('');
    this.startDate.set('');
    this.endDate.set('');
    this.advanced.set(false);
    this.reset.emit();
    this.emitChange();
  }

  private emitChange(): void {
    this.filterChange.emit(this.value());
  }

  private parseDate(value: string): Date | null {
    if (!value) return null;
    const [year, month, day] = value.split('-').map(Number);
    return year && month && day ? new Date(year, month - 1, day) : null;
  }

  private toDateString(value: JDatePickerValue): string {
    if (!value) return '';
    const date =
      value instanceof Date ? value : typeof value === 'string' ? this.parseDate(value) : null;
    if (!date || Number.isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
