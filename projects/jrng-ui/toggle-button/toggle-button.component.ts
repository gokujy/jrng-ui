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
import { JSize } from 'jrng-ui/core';

@Component({
  selector: 'j-toggle-button',
  imports: [],
  template: `
    <button
      [class]="buttonClasses"
      data-jc-name="toggle-button"
      data-jc-section="root"
      type="button"
      [disabled]="isDisabled"
      [attr.aria-pressed]="pressed"
      [attr.data-j-active]="pressed ? 'true' : null"
      [attr.data-j-disabled]="isDisabled ? 'true' : null"
      [attr.data-j-invalid]="invalid ? 'true' : null"
      (click)="toggle()"
      (blur)="onTouched()"
    >
      @if (pressed && onIcon) {
        <span data-jc-section="icon" aria-hidden="true">{{ onIcon }}</span>
      }
      @if (!pressed && offIcon) {
        <span data-jc-section="icon" aria-hidden="true">{{ offIcon }}</span>
      }
      <span data-jc-section="label">{{ pressed ? onLabel : offLabel }}</span>
    </button>
  `,
  styles: [
    `
      .j-toggle-button {
        align-items: center;
        background: var(--j-color-surface);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-button-radius);
        color: var(--j-color-text);
        cursor: pointer;
        display: inline-flex;
        font: inherit;
        gap: var(--j-spacing-sm);
        justify-content: center;
        min-height: var(--j-button-height-md);
        padding-inline: var(--j-spacing-md);
      }
      .j-toggle-button.is-active {
        background: var(--j-color-primary);
        border-color: var(--j-color-primary);
        color: var(--j-color-primary-foreground);
      }
      .j-toggle-button:focus-visible {
        box-shadow: var(--j-focus-ring);
        outline: none;
      }
      .j-toggle-button:disabled {
        cursor: not-allowed;
        opacity: var(--j-disabled-opacity);
      }
      .j-toggle-button.is-invalid {
        border-color: var(--j-color-danger);
      }
      .j-toggle-button--sm {
        min-height: var(--j-button-height-sm);
      }
      .j-toggle-button--lg {
        min-height: var(--j-button-height-lg);
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => JToggleButtonComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JToggleButtonComponent implements ControlValueAccessor {
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  @Input() onLabel = 'On';
  @Input() offLabel = 'Off';
  @Input() onIcon = '';
  @Input() offIcon = '';
  @Input() trueValue: unknown = true;
  @Input() falseValue: unknown = false;
  @Input() styleClass = '';
  @Input() size: JSize = 'md';
  @Input({ transform: booleanAttribute }) readonly = false;
  @Input({ transform: booleanAttribute }) invalid = false;

  @Output() valueChange = new EventEmitter<unknown>();

  value: unknown = false;
  isDisabled = false;
  onTouched: () => void = () => undefined;
  private onChange: (value: unknown) => void = () => undefined;

  @Input({ transform: booleanAttribute })
  set disabled(value: boolean) {
    this.isDisabled = value;
    this.changeDetectorRef.markForCheck();
  }

  get pressed(): boolean {
    return Object.is(this.value, this.trueValue);
  }

  get buttonClasses(): string {
    return [
      'j-toggle-button',
      `j-toggle-button--${this.size}`,
      this.pressed ? 'is-active' : '',
      this.invalid ? 'is-invalid' : '',
      this.styleClass,
    ]
      .filter(Boolean)
      .join(' ');
  }

  writeValue(value: unknown): void {
    this.value = value ?? this.falseValue;
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
  toggle(): void {
    if (this.isDisabled || this.readonly) return;
    this.value = this.pressed ? this.falseValue : this.trueValue;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
    this.changeDetectorRef.markForCheck();
  }
}
