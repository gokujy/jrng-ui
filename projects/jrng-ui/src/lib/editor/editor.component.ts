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
import { jCreateId } from 'jrng-ui/core';
import { jIsSafeEditorUrl, jSanitizeEditorHtml } from './editor-sanitizer';

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
        <div
          class="j-editor__toolbar"
          data-jc-section="toolbar"
          role="toolbar"
          [attr.aria-label]="toolbarLabel()"
          (mousedown)="handleToolbarMouseDown($event)"
        >
          @if (toolbarTemplate(); as template) {
            <ng-container [ngTemplateOutlet]="template" />
          } @else {
            <button
              type="button"
              class="j-editor__tool"
              [disabled]="isDisabled()"
              (click)="execute('bold')"
              aria-label="Bold"
            >
              B
            </button>
            <button
              type="button"
              class="j-editor__tool"
              [disabled]="isDisabled()"
              (click)="execute('italic')"
              aria-label="Italic"
            >
              I
            </button>
            <button
              type="button"
              class="j-editor__tool"
              [disabled]="isDisabled()"
              (click)="execute('underline')"
              aria-label="Underline"
            >
              U
            </button>
            <button
              type="button"
              class="j-editor__tool"
              [disabled]="isDisabled()"
              (click)="execute('strikeThrough')"
              aria-label="Strike"
            >
              S
            </button>
            <select
              class="j-editor__select"
              [disabled]="isDisabled()"
              (change)="setBlock($event)"
              aria-label="Block style"
            >
              <option value="p">Paragraph</option>
              <option value="h1">Heading 1</option>
              <option value="h2">Heading 2</option>
              <option value="h3">Heading 3</option>
              <option value="blockquote">Quote</option>
              <option value="pre">Code block</option>
            </select>
            <button
              type="button"
              class="j-editor__tool"
              [disabled]="isDisabled()"
              (click)="execute('insertOrderedList')"
              aria-label="Ordered list"
            >
              1.
            </button>
            <button
              type="button"
              class="j-editor__tool"
              [disabled]="isDisabled()"
              (click)="execute('insertUnorderedList')"
              aria-label="Unordered list"
            >
              -
            </button>
            <button
              type="button"
              class="j-editor__tool"
              [disabled]="isDisabled()"
              (click)="createLink()"
              aria-label="Link"
            >
              Link
            </button>
            <button
              type="button"
              class="j-editor__tool"
              [disabled]="isDisabled()"
              (click)="insertImage()"
              aria-label="Image"
            >
              Image
            </button>
            <button
              type="button"
              class="j-editor__tool"
              [disabled]="isDisabled()"
              (click)="clearFormatting()"
              aria-label="Clear formatting"
            >
              Clear
            </button>
            <button
              type="button"
              class="j-editor__tool"
              [disabled]="isDisabled()"
              (click)="execute('justifyLeft')"
              aria-label="Align left"
            >
              Left
            </button>
            <button
              type="button"
              class="j-editor__tool"
              [disabled]="isDisabled()"
              (click)="execute('justifyCenter')"
              aria-label="Align center"
            >
              Center
            </button>
            <button
              type="button"
              class="j-editor__tool"
              [disabled]="isDisabled()"
              (click)="execute('justifyRight')"
              aria-label="Align right"
            >
              Right
            </button>
            <button
              type="button"
              class="j-editor__tool"
              [disabled]="isDisabled()"
              (click)="execute('undo')"
              aria-label="Undo"
            >
              Undo
            </button>
            <button
              type="button"
              class="j-editor__tool"
              [disabled]="isDisabled()"
              (click)="execute('redo')"
              aria-label="Redo"
            >
              Redo
            </button>
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
          (mouseup)="rememberSelection()"
          (keyup)="rememberSelection()"
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
  private savedRange: Range | null = null;

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
  readonly toolbarTemplate = contentChild<unknown, TemplateRef<unknown>>('jEditorToolbar', {
    read: TemplateRef,
  });
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
    const next = value ?? '';
    this.value.set(this.outputFormat() === 'html' ? this.sanitize(next) : next);
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
    const raw =
      this.outputFormat() === 'text' ? (editable?.innerText ?? '') : (editable?.innerHTML ?? '');
    const next = this.outputFormat() === 'text' ? raw : this.sanitize(raw);
    if (editable && next !== raw) editable.innerHTML = next;
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
    this.restoreSelection();
    this.documentRef()?.execCommand(command, false, value);
    this.handleInput();
    this.rememberSelection();
  }

  handleToolbarMouseDown(event: MouseEvent): void {
    if ((event.target as HTMLElement | null)?.closest('button')) {
      event.preventDefault();
    }
  }

  rememberSelection(): void {
    const editable = this.editable()?.nativeElement;
    const selection = this.documentRef()?.getSelection();
    if (!editable || !selection?.rangeCount) return;
    const range = selection.getRangeAt(0);
    if (editable.contains(range.commonAncestorContainer)) {
      this.savedRange = range.cloneRange();
    }
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
    if (url && this.isSafeUrl(url)) {
      this.execute('createLink', url);
    }
  }

  insertImage(): void {
    const url = this.prompt('Enter image URL');
    if (url && this.isSafeUrl(url)) {
      this.execute('insertImage', url);
    }
  }

  clearFormatting(): void {
    this.execute('removeFormat');
  }

  handlePaste(event: ClipboardEvent): void {
    if (this.readonly() || this.isDisabled()) {
      event.preventDefault();
      return;
    }
    const html = event.clipboardData?.getData('text/html');
    const text = event.clipboardData?.getData('text/plain') ?? '';
    if (!html && !text) return;
    event.preventDefault();
    const safe = html ? this.sanitize(html) : this.escapeText(text);
    this.documentRef()?.execCommand('insertHTML', false, safe);
    this.handleInput();
  }

  private canEdit(): boolean {
    return this.isBrowser && !this.readonly() && !this.isDisabled();
  }

  private focusEditable(): void {
    this.editable()?.nativeElement.focus();
  }

  private restoreSelection(): void {
    this.focusEditable();
    if (!this.savedRange) return;
    const selection = this.documentRef()?.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(this.savedRange);
  }

  private syncView(): void {
    queueMicrotask(() => {
      const editable = this.editable()?.nativeElement;
      if (!editable) {
        return;
      }
      this.updatingView = true;
      editable.innerHTML =
        this.outputFormat() === 'html'
          ? this.sanitize(this.value())
          : this.escapeText(this.value());
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

  private sanitize(value: string): string {
    const documentRef = this.documentRef();
    return documentRef ? jSanitizeEditorHtml(value, documentRef) : '';
  }

  private isSafeUrl(value: string): boolean {
    const documentRef = this.documentRef();
    return !!documentRef && jIsSafeEditorUrl(value, documentRef);
  }

  private escapeText(value: string): string {
    const documentRef = this.documentRef();
    if (!documentRef) return '';
    const element = documentRef.createElement('div');
    element.textContent = value;
    return element.innerHTML.replaceAll('\n', '<br>');
  }
}
