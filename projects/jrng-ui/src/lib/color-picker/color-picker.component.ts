import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  booleanAttribute,
  forwardRef,
  inject,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { JClickOutsideDirective } from '../core/click-outside.directive';

@Component({
  selector: 'j-color-picker',
  imports: [JClickOutsideDirective],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => JColorPickerComponent),
      multi: true,
    },
  ],
  template: `
    <div
      [class]="rootClasses"
      data-jc-name="color-picker"
      data-jc-section="root"
      data-jc-extend="panel preset clear"
      [attr.data-j-open]="open ? 'true' : null"
      [attr.data-j-disabled]="disabled ? 'true' : null"
      [attr.data-j-invalid]="invalid ? 'true' : null"
      jClickOutside
      (jClickOutside)="close()"
    >
      @if (label) {
        <label class="j-color-picker__label" data-jc-section="label">{{ label }}</label>
      }
      <button
        class="j-color-picker__trigger"
        data-jc-section="trigger"
        type="button"
        [disabled]="disabled"
        [attr.aria-expanded]="open"
        (click)="toggle()"
        (blur)="onTouched()"
      >
        <span class="j-color-picker__swatch" data-jc-section="swatch" [style.background]="value || fallbackColor"></span>
        <span>{{ value || placeholder }}</span>
      </button>
      @if (open) {
        <div class="j-color-picker__panel" data-jc-section="panel">
          <input
            class="j-color-picker__native"
            data-jc-section="native"
            type="color"
            [value]="value || fallbackColor"
            [disabled]="disabled || readonly"
            (input)="handleInput($event)"
          />
          @if (showInput) {
            <input
              class="j-color-picker__hex"
              data-jc-section="hex"
              type="text"
              [value]="value"
              [placeholder]="placeholder"
              [disabled]="disabled"
              [readOnly]="readonly"
              (input)="handleTextInput($event)"
              (blur)="onTouched()"
            />
          }
          @if (presetColors.length) {
            <div class="j-color-picker__presets" data-jc-section="presets">
              @for (color of presetColors; track color) {
                <button
                  class="j-color-picker__preset"
                  data-jc-section="preset"
                  type="button"
                  [style.background]="color"
                  [attr.aria-label]="'Select ' + color"
                  [attr.data-j-selected]="value === color ? 'true' : null"
                  [disabled]="disabled || readonly"
                  (click)="setValue(color)"
                ></button>
              }
            </div>
          }
          @if (clearable) {
            <button class="j-color-picker__clear" data-jc-section="clear" type="button" [disabled]="disabled || readonly" (click)="clearValue()">Clear</button>
          }
        </div>
      }
      @if (invalid && error) {
        <p class="j-color-picker__message j-color-picker__message--error">{{ error }}</p>
      }
      @if (hint && !(invalid && error)) {
        <p class="j-color-picker__message">{{ hint }}</p>
      }
    </div>
  `,
  styles: [
    `
      .j-color-picker { color: var(--j-color-text); display: inline-grid; gap: var(--j-spacing-xs); position: relative; }
      .j-color-picker__label { font-size: var(--j-font-size-sm); font-weight: var(--j-font-weight-semibold); }
      .j-color-picker__trigger { align-items: center; background: var(--j-color-surface); border: 1px solid var(--j-color-border); border-radius: var(--j-radius-md); color: var(--j-color-text); cursor: pointer; display: inline-flex; font: inherit; gap: var(--j-spacing-sm); min-height: 2.5rem; padding: 0 var(--j-spacing-md); }
      .j-color-picker__trigger:focus-visible { box-shadow: var(--j-focus-ring); outline: none; }
      .j-color-picker__swatch { border: 1px solid var(--j-color-border); border-radius: var(--j-radius-sm); height: 1.25rem; width: 1.25rem; }
      .j-color-picker__panel { background: var(--j-color-surface); border: 1px solid var(--j-color-border); border-radius: var(--j-radius-md); box-shadow: var(--j-shadow-lg); display: grid; gap: var(--j-spacing-sm); margin-top: var(--j-spacing-xs); min-width: 13rem; padding: var(--j-spacing-md); position: absolute; top: 100%; z-index: var(--j-z-index-dropdown); }
      .j-color-picker__native { height: 2.25rem; width: 100%; }
      .j-color-picker__hex { background: var(--j-color-surface); border: 1px solid var(--j-color-border); border-radius: var(--j-radius-sm); color: var(--j-color-text); font: inherit; min-height: 2rem; padding: 0 var(--j-spacing-sm); }
      .j-color-picker__presets { display: grid; gap: var(--j-spacing-xs); grid-template-columns: repeat(6, 1.5rem); }
      .j-color-picker__preset { border: 1px solid var(--j-color-border); border-radius: var(--j-radius-sm); cursor: pointer; height: 1.5rem; width: 1.5rem; }
      .j-color-picker__preset[data-j-selected='true'] { box-shadow: var(--j-focus-ring); }
      .j-color-picker__clear { background: transparent; border: 0; color: var(--j-color-primary); cursor: pointer; font: inherit; justify-self: start; padding: 0; }
      .j-color-picker.is-disabled { opacity: var(--j-disabled-opacity); }
      .j-color-picker.is-invalid .j-color-picker__trigger { border-color: var(--j-color-danger); }
      .j-color-picker__message { color: var(--j-color-muted-foreground); font-size: var(--j-font-size-xs); margin: 0; }
      .j-color-picker__message--error { color: var(--j-color-danger); }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JColorPickerComponent implements ControlValueAccessor {
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  @Input() label = '';
  @Input() hint = '';
  @Input() error = '';
  @Input() placeholder = '#000000';
  @Input() styleClass = '';
  @Input() presetColors: readonly string[] = ['#111827', '#4f46e5', '#2563eb', '#16a34a', '#d97706', '#dc2626'];
  @Input({ transform: booleanAttribute }) showInput = true;
  @Input({ transform: booleanAttribute }) disabled = false;
  @Input({ transform: booleanAttribute }) readonly = false;
  @Input({ transform: booleanAttribute }) invalid = false;
  @Input({ transform: booleanAttribute }) clearable = false;
  @Output() valueChange = new EventEmitter<string | null>();

  value: string | null = '#4f46e5';
  open = false;
  readonly fallbackColor = '#4f46e5';

  private onChange: (value: string | null) => void = () => undefined;
  onTouched: () => void = () => undefined;

  get rootClasses(): string {
    return ['j-color-picker', this.disabled ? 'is-disabled' : '', this.invalid ? 'is-invalid' : '', this.styleClass].filter(Boolean).join(' ');
  }

  writeValue(value: string | null): void {
    this.value = value || null;
    this.changeDetectorRef.markForCheck();
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.changeDetectorRef.markForCheck();
  }

  toggle(): void {
    if (this.disabled || this.readonly) {
      return;
    }
    this.open = !this.open;
    this.changeDetectorRef.markForCheck();
  }

  close(): void {
    this.open = false;
    this.changeDetectorRef.markForCheck();
  }

  handleInput(event: Event): void {
    this.setValue((event.target as HTMLInputElement | null)?.value ?? this.fallbackColor);
  }

  handleTextInput(event: Event): void {
    const rawValue = (event.target as HTMLInputElement | null)?.value ?? '';
    this.setValue(this.normalizeHex(rawValue));
  }

  setValue(value: string): void {
    if (this.disabled || this.readonly) {
      return;
    }
    this.value = value;
    this.onChange(value);
    this.valueChange.emit(value);
    this.changeDetectorRef.markForCheck();
  }

  clearValue(): void {
    if (this.disabled || this.readonly) {
      return;
    }
    this.value = null;
    this.onChange(null);
    this.valueChange.emit(null);
    this.changeDetectorRef.markForCheck();
  }

  private normalizeHex(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) {
      return '';
    }
    return trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
  }
}
