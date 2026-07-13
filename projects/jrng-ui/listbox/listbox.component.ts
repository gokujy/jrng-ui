import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  effect,
  forwardRef,
  inject,
  input,
  output,
  signal,
  TemplateRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { jAriaDescribedBy } from 'jrng-ui/core';
import { jCreateId } from 'jrng-ui/core';
import {
  JNormalizedSelectionOption,
  JSelectionOptionSource,
  jNormalizeSelectionOptions,
  jSameSelectionValue,
} from 'jrng-ui/core';
import { JSize } from 'jrng-ui/core';

export type JListboxOption = JSelectionOptionSource;

@Component({
  selector: 'j-listbox',
  imports: [NgTemplateOutlet],
  template: `
    <div
      [class]="rootClasses"
      data-jc-name="listbox"
      data-jc-section="root"
      data-jc-extend="option filter"
      [attr.data-j-disabled]="isDisabled() ? 'true' : null"
      [attr.data-j-invalid]="hasError ? 'true' : null"
    >
      @if (label()) {
        <label class="j-listbox__label" data-jc-section="label" [for]="id()">
          <span>{{ label() }}</span>
          @if (required()) {
            <span class="j-listbox__required" aria-hidden="true">*</span>
          }
        </label>
      }
      @if (filter()) {
        <input
          class="j-listbox__filter"
          data-jc-section="filter"
          type="text"
          [placeholder]="filterPlaceholder()"
          [value]="filterText"
          (input)="handleFilterInput($event)"
        />
      }
      <div
        class="j-listbox"
        data-jc-section="list"
        role="listbox"
        [id]="id()"
        [attr.aria-multiselectable]="multiple() ? 'true' : null"
        [attr.aria-invalid]="hasError ? 'true' : null"
        [attr.aria-describedby]="describedBy"
        [attr.aria-activedescendant]="activeDescendant"
        tabindex="0"
        (keydown)="handleKeydown($event)"
        (blur)="onTouched()"
      >
        @for (option of visibleOptions; track option.value; let i = $index) {
          <button
            class="j-listbox__option"
            data-jc-section="option"
            type="button"
            role="option"
            [id]="optionId(i)"
            [attr.tabindex]="-1"
            [disabled]="isDisabled() || option.disabled"
            [class.is-active]="i === activeIndex"
            [class.is-selected]="isSelected(option)"
            [attr.data-j-selected]="isSelected(option) ? 'true' : null"
            [attr.data-j-active]="i === activeIndex ? 'true' : null"
            [attr.data-j-disabled]="option.disabled ? 'true' : null"
            [attr.aria-selected]="isSelected(option)"
            [attr.aria-disabled]="option.disabled ? 'true' : null"
            (click)="selectOption(option)"
          >
            @if (multiple()) {
              <span
                class="j-listbox__box"
                [class.is-selected]="isSelected(option)"
                aria-hidden="true"
              ></span>
            }
            @if (optionTemplate) {
              <ng-container
                [ngTemplateOutlet]="optionTemplate"
                [ngTemplateOutletContext]="optionContext(option)"
              ></ng-container>
            } @else {
              <span>{{ option.label }}</span>
            }
          </button>
        }
        @if (!visibleOptions.length) {
          <div class="j-listbox__empty">{{ emptyMessage() }}</div>
        }
      </div>
      @if (hasError && error()) {
        <p class="j-listbox__message j-listbox__message--error" [id]="errorId">{{ error() }}</p>
      }
      @if (hint() && !hasError) {
        <p class="j-listbox__message" [id]="hintId">{{ hint() }}</p>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .j-listbox-field {
        color: var(--j-color-text);
        display: block;
      }

      .j-listbox__label {
        display: inline-flex;
        font-size: var(--j-font-size-sm);
        font-weight: var(--j-font-weight-semibold);
        gap: var(--j-spacing-xs);
        margin-bottom: var(--j-spacing-sm);
      }

      .j-listbox__required,
      .j-listbox__message--error {
        color: var(--j-color-danger);
      }

      .j-listbox,
      .j-listbox__filter {
        background: var(--j-color-surface);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-md);
      }

      .j-listbox {
        max-height: 18rem;
        overflow: auto;
        padding: var(--j-spacing-xs);
      }

      .j-listbox:focus-visible,
      .j-listbox__filter:focus {
        border-color: var(--j-color-primary);
        box-shadow: var(--j-focus-ring);
        outline: none;
      }

      .j-listbox-field.is-invalid .j-listbox {
        border-color: var(--j-color-danger);
      }

      .j-listbox-field.is-disabled {
        opacity: var(--j-disabled-opacity);
      }

      .j-listbox__filter {
        color: var(--j-color-text);
        font: inherit;
        margin-bottom: var(--j-spacing-sm);
        min-height: 2.25rem;
        padding: 0 var(--j-spacing-md);
        width: 100%;
      }

      .j-listbox__option {
        align-items: center;
        background: transparent;
        border: 0;
        border-radius: var(--j-radius-sm);
        color: var(--j-color-text);
        cursor: pointer;
        display: flex;
        font: inherit;
        gap: var(--j-spacing-sm);
        padding: var(--j-spacing-sm) var(--j-spacing-md);
        text-align: left;
        width: 100%;
      }

      .j-listbox__option:hover,
      .j-listbox__option.is-active {
        background: var(--j-color-surface-muted);
      }

      .j-listbox__option.is-selected {
        color: var(--j-color-primary);
        font-weight: var(--j-font-weight-semibold);
      }

      .j-listbox__box {
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-xs);
        height: 1rem;
        width: 1rem;
      }

      .j-listbox__box.is-selected {
        background: var(--j-color-primary);
        border-color: var(--j-color-primary);
      }

      .j-listbox__empty,
      .j-listbox__message {
        color: var(--j-color-text-muted);
        font-size: var(--j-font-size-xs);
      }

      .j-listbox__empty {
        padding: var(--j-spacing-md);
      }

      .j-listbox__message {
        margin: var(--j-spacing-sm) 0 0;
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => JListboxComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JListboxComponent implements ControlValueAccessor {
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  @ContentChild('jListboxOption', { read: TemplateRef }) optionTemplate?: TemplateRef<{
    readonly $implicit: JSelectionOptionSource;
    readonly option: JSelectionOptionSource;
    readonly label: string;
    readonly value: unknown;
    readonly selected: boolean;
    readonly disabled: boolean;
  }>;

  readonly id = input(jCreateId('j-listbox'));
  readonly label = input('');
  readonly options = input<readonly JListboxOption[]>([]);
  readonly optionLabel = input('label');
  readonly optionValue = input('value');
  readonly optionDisabled = input('disabled');
  readonly error = input('');
  readonly hint = input('');
  readonly filterPlaceholder = input('Search');
  readonly emptyMessage = input('No options found');
  readonly styleClass = input('');
  readonly size = input<JSize>('md');
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly multiple = input(false, { transform: booleanAttribute });
  readonly filter = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });

  readonly valueChange = output<unknown>();
  readonly selectionChange = output<
    JNormalizedSelectionOption | readonly JNormalizedSelectionOption[] | null
  >();
  readonly filterChange = output<string>();

  readonly hintId = jCreateId('j-listbox-hint');
  readonly errorId = jCreateId('j-listbox-error');
  value: unknown = null;
  readonly isDisabled = signal(false);
  filterText = '';
  activeIndex = 0;

  onTouched: () => void = () => undefined;
  private onChange: (value: unknown) => void = () => undefined;

  constructor() {
    effect(() => this.isDisabled.set(this.disabled()));
  }

  get normalizedOptions(): readonly JNormalizedSelectionOption[] {
    return jNormalizeSelectionOptions(
      this.options(),
      this.optionLabel(),
      this.optionValue(),
      this.optionDisabled(),
    );
  }

  get visibleOptions(): readonly JNormalizedSelectionOption[] {
    const query = this.filterText.trim().toLowerCase();
    return query
      ? this.normalizedOptions.filter((option) => option.label.toLowerCase().includes(query))
      : this.normalizedOptions;
  }

  get selectedValues(): readonly unknown[] {
    return Array.isArray(this.value) ? this.value : [];
  }

  get hasError(): boolean {
    return this.invalid() || this.error().trim().length > 0;
  }

  get describedBy(): string | null {
    return jAriaDescribedBy(this.hasError ? this.errorId : null, this.hint() ? this.hintId : null);
  }

  /** Stable per-index id so the active option can be referenced via aria-activedescendant. */
  optionId(index: number): string {
    return `${this.id()}-option-${index}`;
  }

  /** Id of the active option, exposed on the listbox container for assistive tech. */
  get activeDescendant(): string | null {
    return this.activeIndex >= 0 && this.visibleOptions.length
      ? this.optionId(this.activeIndex)
      : null;
  }

  get rootClasses(): string {
    return [
      'j-listbox-field',
      `j-listbox-field--${this.size()}`,
      this.hasError ? 'is-invalid' : '',
      this.isDisabled() ? 'is-disabled' : '',
      this.styleClass(),
    ]
      .filter(Boolean)
      .join(' ');
  }

  writeValue(value: unknown): void {
    this.value = value ?? (this.multiple() ? [] : null);
    this.changeDetectorRef.markForCheck();
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
    this.changeDetectorRef.markForCheck();
  }

  handleFilterInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.filterText = target.value;
    this.filterChange.emit(this.filterText);
  }

  selectOption(option: JNormalizedSelectionOption): void {
    if (this.isDisabled() || option.disabled) {
      return;
    }

    if (this.multiple()) {
      const next = this.isSelected(option)
        ? this.selectedValues.filter((value) => !jSameSelectionValue(value, option.value))
        : [...this.selectedValues, option.value];
      this.value = next;
      this.onChange(next);
      this.valueChange.emit(next);
      this.selectionChange.emit(
        this.normalizedOptions.filter((item) =>
          next.some((value) => jSameSelectionValue(value, item.value)),
        ),
      );
      return;
    }

    this.value = option.value;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
    this.selectionChange.emit(option);
  }

  handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.moveActive(event.key === 'ArrowDown' ? 1 : -1);
    }

    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      this.activeIndex = event.key === 'Home' ? 0 : Math.max(0, this.visibleOptions.length - 1);
      this.changeDetectorRef.markForCheck();
    }

    // Both Enter and Space select the active option (the container is the tab stop,
    // so option buttons never receive the key events themselves).
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const option = this.visibleOptions[this.activeIndex];
      if (option) {
        this.selectOption(option);
      }
    }
  }

  optionContext(option: JNormalizedSelectionOption): {
    readonly $implicit: JSelectionOptionSource;
    readonly option: JSelectionOptionSource;
    readonly label: string;
    readonly value: unknown;
    readonly selected: boolean;
    readonly disabled: boolean;
  } {
    return {
      $implicit: option.source,
      option: option.source,
      label: option.label,
      value: option.value,
      selected: this.isSelected(option),
      disabled: option.disabled,
    };
  }

  isSelected(option: JNormalizedSelectionOption): boolean {
    return this.multiple()
      ? this.selectedValues.some((value) => jSameSelectionValue(value, option.value))
      : jSameSelectionValue(this.value, option.value);
  }

  private moveActive(direction: 1 | -1): void {
    const length = this.visibleOptions.length;
    if (!length) {
      return;
    }
    this.activeIndex = (this.activeIndex + direction + length) % length;
    this.changeDetectorRef.markForCheck();
  }
}
