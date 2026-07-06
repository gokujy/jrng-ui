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
import { jCreateId } from 'jrng-ui/core';
import { JSize } from 'jrng-ui/core';

@Component({
  selector: 'j-switch',
  imports: [],
  template: `
    <label [class]="rootClasses">
      <input
        class="j-switch__input"
        type="checkbox"
        role="switch"
        [id]="id"
        [checked]="checked"
        [disabled]="isDisabled"
        [readOnly]="readonly"
        [attr.aria-checked]="checked"
        [attr.aria-invalid]="invalid ? 'true' : null"
        (change)="handleChange($event)"
        (blur)="handleBlur()"
      />
      <span class="j-switch__track" aria-hidden="true">
        <span class="j-switch__thumb"></span>
      </span>
      @if (label || onLabel || offLabel) {
        <span class="j-switch__label">
          {{ label || (checked ? onLabel : offLabel) }}
        </span>
      }
    </label>
  `,
  styles: [
    `
      :host {
        display: inline-block;
      }

      .j-switch {
        align-items: center;
        color: var(--j-color-text);
        cursor: pointer;
        display: inline-flex;
        gap: var(--j-spacing-sm);
      }

      .j-switch.is-disabled {
        cursor: not-allowed;
        opacity: var(--j-disabled-opacity);
      }

      .j-switch__input {
        height: 1px;
        opacity: 0;
        position: absolute;
        width: 1px;
      }

      .j-switch__track {
        align-items: center;
        background: var(--j-color-border);
        border-radius: var(--j-radius-full);
        display: inline-flex;
        height: 1.25rem;
        padding: 0.125rem;
        transition: var(--j-transition-colors);
        width: 2.25rem;
      }

      .j-switch__thumb {
        background: var(--j-color-surface);
        border-radius: var(--j-radius-full);
        box-shadow: var(--j-shadow-sm);
        height: 1rem;
        transform: translateX(0);
        transition: var(--j-transition-transform);
        width: 1rem;
      }

      .j-switch--sm .j-switch__track {
        height: 1rem;
        width: 1.875rem;
      }

      .j-switch--sm .j-switch__thumb {
        height: 0.75rem;
        width: 0.75rem;
      }

      .j-switch--lg .j-switch__track {
        height: 1.5rem;
        width: 2.75rem;
      }

      .j-switch--lg .j-switch__thumb {
        height: 1.25rem;
        width: 1.25rem;
      }

      .j-switch.is-checked .j-switch__track {
        background: var(--j-color-primary);
      }

      .j-switch.is-checked .j-switch__thumb {
        transform: translateX(1rem);
      }

      .j-switch--sm.is-checked .j-switch__thumb {
        transform: translateX(0.875rem);
      }

      .j-switch--lg.is-checked .j-switch__thumb {
        transform: translateX(1.25rem);
      }

      .j-switch__input:focus-visible + .j-switch__track {
        box-shadow: var(--j-focus-ring);
      }

      .j-switch.is-invalid .j-switch__track {
        outline: 1px solid var(--j-color-danger);
      }

      .j-switch__label {
        font-size: var(--j-font-size-sm);
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => JSwitchComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JSwitchComponent implements ControlValueAccessor {
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  @Input() id = jCreateId('j-switch');
  @Input() label = '';
  @Input() onLabel = '';
  @Input() offLabel = '';
  @Input() trueValue: unknown = true;
  @Input() falseValue: unknown = false;
  @Input() styleClass = '';
  @Input() size: JSize = 'md';
  @Input({ transform: booleanAttribute }) invalid = false;
  @Input({ transform: booleanAttribute }) readonly = false;

  @Output() valueChange = new EventEmitter<unknown>();

  value: unknown = false;
  checked = false;
  isDisabled = false;

  private onChange: (value: unknown) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  @Input({ transform: booleanAttribute })
  set disabled(value: boolean) {
    this.isDisabled = value;
    this.changeDetectorRef.markForCheck();
  }

  get rootClasses(): string {
    return [
      'j-switch',
      `j-switch--${this.size}`,
      this.checked ? 'is-checked' : '',
      this.isDisabled ? 'is-disabled' : '',
      this.invalid ? 'is-invalid' : '',
      this.styleClass,
    ]
      .filter(Boolean)
      .join(' ');
  }

  writeValue(value: unknown): void {
    this.value = value ?? this.falseValue;
    this.checked = Object.is(this.value, this.trueValue);
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

  handleChange(event: Event): void {
    if (this.readonly) {
      (event.target as HTMLInputElement).checked = this.checked;
      return;
    }
    const target = event.target as HTMLInputElement;
    this.checked = target.checked;
    this.value = this.checked ? this.trueValue : this.falseValue;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
  }

  handleBlur(): void {
    this.onTouched();
  }
}
