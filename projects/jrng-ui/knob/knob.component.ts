import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  forwardRef,
  inject,
  input,
  numberAttribute,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'j-knob',
  imports: [],
  template: `
    <div
      [class]="knobClasses"
      data-jc-name="knob"
      data-jc-section="root"
      role="slider"
      tabindex="0"
      [attr.aria-label]="ariaLabel() || label() || 'Value'"
      [attr.aria-valuemin]="min()"
      [attr.aria-valuemax]="max()"
      [attr.aria-valuenow]="value"
      [attr.data-j-disabled]="isDisabled() ? 'true' : null"
      [attr.data-j-invalid]="invalid() ? 'true' : null"
      (keydown)="handleKeydown($event)"
      (blur)="onTouched()"
    >
      <svg class="j-knob__svg" viewBox="0 0 100 100" aria-hidden="true">
        <circle class="j-knob__track" cx="50" cy="50" r="42"></circle>
        <circle
          class="j-knob__value"
          cx="50"
          cy="50"
          r="42"
          [attr.stroke-dasharray]="dashArray"
          [attr.stroke-dashoffset]="dashOffset"
        ></circle>
      </svg>
      <span class="j-knob__label" data-jc-section="label">{{ label() || value }}</span>
    </div>
  `,
  styles: [
    `
      .j-knob {
        align-items: center;
        color: var(--j-color-text);
        display: inline-grid;
        height: 7rem;
        justify-items: center;
        position: relative;
        width: 7rem;
      }
      .j-knob__svg {
        inset: 0;
        position: absolute;
        transform: rotate(-90deg);
      }
      .j-knob__track,
      .j-knob__value {
        fill: none;
        stroke-width: 10;
      }
      .j-knob__track {
        stroke: var(--j-color-muted);
      }
      .j-knob__value {
        stroke: var(--j-color-primary);
        transition: stroke-dashoffset var(--j-duration-fast) var(--j-ease-standard);
      }
      .j-knob__label {
        font-weight: var(--j-font-weight-semibold);
        position: relative;
      }
      .j-knob:focus-visible {
        border-radius: var(--j-radius-full);
        box-shadow: var(--j-focus-ring);
        outline: none;
      }
      .j-knob.is-disabled {
        opacity: var(--j-disabled-opacity);
      }
      .j-knob.is-invalid .j-knob__value {
        stroke: var(--j-color-danger);
      }
    `,
  ],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => JKnobComponent), multi: true },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JKnobComponent implements ControlValueAccessor {
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  readonly label = input('');
  readonly ariaLabel = input('');
  readonly styleClass = input('');
  readonly min = input(0, { transform: numberAttribute });
  readonly max = input(100, { transform: numberAttribute });
  readonly step = input(1, { transform: numberAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly valueChange = output<number>();

  value = 0;
  /** Writable disabled state so `setDisabledState()` (forms) works; seeded from the input. */
  readonly isDisabled = signal(false);
  onTouched: () => void = () => undefined;
  private onChange: (value: number) => void = () => undefined;

  constructor() {
    effect(() => this.isDisabled.set(this.disabled()));
  }

  get knobClasses(): string {
    return [
      'j-knob',
      this.isDisabled() ? 'is-disabled' : '',
      this.invalid() ? 'is-invalid' : '',
      this.styleClass(),
    ]
      .filter(Boolean)
      .join(' ');
  }
  get circumference(): number {
    return 2 * Math.PI * 42;
  }
  get percent(): number {
    return (this.value - this.min()) / Math.max(1, this.max() - this.min());
  }
  get dashArray(): string {
    return `${this.circumference} ${this.circumference}`;
  }
  get dashOffset(): number {
    return this.circumference * (1 - Math.min(1, Math.max(0, this.percent)));
  }
  writeValue(value: number | null | undefined): void {
    this.value = this.clamp(Number(value ?? this.min()));
    this.changeDetectorRef.markForCheck();
  }
  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
    this.changeDetectorRef.markForCheck();
  }
  handleKeydown(event: KeyboardEvent): void {
    if (this.isDisabled() || this.readonly()) return;
    const direction =
      event.key === 'ArrowUp' || event.key === 'ArrowRight'
        ? 1
        : event.key === 'ArrowDown' || event.key === 'ArrowLeft'
          ? -1
          : 0;
    if (!direction) return;
    event.preventDefault();
    this.setValue(this.value + direction * this.step());
  }
  private setValue(value: number): void {
    this.value = this.clamp(value);
    this.onChange(this.value);
    this.valueChange.emit(this.value);
    this.changeDetectorRef.markForCheck();
  }
  private clamp(value: number): number {
    return Math.min(this.max(), Math.max(this.min(), Number.isNaN(value) ? this.min() : value));
  }
}
