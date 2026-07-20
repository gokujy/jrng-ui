import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  effect,
  forwardRef,
  inject,
  input,
  numberAttribute,
  output,
  signal,
  untracked,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { jAriaDescribedBy } from 'jrng-ui/core';
import { JAppendTo, JClickOutsideDirective, JOverlayHandle, JOverlayService } from 'jrng-ui/core';
import { JRNG_LOCALE } from 'jrng-ui/core';
import { JPassThrough } from 'jrng-ui/core';
import { JComponentSize } from 'jrng-ui/core';
import { jCreateId } from 'jrng-ui/core';
import { JButtonComponent } from 'jrng-ui/button';
import { JIconComponent } from 'jrng-ui/icon';

export type JTimePickerHourFormat = 12 | 24;

@Component({
  selector: 'j-time-picker',
  imports: [JButtonComponent, JClickOutsideDirective, JIconComponent],
  template: `
    <div
      [class]="rootClasses"
      jClickOutside
      (jClickOutside)="close()"
      data-jc-name="time-picker"
      data-jc-section="root"
      [attr.data-j-disabled]="isDisabled() ? 'true' : null"
      [attr.data-j-invalid]="hasError ? 'true' : null"
      [attr.data-j-open]="isOpen ? 'true' : null"
    >
      @if (label()) {
        <span class="j-time-picker__label" [id]="labelId">
          <span>{{ label() }}</span>
          @if (required()) {
            <span class="j-time-picker__required" aria-hidden="true">*</span>
          }
        </span>
      }

      <div class="j-time-picker__control-wrapper">
        <button
          class="j-time-picker__control"
          type="button"
          [disabled]="isDisabled() || readonly()"
          [attr.aria-labelledby]="label() ? labelId : null"
          [attr.aria-describedby]="describedBy"
          [attr.aria-invalid]="hasError ? 'true' : null"
          [attr.aria-expanded]="isOpen"
          [attr.aria-controls]="isOpen ? panelId : null"
          (click)="toggle()"
          (keydown)="handleTriggerKeydown($event)"
        >
          <span class="j-time-picker__value" [class.is-placeholder]="!value">
            {{ displayValue || placeholder() }}
          </span>
          <j-icon class="j-time-picker__icon" name="clock" aria-hidden="true" />
        </button>
        @if (canClear) {
          <j-button
            styleClass="j-time-picker__clear"
            actionDisplay="icon"
            icon="close"
            size="sm"
            variant="text"
            [ariaLabel]="locale.clear"
            [title]="locale.clear"
            (onClick)="clearValue($event)"
          />
        }
      </div>

      @if (isOpen) {
        <div
          #panel
          class="j-time-picker__panel"
          [id]="panelId"
          role="dialog"
          data-jc-section="panel"
        >
          <div class="j-time-picker__columns">
            <label class="j-time-picker__column">
              <span class="j-time-picker__column-label">{{ locale.hour }}</span>
              <select
                class="j-time-picker__select"
                [value]="displayHour"
                [disabled]="isDisabled() || readonly()"
                (change)="handleHourChange($event)"
              >
                @for (hour of hourOptions; track hour) {
                  <option [value]="hour">{{ pad(hour) }}</option>
                }
              </select>
            </label>

            <label class="j-time-picker__column">
              <span class="j-time-picker__column-label">{{ locale.minute }}</span>
              <select
                class="j-time-picker__select"
                [value]="minute"
                [disabled]="isDisabled() || readonly()"
                (change)="handleMinuteChange($event)"
              >
                @for (option of minuteOptions; track option) {
                  <option [value]="option">{{ pad(option) }}</option>
                }
              </select>
            </label>

            @if (showSeconds()) {
              <label class="j-time-picker__column">
                <span class="j-time-picker__column-label">{{ locale.second }}</span>
                <select
                  class="j-time-picker__select"
                  [value]="second"
                  [disabled]="isDisabled() || readonly()"
                  (change)="handleSecondChange($event)"
                >
                  @for (option of secondOptions; track option) {
                    <option [value]="option">{{ pad(option) }}</option>
                  }
                </select>
              </label>
            }

            @if (hourFormat() === 12) {
              <label class="j-time-picker__column j-time-picker__column--period">
                <span class="j-time-picker__column-label">{{ locale.period }}</span>
                <select
                  class="j-time-picker__select"
                  [value]="period"
                  [disabled]="isDisabled() || readonly()"
                  (change)="handlePeriodChange($event)"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </label>
            }
          </div>

          <div class="j-time-picker__bar">
            <j-button
              [label]="locale.now"
              size="sm"
              variant="text"
              [disabled]="isDisabled() || readonly()"
              (onClick)="selectNow()"
            />
            <j-button
              [label]="locale.clear"
              size="sm"
              variant="text"
              [disabled]="!value || isDisabled() || readonly()"
              (onClick)="clearValue()"
            />
            <j-button
              [label]="locale.accept"
              size="sm"
              [disabled]="isDisabled() || readonly()"
              (onClick)="close()"
            />
          </div>
        </div>
      }

      @if (hasError && error()) {
        <p class="j-time-picker__message j-time-picker__message--error" [id]="errorId">
          {{ error() }}
        </p>
      }
      @if (hint() && !hasError) {
        <p class="j-time-picker__message" [id]="hintId">{{ hint() }}</p>
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

      .j-time-picker__control-wrapper {
        align-items: center;
        display: flex;
        position: relative;
      }

      .j-time-picker__control-wrapper .j-time-picker__control {
        padding-inline-end: 4rem;
      }

      :host ::ng-deep .j-time-picker__clear {
        background: transparent;
        border: 0;
        cursor: pointer;
        inset-inline-end: 2.5rem;
        position: absolute;
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
        max-height: min(20rem, calc(100dvh - 2rem));
        overflow: auto;
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
        max-height: 10rem;
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
  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly overlay = inject(JOverlayService);
  private readonly destroyRef = inject(DestroyRef);
  @ViewChild('panel') private panelRef?: ElementRef<HTMLElement>;
  private overlayHandle?: JOverlayHandle;

  readonly locale = inject(JRNG_LOCALE);
  readonly labelId = jCreateId('j-time-picker-label');
  readonly hintId = jCreateId('j-time-picker-hint');
  readonly errorId = jCreateId('j-time-picker-error');
  readonly panelId = jCreateId('j-time-picker-panel');

  readonly label = input('');
  readonly placeholder = input('Select time');
  readonly hint = input('');
  readonly error = input('');
  readonly styleClass = input('');
  readonly variant = input<'outlined' | 'filled'>('outlined');
  readonly size = input<JComponentSize>('md');
  readonly hourFormat = input<JTimePickerHourFormat>(24);
  readonly appendTo = input<JAppendTo | undefined>(undefined);
  readonly pt = input<JPassThrough | null>(null);
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly showSeconds = input(false, { transform: booleanAttribute });
  readonly showClear = input(true, { transform: booleanAttribute });
  readonly valueInput = input<string | null | undefined>(undefined);
  readonly minuteStep = input<number | string | undefined>(undefined);
  readonly disabled = input(false, { transform: booleanAttribute });

  readonly valueChange = output<string | null>();
  readonly clear = output<void>();
  readonly opened = output<void>();
  readonly closed = output<void>();

  value = '';
  hour = 0;
  minute = 0;
  second = 0;
  period: 'AM' | 'PM' = 'AM';
  readonly formDisabled = signal(false);
  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  isOpen = false;

  private readonly minuteStepInternal = signal(1);
  private onChange: (value: string | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor() {
    this.destroyRef.onDestroy(() => this.overlayHandle?.detach());
    effect(() => {
      const value = this.valueInput();
      untracked(() => this.writeValue(value));
    });
    effect(() => {
      const value = this.minuteStep();
      if (value !== undefined) {
        this.setMinuteStep(value);
      }
    });
  }

  private setMinuteStep(value: number | string): void {
    this.minuteStepInternal.set(Math.max(1, Math.min(60, numberAttribute(value, 1))));
  }

  get hasError(): boolean {
    return this.invalid() || this.error().trim().length > 0;
  }

  get describedBy(): string | null {
    return jAriaDescribedBy(this.hasError ? this.errorId : null, this.hint() ? this.hintId : null);
  }

  get canClear(): boolean {
    return this.showClear() && !!this.value && !this.isDisabled() && !this.readonly();
  }

  get rootClasses(): string {
    return [
      'j-time-picker',
      `j-time-picker--${this.size()}`,
      `j-time-picker--${this.variant()}`,
      this.hasError ? 'is-invalid' : '',
      this.isDisabled() ? 'is-disabled' : '',
      this.isOpen ? 'is-open' : '',
      this.styleClass(),
      this.pt()?.['root']?.['class'] ?? '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  get hourOptions(): readonly number[] {
    return this.hourFormat() === 12
      ? Array.from({ length: 12 }, (_, index) => index + 1)
      : Array.from({ length: 24 }, (_, index) => index);
  }

  get minuteOptions(): readonly number[] {
    return steppedOptions(this.minuteStepInternal());
  }

  get secondOptions(): readonly number[] {
    return steppedOptions(1);
  }

  get displayHour(): number {
    if (this.hourFormat() === 24) {
      return this.hour;
    }
    const hour = this.hour % 12;
    return hour === 0 ? 12 : hour;
  }

  get displayValue(): string {
    if (!this.value) {
      return '';
    }

    if (this.hourFormat() === 24) {
      return this.value;
    }

    return `${this.pad(this.displayHour)}:${this.pad(this.minute)}${this.showSeconds() ? `:${this.pad(this.second)}` : ''} ${this.period}`;
  }

  writeValue(value: string | null | undefined): void {
    this.value = normalizeTime(value, this.showSeconds());
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
    this.formDisabled.set(isDisabled);
    if (isDisabled) {
      this.close();
    }
    this.changeDetectorRef.markForCheck();
  }

  toggle(): void {
    this.isOpen ? this.close() : this.open();
  }

  open(): void {
    if (this.isDisabled() || this.readonly() || this.isOpen) {
      return;
    }
    if (!this.value) {
      this.setPartsFromDate(new Date());
    }
    this.isOpen = true;
    this.opened.emit();
    this.changeDetectorRef.markForCheck();
    queueMicrotask(() => {
      const panel = this.panelRef?.nativeElement;
      if (panel) {
        this.overlayHandle = this.overlay.attach(this.hostRef.nativeElement, panel, {
          appendTo: this.appendTo(),
          matchWidth: false,
        });
      }
    });
  }

  close(): void {
    if (!this.isOpen) {
      return;
    }
    this.overlayHandle?.detach();
    this.overlayHandle = undefined;
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
    if (this.isDisabled() || this.readonly()) return;
    const nextHour = Number((event.target as HTMLSelectElement).value);
    if (this.hourFormat() === 12) {
      this.hour = this.toTwentyFourHour(nextHour, this.period);
    } else {
      this.hour = nextHour;
    }
    this.commit();
  }

  handleMinuteChange(event: Event): void {
    if (this.isDisabled() || this.readonly()) return;
    this.minute = Number((event.target as HTMLSelectElement).value);
    this.commit();
  }

  handleSecondChange(event: Event): void {
    if (this.isDisabled() || this.readonly()) return;
    this.second = Number((event.target as HTMLSelectElement).value);
    this.commit();
  }

  handlePeriodChange(event: Event): void {
    if (this.isDisabled() || this.readonly()) return;
    this.period = (event.target as HTMLSelectElement).value === 'PM' ? 'PM' : 'AM';
    this.hour = this.toTwentyFourHour(this.displayHour, this.period);
    this.commit();
  }

  selectNow(): void {
    if (this.isDisabled() || this.readonly()) return;
    this.setPartsFromDate(new Date());
    this.commit();
  }

  clearValue(event?: Event): void {
    event?.stopPropagation();
    if (this.isDisabled() || this.readonly()) {
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
    if (this.isDisabled() || this.readonly()) return;
    this.value = `${this.pad(this.hour)}:${this.pad(this.minute)}${this.showSeconds() ? `:${this.pad(this.second)}` : ''}`;
    this.onChange(this.value || null);
    this.valueChange.emit(this.value || null);
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
    const roundedMinute =
      Math.floor(date.getMinutes() / this.minuteStepInternal()) * this.minuteStepInternal();
    this.minute = clamp(roundedMinute, 0, 59);
    this.second = this.showSeconds() ? date.getSeconds() : 0;
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
