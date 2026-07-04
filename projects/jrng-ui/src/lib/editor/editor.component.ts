import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  forwardRef,
  booleanAttribute,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'j-editor',
  imports: [],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => JEditorComponent),
      multi: true,
    },
  ],
  template: `
    <label class="j-editor" [class.is-disabled]="disabled">
      @if (label) {
        <span class="j-editor__label">{{ label }}</span>
      }
      <textarea
        class="j-editor__control"
        [attr.placeholder]="placeholder || null"
        [rows]="rows"
        [value]="value"
        [disabled]="disabled"
        [readonly]="readonly"
        (input)="handleInput($event)"
        (blur)="onTouched()"
      ></textarea>
      <small class="j-editor__hint"
        >Rich text toolbar is pending; current editor is a lightweight text-area API
        placeholder.</small
      >
    </label>
  `,
  styles: [
    `
      .j-editor {
        color: var(--j-color-text, #111827);
        display: grid;
        gap: var(--j-spacing-xs, 0.25rem);
      }

      .j-editor__label {
        font-size: var(--j-font-size-sm, 0.875rem);
        font-weight: var(--j-font-weight-medium, 550);
      }

      .j-editor__control {
        background: var(--j-color-surface, #ffffff);
        border: 1px solid var(--j-color-border, #dbe2ea);
        border-radius: var(--j-radius-md, 0.5rem);
        color: var(--j-color-text, #111827);
        font: inherit;
        min-height: 8rem;
        padding: var(--j-spacing-md, 0.75rem);
        resize: vertical;
      }

      .j-editor__control:focus-visible {
        box-shadow: var(--j-focus-ring, 0 0 0 3px rgb(79 70 229 / 24%));
        outline: none;
      }

      .j-editor__hint {
        color: var(--j-color-text-muted, #64748b);
      }

      .j-editor.is-disabled {
        opacity: var(--j-disabled-opacity, 0.55);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JEditorComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() rows = 6;
  @Input({ transform: booleanAttribute }) readonly = false;
  @Input({ transform: booleanAttribute }) disabled = false;
  @Output() valueChange = new EventEmitter<string>();

  value = '';
  private onChange: (value: string) => void = () => undefined;
  onTouched: () => void = () => undefined;

  writeValue(value: string | null): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  handleInput(event: Event): void {
    const input = event.target as HTMLTextAreaElement | null;
    const value = input?.value ?? '';
    this.value = value;
    this.onChange(value);
    this.valueChange.emit(value);
  }
}
