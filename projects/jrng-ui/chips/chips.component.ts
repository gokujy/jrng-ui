import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  contentChild,
  effect,
  forwardRef,
  inject,
  input,
  numberAttribute,
  output,
  TemplateRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';
import { jCreateId, JSeverity } from 'jrng-ui/core';
import { JChipComponent, JChipItem, JChipVariant } from 'jrng-ui/chip';

@Component({
  selector: 'j-chips',
  imports: [JChipComponent, NgTemplateOutlet],
  template: `
    <div
      [class]="rootClasses"
      data-jc-name="chips"
      data-jc-section="root"
      data-jc-extend="chip input remove"
      [attr.data-j-disabled]="isDisabled ? 'true' : null"
      [attr.data-j-invalid]="hasError ? 'true' : null"
      tabindex="0"
      (click)="input.focus()"
      (keydown.enter)="input.focus()"
      (keydown.space)="input.focus(); $event.preventDefault()"
    >
      @if (label()) {
        <label class="j-chips__label" data-jc-section="label" [for]="id()">
          <span>{{ label() }}</span>
          @if (required()) {
            <span class="j-chips__required" aria-hidden="true">*</span>
          }
        </label>
      }
      <div class="j-chips" data-jc-section="control">
        @for (item of value; track item; let i = $index) {
          @if (itemTemplate(); as template) {
            <ng-container
              [ngTemplateOutlet]="template"
              [ngTemplateOutletContext]="{ $implicit: item, index: i }"
            />
          } @else {
            <j-chip
              data-jc-section="chip"
              [label]="item.label"
              [icon]="item.icon || ''"
              [severity]="item.severity || severity()"
              [variant]="variant()"
              [disabled]="item.disabled || isDisabled || readonly()"
              [removable]="item.removable !== false && !item.disabled"
              [removeAriaLabel]="'Remove ' + item.label"
              (remove)="removeAt(i)"
            />
          }
        }
        <input
          #input
          class="j-chips__input"
          data-jc-section="input"
          [id]="id()"
          type="text"
          [placeholder]="value.length ? '' : placeholder()"
          [disabled]="isDisabled"
          [readOnly]="readonly()"
          [value]="draft"
          (input)="handleInput($event)"
          (keydown)="handleKeydown($event)"
          (blur)="handleBlur()"
        />
      </div>
      @if (hasError && error()) {
        <p class="j-chips__message j-chips__message--error">{{ error() }}</p>
      }
      @if (hint() && !hasError) {
        <p class="j-chips__message">{{ hint() }}</p>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .j-chips-field {
        display: block;
      }

      .j-chips__label {
        display: inline-flex;
        font-size: var(--j-font-size-sm);
        font-weight: var(--j-font-weight-semibold);
        gap: var(--j-spacing-xs);
        margin-bottom: var(--j-spacing-sm);
      }

      .j-chips__required,
      .j-chips__message--error {
        color: var(--j-color-danger);
      }

      .j-chips {
        align-items: center;
        background: var(--j-color-surface);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-md);
        display: flex;
        flex-wrap: wrap;
        gap: var(--j-spacing-xs);
        min-height: 2.5rem;
        padding: var(--j-spacing-xs);
      }

      .j-chips-field.is-invalid .j-chips {
        border-color: var(--j-color-danger);
      }

      .j-chips:focus-within {
        border-color: var(--j-color-primary);
        box-shadow: var(--j-focus-ring);
      }

      .j-chips__chip {
        align-items: center;
        background: var(--j-color-surface-muted);
        border-radius: var(--j-radius-full);
        display: inline-flex;
        font-size: var(--j-font-size-sm);
        gap: var(--j-spacing-xs);
        min-height: 1.75rem;
        padding: 0 var(--j-spacing-sm);
      }

      .j-chips__chip button {
        background: transparent;
        border: 0;
        color: inherit;
        cursor: pointer;
        font: inherit;
        padding: 0;
      }

      .j-chips__input {
        background: transparent;
        border: 0;
        color: var(--j-color-text);
        flex: 1;
        font: inherit;
        min-width: 8rem;
        outline: none;
      }

      .j-chips__message {
        color: var(--j-color-text-muted);
        font-size: var(--j-font-size-xs);
        margin: var(--j-spacing-sm) 0 0;
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => JChipsComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JChipsComponent implements ControlValueAccessor {
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  readonly id = input(jCreateId('j-chips'));
  readonly label = input('');
  readonly placeholder = input('');
  readonly hint = input('');
  readonly error = input('');
  readonly styleClass = input('');
  readonly separator = input(',');
  readonly separators = input<readonly string[]>([]);
  readonly max = input(0, { transform: numberAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly allowDuplicate = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly severity = input<JSeverity>('neutral');
  readonly variant = input<JChipVariant>('soft');

  readonly itemTemplate =
    contentChild<TemplateRef<{ $implicit: JChipItem; index: number }>>('item');

  readonly valueChange = output<readonly JChipItem[]>();
  readonly add = output<JChipItem>();
  readonly remove = output<JChipItem>();

  value: readonly JChipItem[] = [];
  draft = '';
  isDisabled = false;

  private onChange: (value: readonly JChipItem[]) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor() {
    effect(() => {
      this.isDisabled = this.disabled();
      this.changeDetectorRef.markForCheck();
    });
  }

  get hasError(): boolean {
    return this.invalid() || this.error().trim().length > 0;
  }

  get rootClasses(): string {
    return [
      'j-chips-field',
      this.hasError ? 'is-invalid' : '',
      this.isDisabled ? 'is-disabled' : '',
      this.styleClass(),
    ]
      .filter(Boolean)
      .join(' ');
  }

  writeValue(value: readonly JChipItem[] | null | undefined): void {
    this.value = Array.isArray(value) ? value.map((item) => ({ ...item })) : [];
    this.changeDetectorRef.markForCheck();
  }

  registerOnChange(fn: (value: readonly JChipItem[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    this.changeDetectorRef.markForCheck();
  }

  handleInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.draft = target.value;

    for (const separator of this.separatorList) {
      if (separator && this.draft.includes(separator)) {
        const parts = this.draft.split(separator);
        parts.slice(0, -1).forEach((part) => this.addValue(part));
        this.draft = parts.at(-1) ?? '';
        target.value = this.draft;
        return;
      }
    }
  }

  handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addValue(this.draft);
      this.draft = '';
    }

    if (event.key === 'Backspace' && !this.draft && this.value.length) {
      this.removeAt(this.value.length - 1);
    }
  }

  handleBlur(): void {
    this.addValue(this.draft);
    this.draft = '';
    this.onTouched();
  }

  removeAt(index: number): void {
    const removed = this.value[index];
    if (removed == null) {
      return;
    }
    this.commit(this.value.filter((_, itemIndex) => itemIndex !== index));
    this.remove.emit(removed);
  }

  private addValue(rawValue: string): void {
    const next = rawValue.trim();
    if (
      !next ||
      (this.max() > 0 && this.value.length >= this.max()) ||
      (!this.allowDuplicate() && this.value.some((item) => item.label === next))
    ) {
      return;
    }
    const item: JChipItem = { label: next, severity: this.severity() };
    this.commit([...this.value, item]);
    this.add.emit(item);
  }

  private commit(value: readonly JChipItem[]): void {
    this.value = value.map((item) => ({ ...item }));
    this.onChange(this.value);
    this.valueChange.emit(this.value);
    this.changeDetectorRef.markForCheck();
  }

  private get separatorList(): readonly string[] {
    return this.separators().length ? this.separators() : [this.separator()].filter(Boolean);
  }
}
