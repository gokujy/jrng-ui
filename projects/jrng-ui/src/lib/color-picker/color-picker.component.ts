import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  forwardRef,
  booleanAttribute,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'j-color-picker',
  imports: [],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => JColorPickerComponent),
      multi: true,
    },
  ],
  template: `
    <label class="j-color-picker" [class.is-disabled]="disabled">
      @if (label) {
        <span class="j-color-picker__label">{{ label }}</span>
      }
      <span class="j-color-picker__control">
        <span class="j-color-picker__swatch" [style.background]="value || fallbackColor"></span>
        <input
          type="color"
          [value]="value || fallbackColor"
          [disabled]="disabled"
          (input)="handleInput($event)"
          (blur)="onTouched()"
        />
        @if (showInput) {
          <input
            type="text"
            [value]="value"
            [disabled]="disabled"
            (input)="handleTextInput($event)"
            (blur)="onTouched()"
          />
        }
      </span>
    </label>
  `,
  styles: [
    `
      .j-color-picker {
        color: var(--j-color-text, #111827);
        display: inline-grid;
        gap: var(--j-spacing-xs, 0.25rem);
      }

      .j-color-picker__label {
        font-size: var(--j-font-size-sm, 0.875rem);
        font-weight: var(--j-font-weight-medium, 550);
      }

      .j-color-picker__control {
        align-items: center;
        display: inline-flex;
        gap: var(--j-spacing-sm, 0.5rem);
      }

      .j-color-picker__swatch {
        border: 1px solid var(--j-color-border, #dbe2ea);
        border-radius: var(--j-radius-sm, 0.375rem);
        height: 2rem;
        width: 2rem;
      }

      .j-color-picker input[type='color'] {
        height: 2rem;
        width: 2.5rem;
      }

      .j-color-picker input[type='text'] {
        background: var(--j-color-surface, #ffffff);
        border: 1px solid var(--j-color-border, #dbe2ea);
        border-radius: var(--j-radius-sm, 0.375rem);
        color: var(--j-color-text, #111827);
        font: inherit;
        min-height: 2rem;
        padding: 0 var(--j-spacing-sm, 0.5rem);
        width: 7rem;
      }

      .j-color-picker input:focus-visible {
        box-shadow: var(--j-focus-ring, 0 0 0 3px rgb(79 70 229 / 24%));
        outline: none;
      }

      .j-color-picker.is-disabled {
        opacity: var(--j-disabled-opacity, 0.55);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JColorPickerComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input({ transform: booleanAttribute }) showInput = true;
  @Input({ transform: booleanAttribute }) disabled = false;
  @Output() valueChange = new EventEmitter<string>();

  value = '#4f46e5';
  readonly fallbackColor = '#4f46e5';

  private onChange: (value: string) => void = () => undefined;
  onTouched: () => void = () => undefined;

  writeValue(value: string | null): void {
    this.value = value || this.fallbackColor;
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  handleInput(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    this.setValue(input?.value ?? this.fallbackColor);
  }

  handleTextInput(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    this.setValue(input?.value ?? '');
  }

  private setValue(value: string): void {
    this.value = value;
    this.onChange(value);
    this.valueChange.emit(value);
  }
}
