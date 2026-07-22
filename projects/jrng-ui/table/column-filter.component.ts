import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import {
  JTableFilterItem,
  JTableFilterOperator,
  JTableFilterOption,
  JTableFilterType,
} from './table.types';
import { JButtonComponent } from 'jrng-ui/button';

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
  'date-time': ['equals', 'notEquals', 'before', 'after', 'between', 'isEmpty', 'isNotEmpty'],
  time: ['equals', 'notEquals', 'before', 'after', 'between', 'isEmpty', 'isNotEmpty'],
  boolean: ['equals', 'isTrue', 'isFalse', 'isEmpty', 'isNotEmpty'],
  select: ['equals', 'notEquals', 'isEmpty', 'isNotEmpty'],
  'multi-select': ['in', 'notIn', 'isEmpty', 'isNotEmpty'],
};

@Component({
  selector: 'j-column-filter',
  imports: [JButtonComponent],
  template: `
    <div
      [class]="'j-column-filter j-column-filter--' + display()"
      role="group"
      [attr.aria-label]="resolvedAriaLabel()"
    >
      <span class="j-column-filter__label">Filter {{ label() || field() }}</span>
      @if (!hideOperator() && display() !== 'row') {
        <select
          class="j-column-filter__operator"
          [attr.aria-label]="'Filter operator for ' + (label() || field())"
          [value]="resolvedOperator()"
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
              (input)="handleRangeInput(0, $event)"
            />
            <span aria-hidden="true">–</span>
            <input
              class="j-column-filter__control"
              [type]="inputType()"
              [attr.aria-label]="resolvedAriaLabel() + ' to'"
              [value]="rangeValue()[1]"
              (input)="handleRangeInput(1, $event)"
            />
          </span>
        } @else {
          @switch (type()) {
            @case ('select') {
              <select
                class="j-column-filter__control"
                [attr.aria-label]="resolvedAriaLabel()"
                [value]="stringValue()"
                (change)="handleInput($event)"
              >
                <option value="">{{ placeholder() || 'All' }}</option>
                @for (option of options(); track option.value) {
                  <option [value]="option.value" [disabled]="option.disabled">
                    {{ option.label }}
                  </option>
                }
              </select>
            }
            @case ('multi-select') {
              <select
                class="j-column-filter__control"
                multiple
                [attr.aria-label]="resolvedAriaLabel()"
                (change)="handleMultiSelect($event)"
              >
                @for (option of options(); track option.value) {
                  <option
                    [value]="option.value"
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
                (input)="handleInput($event)"
              />
            }
          }
        }
      }
      @if (!hideOperator() && display() === 'row') {
        <details class="j-column-filter__match-menu">
          <summary
            class="j-column-filter__match-button"
            [attr.aria-label]="'Choose match mode for ' + (label() || field())"
            [attr.data-j-active]="resolvedOperator() !== defaultOperator() ? 'true' : null"
          >
            &#8801;
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
      @if (showActions()) {
        <div class="j-column-filter__actions">
          <j-button label="Clear" variant="text" size="sm" (onClick)="clearFilter()" />
          <j-button label="Apply" size="sm" (onClick)="applyFilter()" />
        </div>
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
      .j-column-filter--row .j-column-filter__control,
      .j-column-filter--row .j-column-filter__range {
        flex: 1;
        min-width: 0;
      }
      .j-column-filter__match-menu {
        flex: 0 0 auto;
        position: relative;
      }
      .j-column-filter__match-button {
        align-items: center;
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-sm);
        cursor: pointer;
        display: inline-flex;
        height: 2rem;
        justify-content: center;
        list-style: none;
        width: 2rem;
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
        min-width: 12rem;
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
        gap: var(--j-spacing-1);
        justify-content: flex-end;
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

      .j-column-filter__control,
      .j-column-filter__operator {
        background: var(--j-color-surface, #ffffff);
        border: 1px solid var(--j-color-border, #dbe2ea);
        border-radius: var(--j-radius-sm, 0.375rem);
        color: var(--j-color-text, #111827);
        font: inherit;
        min-height: 2rem;
        padding: 0 var(--j-spacing-sm, 0.5rem);
        width: 100%;
      }

      .j-column-filter__range {
        align-items: center;
        display: flex;
        gap: var(--j-spacing-1, 0.25rem);
      }

      .j-column-filter__operator {
        font-size: var(--j-font-size-xs, 0.75rem);
        min-height: 1.75rem;
      }

      .j-column-filter__control:focus-visible,
      .j-column-filter__operator:focus-visible {
        box-shadow: var(--j-focus-ring, 0 0 0 3px rgb(79 70 229 / 24%));
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
  readonly filterChange = output<JColumnFilterChange>();
  readonly apply = output<JColumnFilterChange>();
  readonly clear = output<void>();

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
  readonly selectedValues = computed(() => {
    const value = this.value();
    return Array.isArray(value) ? value.map(String) : [];
  });
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
      : this.type() === 'date'
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
    this.emitValue(
      Array.from((event.target as HTMLSelectElement).selectedOptions).map((option) => option.value),
    );
  }
  handleRangeInput(index: 0 | 1, event: Event): void {
    const next = [...this.rangeValue()];
    const raw = (event.target as HTMLInputElement).value;
    next[index] = this.type() === 'number' && raw !== '' ? Number(raw) : raw;
    this.emitValue(next);
  }
  handleOperator(event: Event): void {
    this.filterChange.emit({
      field: this.field(),
      operator: (event.target as HTMLSelectElement).value as JTableFilterOperator,
      value: this.value(),
    });
  }
  selectOperator(operator: JTableFilterOperator, event: Event): void {
    this.filterChange.emit({ field: this.field(), operator, value: this.value() });
    (event.currentTarget as HTMLElement | null)?.closest('details')?.removeAttribute('open');
  }
  clearFilter(): void {
    this.emitValue('');
    this.clear.emit();
  }
  applyFilter(): void {
    this.apply.emit({
      field: this.field(),
      operator: this.resolvedOperator(),
      value: this.value(),
    });
  }
  operatorLabel(operator: JTableFilterOperator): string {
    return operator.replace(/([A-Z])/g, ' $1').replace(/^./, (value) => value.toUpperCase());
  }

  isOptionSelected(value: unknown): boolean {
    return this.selectedValues().includes(String(value));
  }

  private emitValue(value: unknown): void {
    this.filterChange.emit({ field: this.field(), operator: this.resolvedOperator(), value });
  }
}
