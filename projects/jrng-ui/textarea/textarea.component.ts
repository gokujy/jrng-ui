import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  ElementRef,
  forwardRef,
  inject,
  input,
  numberAttribute,
  output,
  signal,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { jAriaDescribedBy } from 'jrng-ui/core';
import { jCreateId } from 'jrng-ui/core';
import { JPassThrough, jMergePartClasses } from 'jrng-ui/core';
import { JComponentSize } from 'jrng-ui/core';
import { JInputVariant } from 'jrng-ui/input';

@Component({
  selector: 'j-textarea',
  imports: [],
  template: `
    @if (label()) {
      <label class="j-textarea__label" data-jc-name="textarea" data-jc-section="label" [for]="id()">
        <span>{{ label() }}</span>
        @if (required()) {
          <span class="j-textarea__required" aria-hidden="true">*</span>
        }
      </label>
    }
    <textarea
      #textarea
      [class]="textareaClasses"
      data-jc-name="textarea"
      data-jc-section="root"
      [attr.data-j-disabled]="isDisabled() ? 'true' : null"
      [attr.data-j-invalid]="hasError ? 'true' : null"
      [attr.data-j-active]="value ? 'true' : null"
      [id]="id()"
      [name]="name() || null"
      [placeholder]="placeholder()"
      [disabled]="isDisabled()"
      [readOnly]="readonly()"
      [required]="required()"
      [rows]="rows()"
      [maxLength]="maxLength() || null"
      [value]="value"
      [attr.aria-invalid]="hasError ? 'true' : null"
      [attr.aria-describedby]="describedBy"
      (input)="handleInput($event)"
      (blur)="handleBlur()"
    ></textarea>
    @if (clearable() && value) {
      <button
        class="j-textarea__clear"
        data-jc-section="clear"
        type="button"
        aria-label="Clear"
        [disabled]="isDisabled() || readonly()"
        (click)="clearValue()"
      >
        x
      </button>
    }
    @if ((hint() && !hasError) || showCount()) {
      <div class="j-textarea__meta">
        @if (hint() && !hasError) {
          <p class="j-textarea__message" [id]="hintId">{{ hint() }}</p>
        }
        @if (showCount()) {
          <span class="j-textarea__count"
            >{{ value.length }}{{ maxLength() ? '/' + maxLength() : '' }}</span
          >
        }
      </div>
    }
    @if (hasError && error()) {
      <p class="j-textarea__message j-textarea__message--error" [id]="errorId">
        {{ error() }}
      </p>
    }
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }

      .j-textarea__label {
        display: inline-flex;
        font-size: var(--j-font-size-sm);
        font-weight: var(--j-font-weight-semibold);
        gap: var(--j-spacing-xs);
        margin-bottom: var(--j-spacing-sm);
      }

      .j-textarea__required,
      .j-textarea__message--error {
        color: var(--j-color-danger);
      }

      .j-textarea {
        background: var(--j-color-surface);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-md);
        box-sizing: border-box;
        color: var(--j-color-text);
        display: block;
        font: inherit;
        line-height: var(--j-line-height-normal);
        min-height: 5rem;
        padding: var(--j-spacing-md);
        resize: vertical;
        transition: var(--j-transition-colors), var(--j-transition-shadow);
        width: 100%;
      }

      .j-textarea__clear {
        background: transparent;
        border: 0;
        color: var(--j-color-muted-foreground);
        cursor: pointer;
        font: inherit;
        margin-top: var(--j-spacing-sm);
        padding: 0;
      }

      .j-textarea--filled {
        background: var(--j-color-surface-muted);
      }

      .j-textarea--sm {
        font-size: var(--j-font-size-sm);
      }

      .j-textarea--md {
        font-size: var(--j-font-size-sm);
      }

      .j-textarea--lg {
        font-size: var(--j-font-size-md);
      }

      .j-textarea--fluid {
        width: 100%;
      }

      .j-textarea:focus-visible {
        border-color: var(--j-color-primary);
        box-shadow: var(--j-focus-ring);
        outline: none;
      }

      .j-textarea.is-invalid {
        border-color: var(--j-color-danger);
      }

      .j-textarea.is-disabled {
        background: var(--j-color-surface-subtle);
        opacity: var(--j-disabled-opacity);
      }

      .j-textarea__meta {
        align-items: center;
        display: flex;
        gap: var(--j-spacing-sm);
        justify-content: space-between;
      }

      .j-textarea__message,
      .j-textarea__count {
        color: var(--j-color-text-muted);
        font-size: var(--j-font-size-xs);
        margin: var(--j-spacing-sm) 0 0;
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => JTextareaComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JTextareaComponent implements ControlValueAccessor {
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  @ViewChild('textarea') private textareaRef?: ElementRef<HTMLTextAreaElement>;

  readonly id = input(jCreateId('j-textarea'));
  readonly name = input('');
  readonly label = input('');
  readonly placeholder = input('');
  readonly hint = input('');
  readonly error = input('');
  readonly styleClass = input('');
  readonly pt = input<JPassThrough | null>(null);
  readonly ariaDescribedby = input('', { alias: 'aria-describedby' });
  readonly size = input<JComponentSize>('md');
  readonly variant = input<JInputVariant>('outlined');
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly clearable = input(false, { transform: booleanAttribute });
  readonly autoResize = input(false, { transform: booleanAttribute });
  readonly showCount = input(false, { transform: booleanAttribute });
  readonly fluid = input(false, { transform: booleanAttribute });
  readonly fullWidth = input(false, { transform: booleanAttribute });
  readonly rows = input(3, { transform: numberAttribute });
  readonly maxLength = input(0, { transform: numberAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });

  readonly valueChange = output<string>();
  readonly clear = output<void>();

  readonly hintId = jCreateId('j-textarea-hint');
  readonly errorId = jCreateId('j-textarea-error');
  value = '';
  readonly isDisabled = signal(false);

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor() {
    effect(() => this.isDisabled.set(this.disabled()));
  }

  get hasError(): boolean {
    return this.invalid() || this.error().trim().length > 0;
  }

  get describedBy(): string | null {
    return jAriaDescribedBy(
      this.ariaDescribedby(),
      this.hasError ? this.errorId : null,
      this.hint() ? this.hintId : null,
    );
  }

  get textareaClasses(): string {
    return jMergePartClasses(
      [
        'j-textarea',
        `j-textarea--${this.size()}`,
        `j-textarea--${this.variant()}`,
        this.hasError ? 'is-invalid' : '',
        this.isDisabled() ? 'is-disabled' : '',
        this.fluid() || this.fullWidth() ? 'j-textarea--fluid' : '',
      ],
      this.styleClass(),
      this.pt(),
    );
  }

  writeValue(value: string | number | null | undefined): void {
    this.value = value == null ? '' : String(value);
    this.resize();
    this.changeDetectorRef.markForCheck();
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
    this.changeDetectorRef.markForCheck();
  }

  handleInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.value = target.value;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
    this.resize();
  }

  handleBlur(): void {
    this.onTouched();
  }

  clearValue(): void {
    if (this.isDisabled() || this.readonly() || !this.value) {
      return;
    }

    this.value = '';
    this.onChange(this.value);
    this.valueChange.emit(this.value);
    this.clear.emit();
    this.resize();
    this.changeDetectorRef.markForCheck();
  }

  private resize(): void {
    if (!this.autoResize()) {
      return;
    }

    queueMicrotask(() => {
      const element = this.textareaRef?.nativeElement;

      if (!element) {
        return;
      }

      element.style.height = 'auto';
      element.style.height = `${element.scrollHeight}px`;
    });
  }
}
