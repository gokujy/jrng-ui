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

export type JAutocompleteSuggestion = JSelectionOptionSource;

@Component({
  selector: 'j-autocomplete',
  imports: [JClickOutsideDirective],
  template: `
    <div [class]="rootClasses" jClickOutside (jClickOutside)="close()">
      @if (label) {
        <label class="j-autocomplete__label" [for]="id">
          <span>{{ label }}</span>
          @if (required) {
            <span class="j-autocomplete__required" aria-hidden="true">*</span>
          }
        </label>
      }

      <div class="j-autocomplete">
        <input
          class="j-autocomplete__field"
          [id]="id"
          type="text"
          [placeholder]="placeholder"
          [disabled]="isDisabled"
          [readOnly]="readonly"
          [required]="required"
          [value]="query"
          [attr.aria-expanded]="isOpen"
          [attr.aria-controls]="listboxId"
          [attr.aria-invalid]="hasError ? 'true' : null"
          [attr.aria-describedby]="describedBy"
          role="combobox"
          (input)="handleInput($event)"
          (focus)="open()"
          (blur)="handleBlur()"
          (keydown)="handleKeydown($event)"
        />
        @if (dropdown) {
          <button
            class="j-autocomplete__dropdown"
            type="button"
            [disabled]="isDisabled"
            (click)="toggle()"
          >
            <span aria-hidden="true"></span>
          </button>
        }
      </div>

      @if (isOpen) {
        <div class="j-autocomplete__panel" [id]="listboxId" role="listbox">
          @if (!normalizedSuggestions.length) {
            <div class="j-autocomplete__empty">{{ emptyMessage }}</div>
          }
          @for (suggestion of normalizedSuggestions; track suggestion.value; let i = $index) {
            <button
              class="j-autocomplete__option"
              type="button"
              role="option"
              [disabled]="suggestion.disabled"
              [class.is-active]="i === activeIndex"
              [attr.aria-selected]="isSelected(suggestion)"
              (mousedown)="$event.preventDefault()"
              (click)="selectSuggestion(suggestion)"
            >
              {{ suggestion.label }}
            </button>
          }
        </div>
      }

      @if (hasError && error) {
        <p class="j-autocomplete__message j-autocomplete__message--error" [id]="errorId">
          {{ error }}
        </p>
      }
      @if (hint && !hasError) {
        <p class="j-autocomplete__message" [id]="hintId">{{ hint }}</p>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .j-autocomplete-field {
        display: block;
        position: relative;
      }

      .j-autocomplete__label {
        display: inline-flex;
        font-size: var(--j-font-size-sm);
        font-weight: var(--j-font-weight-semibold);
        gap: var(--j-spacing-xs);
        margin-bottom: var(--j-spacing-sm);
      }

      .j-autocomplete__required,
      .j-autocomplete__message--error {
        color: var(--j-color-danger);
      }

      .j-autocomplete {
        align-items: center;
        background: var(--j-color-surface);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-md);
        display: flex;
        min-height: 2.5rem;
      }

      .j-autocomplete-field--filled .j-autocomplete {
        background: var(--j-color-surface-muted);
      }

      .j-autocomplete:focus-within {
        border-color: var(--j-color-primary);
        box-shadow: var(--j-focus-ring);
      }

      .j-autocomplete-field.is-invalid .j-autocomplete {
        border-color: var(--j-color-danger);
      }

      .j-autocomplete-field.is-disabled {
        opacity: var(--j-disabled-opacity);
      }

      .j-autocomplete__field {
        background: transparent;
        border: 0;
        color: var(--j-color-text);
        flex: 1;
        font: inherit;
        min-width: 0;
        outline: none;
        padding: 0 var(--j-spacing-md);
      }

      .j-autocomplete__dropdown {
        align-items: center;
        background: transparent;
        border: 0;
        color: var(--j-color-text-muted);
        cursor: pointer;
        display: inline-flex;
        height: 2rem;
        justify-content: center;
        width: 2rem;
      }

      .j-autocomplete__dropdown span {
        border-bottom: 2px solid currentColor;
        border-right: 2px solid currentColor;
        height: 0.45rem;
        transform: rotate(45deg) translateY(-2px);
        width: 0.45rem;
      }

      .j-autocomplete__panel {
        background: var(--j-color-surface);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-md);
        box-shadow: var(--j-shadow-lg);
        left: 0;
        margin-top: var(--j-spacing-xs);
        max-height: 16rem;
        min-width: 100%;
        overflow: auto;
        padding: var(--j-spacing-xs);
        position: absolute;
        top: 100%;
        z-index: var(--j-z-index-dropdown);
      }

      .j-autocomplete__option {
        background: transparent;
        border: 0;
        border-radius: var(--j-radius-sm);
        color: var(--j-color-text);
        cursor: pointer;
        display: block;
        font: inherit;
        padding: var(--j-spacing-sm) var(--j-spacing-md);
        text-align: left;
        width: 100%;
      }

      .j-autocomplete__option:hover,
      .j-autocomplete__option.is-active {
        background: var(--j-color-surface-muted);
      }

      .j-autocomplete__empty,
      .j-autocomplete__message {
        color: var(--j-color-text-muted);
        font-size: var(--j-font-size-xs);
      }

      .j-autocomplete__empty {
        padding: var(--j-spacing-md);
      }

      .j-autocomplete__message {
        margin: var(--j-spacing-sm) 0 0;
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => JAutocompleteComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JAutocompleteComponent implements ControlValueAccessor {
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  @Input() id = jCreateId('j-autocomplete');
  @Input() label = '';
  @Input() suggestions: readonly JAutocompleteSuggestion[] = [];
  @Input() optionLabel = 'label';
  @Input() optionValue = 'value';
  @Input() placeholder = '';
  @Input() error = '';
  @Input() hint = '';
  @Input() emptyMessage = 'No suggestions found';
  @Input() styleClass = '';
  @Input() size: JSize = 'md';
  @Input() variant: JInputVariant = 'outlined';
  @Input({ transform: booleanAttribute }) readonly = false;
  @Input({ transform: booleanAttribute }) invalid = false;
  @Input({ transform: booleanAttribute }) required = false;
  @Input({ transform: booleanAttribute }) dropdown = false;
  @Input({ transform: booleanAttribute }) forceSelection = false;

  @Output() valueChange = new EventEmitter<unknown>();
  @Output() selectionChange = new EventEmitter<JNormalizedSelectionOption | null>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() completeMethod = new EventEmitter<string>();
  @Output() opened = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  readonly hintId = jCreateId('j-autocomplete-hint');
  readonly errorId = jCreateId('j-autocomplete-error');
  readonly listboxId = jCreateId('j-autocomplete-listbox');
  value: unknown = null;
  query = '';
  isDisabled = false;
  isOpen = false;
  activeIndex = -1;

  private onChange: (value: unknown) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  @Input({ transform: booleanAttribute })
  set disabled(value: boolean) {
    this.isDisabled = value;
    this.changeDetectorRef.markForCheck();
  }

  get normalizedSuggestions(): readonly JNormalizedSelectionOption[] {
    return jNormalizeSelectionOptions(this.suggestions, this.optionLabel, this.optionValue);
  }

  get hasError(): boolean {
    return this.invalid || this.error.trim().length > 0;
  }

  get describedBy(): string | null {
    return jAriaDescribedBy(this.hasError ? this.errorId : null, this.hint ? this.hintId : null);
  }

  get rootClasses(): string {
    return [
      'j-autocomplete-field',
      `j-autocomplete-field--${this.size}`,
      `j-autocomplete-field--${this.variant}`,
      this.hasError ? 'is-invalid' : '',
      this.isDisabled ? 'is-disabled' : '',
      this.styleClass,
    ]
      .filter(Boolean)
      .join(' ');
  }

  writeValue(value: unknown): void {
    this.value = value ?? null;
    const selected = this.normalizedSuggestions.find((suggestion) =>
      jSameSelectionValue(suggestion.value, this.value),
    );
    this.query = selected?.label ?? (typeof this.value === 'string' ? this.value : '');
    this.changeDetectorRef.markForCheck();
  }

  registerOnChange(fn: (value: unknown) => void): void {
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

  handleInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.query = target.value;
    this.value = this.query;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
    this.searchChange.emit(this.query);
    this.completeMethod.emit(this.query);
    this.open();
  }

  selectSuggestion(suggestion: JNormalizedSelectionOption): void {
    if (suggestion.disabled) {
      return;
    }
    this.value = suggestion.value;
    this.query = suggestion.label;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
    this.selectionChange.emit(suggestion);
    this.close();
  }

  toggle(): void {
    this.isOpen ? this.close() : this.open();
  }

  open(): void {
    if (this.isDisabled || this.readonly || this.isOpen) {
      return;
    }
    this.isOpen = true;
    this.activeIndex = this.normalizedSuggestions.findIndex((suggestion) => !suggestion.disabled);
    this.opened.emit();
    this.changeDetectorRef.markForCheck();
  }

  close(): void {
    if (!this.isOpen) {
      return;
    }
    this.isOpen = false;
    this.closed.emit();
    this.changeDetectorRef.markForCheck();
  }

  handleBlur(): void {
    this.onTouched();
    if (this.forceSelection) {
      const selected = this.normalizedSuggestions.find(
        (suggestion) => suggestion.label === this.query,
      );
      if (!selected) {
        this.value = null;
        this.query = '';
        this.onChange(null);
        this.valueChange.emit(null);
        this.selectionChange.emit(null);
      }
    }
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
      const suggestion = this.normalizedSuggestions[this.activeIndex];
      if (suggestion) {
        this.selectSuggestion(suggestion);
      }
    }
  }

  isSelected(suggestion: JNormalizedSelectionOption): boolean {
    return jSameSelectionValue(this.value, suggestion.value);
  }

  private moveActive(direction: 1 | -1): void {
    const options = this.normalizedSuggestions;
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
