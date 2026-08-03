import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import {
  JTableFilterItem,
  JTableFilterOperator,
  JTableFilterOption,
  JTableFilterType,
} from './table.types';
import { JButtonComponent } from 'jrng-ui/button';
import { jCreateId } from 'jrng-ui/core';
import { JIconComponent } from 'jrng-ui/icon';

export type JColumnFilterChange = JTableFilterItem;
export type JColumnFilterDisplay = 'inline' | 'row' | 'menu' | 'toolbar';

const DEFAULT_OPERATORS: Readonly<Record<JTableFilterType, readonly JTableFilterOperator[]>> = {
  text: [
    'contains',
    'notContains',
    'startsWith',
    'endsWith',
    'equals',
    'notEquals',
    'isEmpty',
    'isNotEmpty',
  ],
  number: [
    'equals',
    'notEquals',
    'lessThan',
    'lessThanOrEqual',
    'greaterThan',
    'greaterThanOrEqual',
    'between',
    'isEmpty',
    'isNotEmpty',
  ],
  date: ['equals', 'notEquals', 'before', 'after', 'between', 'isEmpty', 'isNotEmpty'],
  'date-range': ['between', 'equals', 'notEquals', 'before', 'after', 'isEmpty', 'isNotEmpty'],
  'date-time': ['equals', 'notEquals', 'before', 'after', 'between', 'isEmpty', 'isNotEmpty'],
  time: ['equals', 'notEquals', 'before', 'after', 'between', 'isEmpty', 'isNotEmpty'],
  boolean: ['equals', 'isTrue', 'isFalse', 'isEmpty', 'isNotEmpty'],
  enum: ['equals', 'notEquals', 'isEmpty', 'isNotEmpty'],
  select: ['equals', 'notEquals', 'isEmpty', 'isNotEmpty'],
  'multi-select': ['in', 'notIn', 'isEmpty', 'isNotEmpty'],
  custom: ['equals', 'notEquals', 'isEmpty', 'isNotEmpty'],
};

@Component({
  selector: 'j-column-filter',
  imports: [JButtonComponent, JIconComponent],
  template: `
    <div
      [class]="'j-column-filter j-column-filter--' + display()"
      role="group"
      [attr.aria-label]="resolvedAriaLabel()"
    >
      <span class="j-column-filter__label">Filter {{ label() || field() }}</span>
      <div class="j-column-filter__fields">
        @if (!hideOperator() && display() !== 'row' && display() !== 'toolbar') {
          <select
            class="j-column-filter__operator"
            [attr.aria-label]="'Filter operator for ' + (label() || field())"
            [value]="resolvedOperator()"
            [disabled]="disabled() || readonly()"
            (change)="handleOperator($event)"
          >
            @for (item of resolvedOperators(); track item) {
              <option [value]="item">{{ operatorLabel(item) }}</option>
            }
          </select>
        }
        @if (requiresValue()) {
          @if (resolvedOperator() === 'between') {
            <span class="j-column-filter__range">
              <input
                class="j-column-filter__control"
                [type]="inputType()"
                [attr.aria-label]="resolvedAriaLabel() + ' from'"
                [value]="rangeValue()[0]"
                [disabled]="disabled()"
                [readOnly]="readonly()"
                [attr.aria-invalid]="invalid() || error() ? 'true' : null"
                [attr.aria-describedby]="error() ? errorId : null"
                (input)="handleRangeInput(0, $event)"
              />
              <span aria-hidden="true">–</span>
              <input
                class="j-column-filter__control"
                [type]="inputType()"
                [attr.aria-label]="resolvedAriaLabel() + ' to'"
                [value]="rangeValue()[1]"
                [disabled]="disabled()"
                [readOnly]="readonly()"
                [attr.aria-invalid]="invalid() || error() ? 'true' : null"
                [attr.aria-describedby]="error() ? errorId : null"
                (input)="handleRangeInput(1, $event)"
              />
            </span>
          } @else {
            @switch (type()) {
              @case ('select') {
                <select
                  class="j-column-filter__control"
                  [attr.aria-label]="resolvedAriaLabel()"
                  [value]="selectedOptionIndex()"
                  [disabled]="disabled() || readonly()"
                  (change)="handleSelect($event)"
                >
                  <option value="-1">{{ placeholder() || 'All' }}</option>
                  @for (option of options(); track $index) {
                    <option [value]="$index" [disabled]="option.disabled">
                      {{ option.label }}
                    </option>
                  }
                </select>
              }
              @case ('enum') {
                <select
                  class="j-column-filter__control"
                  [attr.aria-label]="resolvedAriaLabel()"
                  [value]="selectedOptionIndex()"
                  [disabled]="disabled() || readonly()"
                  (change)="handleSelect($event)"
                >
                  <option value="-1">{{ placeholder() || 'All' }}</option>
                  @for (option of options(); track $index) {
                    <option [value]="$index" [disabled]="option.disabled">
                      {{ option.label }}
                    </option>
                  }
                </select>
              }
              @case ('multi-select') {
                <select
                  class="j-column-filter__control"
                  multiple
                  [disabled]="disabled() || readonly()"
                  [attr.aria-label]="resolvedAriaLabel()"
                  (change)="handleMultiSelect($event)"
                >
                  @for (option of options(); track $index) {
                    <option
                      [value]="$index"
                      [selected]="isOptionSelected(option.value)"
                      [disabled]="option.disabled"
                    >
                      {{ option.label }}
                    </option>
                  }
                </select>
              }
              @case ('boolean') {
                <select
                  class="j-column-filter__control"
                  [attr.aria-label]="resolvedAriaLabel()"
                  [value]="stringValue()"
                  [disabled]="disabled() || readonly()"
                  (change)="handleInput($event)"
                >
                  <option value="">{{ placeholder() || 'Any' }}</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              }
              @default {
                <input
                  class="j-column-filter__control"
                  [type]="inputType()"
                  [attr.aria-label]="resolvedAriaLabel()"
                  [attr.placeholder]="placeholder() || null"
                  [attr.min]="min() ?? null"
                  [attr.max]="max() ?? null"
                  [attr.step]="step() ?? null"
                  [value]="stringValue()"
                  [disabled]="disabled()"
                  [readOnly]="readonly()"
                  [attr.aria-invalid]="invalid() || error() ? 'true' : null"
                  [attr.aria-describedby]="error() ? errorId : null"
                  (input)="handleInput($event)"
                />
              }
            }
          }
        }
        @if (!hideOperator() && display() === 'toolbar') {
          <select
            class="j-column-filter__operator"
            [attr.aria-label]="'Filter operator for ' + (label() || field())"
            [value]="resolvedOperator()"
            [disabled]="disabled() || readonly()"
            (change)="handleOperator($event)"
          >
            @for (item of resolvedOperators(); track item) {
              <option [value]="item">{{ operatorLabel(item) }}</option>
            }
          </select>
        }
      </div>
      @if (!hideOperator() && display() === 'row') {
        <details class="j-column-filter__match-menu">
          <summary
            class="j-column-filter__match-button"
            [attr.aria-label]="'Choose match mode for ' + (label() || field())"
            [attr.data-j-active]="resolvedOperator() !== defaultOperator() ? 'true' : null"
          >
            <j-icon name="filter" size="0.875rem" aria-hidden="true" />
          </summary>
          <div class="j-column-filter__match-popup" role="menu">
            @for (item of resolvedOperators(); track item) {
              <j-button
                [label]="operatorLabel(item)"
                variant="text"
                size="sm"
                ariaRole="menuitemradio"
                [ariaChecked]="item === resolvedOperator()"
                (onClick)="selectOperator(item, $event)"
              />
            }
          </div>
        </details>
      }
      @if (display() === 'row' && active()) {
        <j-button
          icon="close"
          actionDisplay="icon"
          size="sm"
          variant="text"
          [ariaLabel]="'Clear filter for ' + (label() || field())"
          [disabled]="disabled() || readonly()"
          (onClick)="clearFilter()"
        />
      }
      @if (showActions()) {
        <div class="j-column-filter__actions">
          <j-button
            [ariaLabel]="'Clear filter for ' + (label() || field())"
            label="Clear"
            variant="outlined"
            size="sm"
            [disabled]="disabled() || readonly()"
            (onClick)="clearFilter()"
          />
          <j-button
            [ariaLabel]="'Apply filter for ' + (label() || field())"
            label="Apply"
            size="sm"
            [disabled]="disabled() || readonly()"
            (onClick)="applyFilter()"
          />
        </div>
      }
      @if (error()) {
        <small [id]="errorId" class="j-column-filter__error" role="alert">{{ error() }}</small>
      }
    </div>
  `,
  styles: [
    `
      .j-column-filter {
        display: grid;
        gap: var(--j-spacing-1, 0.25rem);
        margin-top: var(--j-spacing-sm, 0.5rem);
      }

      .j-column-filter--row {
        align-items: center;
        display: flex;
        margin: 0;
        position: relative;
      }
      .j-column-filter__fields {
        display: contents;
      }
      .j-column-filter--row .j-column-filter__control,
      .j-column-filter--row .j-column-filter__range {
        flex: 1;
        min-width: 0;
      }
      .j-column-filter--row:has(.j-column-filter__match-menu)
        .j-column-filter__fields
        > .j-column-filter__control,
      .j-column-filter--row:has(.j-column-filter__match-menu)
        .j-column-filter__fields
        > .j-column-filter__range {
        border-end-end-radius: 0;
        border-start-end-radius: 0;
      }
      .j-column-filter__match-menu {
        flex: 0 0 auto;
        position: relative;
      }
      .j-column-filter__match-button {
        align-items: center;
        border: 1px solid var(--j-color-border);
        border-end-end-radius: var(--j-radius-sm);
        border-inline-start: 0;
        border-start-end-radius: var(--j-radius-sm);
        cursor: pointer;
        display: inline-flex;
        height: var(--j-table-filter-control-height, 2.5rem);
        justify-content: center;
        list-style: none;
        width: 2.25rem;
      }
      .j-column-filter__match-button:focus-visible {
        box-shadow: var(--j-focus-ring);
        outline: none;
      }
      .j-column-filter__match-popup {
        background: var(--j-color-popover);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-md);
        box-shadow: var(--j-shadow-md);
        display: grid;
        inset-inline-end: 0;
        max-height: min(18rem, calc(100vh - 2rem));
        min-width: 13rem;
        overflow: auto;
        padding: var(--j-spacing-1);
        position: absolute;
        top: calc(100% + var(--j-spacing-1));
        z-index: var(--j-z-index-popover);
      }
      .j-column-filter__match-popup button,
      .j-column-filter__actions button {
        background: transparent;
        border: 0;
        border-radius: var(--j-radius-sm);
        color: inherit;
        font: inherit;
        min-height: 2rem;
        padding: 0 var(--j-spacing-2);
        text-align: start;
      }
      .j-column-filter__match-popup button:hover,
      .j-column-filter__match-popup button:focus-visible {
        background: var(--j-color-hover-background);
        outline: none;
      }
      .j-column-filter__actions {
        display: flex;
        gap: var(--j-spacing-2);
        justify-content: space-between;
      }

      .j-column-filter--menu {
        gap: var(--j-spacing-3);
        margin: 0;
      }

      .j-column-filter--menu .j-column-filter__actions {
        border-top: 1px solid var(--j-color-border);
        margin: var(--j-spacing-1) calc(var(--j-spacing-3) * -1) calc(var(--j-spacing-3) * -1);
        padding: var(--j-spacing-3);
      }

      .j-column-filter--toolbar {
        gap: var(--j-spacing-2);
        margin: 0;
      }

      .j-column-filter--toolbar .j-column-filter__fields {
        align-items: stretch;
        background: var(--j-table-filter-control-bg, var(--j-color-surface));
        border: 1px solid var(--j-table-filter-control-border, var(--j-color-border));
        border-radius: var(--j-radius-sm, 0.375rem);
        display: flex;
        min-height: var(--j-table-filter-control-height, 2.5rem);
        overflow: hidden;
      }

      .j-column-filter--toolbar .j-column-filter__control,
      .j-column-filter--toolbar .j-column-filter__operator {
        background: transparent;
        border: 0;
        border-radius: 0;
        min-width: 0;
      }

      .j-column-filter--toolbar .j-column-filter__control,
      .j-column-filter--toolbar .j-column-filter__range {
        flex: 1 1 auto;
      }

      .j-column-filter--toolbar .j-column-filter__operator {
        border-inline-start: 1px solid var(--j-table-filter-control-border, var(--j-color-border));
        flex: 0 1 9rem;
        width: min(42%, 9rem);
      }

      .j-column-filter--toolbar .j-column-filter__operator:only-child {
        border-inline-start: 0;
        flex-basis: 100%;
        width: 100%;
      }

      .j-column-filter--toolbar .j-column-filter__range {
        gap: 0;
      }

      .j-column-filter--toolbar .j-column-filter__range > span {
        align-items: center;
        color: var(--j-color-text-muted);
        display: inline-flex;
      }

      .j-column-filter--toolbar .j-column-filter__fields:focus-within {
        box-shadow: var(--j-focus-ring);
      }

      .j-column-filter--toolbar .j-column-filter__control:focus-visible,
      .j-column-filter--toolbar .j-column-filter__operator:focus-visible {
        box-shadow: none;
      }

      .j-column-filter__label {
        clip: rect(0 0 0 0);
        clip-path: inset(50%);
        height: 1px;
        overflow: hidden;
        position: absolute;
        white-space: nowrap;
        width: 1px;
      }

      .j-column-filter--menu .j-column-filter__label,
      .j-column-filter--toolbar .j-column-filter__label {
        clip: auto;
        clip-path: none;
        font-size: var(--j-font-size-sm);
        font-weight: var(--j-font-weight-semibold);
        height: auto;
        overflow: visible;
        position: static;
        white-space: nowrap;
        width: auto;
      }

      .j-column-filter__error {
        color: var(--j-color-danger);
        font-size: var(--j-font-size-xs);
      }

      .j-column-filter__control,
      .j-column-filter__operator {
        background: var(--j-table-filter-control-bg, var(--j-color-surface));
        border: 1px solid var(--j-table-filter-control-border, var(--j-color-border));
        border-radius: var(--j-radius-sm, 0.375rem);
        color: var(--j-color-text);
        font: inherit;
        min-height: var(--j-table-filter-control-height, 2.5rem);
        padding: 0 var(--j-spacing-2, 0.5rem);
        width: 100%;
      }

      .j-column-filter__range {
        align-items: center;
        display: flex;
        gap: var(--j-spacing-1, 0.25rem);
      }

      .j-column-filter__operator {
        font-size: var(--j-font-size-sm, 0.875rem);
        min-height: var(--j-table-filter-control-height, 2.5rem);
      }

      .j-column-filter__control:focus-visible,
      .j-column-filter__operator:focus-visible {
        box-shadow: var(--j-focus-ring);
        outline: none;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JColumnFilterComponent {
  readonly field = input.required<string>();
  readonly label = input('');
  readonly value = input<unknown>('');
  readonly type = input<JTableFilterType>('text');
  readonly operator = input<JTableFilterOperator>('contains');
  readonly operators = input<readonly JTableFilterOperator[]>([]);
  readonly options = input<readonly JTableFilterOption[]>([]);
  readonly placeholder = input('');
  readonly ariaLabel = input('');
  readonly hideOperator = input(false);
  readonly min = input<number | string | null>(null);
  readonly max = input<number | string | null>(null);
  readonly step = input<number | null>(null);
  readonly display = input<JColumnFilterDisplay>('inline');
  readonly showActions = input(false);
  readonly active = input(false);
  readonly disabled = input(false);
  readonly readonly = input(false);
  readonly invalid = input(false);
  readonly error = input('');
  readonly filterChange = output<JColumnFilterChange>();
  readonly apply = output<JColumnFilterChange>();
  readonly clear = output<void>();
  readonly errorId = jCreateId('j-column-filter-error');

  readonly resolvedOperators = computed(() =>
    this.operators().length ? this.operators() : DEFAULT_OPERATORS[this.type()],
  );
  readonly resolvedOperator = computed(() =>
    this.resolvedOperators().includes(this.operator())
      ? this.operator()
      : (this.resolvedOperators()[0] ?? 'equals'),
  );
  readonly defaultOperator = computed(() => this.resolvedOperators()[0] ?? 'equals');
  readonly resolvedAriaLabel = computed(
    () => this.ariaLabel() || `Filter ${this.label() || this.field()}`,
  );
  readonly selectedOptionIndex = computed(() =>
    this.options().findIndex((option) => this.valuesEqual(option.value, this.value())),
  );
  readonly rangeValue = computed<readonly [unknown, unknown]>(() => {
    const value = this.value();
    return Array.isArray(value) ? [value[0] ?? '', value[1] ?? ''] : ['', ''];
  });
  readonly requiresValue = computed(
    () => !['isEmpty', 'isNotEmpty', 'isTrue', 'isFalse'].includes(this.resolvedOperator()),
  );
  readonly inputType = computed(() =>
    this.type() === 'number'
      ? 'number'
      : this.type() === 'date' || this.type() === 'date-range'
        ? 'date'
        : this.type() === 'date-time'
          ? 'datetime-local'
          : this.type() === 'time'
            ? 'time'
            : 'search',
  );

  readonly stringValue = computed<string>(() => {
    const value = this.value();
    return value == null ? '' : String(value);
  });

  handleInput(event: Event): void {
    if (this.disabled() || this.readonly()) return;
    const input = event.target as HTMLInputElement | null;
    const value = input?.value ?? '';
    this.emitValue(
      this.type() === 'number' && value !== ''
        ? Number(value)
        : this.type() === 'boolean' && value !== ''
          ? value === 'true'
          : value,
    );
  }

  handleMultiSelect(event: Event): void {
    if (this.disabled() || this.readonly()) return;
    this.emitValue(
      Array.from((event.target as HTMLSelectElement).selectedOptions)
        .map((option) => this.options()[Number(option.value)]?.value)
        .filter((value) => value !== undefined),
    );
  }
  handleSelect(event: Event): void {
    if (this.disabled() || this.readonly()) return;
    const index = Number((event.target as HTMLSelectElement).value);
    this.emitValue(index < 0 ? '' : this.options()[index]?.value);
  }
  handleRangeInput(index: 0 | 1, event: Event): void {
    if (this.disabled() || this.readonly()) return;
    const next = [...this.rangeValue()];
    const raw = (event.target as HTMLInputElement).value;
    next[index] = this.type() === 'number' && raw !== '' ? Number(raw) : raw;
    this.emitValue(next);
  }
  handleOperator(event: Event): void {
    if (this.disabled() || this.readonly()) return;
    this.filterChange.emit({
      field: this.field(),
      operator: (event.target as HTMLSelectElement).value as JTableFilterOperator,
      value: this.value(),
    });
  }
  selectOperator(operator: JTableFilterOperator, event: Event): void {
    if (this.disabled() || this.readonly()) return;
    this.filterChange.emit({ field: this.field(), operator, value: this.value() });
    (event.currentTarget as HTMLElement | null)?.closest('details')?.removeAttribute('open');
  }
  clearFilter(): void {
    if (this.disabled() || this.readonly()) return;
    this.emitValue('');
    this.clear.emit();
  }
  applyFilter(): void {
    if (this.disabled() || this.readonly()) return;
    this.apply.emit({
      field: this.field(),
      operator: this.resolvedOperator(),
      value: this.value(),
    });
  }
  operatorLabel(operator: JTableFilterOperator): string {
    const dateLabels: Partial<Record<JTableFilterOperator, string>> = {
      equals: 'Date is',
      notEquals: 'Date is not',
      before: 'Before',
      after: 'After',
      between: 'Between',
    };
    if (['date', 'date-range', 'date-time'].includes(this.type()) && dateLabels[operator]) {
      return dateLabels[operator] as string;
    }
    const labels: Partial<Record<JTableFilterOperator, string>> = {
      notEquals: 'Not equal',
      lessThan: 'Less than',
      lessThanOrEqual: 'Less than or equal',
      greaterThan: 'Greater than',
      greaterThanOrEqual: 'Greater than or equal',
      startsWith: 'Starts with',
      endsWith: 'Ends with',
      isEmpty: 'Is empty',
      isNotEmpty: 'Is not empty',
      isTrue: 'Is true',
      isFalse: 'Is false',
      notIn: 'Not in',
    };
    return labels[operator] ?? operator.replace(/^./, (value) => value.toUpperCase());
  }

  isOptionSelected(value: unknown): boolean {
    const current = this.value();
    const selected: readonly unknown[] = Array.isArray(current) ? current : [];
    return selected.some((candidate) => this.valuesEqual(candidate, value));
  }

  private emitValue(value: unknown): void {
    this.filterChange.emit({ field: this.field(), operator: this.resolvedOperator(), value });
  }

  private valuesEqual(first: unknown, second: unknown): boolean {
    return first === second || String(first) === String(second);
  }
}
