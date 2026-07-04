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
import {
  JNormalizedSelectionOption,
  JSelectionOptionSource,
  jNormalizeSelectionOptions,
  jSameSelectionValue,
} from '../core/selection-options';
import { JSize } from '../core/types';

@Component({
  selector: 'j-select-button',
  imports: [NgTemplateOutlet],
  template: `
    <div
      [class]="rootClasses"
      data-jc-name="select-button"
      data-jc-section="root"
      role="group"
      [attr.aria-label]="ariaLabel || label || 'Select option'"
      [attr.data-j-disabled]="isDisabled ? 'true' : null"
      [attr.data-j-invalid]="invalid ? 'true' : null"
    >
      @if (label) {
        <span class="j-select-button__label" data-jc-section="label">{{ label }}</span>
      }
      @for (option of normalizedOptions; track option.value) {
        <button
          class="j-select-button__option"
          data-jc-section="option"
          type="button"
          [disabled]="isDisabled || option.disabled"
          [class.is-selected]="isSelected(option)"
          [attr.aria-pressed]="isSelected(option)"
          [attr.data-j-selected]="isSelected(option) ? 'true' : null"
          [attr.data-j-disabled]="option.disabled ? 'true' : null"
          (click)="toggleOption(option)"
        >
          @if (optionTemplate) {
            <ng-container [ngTemplateOutlet]="optionTemplate" [ngTemplateOutletContext]="{ $implicit: option.source, option: option.source, label: option.label, value: option.value, selected: isSelected(option) }"></ng-container>
          } @else {
            {{ option.label }}
          }
        </button>
      }
    </div>
  `,
  styles: [`
    .j-select-button { display: inline-flex; flex-wrap: wrap; gap: 0; }
    .j-select-button__label { align-self: center; font-size: var(--j-font-size-sm); font-weight: var(--j-font-weight-semibold); margin-right: var(--j-spacing-sm); }
    .j-select-button__option { background: var(--j-color-surface); border: 1px solid var(--j-color-border); color: var(--j-color-text); cursor: pointer; font: inherit; min-height: var(--j-button-height-md); padding-inline: var(--j-spacing-md); }
    .j-select-button__option:first-of-type { border-radius: var(--j-button-radius) 0 0 var(--j-button-radius); }
    .j-select-button__option:last-of-type { border-radius: 0 var(--j-button-radius) var(--j-button-radius) 0; }
    .j-select-button__option + .j-select-button__option { margin-left: -1px; }
    .j-select-button__option.is-selected { background: var(--j-color-primary); border-color: var(--j-color-primary); color: var(--j-color-primary-foreground); z-index: 1; }
    .j-select-button__option:focus-visible { box-shadow: var(--j-focus-ring); outline: none; z-index: 2; }
    .j-select-button.is-disabled { opacity: var(--j-disabled-opacity); }
    .j-select-button.is-invalid .j-select-button__option { border-color: var(--j-color-danger); }
    .j-select-button--sm .j-select-button__option { min-height: var(--j-button-height-sm); }
    .j-select-button--lg .j-select-button__option { min-height: var(--j-button-height-lg); }
  `],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => JSelectButtonComponent), multi: true }],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JSelectButtonComponent implements ControlValueAccessor {
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  @ContentChild('jSelectButtonOption', { read: TemplateRef }) optionTemplate?: TemplateRef<unknown>;

  @Input() label = '';
  @Input() ariaLabel = '';
  @Input() options: readonly JSelectionOptionSource[] = [];
  @Input() optionLabel = 'label';
  @Input() optionValue = 'value';
  @Input() optionDisabled = 'disabled';
  @Input() styleClass = '';
  @Input() size: JSize = 'md';
  @Input({ transform: booleanAttribute }) multiple = false;
  @Input({ transform: booleanAttribute }) readonly = false;
  @Input({ transform: booleanAttribute }) invalid = false;

  @Output() valueChange = new EventEmitter<unknown>();

  value: unknown = null;
  isDisabled = false;
  private onChange: (value: unknown) => void = () => undefined;
  onTouched: () => void = () => undefined;

  @Input({ transform: booleanAttribute })
  set disabled(value: boolean) { this.isDisabled = value; this.changeDetectorRef.markForCheck(); }

  get normalizedOptions(): readonly JNormalizedSelectionOption[] {
    return jNormalizeSelectionOptions(this.options, this.optionLabel, this.optionValue, this.optionDisabled);
  }
  get rootClasses(): string {
    return ['j-select-button', `j-select-button--${this.size}`, this.isDisabled ? 'is-disabled' : '', this.invalid ? 'is-invalid' : '', this.styleClass].filter(Boolean).join(' ');
  }
  writeValue(value: unknown): void { this.value = value ?? (this.multiple ? [] : null); this.changeDetectorRef.markForCheck(); }
  registerOnChange(fn: (value: unknown) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.isDisabled = isDisabled; this.changeDetectorRef.markForCheck(); }
  toggleOption(option: JNormalizedSelectionOption): void {
    if (this.isDisabled || this.readonly || option.disabled) return;
    if (this.multiple) {
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
    return this.multiple && Array.isArray(this.value)
      ? this.value.some((item) => jSameSelectionValue(item, option.value))
      : jSameSelectionValue(this.value, option.value);
  }
}
