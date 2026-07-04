import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  forwardRef,
  inject,
  Input,
  numberAttribute,
  output,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { jAriaDescribedBy } from '../core/aria';
import { JClickOutsideDirective } from '../core/click-outside.directive';
import { JRNG_LOCALE } from '../core/locale';
import { JPassThrough } from '../core/pass-through';
import { JSize } from '../core/types';
import { jCreateId } from '../core/id';

export type JTimePickerHourFormat = 12 | 24;

@Component({
  selector: 'j-time-picker',
  imports: [JClickOutsideDirective],
  template: `
    <div
      [class]="rootClasses"
      jClickOutside
      (jClickOutside)="close()"
      data-jc-name="time-picker"
      data-jc-section="root"
      [attr.data-j-disabled]="isDisabled ? 'true' : null"
      [attr.data-j-invalid]="hasError ? 'true' : null"
      [attr.data-j-open]="isOpen ? 'true' : null"
    >
      @if (label) {
        <label class="j-time-picker__label" [id]="labelId">
          <span>{{ label }}</span>
          @if (required) {
            <span class="j-time-picker__required" aria-hidden="true">*</span>
          }
        </label>
      }

      <button
        class="j-time-picker__control"
        type="button"
        [disabled]="isDisabled || readonly"
        [attr.aria-labelledby]="label ? labelId : null"
        [attr.aria-describedby]="describedBy"
        [attr.aria-invalid]="hasError ? 'true' : null"
        [attr.aria-expanded]="isOpen"
        [attr.aria-controls]="isOpen ? panelId : null"
        (click)="toggle()"
        (keydown)="handleTriggerKeydown($event)"
      >
        <span class="j-time-picker__value" [class.is-placeholder]="!value">
          {{ displayValue || placeholder }}
        </span>
        @if (canClear) {
          <span class="j-time-picker__clear" role="button" tabindex="-1" aria-hidden="true" (click)="clearValue($event)">
            x
          </span>
        }
        <span class="j-time-picker__icon" aria-hidden="true">time</span>
      </button>

      @if (isOpen) {
        <div class="j-time-picker__panel" [id]="panelId" role="dialog" data-jc-section="panel">
          <div class="j-time-picker__columns">
            <label class="j-time-picker__column">
              <span class="j-time-picker__column-label">Hour</span>
              <select class="j-time-picker__select" [value]="displayHour" (change)="handleHourChange($event)">
                @for (hour of hourOptions; track hour) {
                  <option [value]="hour">{{ pad(hour) }}</option>
                }
              </select>
            </label>

            <label class="j-time-picker__column">
              <span class="j-time-picker__column-label">Minute</span>
              <select class="j-time-picker__select" [value]="minute" (change)="handleMinuteChange($event)">
                @for (option of minuteOptions; track option) {
                  <option [value]="option">{{ pad(option) }}</option>
                }
              </select>
            </label>

            @if (showSeconds) {
              <label class="j-time-picker__column">
                <span class="j-time-picker__column-label">Second</span>
                <select class="j-time-picker__select" [value]="second" (change)="handleSecondChange($event)">
                  @for (option of secondOptions; track option) {
                    <option [value]="option">{{ pad(option) }}</option>
                  }
                </select>
              </label>
            }

            @if (hourFormat === 12) {
              <label class="j-time-picker__column j-time-picker__column--period">
                <span class="j-time-picker__column-label">Period</span>
                <select class="j-time-picker__select" [value]="period" (change)="handlePeriodChange($event)">
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </label>
            }
          </div>

          <div class="j-time-picker__bar">
            <button type="button" class="j-time-picker__bar-button" (click)="selectNow()">Now</button>
            <button type="button" class="j-time-picker__bar-button" [disabled]="!value" (click)="clearValue()">
              {{ locale.clear }}
            </button>
            <button type="button" class="j-time-picker__done" (click)="close()">{{ locale.accept }}</button>
          </div>
        </div>
      }

      @if (hasError && error) {
        <p class="j-time-picker__message j-time-picker__message--error" [id]="errorId">
          {{ error }}
        </p>
      }
      @if (hint && !hasError) {
        <p class="j-time-picker__message" [id]="hintId">{{ hint }}</p>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .j-time-picker {
        color: var(--j-color-foreground);
        display: block;
        position: relative;
      }

      .j-time-picker__label {
        display: inline-flex;
        font-size: var(--j-font-size-sm);
        font-weight: var(--j-font-weight-semibold);
        gap: var(--j-spacing-1);
        margin-bottom: var(--j-spacing-2);
      }

      .j-time-picker__control {
        align-items: center;
        background: var(--j-color-card);
        border: 1px solid var(--j-input-border-color, var(--j-color-border));
        border-radius: var(--j-input-radius, var(--j-radius-md));
        color: inherit;
        cursor: pointer;
        display: flex;
        font: inherit;
        gap: var(--j-spacing-2);
        min-height: var(--j-input-height-md, 2.5rem);
        padding: 0 var(--j-spacing-3);
        text-align: left;
        width: 100%;
      }

      .j-time-picker__control:focus-visible {
        border-color: var(--j-color-ring);
        box-shadow: var(--j-focus-ring);
        outline: 2px solid transparent;
      }

      .j-time-picker--filled .j-time-picker__control {
        background: var(--j-color-muted);
      }

      .j-time-picker--sm .j-time-picker__control {
        min-height: var(--j-input-height-sm, 2.125rem);
      }

      .j-time-picker--lg .j-time-picker__control {
        min-height: var(--j-input-height-lg, 2.875rem);
      }

      .j-time-picker.is-invalid .j-time-picker__control {
        border-color: var(--j-color-danger);
      }

      .j-time-picker.is-disabled {
        opacity: var(--j-disabled-opacity);
      }

      .j-time-picker__value {
        flex: 1;
      }

      .j-time-picker__value.is-placeholder,
      .j-time-picker__clear,
      .j-time-picker__icon {
        color: var(--j-color-muted-foreground);
      }

      .j-time-picker__panel {
        background: var(--j-color-popover);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-lg);
        box-shadow: var(--j-shadow-lg, 0 18px 45px rgb(15 23 42 / 0.14));
        color: var(--j-color-popover-foreground);
        margin-top: var(--j-spacing-2);
        padding: var(--j-spacing-3);
        position: absolute;
        width: min(24rem, calc(100vw - 2rem));
        z-index: var(--j-z-index-overlay, 1000);
      }

      .j-time-picker__columns {
        display: grid;
        gap: var(--j-spacing-2);
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }

      .j-time-picker__column {
        display: grid;
        gap: var(--j-spacing-1);
      }

      .j-time-picker__column--period {
        grid-column: span 1;
      }

      .j-time-picker__column-label {
        color: var(--j-color-muted-foreground);
        font-size: var(--j-font-size-xs);
        font-weight: var(--j-font-weight-semibold);
      }

      .j-time-picker__select {
        background: var(--j-color-card);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-md);
        color: inherit;
        font: inherit;
        min-height: 2.5rem;
        outline: none;
        padding: 0 var(--j-spacing-2);
      }

      .j-time-picker__select:focus {
        border-color: var(--j-color-ring);
        box-shadow: var(--j-focus-ring);
      }

      .j-time-picker__bar {
        align-items: center;
        border-top: 1px solid var(--j-color-border);
        display: flex;
        gap: var(--j-spacing-2);
        justify-content: flex-end;
        margin-top: var(--j-spacing-3);
        padding-top: var(--j-spacing-3);
      }

      .j-time-picker__bar-button,
      .j-time-picker__done {
        border: 0;
        border-radius: var(--j-radius-sm);
        cursor: pointer;
        font: inherit;
        min-height: 2rem;
        padding: 0 var(--j-spacing-3);
      }

      .j-time-picker__bar-button {
        background: transparent;
        color: var(--j-color-primary);
      }

      .j-time-picker__done {
        background: var(--j-color-primary);
        color: var(--j-color-primary-foreground);
      }

      .j-time-picker__bar-button:hover,
      .j-time-picker__done:hover {
        filter: brightness(0.98);
      }

      .j-time-picker__bar-button:focus-visible,
      .j-time-picker__done:focus-visible {
        box-shadow: var(--j-focus-ring);
        outline: 2px solid transparent;
      }

      .j-time-picker__required,
      .j-time-picker__message--error {
        color: var(--j-color-danger);
      }

      .j-time-picker__message {
        color: var(--j-color-muted-foreground);
        font-size: var(--j-font-size-xs);
        margin: var(--j-spacing-2) 0 0;
      }

      @media (max-width: 420px) {
        .j-time-picker__panel {
          width: min(100%, calc(100vw - 2rem));
        }

        .j-time-picker__columns {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => JTimePickerComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JTimePickerComponent implements ControlValueAccessor {
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  readonly locale = inject(JRNG_LOCALE);
  readonly labelId = jCreateId('j-time-picker-label');
  readonly hintId = jCreateId('j-time-picker-hint');
  readonly errorId = jCreateId('j-time-picker-error');
  readonly panelId = jCreateId('j-time-picker-panel');

  @Input() label = '';
  @Input() placeholder = 'Select time';
  @Input() hint = '';
  @Input() error = '';
  @Input() styleClass = '';
  @Input() variant: 'outlined' | 'filled' = 'outlined';
  @Input() size: JSize = 'md';
  @Input() hourFormat: JTimePickerHourFormat = 24;
  @Input() appendTo: 'self' | 'body' | string = 'self';
  @Input() pt: JPassThrough | null = null;
  @Input({ transform: booleanAttribute }) readonly = false;
  @Input({ transform: booleanAttribute }) invalid = false;
  @Input({ transform: booleanAttribute }) required = false;
  @Input({ transform: booleanAttribute }) showSeconds = false;
  @Input({ transform: booleanAttribute }) showClear = true;
  @Input({ transform: booleanAttribute }) timeOnly = true;

  readonly valueChange = output<string | null>();
  readonly select = output<string | null>();
  readonly clear = output<void>();
  readonly opened = output<void>();
  readonly closed = output<void>();

  value = '';
  hour = 0;
  minute = 0;
  second = 0;
  period: 'AM' | 'PM' = 'AM';
  isDisabled = false;
  isOpen = false;

  private minuteStepInternal = 1;
  private onChange: (value: string | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  @Input()
  set valueInput(value: string | null | undefined) {
    this.writeValue(value);
  }

  @Input()
  set minuteStep(value: number | string) {
    this.minuteStepInternal = Math.max(1, Math.min(60, numberAttribute(value, 1)));
  }

  @Input()
  set stepMinute(value: number | string) {
    this.minuteStep = value;
  }

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

  get canClear(): boolean {
    return this.showClear && !!this.value && !this.isDisabled && !this.readonly;
  }

  get rootClasses(): string {
    return [
      'j-time-picker',
      `j-time-picker--${this.size}`,
      `j-time-picker--${this.variant}`,
      this.hasError ? 'is-invalid' : '',
      this.isDisabled ? 'is-disabled' : '',
      this.isOpen ? 'is-open' : '',
      this.styleClass,
      this.pt?.['root']?.['class'] ?? '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  get hourOptions(): readonly number[] {
    return this.hourFormat === 12
      ? Array.from({ length: 12 }, (_, index) => index + 1)
      : Array.from({ length: 24 }, (_, index) => index);
  }

  get minuteOptions(): readonly number[] {
    return steppedOptions(this.minuteStepInternal);
  }

  get secondOptions(): readonly number[] {
    return steppedOptions(1);
  }

  get displayHour(): number {
    if (this.hourFormat === 24) {
      return this.hour;
    }
    const hour = this.hour % 12;
    return hour === 0 ? 12 : hour;
  }

  get displayValue(): string {
    if (!this.value) {
      return '';
    }

    if (this.hourFormat === 24) {
      return this.value;
    }

    return `${this.pad(this.displayHour)}:${this.pad(this.minute)}${this.showSeconds ? `:${this.pad(this.second)}` : ''} ${this.period}`;
  }

  writeValue(value: string | null | undefined): void {
    this.value = normalizeTime(value, this.showSeconds);
    this.applyValueParts();
    this.changeDetectorRef.markForCheck();
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    if (isDisabled) {
      this.close();
    }
    this.changeDetectorRef.markForCheck();
  }

  toggle(): void {
    this.isOpen ? this.close() : this.open();
  }

  open(): void {
    if (this.isDisabled || this.readonly || this.isOpen) {
      return;
    }
    if (!this.value) {
      this.setPartsFromDate(new Date());
    }
    this.isOpen = true;
    this.opened.emit();
    this.changeDetectorRef.markForCheck();
  }

  close(): void {
    if (!this.isOpen) {
      return;
    }
    this.isOpen = false;
    this.onTouched();
    this.closed.emit();
    this.changeDetectorRef.markForCheck();
  }

  handleTriggerKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
      event.preventDefault();
      this.open();
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
    }
  }

  handleHourChange(event: Event): void {
    const nextHour = Number((event.target as HTMLSelectElement).value);
    if (this.hourFormat === 12) {
      this.hour = this.toTwentyFourHour(nextHour, this.period);
    } else {
      this.hour = nextHour;
    }
    this.commit();
  }

  handleMinuteChange(event: Event): void {
    this.minute = Number((event.target as HTMLSelectElement).value);
    this.commit();
  }

  handleSecondChange(event: Event): void {
    this.second = Number((event.target as HTMLSelectElement).value);
    this.commit();
  }

  handlePeriodChange(event: Event): void {
    this.period = (event.target as HTMLSelectElement).value === 'PM' ? 'PM' : 'AM';
    this.hour = this.toTwentyFourHour(this.displayHour, this.period);
    this.commit();
  }

  selectNow(): void {
    this.setPartsFromDate(new Date());
    this.commit();
  }

  clearValue(event?: Event): void {
    event?.stopPropagation();
    if (this.isDisabled || this.readonly) {
      return;
    }
    this.value = '';
    this.onChange(null);
    this.valueChange.emit(null);
    this.clear.emit();
    this.changeDetectorRef.markForCheck();
  }

  pad(value: number): string {
    return String(value).padStart(2, '0');
  }

  private commit(): void {
    this.value = `${this.pad(this.hour)}:${this.pad(this.minute)}${this.showSeconds ? `:${this.pad(this.second)}` : ''}`;
    this.onChange(this.value || null);
    this.valueChange.emit(this.value || null);
    this.select.emit(this.value || null);
    this.changeDetectorRef.markForCheck();
  }

  private applyValueParts(): void {
    if (!this.value) {
      this.hour = 0;
      this.minute = 0;
      this.second = 0;
      this.period = 'AM';
      return;
    }

    const [hour, minute, second] = this.value.split(':').map(Number);
    this.hour = clamp(hour, 0, 23);
    this.minute = clamp(minute, 0, 59);
    this.second = clamp(second || 0, 0, 59);
    this.period = this.hour >= 12 ? 'PM' : 'AM';
  }

  private setPartsFromDate(date: Date): void {
    this.hour = date.getHours();
    const roundedMinute = Math.floor(date.getMinutes() / this.minuteStepInternal) * this.minuteStepInternal;
    this.minute = clamp(roundedMinute, 0, 59);
    this.second = this.showSeconds ? date.getSeconds() : 0;
    this.period = this.hour >= 12 ? 'PM' : 'AM';
  }

  private toTwentyFourHour(hour: number, period: 'AM' | 'PM'): number {
    if (period === 'AM') {
      return hour === 12 ? 0 : hour;
    }
    return hour === 12 ? 12 : hour + 12;
  }
}

function steppedOptions(step: number): readonly number[] {
  const safeStep = Math.max(1, Math.min(60, step));
  const options: number[] = [];
  for (let value = 0; value < 60; value += safeStep) {
    options.push(value);
  }
  return options;
}

function normalizeTime(value: string | null | undefined, includeSeconds: boolean): string {
  if (!value) {
    return '';
  }
  const match = /^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/.exec(value);
  if (!match) {
    return '';
  }
  const hour = clamp(Number(match[1]), 0, 23);
  const minute = clamp(Number(match[2]), 0, 59);
  const second = clamp(Number(match[3] || 0), 0, 59);
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}${includeSeconds ? `:${String(second).padStart(2, '0')}` : ''}`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
}
