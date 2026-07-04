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
import { jCreateId } from '../core/id';
import {
  JNormalizedSelectionOption,
  JSelectionOptionSource,
  jNormalizeSelectionOptions,
  jSameSelectionValue,
} from '../core/selection-options';
import { JSize } from '../core/types';

export type JRadioGroupDirection = 'horizontal' | 'vertical';
export type JRadioGroupOption = JSelectionOptionSource;

@Component({
  selector: 'j-radio-group',
  imports: [],
  template: `
    <fieldset
      [class]="rootClasses"
      [attr.aria-describedby]="describedBy"
      [attr.aria-invalid]="hasError ? 'true' : null"
    >
      @if (label) {
        <legend class="j-radio-group__legend">
          <span>{{ label }}</span>
          @if (required) {
            <span class="j-radio-group__required" aria-hidden="true">*</span>
          }
        </legend>
      }
      <div
        class="j-radio-group__options"
        role="radiogroup"
        [attr.aria-required]="required ? 'true' : null"
      >
        @for (option of normalizedOptions; track option.value; let i = $index) {
          <label class="j-radio-group__option">
            <input
              class="j-radio-group__input"
              type="radio"
              [name]="name"
              [checked]="isSelected(option)"
              [disabled]="isDisabled || option.disabled"
              [attr.tabindex]="i === activeIndex ? 0 : -1"
              (change)="selectOption(option, i)"
              (keydown)="handleKeydown($event, i)"
              (blur)="onTouched()"
            />
            <span class="j-radio-group__mark" aria-hidden="true"></span>
            <span>{{ option.label }}</span>
          </label>
        }
      </div>
      @if (hasError && error) {
        <p class="j-radio-group__message j-radio-group__message--error" [id]="errorId">
          {{ error }}
        </p>
      }
      @if (hint && !hasError) {
        <p class="j-radio-group__message" [id]="hintId">{{ hint }}</p>
      }
    </fieldset>
  `,
  styles: [
    `
      .j-radio-group {
        border: 0;
        color: var(--j-color-text);
        margin: 0;
        padding: 0;
      }

      .j-radio-group__legend {
        display: inline-flex;
        font-size: var(--j-font-size-sm);
        font-weight: var(--j-font-weight-semibold);
        gap: var(--j-spacing-xs);
        margin-bottom: var(--j-spacing-sm);
        padding: 0;
      }

      .j-radio-group__options {
        display: flex;
        gap: var(--j-spacing-md);
      }

      .j-radio-group--vertical .j-radio-group__options {
        align-items: flex-start;
        flex-direction: column;
      }

      .j-radio-group__option {
        align-items: center;
        cursor: pointer;
        display: inline-flex;
        gap: var(--j-spacing-sm);
      }

      .j-radio-group.is-disabled .j-radio-group__option {
        cursor: not-allowed;
        opacity: var(--j-disabled-opacity);
      }

      .j-radio-group__input {
        height: 1px;
        opacity: 0;
        position: absolute;
        width: 1px;
      }

      .j-radio-group__mark {
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-full);
        height: 1rem;
        width: 1rem;
      }

      .j-radio-group__input:checked + .j-radio-group__mark {
        border: 0.3rem solid var(--j-color-primary);
      }

      .j-radio-group__input:focus-visible + .j-radio-group__mark {
        box-shadow: var(--j-focus-ring);
      }

      .j-radio-group.is-invalid .j-radio-group__mark {
        border-color: var(--j-color-danger);
      }

      .j-radio-group__required,
      .j-radio-group__message--error {
        color: var(--j-color-danger);
      }

      .j-radio-group__message {
        color: var(--j-color-text-muted);
        font-size: var(--j-font-size-xs);
        margin: var(--j-spacing-sm) 0 0;
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => JRadioGroupComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JRadioGroupComponent implements ControlValueAccessor {
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  @Input() name = jCreateId('j-radio-group');
  @Input() label = '';
  @Input() options: readonly JRadioGroupOption[] = [];
  @Input() optionLabel = 'label';
  @Input() optionValue = 'value';
  @Input() hint = '';
  @Input() error = '';
  @Input() styleClass = '';
  @Input() size: JSize = 'md';
  @Input() direction: JRadioGroupDirection = 'vertical';
  @Input({ transform: booleanAttribute }) required = false;
  @Input({ transform: booleanAttribute }) invalid = false;
  @Input({ transform: booleanAttribute }) readonly = false;

  @Output() valueChange = new EventEmitter<unknown>();
  @Output() selectionChange = new EventEmitter<JNormalizedSelectionOption | null>();

  readonly hintId = jCreateId('j-radio-group-hint');
  readonly errorId = jCreateId('j-radio-group-error');
  value: unknown = null;
  isDisabled = false;
  activeIndex = 0;

  onTouched: () => void = () => undefined;
  private onChange: (value: unknown) => void = () => undefined;

  @Input({ transform: booleanAttribute })
  set disabled(value: boolean) {
    this.isDisabled = value;
    this.changeDetectorRef.markForCheck();
  }

  get normalizedOptions(): readonly JNormalizedSelectionOption[] {
    return jNormalizeSelectionOptions(this.options, this.optionLabel, this.optionValue);
  }

  get hasError(): boolean {
    return this.invalid || this.error.trim().length > 0;
  }

  get describedBy(): string | null {
    return jAriaDescribedBy(this.hasError ? this.errorId : null, this.hint ? this.hintId : null);
  }

  get rootClasses(): string {
    return [
      'j-radio-group',
      `j-radio-group--${this.size}`,
      `j-radio-group--${this.direction}`,
      this.hasError ? 'is-invalid' : '',
      this.isDisabled ? 'is-disabled' : '',
      this.styleClass,
    ]
      .filter(Boolean)
      .join(' ');
  }

  writeValue(value: unknown): void {
    this.value = value ?? null;
    const selectedIndex = this.normalizedOptions.findIndex((option) => this.isSelected(option));
    this.activeIndex = selectedIndex >= 0 ? selectedIndex : 0;
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
    this.changeDetectorRef.markForCheck();
  }

  selectOption(option: JNormalizedSelectionOption, index: number): void {
    if (this.isDisabled || this.readonly || option.disabled) {
      return;
    }
    this.value = option.value;
    this.activeIndex = index;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
    this.selectionChange.emit(option);
  }

  handleKeydown(event: KeyboardEvent, index: number): void {
    if (!['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'].includes(event.key)) {
      return;
    }
    event.preventDefault();
    const direction = event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1 : -1;
    const next = this.findNextEnabled(index, direction);
    const option = this.normalizedOptions[next];
    if (option) {
      this.selectOption(option, next);
    }
  }

  isSelected(option: JNormalizedSelectionOption): boolean {
    return jSameSelectionValue(this.value, option.value);
  }

  private findNextEnabled(startIndex: number, direction: 1 | -1): number {
    const options = this.normalizedOptions;
    let next = startIndex;
    for (let attempt = 0; attempt < options.length; attempt += 1) {
      next = (next + direction + options.length) % options.length;
      if (!options[next]?.disabled) {
        return next;
      }
    }
    return startIndex;
  }
}
