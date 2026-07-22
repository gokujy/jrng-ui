import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  forwardRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { jCreateId } from 'jrng-ui/core';
import { JComponentSize } from 'jrng-ui/core';

@Component({
  selector: 'j-radio',
  imports: [],
  template: `
    <label [class]="rootClasses">
      <input
        class="j-radio__input"
        type="radio"
        [id]="id()"
        [name]="name()"
        [checked]="selected"
        [disabled]="isDisabled()"
        [required]="required()"
        [readOnly]="readonly()"
        [attr.aria-invalid]="invalid() ? 'true' : null"
        (change)="handleChange()"
        (blur)="handleBlur()"
      />
      <span class="j-radio__mark" aria-hidden="true"></span>
      <span class="j-radio__label">
        <ng-content></ng-content>
        @if (label()) {
          <span>{{ label() }}</span>
        }
        @if (required()) {
          <span class="j-radio__required" aria-hidden="true">*</span>
        }
      </span>
    </label>
  `,
  styles: [
    `
      :host {
        display: inline-block;
      }

      .j-radio {
        align-items: center;
        color: var(--j-color-text);
        cursor: pointer;
        display: inline-flex;
        gap: var(--j-spacing-sm);
      }

      .j-radio.is-disabled {
        cursor: not-allowed;
        opacity: var(--j-disabled-opacity);
      }

      .j-radio__input {
        height: 1px;
        opacity: 0;
        position: absolute;
        width: 1px;
      }

      .j-radio__mark {
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-full);
        display: inline-flex;
        flex: 0 0 auto;
        height: 1rem;
        width: 1rem;
      }

      .j-radio--sm .j-radio__mark {
        height: 0.875rem;
        width: 0.875rem;
      }

      .j-radio--lg .j-radio__mark {
        height: 1.25rem;
        width: 1.25rem;
      }

      .j-radio__input:checked + .j-radio__mark {
        border: 0.3rem solid var(--j-color-primary);
      }

      .j-radio__input:focus-visible + .j-radio__mark {
        box-shadow: var(--j-focus-ring);
      }

      .j-radio.is-invalid .j-radio__mark {
        border-color: var(--j-color-danger);
      }

      .j-radio__label {
        align-items: center;
        display: inline-flex;
        gap: var(--j-spacing-xs);
        font-size: var(--j-font-size-sm);
      }

      .j-radio__required {
        color: var(--j-color-danger);
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => JRadioComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JRadioComponent implements ControlValueAccessor {
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  readonly id = input(jCreateId('j-radio'));
  readonly name = input('');
  readonly label = input('');
  readonly value = input<unknown>('');
  readonly styleClass = input('');
  readonly size = input<JComponentSize>('md');
  readonly required = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });

  readonly valueChange = output<unknown>();

  selectedValue: unknown = null;
  readonly isDisabled = signal(false);

  private onChange: (value: unknown) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor() {
    effect(() => this.isDisabled.set(this.disabled()));
  }

  get selected(): boolean {
    return Object.is(this.selectedValue, this.value());
  }

  get rootClasses(): string {
    return [
      'j-radio',
      `j-radio--${this.size()}`,
      this.selected ? 'is-selected' : '',
      this.isDisabled() ? 'is-disabled' : '',
      this.invalid() ? 'is-invalid' : '',
      this.styleClass(),
    ]
      .filter(Boolean)
      .join(' ');
  }

  writeValue(value: unknown): void {
    this.selectedValue = value ?? null;
    this.changeDetectorRef.markForCheck();
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
    this.changeDetectorRef.markForCheck();
  }

  handleChange(): void {
    if (this.readonly()) {
      return;
    }
    this.selectedValue = this.value();
    this.onChange(this.value());
    this.valueChange.emit(this.value());
  }

  handleBlur(): void {
    this.onTouched();
  }
}
