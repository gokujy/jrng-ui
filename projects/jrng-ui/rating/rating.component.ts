import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  numberAttribute,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { JButtonComponent } from 'jrng-ui/button';
import { JComponentSize } from 'jrng-ui/core';

@Component({
  selector: 'j-rating',
  imports: [JButtonComponent],
  template: `
    <div
      [class]="rootClasses()"
      data-jc-name="rating"
      data-jc-section="root"
      role="slider"
      [attr.tabindex]="isDisabled() || readonly() ? -1 : 0"
      [attr.aria-label]="ariaLabel() || label() || 'Rating'"
      aria-valuemin="0"
      [attr.aria-valuemax]="max()"
      [attr.aria-valuenow]="value"
      [attr.aria-valuetext]="valueText()"
      [attr.aria-disabled]="isDisabled() || readonly()"
      [attr.data-j-disabled]="isDisabled() ? 'true' : null"
      [attr.data-j-invalid]="invalid() ? 'true' : null"
      (keydown)="handleKeydown($event)"
      (blur)="onTouched()"
      (pointerleave)="clearPreview()"
    >
      @if (label()) {
        <span class="j-rating__label" data-jc-section="label">{{ label() }}</span>
      }
      @if (cancel() && !readonly()) {
        <j-button
          label="Clear"
          styleClass="j-rating__clear"
          data-jc-section="clear"
          size="sm"
          variant="text"
          [disabled]="isDisabled()"
          (onClick)="setValue(0)"
        />
      }
      @for (star of stars(); track star) {
        <button
          class="j-rating__star"
          data-jc-section="item"
          type="button"
          aria-hidden="true"
          tabindex="-1"
          [disabled]="isDisabled() || readonly()"
          [attr.data-j-active]="fillPercent(star) > 0 ? 'true' : null"
          (pointermove)="previewAt(star, $event)"
          (pointerdown)="selectAt(star, $event)"
        >
          <span class="j-rating__glyph j-rating__glyph--empty">{{ icon() }}</span>
          <span
            class="j-rating__glyph j-rating__glyph--filled"
            [style.width.%]="fillPercent(star)"
            >{{ icon() }}</span
          >
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

      .j-rating__star {
        background: transparent;
        border: 0;
        color: inherit;
        cursor: pointer;
        font: inherit;
        font-size: 1.25rem;
        line-height: 1;
        padding: 0;
        position: relative;
      }

      .j-rating__glyph {
        display: block;
      }

      .j-rating__glyph--filled {
        color: var(--j-rating-color, var(--j-color-warning));
        inset: 0 auto 0 0;
        overflow: hidden;
        position: absolute;
        white-space: nowrap;
      }

      .j-rating--sm .j-rating__star {
        font-size: 1rem;
      }

      .j-rating--lg .j-rating__star {
        font-size: 1.5rem;
      }

      .j-rating:focus-visible,
      .j-rating__star:focus-visible {
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

  readonly label = input('');
  readonly ariaLabel = input('');
  readonly styleClass = input('');
  readonly size = input<JComponentSize>('md');
  readonly max = input(5, { transform: numberAttribute });
  readonly step = input(1, { transform: numberAttribute });
  readonly icon = input('★');
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly cancel = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });

  readonly valueChange = output<number>();

  value = 0;
  readonly previewValue = signal<number | null>(null);
  readonly isDisabled = signal(false);

  onTouched: () => void = () => undefined;
  private onChange: (value: number) => void = () => undefined;

  constructor() {
    effect(() => this.isDisabled.set(this.disabled()));
  }

  readonly stars = computed<readonly number[]>(() =>
    Array.from({ length: Math.max(0, this.max()) }, (_, index) => index + 1),
  );

  readonly rootClasses = computed(() =>
    [
      'j-rating',
      `j-rating--${this.size()}`,
      this.isDisabled() ? 'is-disabled' : '',
      this.readonly() ? 'is-readonly' : '',
      this.invalid() ? 'is-invalid' : '',
      this.styleClass(),
    ]
      .filter(Boolean)
      .join(' '),
  );

  writeValue(value: number | null | undefined): void {
    this.value = this.normalize(Number(value ?? 0));
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
    this.clearPreview();
    this.changeDetectorRef.markForCheck();
  }

  setValue(value: number): void {
    if (this.isDisabled() || this.readonly()) return;
    this.value = this.normalize(value);
    this.onChange(this.value);
    this.valueChange.emit(this.value);
    this.changeDetectorRef.markForCheck();
  }

  handleKeydown(event: KeyboardEvent): void {
    if (this.isDisabled() || this.readonly()) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.setValue(this.value + this.safeStep());
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault();
      this.setValue(this.value - this.safeStep());
    } else if (event.key === 'Home') {
      event.preventDefault();
      this.setValue(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      this.setValue(this.max());
    }
  }

  previewAt(star: number, event: PointerEvent): void {
    if (this.isDisabled() || this.readonly()) return;
    this.previewValue.set(this.valueAtPointer(star, event));
  }

  selectAt(star: number, event: PointerEvent): void {
    if (this.isDisabled() || this.readonly()) return;
    event.preventDefault();
    this.setValue(this.valueAtPointer(star, event));
  }

  clearPreview(): void {
    this.previewValue.set(null);
  }

  fillPercent(star: number): number {
    const displayed = this.previewValue() ?? this.value;
    return Math.max(0, Math.min(100, (displayed - (star - 1)) * 100));
  }

  valueText(): string {
    return `${this.value} of ${this.max()}`;
  }

  private valueAtPointer(star: number, event: PointerEvent): number {
    const target = event.currentTarget as HTMLElement | null;
    const bounds = target?.getBoundingClientRect();
    const ratio = bounds?.width ? (event.clientX - bounds.left) / bounds.width : 1;
    return this.normalize(star - 1 + Math.max(0, Math.min(1, ratio)));
  }

  private normalize(value: number): number {
    const step = this.safeStep();
    const rounded = Math.round(value / step) * step;
    return Math.max(0, Math.min(this.max(), Number(rounded.toFixed(6))));
  }

  private safeStep(): number {
    const step = this.step();
    return Number.isFinite(step) && step > 0 ? Math.min(1, step) : 1;
  }
}
