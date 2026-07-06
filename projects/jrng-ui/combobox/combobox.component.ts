import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  EventEmitter,
  forwardRef,
  inject,
  Input,
  Output,
  TemplateRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { JClickOutsideDirective } from 'jrng-ui/core';
import { jCreateId } from 'jrng-ui/core';
import {
  JNormalizedSelectionOption,
  JSelectionOptionSource,
  jNormalizeSelectionOptions,
  jSameSelectionValue,
} from 'jrng-ui/core';
import { JInputVariant } from 'jrng-ui/input';

@Component({
  selector: 'j-combobox',
  imports: [JClickOutsideDirective, NgTemplateOutlet],
  template: `
    <div
      class="j-combobox-field"
      [class.is-open]="open"
      data-jc-name="combobox"
      data-jc-section="root"
      jClickOutside
      (jClickOutside)="close()"
    >
      @if (label) {
        <label class="j-combobox__label" data-jc-section="label" [for]="id">{{ label }}</label>
      }
      <div class="j-combobox" data-jc-section="control">
        <input
          class="j-combobox__input"
          data-jc-section="input"
          role="combobox"
          [id]="id"
          [value]="query"
          [placeholder]="placeholder"
          [disabled]="disabledState"
          [readOnly]="readonly"
          [attr.aria-expanded]="open"
          [attr.aria-controls]="listboxId"
          (input)="handleInput($event)"
          (keydown)="handleKeydown($event)"
          (focus)="show()"
          (blur)="onTouched()"
        />
        <button
          class="j-combobox__button"
          data-jc-section="dropdown"
          type="button"
          [disabled]="disabledState"
          (click)="toggle()"
        >
          ⌄
        </button>
      </div>
      @if (open) {
        <div class="j-combobox__panel" data-jc-section="panel" [id]="listboxId" role="listbox">
          @if (!filteredOptions.length) {
            <div class="j-combobox__empty" data-jc-section="empty">{{ emptyMessage }}</div>
          }
          @for (option of filteredOptions; track option.value; let i = $index) {
            <button
              class="j-combobox__option"
              data-jc-section="option"
              role="option"
              type="button"
              [disabled]="option.disabled"
              [class.is-active]="i === activeIndex"
              [attr.aria-selected]="isSelected(option)"
              (mousedown)="$event.preventDefault()"
              (click)="selectOption(option)"
            >
              @if (itemTemplate) {
                <ng-container
                  [ngTemplateOutlet]="itemTemplate"
                  [ngTemplateOutletContext]="{
                    $implicit: option.source,
                    option: option.source,
                    label: option.label,
                    value: option.value,
                  }"
                ></ng-container>
              } @else {
                {{ option.label }}
              }
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .j-combobox-field {
        position: relative;
      }
      .j-combobox__label {
        display: inline-flex;
        font-size: var(--j-font-size-sm);
        font-weight: var(--j-font-weight-semibold);
        margin-bottom: var(--j-spacing-sm);
      }
      .j-combobox {
        align-items: center;
        background: var(--j-color-surface);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-md);
        display: flex;
        min-height: 2.5rem;
      }
      .j-combobox-field.is-open .j-combobox,
      .j-combobox:focus-within {
        border-color: var(--j-color-primary);
        box-shadow: var(--j-focus-ring);
      }
      .j-combobox__input {
        background: transparent;
        border: 0;
        color: var(--j-color-text);
        flex: 1;
        font: inherit;
        min-width: 0;
        outline: none;
        padding: 0 var(--j-spacing-md);
      }
      .j-combobox__button {
        background: transparent;
        border: 0;
        color: var(--j-color-muted-foreground);
        cursor: pointer;
        font: inherit;
        padding-inline: var(--j-spacing-md);
      }
      .j-combobox__panel {
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
      .j-combobox__option {
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
      .j-combobox__option:hover,
      .j-combobox__option.is-active {
        background: var(--j-color-surface-muted);
      }
      .j-combobox__empty {
        color: var(--j-color-muted-foreground);
        font-size: var(--j-font-size-xs);
        padding: var(--j-spacing-md);
      }
    `,
  ],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => JComboboxComponent), multi: true },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JComboboxComponent implements ControlValueAccessor {
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  @ContentChild('jComboboxItem', { read: TemplateRef }) itemTemplate?: TemplateRef<unknown>;

  @Input() id = jCreateId('j-combobox');
  @Input() label = '';
  @Input() placeholder = '';
  @Input() options: readonly JSelectionOptionSource[] = [];
  @Input() optionLabel = 'label';
  @Input() optionValue = 'value';
  @Input() optionDisabled = 'disabled';
  @Input() emptyMessage = 'No options found';
  @Input() variant: JInputVariant = 'outlined';
  @Input({ transform: booleanAttribute }) readonly = false;
  @Input({ transform: booleanAttribute }) forceSelection = false;

  @Output() valueChange = new EventEmitter<unknown>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() selectionChange = new EventEmitter<JNormalizedSelectionOption | null>();

  readonly listboxId = jCreateId('j-combobox-listbox');
  value: unknown = null;
  query = '';
  open = false;
  disabledState = false;
  activeIndex = 0;
  onTouched: () => void = () => undefined;
  private onChange: (value: unknown) => void = () => undefined;

  get normalizedOptions(): readonly JNormalizedSelectionOption[] {
    return jNormalizeSelectionOptions(
      this.options,
      this.optionLabel,
      this.optionValue,
      this.optionDisabled,
    );
  }

  get filteredOptions(): readonly JNormalizedSelectionOption[] {
    const query = this.query.trim().toLowerCase();
    return query
      ? this.normalizedOptions.filter((option) => option.label.toLowerCase().includes(query))
      : this.normalizedOptions;
  }

  writeValue(value: unknown): void {
    this.value = value ?? null;
    this.query =
      this.normalizedOptions.find((option) => jSameSelectionValue(option.value, this.value))
        ?.label ?? (typeof value === 'string' ? value : '');
    this.changeDetectorRef.markForCheck();
  }
  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabledState = isDisabled;
    this.changeDetectorRef.markForCheck();
  }

  handleInput(event: Event): void {
    this.query = (event.target as HTMLInputElement).value;
    this.value = this.query;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
    this.searchChange.emit(this.query);
    this.show();
  }

  handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeIndex =
        (this.activeIndex + (event.key === 'ArrowDown' ? 1 : -1) + this.filteredOptions.length) %
        Math.max(1, this.filteredOptions.length);
      this.changeDetectorRef.markForCheck();
    }
    if (event.key === 'Enter' && this.open) {
      event.preventDefault();
      const option = this.filteredOptions[this.activeIndex];
      if (option) this.selectOption(option);
    }
    if (event.key === 'Escape') this.close();
  }

  selectOption(option: JNormalizedSelectionOption): void {
    if (option.disabled) return;
    this.value = option.value;
    this.query = option.label;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
    this.selectionChange.emit(option);
    this.close();
  }
  isSelected(option: JNormalizedSelectionOption): boolean {
    return jSameSelectionValue(option.value, this.value);
  }
  toggle(): void {
    this.open ? this.close() : this.show();
  }
  show(): void {
    if (!this.disabledState && !this.readonly) {
      this.open = true;
      this.changeDetectorRef.markForCheck();
    }
  }
  close(): void {
    if (
      this.forceSelection &&
      !this.normalizedOptions.some((option) => option.label === this.query)
    ) {
      this.value = null;
      this.query = '';
      this.onChange(null);
      this.selectionChange.emit(null);
    }
    this.open = false;
    this.changeDetectorRef.markForCheck();
  }
}
