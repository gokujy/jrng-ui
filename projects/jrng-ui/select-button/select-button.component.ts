import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
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
import {
  JNormalizedSelectionOption,
  JSelectionOptionSource,
  jNormalizeSelectionOptions,
  jSameSelectionValue,
} from 'jrng-ui/core';
import { JSize } from 'jrng-ui/core';

@Component({
  selector: 'j-select-button',
  imports: [NgTemplateOutlet],
  template: `
    <div
      [class]="rootClasses()"
      data-jc-name="select-button"
      data-jc-section="root"
      role="group"
      [attr.aria-label]="ariaLabel() || label() || 'Select option'"
      [attr.data-j-disabled]="isDisabled() ? 'true' : null"
      [attr.data-j-invalid]="invalid() ? 'true' : null"
    >
      @if (label()) {
        <span class="j-select-button__label" data-jc-section="label">{{ label() }}</span>
      }
      @for (option of normalizedOptions(); track option.value) {
        <button
          class="j-select-button__option"
          data-jc-section="option"
          type="button"
          [disabled]="isDisabled() || option.disabled"
          [class.is-selected]="isSelected(option)"
          [attr.aria-pressed]="isSelected(option)"
          [attr.data-j-selected]="isSelected(option) ? 'true' : null"
          [attr.data-j-disabled]="option.disabled ? 'true' : null"
          (click)="toggleOption(option)"
        >
          @if (optionTemplate) {
            <ng-container
              [ngTemplateOutlet]="optionTemplate"
              [ngTemplateOutletContext]="{
                $implicit: option.source,
                option: option.source,
                label: option.label,
                value: option.value,
                selected: isSelected(option),
              }"
            ></ng-container>
          } @else {
            {{ option.label }}
          }
        </button>
      }
    </div>
  `,
  styles: [
    `
      .j-select-button {
        display: inline-flex;
        flex-wrap: wrap;
        gap: 0;
      }
      .j-select-button__label {
        align-self: center;
        font-size: var(--j-font-size-sm);
        font-weight: var(--j-font-weight-semibold);
        margin-right: var(--j-spacing-sm);
      }
      .j-select-button__option {
        background: var(--j-color-surface);
        border: 1px solid var(--j-color-border);
        color: var(--j-color-text);
        cursor: pointer;
        font: inherit;
        min-height: var(--j-button-height-md);
        padding-inline: var(--j-spacing-md);
      }
      .j-select-button__option:first-of-type {
        border-radius: var(--j-button-radius) 0 0 var(--j-button-radius);
      }
      .j-select-button__option:last-of-type {
        border-radius: 0 var(--j-button-radius) var(--j-button-radius) 0;
      }
      .j-select-button__option + .j-select-button__option {
        margin-left: -1px;
      }
      .j-select-button__option.is-selected {
        background: var(--j-color-primary);
        border-color: var(--j-color-primary);
        color: var(--j-color-primary-foreground);
        z-index: 1;
      }
      .j-select-button__option:focus-visible {
        box-shadow: var(--j-focus-ring);
        outline: none;
        z-index: 2;
      }
      .j-select-button.is-disabled {
        opacity: var(--j-disabled-opacity);
      }
      .j-select-button.is-invalid .j-select-button__option {
        border-color: var(--j-color-danger);
      }
      .j-select-button--sm .j-select-button__option {
        min-height: var(--j-button-height-sm);
      }
      .j-select-button--lg .j-select-button__option {
        min-height: var(--j-button-height-lg);
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => JSelectButtonComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JSelectButtonComponent implements ControlValueAccessor {
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  @ContentChild('jSelectButtonOption', { read: TemplateRef }) optionTemplate?: TemplateRef<unknown>;

  readonly label = input('');
  readonly ariaLabel = input('');
  readonly options = input<readonly JSelectionOptionSource[]>([]);
  readonly optionLabel = input('label');
  readonly optionValue = input('value');
  readonly optionDisabled = input('disabled');
  readonly styleClass = input('');
  readonly size = input<JSize>('md');
  readonly multiple = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });

  readonly valueChange = output<unknown>();

  value: unknown = null;
  readonly isDisabled = signal(false);
  private onChange: (value: unknown) => void = () => undefined;
  onTouched: () => void = () => undefined;

  constructor() {
    effect(() => this.isDisabled.set(this.disabled()));
  }

  readonly normalizedOptions = computed<readonly JNormalizedSelectionOption[]>(() =>
    jNormalizeSelectionOptions(
      this.options(),
      this.optionLabel(),
      this.optionValue(),
      this.optionDisabled(),
    ),
  );
  readonly rootClasses = computed(() =>
    [
      'j-select-button',
      `j-select-button--${this.size()}`,
      this.isDisabled() ? 'is-disabled' : '',
      this.invalid() ? 'is-invalid' : '',
      this.styleClass(),
    ]
      .filter(Boolean)
      .join(' '),
  );
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
  toggleOption(option: JNormalizedSelectionOption): void {
    if (this.isDisabled() || this.readonly() || option.disabled) return;
    if (this.multiple()) {
      const current = Array.isArray(this.value) ? this.value : [];
      this.value = current.some((item) => jSameSelectionValue(item, option.value))
        ? current.filter((item) => !jSameSelectionValue(item, option.value))
        : [...current, option.value];
    } else {
      this.value = option.value;
    }
    this.onChange(this.value);
    this.valueChange.emit(this.value);
  }
  isSelected(option: JNormalizedSelectionOption): boolean {
    return this.multiple() && Array.isArray(this.value)
      ? this.value.some((item) => jSameSelectionValue(item, option.value))
      : jSameSelectionValue(this.value, option.value);
  }
}
