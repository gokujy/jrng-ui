import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  forwardRef,
  inject,
  Input,
  Output,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { jAriaDescribedBy } from '../core/aria';
import { JClickOutsideDirective } from '../core/click-outside.directive';
import { jCreateId } from '../core/id';
import {
  JNormalizedSelectionOption,
  JSelectionOptionSource,
  jNormalizeSelectionOptions,
  jSameSelectionValue,
} from '../core/selection-options';
import { JSize } from '../core/types';
import { JInputVariant } from '../input/input.component';

export type JMultiselectOption = JSelectionOptionSource;

@Component({
  selector: 'j-multiselect',
  imports: [JClickOutsideDirective],
  template: `
    <div [class]="rootClasses" jClickOutside (jClickOutside)="close()">
      @if (label) {
        <label class="j-multiselect__label" [for]="id">
          <span>{{ label }}</span>
          @if (required) {
            <span class="j-multiselect__required" aria-hidden="true">*</span>
          }
        </label>
      }

      <button
        class="j-multiselect"
        type="button"
        role="combobox"
        [id]="id"
        [disabled]="isDisabled"
        [attr.aria-expanded]="isOpen"
        [attr.aria-controls]="listboxId"
        [attr.aria-invalid]="hasError ? 'true' : null"
        [attr.aria-describedby]="describedBy"
        (click)="toggle()"
        (keydown)="handleKeydown($event)"
        (blur)="onTouched()"
      >
        @if (displayChips && selectedOptions.length) {
          <span class="j-multiselect__chips">
            @for (option of selectedOptions; track option.value) {
              <span class="j-multiselect__chip">{{ option.label }}</span>
            }
          </span>
        } @else {
          <span class="j-multiselect__value" [class.is-placeholder]="!selectedOptions.length">
            {{ selectedText }}
          </span>
        }
        @if (canClear) {
          <span class="j-multiselect__clear" (click)="clearAll($event)">x</span>
        }
        <span class="j-multiselect__indicator" aria-hidden="true"></span>
      </button>

      @if (isOpen) {
        <div
          class="j-multiselect__panel"
          [id]="listboxId"
          role="listbox"
          aria-multiselectable="true"
        >
          @if (filter || searchable) {
            <input
              class="j-multiselect__filter"
              type="text"
              [placeholder]="filterPlaceholder"
              [value]="filterText"
              (input)="handleFilterInput($event)"
              (keydown)="handleKeydown($event)"
            />
          }
          @if (showSelectAll) {
            <button class="j-multiselect__utility" type="button" (click)="toggleSelectAll()">
              {{ allVisibleSelected ? 'Clear visible' : 'Select visible' }}
            </button>
          }
          @if (!visibleOptions.length) {
            <div class="j-multiselect__empty">{{ emptyMessage }}</div>
          }
          @for (option of visibleOptions; track option.value; let i = $index) {
            <button
              class="j-multiselect__option"
              type="button"
              role="option"
              [disabled]="option.disabled"
              [class.is-active]="i === activeIndex"
              [attr.aria-selected]="isSelected(option)"
              (click)="toggleOption(option)"
            >
              <span
                class="j-multiselect__box"
                [class.is-selected]="isSelected(option)"
                aria-hidden="true"
              ></span>
              <span>{{ option.label }}</span>
            </button>
          }
        </div>
      }

      @if (hasError && error) {
        <p class="j-multiselect__message j-multiselect__message--error" [id]="errorId">
          {{ error }}
        </p>
      }
      @if (hint && !hasError) {
        <p class="j-multiselect__message" [id]="hintId">{{ hint }}</p>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .j-multiselect {
        align-items: center;
        background: var(--j-color-surface);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-md);
        color: var(--j-color-text);
        cursor: pointer;
        display: flex;
        font: inherit;
        gap: var(--j-spacing-sm);
        min-height: 2.5rem;
        padding: var(--j-spacing-xs) var(--j-spacing-md);
        text-align: left;
        width: 100%;
      }

      .j-multiselect-field {
        display: block;
        position: relative;
      }

      .j-multiselect__label {
        display: inline-flex;
        font-size: var(--j-font-size-sm);
        font-weight: var(--j-font-weight-semibold);
        gap: var(--j-spacing-xs);
        margin-bottom: var(--j-spacing-sm);
      }

      .j-multiselect__required,
      .j-multiselect__message--error {
        color: var(--j-color-danger);
      }

      .j-multiselect-field--filled .j-multiselect {
        background: var(--j-color-surface-muted);
      }

      .j-multiselect:focus-visible,
      .j-multiselect-field.is-open .j-multiselect {
        border-color: var(--j-color-primary);
        box-shadow: var(--j-focus-ring);
        outline: none;
      }

      .j-multiselect-field.is-invalid .j-multiselect {
        border-color: var(--j-color-danger);
      }

      .j-multiselect-field.is-disabled {
        opacity: var(--j-disabled-opacity);
      }

      .j-multiselect__value,
      .j-multiselect__chips {
        flex: 1;
        min-width: 0;
      }

      .j-multiselect__value.is-placeholder {
        color: var(--j-color-text-muted);
      }

      .j-multiselect__chips {
        display: flex;
        flex-wrap: wrap;
        gap: var(--j-spacing-xs);
      }

      .j-multiselect__chip {
        background: var(--j-color-surface-muted);
        border-radius: var(--j-radius-full);
        font-size: var(--j-font-size-xs);
        padding: 0 var(--j-spacing-sm);
      }

      .j-multiselect__clear {
        color: var(--j-color-text-muted);
      }

      .j-multiselect__indicator {
        border-bottom: 2px solid currentColor;
        border-right: 2px solid currentColor;
        height: 0.45rem;
        opacity: 0.62;
        transform: rotate(45deg) translateY(-2px);
        width: 0.45rem;
      }

      .j-multiselect__panel {
        background: var(--j-color-surface);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-md);
        box-shadow: var(--j-shadow-lg);
        left: 0;
        margin-top: var(--j-spacing-xs);
        max-height: 18rem;
        min-width: 100%;
        overflow: auto;
        padding: var(--j-spacing-xs);
        position: absolute;
        top: 100%;
        z-index: var(--j-z-index-dropdown);
      }

      .j-multiselect__filter,
      .j-multiselect__utility,
      .j-multiselect__option {
        font: inherit;
        width: 100%;
      }

      .j-multiselect__filter {
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-sm);
        min-height: 2rem;
        outline: none;
        padding: 0 var(--j-spacing-sm);
      }

      .j-multiselect__utility,
      .j-multiselect__option {
        background: transparent;
        border: 0;
        border-radius: var(--j-radius-sm);
        color: var(--j-color-text);
        cursor: pointer;
        display: flex;
        gap: var(--j-spacing-sm);
        padding: var(--j-spacing-sm) var(--j-spacing-md);
        text-align: left;
      }

      .j-multiselect__option:hover,
      .j-multiselect__option.is-active {
        background: var(--j-color-surface-muted);
      }

      .j-multiselect__box {
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-xs);
        height: 1rem;
        width: 1rem;
      }

      .j-multiselect__box.is-selected {
        background: var(--j-color-primary);
        border-color: var(--j-color-primary);
        box-shadow: inset 0 0 0 3px var(--j-color-surface);
      }

      .j-multiselect__empty,
      .j-multiselect__message {
        color: var(--j-color-text-muted);
        font-size: var(--j-font-size-xs);
      }

      .j-multiselect__empty {
        padding: var(--j-spacing-md);
      }

      .j-multiselect__message {
        margin: var(--j-spacing-sm) 0 0;
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => JMultiselectComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JMultiselectComponent implements ControlValueAccessor {
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  @Input() id = jCreateId('j-multiselect');
  @Input() label = '';
  @Input() options: readonly JMultiselectOption[] = [];
  @Input() optionLabel = 'label';
  @Input() optionValue = 'value';
  @Input() placeholder = 'Select';
  @Input() error = '';
  @Input() hint = '';
  @Input() filterPlaceholder = 'Search';
  @Input() emptyMessage = 'No options found';
  @Input() styleClass = '';
  @Input() size: JSize = 'md';
  @Input() variant: JInputVariant = 'outlined';
  @Input({ transform: booleanAttribute }) readonly = false;
  @Input({ transform: booleanAttribute }) invalid = false;
  @Input({ transform: booleanAttribute }) required = false;
  @Input({ transform: booleanAttribute }) searchable = false;
  @Input({ transform: booleanAttribute }) filter = false;
  @Input({ transform: booleanAttribute }) clearable = false;
  @Input({ transform: booleanAttribute }) displayChips = false;
  @Input({ transform: booleanAttribute }) showSelectAll = true;

  @Output() valueChange = new EventEmitter<readonly unknown[]>();
  @Output() selectionChange = new EventEmitter<readonly JNormalizedSelectionOption[]>();
  @Output() filterChange = new EventEmitter<string>();
  @Output() clear = new EventEmitter<void>();
  @Output() opened = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  readonly hintId = jCreateId('j-multiselect-hint');
  readonly errorId = jCreateId('j-multiselect-error');
  readonly listboxId = jCreateId('j-multiselect-listbox');
  value: readonly unknown[] = [];
  isDisabled = false;
  isOpen = false;
  filterText = '';
  activeIndex = -1;

  onTouched: () => void = () => undefined;
  private onChange: (value: readonly unknown[]) => void = () => undefined;

  @Input({ transform: booleanAttribute })
  set disabled(value: boolean) {
    this.isDisabled = value;
    this.changeDetectorRef.markForCheck();
  }

  get normalizedOptions(): readonly JNormalizedSelectionOption[] {
    return jNormalizeSelectionOptions(this.options, this.optionLabel, this.optionValue);
  }

  get visibleOptions(): readonly JNormalizedSelectionOption[] {
    const query = this.filterText.trim().toLowerCase();
    return query
      ? this.normalizedOptions.filter((option) => option.label.toLowerCase().includes(query))
      : this.normalizedOptions;
  }

  get selectedOptions(): readonly JNormalizedSelectionOption[] {
    return this.normalizedOptions.filter((option) =>
      this.value.some((value) => jSameSelectionValue(value, option.value)),
    );
  }

  get selectedText(): string {
    return this.selectedOptions.length
      ? this.selectedOptions.map((option) => option.label).join(', ')
      : this.placeholder;
  }

  get hasError(): boolean {
    return this.invalid || this.error.trim().length > 0;
  }

  get describedBy(): string | null {
    return jAriaDescribedBy(this.hasError ? this.errorId : null, this.hint ? this.hintId : null);
  }

  get canClear(): boolean {
    return this.clearable && this.value.length > 0 && !this.isDisabled && !this.readonly;
  }

  get allVisibleSelected(): boolean {
    const selectable = this.visibleOptions.filter((option) => !option.disabled);
    return selectable.length > 0 && selectable.every((option) => this.isSelected(option));
  }

  get rootClasses(): string {
    return [
      'j-multiselect-field',
      `j-multiselect-field--${this.size}`,
      `j-multiselect-field--${this.variant}`,
      this.hasError ? 'is-invalid' : '',
      this.isDisabled ? 'is-disabled' : '',
      this.isOpen ? 'is-open' : '',
      this.styleClass,
    ]
      .filter(Boolean)
      .join(' ');
  }

  writeValue(value: readonly unknown[] | null | undefined): void {
    this.value = Array.isArray(value) ? value : [];
    this.changeDetectorRef.markForCheck();
  }

  registerOnChange(fn: (value: readonly unknown[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    if (isDisabled) {
      this.close();
    }
    this.changeDetectorRef.markForCheck();
  }

  toggle(): void {
    if (this.isDisabled || this.readonly) {
      return;
    }
    this.isOpen ? this.close() : this.open();
  }

  open(): void {
    if (this.isOpen || this.isDisabled || this.readonly) {
      return;
    }
    this.isOpen = true;
    this.activeIndex = this.visibleOptions.findIndex((option) => !option.disabled);
    this.opened.emit();
    this.changeDetectorRef.markForCheck();
  }

  close(): void {
    if (!this.isOpen) {
      return;
    }
    this.isOpen = false;
    this.filterText = '';
    this.closed.emit();
    this.changeDetectorRef.markForCheck();
  }

  handleFilterInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.filterText = target.value;
    this.activeIndex = this.visibleOptions.findIndex((option) => !option.disabled);
    this.filterChange.emit(this.filterText);
  }

  handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' || event.key === 'Tab') {
      this.close();
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!this.isOpen) {
        this.open();
        return;
      }
      this.moveActive(event.key === 'ArrowDown' ? 1 : -1);
    }

    if (event.key === 'Enter' && this.isOpen) {
      event.preventDefault();
      const option = this.visibleOptions[this.activeIndex];
      if (option) {
        this.toggleOption(option);
      }
    }
  }

  toggleOption(option: JNormalizedSelectionOption): void {
    if (option.disabled) {
      return;
    }

    const nextValue = this.isSelected(option)
      ? this.value.filter((value) => !jSameSelectionValue(value, option.value))
      : [...this.value, option.value];
    this.commitValue(nextValue);
  }

  toggleSelectAll(): void {
    const selectable = this.visibleOptions.filter((option) => !option.disabled);
    const visibleValues = selectable.map((option) => option.value);
    const nextValue = this.allVisibleSelected
      ? this.value.filter(
          (value) =>
            !visibleValues.some((visibleValue) => jSameSelectionValue(visibleValue, value)),
        )
      : [
          ...this.value,
          ...visibleValues.filter(
            (value) => !this.value.some((selected) => jSameSelectionValue(selected, value)),
          ),
        ];
    this.commitValue(nextValue);
  }

  clearAll(event?: Event): void {
    event?.stopPropagation();
    this.commitValue([]);
    this.clear.emit();
  }

  isSelected(option: JNormalizedSelectionOption): boolean {
    return this.value.some((value) => jSameSelectionValue(value, option.value));
  }

  private commitValue(value: readonly unknown[]): void {
    this.value = value;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
    this.selectionChange.emit(this.selectedOptions);
    this.changeDetectorRef.markForCheck();
  }

  private moveActive(direction: 1 | -1): void {
    const options = this.visibleOptions;
    if (!options.length) {
      return;
    }
    let next = this.activeIndex;
    for (let attempt = 0; attempt < options.length; attempt += 1) {
      next = (next + direction + options.length) % options.length;
      if (!options[next]?.disabled) {
        this.activeIndex = next;
        this.changeDetectorRef.markForCheck();
        return;
      }
    }
  }
}
