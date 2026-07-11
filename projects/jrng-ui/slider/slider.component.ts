import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  forwardRef,
  inject,
  Input,
  numberAttribute,
  Output,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { jAriaDescribedBy } from 'jrng-ui/core';
import { jCreateId } from 'jrng-ui/core';
import { JSize } from 'jrng-ui/core';

export type JSliderValue = number | readonly [number, number];

@Component({
  selector: 'j-slider',
  imports: [],
  template: `
    <div
      [class]="rootClasses"
      data-jc-name="slider"
      data-jc-section="root"
      [attr.data-j-disabled]="isDisabled ? 'true' : null"
      [attr.data-j-invalid]="hasError ? 'true' : null"
    >
      @if (label) {
        <span class="j-slider__label" data-jc-section="label" [id]="labelId">
          <span>{{ label }}</span>
          @if (required) {
            <span class="j-slider__required" aria-hidden="true">*</span>
          }
        </span>
      }

      <div class="j-slider__control" data-jc-section="control">
        <input
          class="j-slider__range"
          data-jc-section="thumb"
          type="range"
          [attr.orient]="vertical ? 'vertical' : null"
          [id]="id"
          [min]="min"
          [max]="max"
          [step]="step"
          [disabled]="isDisabled"
          [value]="lowerValue"
          [attr.aria-labelledby]="label ? labelId : null"
          [attr.aria-describedby]="describedBy"
          [attr.aria-invalid]="hasError ? 'true' : null"
          (input)="handleLowerInput($event)"
          (blur)="onTouched()"
        />
        @if (range) {
          <input
            class="j-slider__range"
            data-jc-section="thumb"
            type="range"
            [attr.orient]="vertical ? 'vertical' : null"
            [min]="min"
            [max]="max"
            [step]="step"
            [disabled]="isDisabled"
            [value]="upperValue"
            [attr.aria-label]="label ? label + ' upper value' : 'Upper value'"
            [attr.aria-describedby]="describedBy"
            (input)="handleUpperInput($event)"
            (blur)="onTouched()"
          />
        }
      </div>

      @if (tooltip || showValue) {
        <div class="j-slider__values" data-jc-section="value" aria-hidden="true">
          <span>{{ lowerValue }}</span>
          @if (range) {
            <span>{{ upperValue }}</span>
          }
        </div>
      }

      @if (hasError && error) {
        <p class="j-slider__message j-slider__message--error" [id]="errorId">{{ error }}</p>
      }
      @if (hint && !hasError) {
        <p class="j-slider__message" [id]="hintId">{{ hint }}</p>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .j-slider {
        color: var(--j-color-text);
        display: block;
      }

      .j-slider__label {
        display: inline-flex;
        font-size: var(--j-font-size-sm);
        font-weight: var(--j-font-weight-semibold);
        gap: var(--j-spacing-xs);
        margin-bottom: var(--j-spacing-sm);
      }

      .j-slider__control {
        display: grid;
        gap: var(--j-spacing-sm);
      }

      .j-slider--vertical .j-slider__control {
        min-height: 10rem;
      }

      .j-slider--vertical .j-slider__range {
        writing-mode: vertical-lr;
        width: auto;
      }

      .j-slider__range {
        accent-color: var(--j-color-primary);
        cursor: pointer;
        width: 100%;
      }

      .j-slider__range:focus-visible {
        outline: var(--j-focus-ring);
        outline-offset: 2px;
      }

      .j-slider.is-disabled {
        opacity: var(--j-disabled-opacity);
      }

      .j-slider__values {
        color: var(--j-color-text-muted);
        display: flex;
        font-size: var(--j-font-size-xs);
        gap: var(--j-spacing-sm);
        justify-content: space-between;
      }

      .j-slider__required,
      .j-slider__message--error {
        color: var(--j-color-danger);
      }

      .j-slider__message {
        color: var(--j-color-text-muted);
        font-size: var(--j-font-size-xs);
        margin: var(--j-spacing-sm) 0 0;
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => JSliderComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JSliderComponent implements ControlValueAccessor {
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  @Input() id = jCreateId('j-slider');
  @Input() label = '';
  @Input() hint = '';
  @Input() error = '';
  @Input() styleClass = '';
  @Input() size: JSize = 'md';
  @Input({ transform: numberAttribute }) min = 0;
  @Input({ transform: numberAttribute }) max = 100;
  @Input({ transform: numberAttribute }) step = 1;
  @Input({ transform: booleanAttribute }) range = false;
  @Input({ transform: booleanAttribute }) vertical = false;
  @Input({ transform: booleanAttribute }) tooltip = false;
  @Input({ transform: booleanAttribute }) showValue = true;
  @Input({ transform: booleanAttribute }) invalid = false;
  @Input({ transform: booleanAttribute }) readonly = false;
  @Input({ transform: booleanAttribute }) required = false;

  @Output() valueChange = new EventEmitter<JSliderValue>();

  readonly labelId = jCreateId('j-slider-label');
  readonly hintId = jCreateId('j-slider-hint');
  readonly errorId = jCreateId('j-slider-error');
  lowerValue = 0;
  upperValue = 100;
  isDisabled = false;

  onTouched: () => void = () => undefined;
  private onChange: (value: JSliderValue) => void = () => undefined;

  @Input({ transform: booleanAttribute })
  set disabled(value: boolean) {
    this.isDisabled = value;
    this.changeDetectorRef.markForCheck();
  }

  get hasError(): boolean {
    return this.invalid || this.error.trim().length > 0;
  }

  get describedBy(): string | null {
    return jAriaDescribedBy(this.hasError ? this.errorId : null, this.hint ? this.hintId : null);
  }

  get rootClasses(): string {
    return [
      'j-slider',
      `j-slider--${this.size}`,
      this.range ? 'j-slider--range' : '',
      this.vertical ? 'j-slider--vertical' : '',
      this.hasError ? 'is-invalid' : '',
      this.isDisabled ? 'is-disabled' : '',
      this.styleClass,
    ]
      .filter(Boolean)
      .join(' ');
  }

  writeValue(value: JSliderValue | null | undefined): void {
    if (Array.isArray(value)) {
      this.lowerValue = this.clamp(Number(value[0] ?? this.min));
      this.upperValue = this.clamp(Number(value[1] ?? this.max));
    } else {
      this.lowerValue = this.clamp(Number(value ?? this.min));
      this.upperValue = this.max;
    }
    this.normalizeRange();
    this.changeDetectorRef.markForCheck();
  }

  registerOnChange(fn: (value: JSliderValue) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    this.changeDetectorRef.markForCheck();
  }

  handleLowerInput(event: Event): void {
    if (this.readonly) {
      return;
    }
    const target = event.target as HTMLInputElement;
    this.lowerValue = this.clamp(Number(target.value));
    this.normalizeRange();
    this.commit();
  }

  handleUpperInput(event: Event): void {
    if (this.readonly) {
      return;
    }
    const target = event.target as HTMLInputElement;
    this.upperValue = this.clamp(Number(target.value));
    this.normalizeRange();
    this.commit();
  }

  private commit(): void {
    const nextValue: JSliderValue = this.range
      ? [this.lowerValue, this.upperValue]
      : this.lowerValue;
    this.onChange(nextValue);
    this.valueChange.emit(nextValue);
  }

  private normalizeRange(): void {
    if (this.range && this.lowerValue > this.upperValue) {
      const lower = this.upperValue;
      this.upperValue = this.lowerValue;
      this.lowerValue = lower;
    }
  }

  private clamp(value: number): number {
    return Math.min(this.max, Math.max(this.min, Number.isNaN(value) ? this.min : value));
  }
}
