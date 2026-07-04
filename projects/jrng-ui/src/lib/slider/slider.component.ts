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
import { jAriaDescribedBy } from '../core/aria';
import { jCreateId } from '../core/id';
import { JSize } from '../core/types';

export type JSliderValue = number | readonly [number, number];

@Component({
  selector: 'j-slider',
  imports: [],
  template: `
    <div [class]="rootClasses">
      @if (label) {
        <label class="j-slider__label" [id]="labelId">
          <span>{{ label }}</span>
          @if (required) {
            <span class="j-slider__required" aria-hidden="true">*</span>
          }
        </label>
      }

      <div class="j-slider__control">
        <input
          class="j-slider__range"
          type="range"
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
            type="range"
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

      <div class="j-slider__values" aria-hidden="true">
        <span>{{ lowerValue }}</span>
        @if (range) {
          <span>{{ upperValue }}</span>
        }
      </div>

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
  @Input({ transform: booleanAttribute }) invalid = false;
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
    const target = event.target as HTMLInputElement;
    this.lowerValue = this.clamp(Number(target.value));
    this.normalizeRange();
    this.commit();
  }

  handleUpperInput(event: Event): void {
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
