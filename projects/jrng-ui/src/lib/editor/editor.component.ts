import { NgTemplateOutlet, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  PLATFORM_ID,
  TemplateRef,
  booleanAttribute,
  contentChild,
  forwardRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { jCreateId } from '../core/id';

export type JEditorFormat = 'html' | 'text';
export type JEditorBlock = 'p' | 'h1' | 'h2' | 'h3' | 'blockquote' | 'pre';

@Component({
  selector: 'j-editor',
  imports: [NgTemplateOutlet],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => JEditorComponent),
      multi: true,
    },
  ],
  template: `
    <section
      class="j-editor"
      [class]="styleClass()"
      [class.is-disabled]="isDisabled()"
      data-jc-name="editor"
      data-jc-section="root"
      data-jc-extend="toolbar editable rich-text"
      [attr.data-j-disabled]="isDisabled() ? 'true' : null"
    >
      @if (label()) {
        <label class="j-editor__label" [attr.for]="editorId">{{ label() }}</label>
      }

      <div class="j-editor__surface">
        <div class="j-editor__toolbar" data-jc-section="toolbar" role="toolbar" [attr.aria-label]="toolbarLabel()">
          @if (toolbarTemplate(); as template) {
            <ng-container [ngTemplateOutlet]="template" />
          } @else {
            <button type="button" class="j-editor__tool" [disabled]="isDisabled()" (click)="execute('bold')" aria-label="Bold">B</button>
            <button type="button" class="j-editor__tool" [disabled]="isDisabled()" (click)="execute('italic')" aria-label="Italic">I</button>
            <button type="button" class="j-editor__tool" [disabled]="isDisabled()" (click)="execute('underline')" aria-label="Underline">U</button>
            <button type="button" class="j-editor__tool" [disabled]="isDisabled()" (click)="execute('strikeThrough')" aria-label="Strike">S</button>
            <select class="j-editor__select" [disabled]="isDisabled()" (change)="setBlock($event)" aria-label="Block style">
              <option value="p">Paragraph</option>
              <option value="h1">Heading 1</option>
              <option value="h2">Heading 2</option>
              <option value="h3">Heading 3</option>
              <option value="blockquote">Quote</option>
              <option value="pre">Code block</option>
            </select>
            <button type="button" class="j-editor__tool" [disabled]="isDisabled()" (click)="execute('insertOrderedList')" aria-label="Ordered list">1.</button>
            <button type="button" class="j-editor__tool" [disabled]="isDisabled()" (click)="execute('insertUnorderedList')" aria-label="Unordered list">-</button>
            <button type="button" class="j-editor__tool" [disabled]="isDisabled()" (click)="createLink()" aria-label="Link">Link</button>
            <button type="button" class="j-editor__tool" [disabled]="isDisabled()" (click)="insertImage()" aria-label="Image">Image</button>
            <button type="button" class="j-editor__tool" [disabled]="isDisabled()" (click)="clearFormatting()" aria-label="Clear formatting">Clear</button>
          }
        </div>

        <div
          #editable
          class="j-editor__control"
          data-jc-section="editable"
          role="textbox"
          aria-multiline="true"
          contenteditable="true"
          [id]="editorId"
          [attr.aria-label]="ariaLabel() || label() || 'Editor'"
          [attr.aria-readonly]="readonly() || null"
          [attr.data-placeholder]="placeholder()"
          [class.is-empty]="isEmpty()"
          (input)="handleInput()"
          (blur)="markTouched()"
          (paste)="handlePaste($event)"
        ></div>
      </div>

      @if (hint()) {
        <small class="j-editor__hint">{{ hint() }}</small>
      }
    </section>
  `,
  styles: [
    `
      .j-editor {
        color: var(--j-color-foreground);
        display: grid;
        gap: var(--j-spacing-2);
      }

      .j-editor__label {
        font-size: var(--j-font-size-sm);
        font-weight: var(--j-font-weight-semibold);
      }

      .j-editor__surface {
        background: var(--j-color-card);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-lg);
        overflow: hidden;
      }

      .j-editor__toolbar {
        align-items: center;
        background: var(--j-color-muted);
        border-bottom: 1px solid var(--j-color-border);
        display: flex;
        flex-wrap: wrap;
        gap: var(--j-spacing-1);
        padding: var(--j-spacing-2);
      }

      .j-editor__tool,
      .j-editor__select {
        background: var(--j-color-card);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-md);
        color: inherit;
        cursor: pointer;
        font: inherit;
        min-height: 2rem;
        padding: 0 var(--j-spacing-2);
      }

      .j-editor__tool:disabled,
      .j-editor__select:disabled {
        cursor: not-allowed;
        opacity: var(--j-disabled-opacity);
      }

      .j-editor__control {
        min-height: 12rem;
        outline: none;
        padding: var(--j-spacing-4);
      }

      .j-editor__control:focus-visible {
        box-shadow: inset var(--j-focus-ring);
      }

      .j-editor__control.is-empty::before {
        color: var(--j-color-muted-foreground);
        content: attr(data-placeholder);
        pointer-events: none;
      }

      .j-editor__hint {
        color: var(--j-color-muted-foreground);
      }

      .j-editor.is-disabled {
        opacity: var(--j-disabled-opacity);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JEditorComponent implements ControlValueAccessor {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private updatingView = false;

  readonly label = input('');
  readonly placeholder = input('');
  readonly hint = input('');
  readonly ariaLabel = input('');
  readonly toolbarLabel = input('Editor toolbar');
  readonly outputFormat = input<JEditorFormat>('html');
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly styleClass = input('');

  readonly valueChange = output<string>();

  readonly editable = viewChild<ElementRef<HTMLElement>>('editable');
  readonly toolbarTemplate = contentChild<unknown, TemplateRef<unknown>>('jEditorToolbar', { read: TemplateRef });
  readonly value = signal('');
  readonly formDisabled = signal(false);
  readonly isEmpty = signal(true);
  readonly editorId = jCreateId('j-editor');

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  isDisabled(): boolean {
    return this.disabled() || this.formDisabled();
  }

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
    this.syncView();
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
    const editable = this.editable()?.nativeElement;
    if (editable) {
      editable.setAttribute('contenteditable', String(!isDisabled && !this.readonly()));
    }
  }

  handleInput(): void {
    if (this.updatingView) {
      return;
    }
    const editable = this.editable()?.nativeElement;
    const next = this.outputFormat() === 'text' ? editable?.innerText ?? '' : editable?.innerHTML ?? '';
    this.value.set(next);
    this.isEmpty.set(!editable?.textContent?.trim());
    this.onChange(next);
    this.valueChange.emit(next);
  }

  markTouched(): void {
    this.onTouched();
  }

  execute(command: string, value?: string): void {
    if (!this.canEdit()) {
      return;
    }
    this.focusEditable();
    this.documentRef()?.execCommand(command, false, value);
    this.handleInput();
  }

  setBlock(event: Event): void {
    const value = (event.target as HTMLSelectElement | null)?.value as JEditorBlock | undefined;
    if (!value) {
      return;
    }
    this.execute('formatBlock', value);
  }

  createLink(): void {
    const url = this.prompt('Enter URL');
    if (url) {
      this.execute('createLink', url);
    }
  }

  insertImage(): void {
    const url = this.prompt('Enter image URL');
    if (url) {
      this.execute('insertImage', url);
    }
  }

  clearFormatting(): void {
    this.execute('removeFormat');
  }

  handlePaste(event: ClipboardEvent): void {
    if (this.readonly() || this.isDisabled()) {
      event.preventDefault();
    }
  }

  private canEdit(): boolean {
    return this.isBrowser && !this.readonly() && !this.isDisabled();
  }

  private focusEditable(): void {
    this.editable()?.nativeElement.focus();
  }

  private syncView(): void {
    queueMicrotask(() => {
      const editable = this.editable()?.nativeElement;
      if (!editable) {
        return;
      }
      this.updatingView = true;
      editable.innerHTML = this.value();
      editable.setAttribute('contenteditable', String(!this.isDisabled() && !this.readonly()));
      this.isEmpty.set(!editable.textContent?.trim());
      this.updatingView = false;
    });
  }

  private documentRef(): Document | null {
    return this.editable()?.nativeElement.ownerDocument ?? null;
  }

  private prompt(message: string): string {
    return this.documentRef()?.defaultView?.prompt(message) ?? '';
  }
}
