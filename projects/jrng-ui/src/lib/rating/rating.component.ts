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
import { JSize } from '../core/types';

@Component({
  selector: 'j-rating',
  imports: [],
  template: `
    <div [class]="rootClasses" role="radiogroup" [attr.aria-label]="ariaLabel || label || 'Rating'">
      @if (label) {
        <span class="j-rating__label">{{ label }}</span>
      }
      @if (cancel && !readonly) {
        <button class="j-rating__clear" type="button" [disabled]="isDisabled" (click)="setValue(0)">
          Clear
        </button>
      }
      @for (star of stars; track star) {
        <button
          class="j-rating__star"
          type="button"
          role="radio"
          [disabled]="isDisabled || readonly"
          [class.is-active]="star <= value"
          [attr.aria-checked]="star === value"
          [attr.aria-label]="star + ' of ' + stars.length"
          (click)="setValue(star)"
          (keydown)="handleKeydown($event, star)"
          (blur)="onTouched()"
        >
          ★
        </button>
      }
    </div>
  `,
  styles: [
    `
      .j-rating {
        align-items: center;
        color: var(--j-color-text-muted);
        display: inline-flex;
        gap: var(--j-spacing-xs);
      }

      .j-rating__label {
        color: var(--j-color-text);
        font-size: var(--j-font-size-sm);
        margin-right: var(--j-spacing-xs);
      }

      .j-rating__star,
      .j-rating__clear {
        background: transparent;
        border: 0;
        color: inherit;
        cursor: pointer;
        font: inherit;
        padding: 0;
      }

      .j-rating__star {
        font-size: 1.25rem;
        line-height: 1;
      }

      .j-rating--sm .j-rating__star {
        font-size: 1rem;
      }

      .j-rating--lg .j-rating__star {
        font-size: 1.5rem;
      }

      .j-rating__star.is-active {
        color: var(--j-color-warning);
      }

      .j-rating__star:focus-visible,
      .j-rating__clear:focus-visible {
        border-radius: var(--j-radius-sm);
        box-shadow: var(--j-focus-ring);
        outline: none;
      }

      .j-rating.is-disabled {
        opacity: var(--j-disabled-opacity);
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => JRatingComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JRatingComponent implements ControlValueAccessor {
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  @Input() label = '';
  @Input() ariaLabel = '';
  @Input() styleClass = '';
  @Input() size: JSize = 'md';
  @Input({ transform: numberAttribute }) max = 5;
  @Input({ transform: booleanAttribute }) readonly = false;
  @Input({ transform: booleanAttribute }) cancel = false;

  @Output() valueChange = new EventEmitter<number>();

  value = 0;
  isDisabled = false;

  onTouched: () => void = () => undefined;
  private onChange: (value: number) => void = () => undefined;

  @Input({ transform: booleanAttribute })
  set disabled(value: boolean) {
    this.isDisabled = value;
    this.changeDetectorRef.markForCheck();
  }

  get stars(): readonly number[] {
    return Array.from({ length: Math.max(0, this.max) }, (_, index) => index + 1);
  }

  get rootClasses(): string {
    return [
      'j-rating',
      `j-rating--${this.size}`,
      this.isDisabled ? 'is-disabled' : '',
      this.readonly ? 'is-readonly' : '',
      this.styleClass,
    ]
      .filter(Boolean)
      .join(' ');
  }

  writeValue(value: number | null | undefined): void {
    this.value = Number(value ?? 0);
    this.changeDetectorRef.markForCheck();
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    this.changeDetectorRef.markForCheck();
  }

  setValue(value: number): void {
    if (this.isDisabled || this.readonly) {
      return;
    }
    this.value = value;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
    this.changeDetectorRef.markForCheck();
  }

  handleKeydown(event: KeyboardEvent, star: number): void {
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.setValue(Math.min(this.max, star + 1));
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault();
      this.setValue(Math.max(0, star - 1));
    }
  }
}
