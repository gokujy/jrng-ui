import { DOCUMENT, NgTemplateOutlet, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  TemplateRef,
  booleanAttribute,
  computed,
  contentChild,
  effect,
  forwardRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import { jCreateId } from 'jrng-ui/core';
import {
  JEditorImageAdapter,
  JEditorSanitizerAdapter,
  jIsSafeEditorUrl,
  jSanitizeEditorHtml,
} from './editor-sanitizer';
import { JEditorCommandService } from './editor-command.service';

export type JEditorFormat = 'html' | 'text';
export type JEditorBlock = 'p' | 'h1' | 'h2' | 'h3' | 'blockquote' | 'pre';
export type JEditorToolbarMode = 'basic' | 'full' | 'custom';

@Component({
  selector: 'j-editor',
  imports: [NgTemplateOutlet],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => JEditorComponent),
      multi: true,
    },
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => JEditorComponent), multi: true },
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
      [attr.data-j-toolbar]="toolbar()"
      [class.j-editor--fullscreen]="fullscreen()"
      [class.is-invalid]="invalid()"
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
          } @else if (toolbar() !== 'custom') {
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
              class="j-editor__tool j-editor__advanced"
              [disabled]="isDisabled()"
              (click)="execute('strikeThrough')"
              aria-label="Strike"
            >
              S
            </button>
            <select
              class="j-editor__select j-editor__advanced"
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
              class="j-editor__tool j-editor__advanced"
              [disabled]="isDisabled()"
              (click)="insertImage()"
              aria-label="Image"
            >
              Image
            </button>
            <button
              type="button"
              class="j-editor__tool j-editor__advanced"
              [disabled]="isDisabled()"
              (click)="insertTable()"
              aria-label="Insert table"
            >
              Table
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

        @if (sourceMode()) {
          <textarea
            class="j-editor__source"
            [value]="value()"
            [readOnly]="readonly()"
            [disabled]="isDisabled()"
            [attr.aria-label]="(ariaLabel() || label() || 'Editor') + ' source'"
            (input)="handleSourceInput($event)"
            (blur)="markTouched()"
          ></textarea>
        } @else {
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
            [attr.aria-disabled]="isDisabled() || null"
            [attr.contenteditable]="canInteract() ? 'true' : 'false'"
            [attr.data-placeholder]="placeholder()"
            [class.is-empty]="isEmpty()"
            (input)="handleInput()"
            (blur)="markTouched()"
            (mouseup)="rememberSelection()"
            (keyup)="rememberSelection()"
            (paste)="handlePaste($event)"
            (keydown)="handleKeydown($event)"
          ></div>
        }
      </div>

      @if (showWordCount() || showCharacterCount() || showSourceToggle() || showFullscreen()) {
        <footer class="j-editor__footer">
          @if (showWordCount()) {
            <span>{{ wordCount() }} words</span>
          }
          @if (showCharacterCount()) {
            <span [attr.aria-live]="invalid() ? 'polite' : null"
              >{{ characterCount() }}
              @if (maxLength() > 0) {
                / {{ maxLength() }}
              }
            </span>
          }
          @if (showSourceToggle()) {
            <button type="button" (click)="sourceMode.set(!sourceMode())" [disabled]="isDisabled()">
              {{ sourceMode() ? 'Visual mode' : 'Source mode' }}
            </button>
          }
          @if (showFullscreen()) {
            <button type="button" (click)="fullscreen.set(!fullscreen())" [disabled]="isDisabled()">
              {{ fullscreen() ? 'Exit fullscreen' : 'Fullscreen' }}
            </button>
          }
        </footer>
      }

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
      .j-editor[data-j-toolbar='basic'] .j-editor__advanced {
        display: none;
      }

      .j-editor__control {
        min-height: 12rem;
        outline: none;
        padding: var(--j-spacing-4);
      }

      .j-editor__source {
        box-sizing: border-box;
        min-height: 12rem;
        padding: var(--j-spacing-4);
        resize: vertical;
        width: 100%;
      }
      .j-editor__footer {
        align-items: center;
        color: var(--j-color-muted-foreground);
        display: flex;
        flex-wrap: wrap;
        gap: var(--j-spacing-2);
        font-size: var(--j-font-size-sm);
      }
      .j-editor__footer button {
        background: transparent;
        border: 0;
        color: var(--j-color-primary);
        cursor: pointer;
        font: inherit;
        margin-inline-start: auto;
      }
      .j-editor__footer button + button {
        margin-inline-start: 0;
      }
      .j-editor--fullscreen {
        background: var(--j-color-background);
        inset: 0;
        overflow: auto;
        padding: var(--j-spacing-4);
        position: fixed;
        z-index: var(--j-z-index-modal, 1100);
      }
      .j-editor.is-invalid .j-editor__surface {
        border-color: var(--j-color-danger);
      }
      @media (max-width: 48rem) {
        .j-editor__toolbar {
          flex-wrap: nowrap;
          overflow-x: auto;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .j-editor--fullscreen {
          scroll-behavior: auto;
        }
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
export class JEditorComponent implements ControlValueAccessor, Validator, AfterViewInit {
  private readonly documentRef = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly commands = inject(JEditorCommandService);
  private readonly destroyRef = inject(DestroyRef);
  private updatingView = false;
  private savedRange: Range | null = null;

  readonly label = input('');
  readonly placeholder = input('');
  readonly hint = input('');
  readonly ariaLabel = input('');
  readonly toolbarLabel = input('Editor toolbar');
  readonly outputFormat = input<JEditorFormat>('html');
  readonly toolbar = input<JEditorToolbarMode>('full');
  readonly showCharacterCount = input(false, { transform: booleanAttribute });
  readonly showWordCount = input(false, { transform: booleanAttribute });
  readonly showSourceToggle = input(false, { transform: booleanAttribute });
  readonly showFullscreen = input(false, { transform: booleanAttribute });
  readonly maxLength = input(0);
  readonly autosaveDelay = input(0);
  readonly sanitizerAdapter = input<JEditorSanitizerAdapter | null>(null);
  readonly imageAdapter = input<JEditorImageAdapter | null>(null);
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly styleClass = input('');

  readonly valueChange = output<string>();
  readonly autosave = output<string>();
  readonly dirtyChange = output<boolean>();
  readonly validationChange = output<{
    readonly valid: boolean;
    readonly errors: Record<string, unknown> | null;
  }>();

  readonly editable = viewChild<ElementRef<HTMLElement>>('editable');
  readonly toolbarTemplate = contentChild<unknown, TemplateRef<unknown>>('jEditorToolbar', {
    read: TemplateRef,
  });
  readonly value = signal('');
  readonly formDisabled = signal(false);
  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  readonly isEmpty = signal(true);
  readonly sourceMode = signal(false);
  readonly fullscreen = signal(false);
  readonly dirty = signal(false);
  readonly characterCount = computed(() => this.textValue(this.value()).length);
  readonly wordCount = computed(() =>
    this.textValue(this.value()).trim()
      ? this.textValue(this.value()).trim().split(/\s+/).length
      : 0,
  );
  readonly invalid = computed(
    () => this.maxLength() > 0 && this.characterCount() > this.maxLength(),
  );
  readonly editorId = jCreateId('j-editor');
  private initialValue = '';
  private autosaveTimer?: ReturnType<typeof setTimeout>;

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;
  private onValidatorChange: () => void = () => undefined;

  constructor() {
    effect(() => {
      this.maxLength();
      this.onValidatorChange();
    });
    this.destroyRef.onDestroy(() => {
      if (this.autosaveTimer) clearTimeout(this.autosaveTimer);
    });
  }

  ngAfterViewInit(): void {
    this.syncView();
  }

  canInteract(): boolean {
    return this.isBrowser && !this.readonly() && !this.isDisabled();
  }

  writeValue(value: string | null | undefined): void {
    const next = value ?? '';
    this.value.set(this.outputFormat() === 'html' ? this.sanitize(next) : next);
    this.initialValue = this.value();
    this.dirty.set(false);
    this.syncView();
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  validate(): ValidationErrors | null {
    return this.invalid()
      ? { maxlength: { requiredLength: this.maxLength(), actualLength: this.characterCount() } }
      : null;
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onValidatorChange = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
    this.syncView();
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
    this.onValidatorChange();
    this.updateEnterpriseState(next);
  }

  handleSourceInput(event: Event): void {
    const raw = (event.target as HTMLTextAreaElement).value;
    const next = this.outputFormat() === 'html' ? this.sanitize(raw) : raw;
    this.value.set(next);
    this.onChange(next);
    this.valueChange.emit(next);
    this.updateEnterpriseState(next);
  }

  handleKeydown(event: KeyboardEvent): void {
    if (
      (event.ctrlKey || event.metaKey) &&
      event.shiftKey &&
      event.key.toLocaleLowerCase() === 's'
    ) {
      event.preventDefault();
      this.sourceMode.set(!this.sourceMode());
    }
  }

  markTouched(): void {
    this.onTouched();
  }

  execute(command: string, value?: string): void {
    if (!this.canEdit()) {
      return;
    }
    this.restoreSelection();
    this.commands.execute(command, value);
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
    const selection = this.documentRef.getSelection?.();
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

  async insertImage(): Promise<void> {
    const adapter = this.imageAdapter();
    if (adapter) {
      const image = await adapter.selectAndUpload();
      if (image && this.isSafeUrl(image.url))
        this.execute(
          'insertHTML',
          `<img src="${this.escapeAttribute(image.url)}" alt="${this.escapeAttribute(image.alt ?? '')}">`,
        );
      return;
    }
    const url = this.prompt('Enter image URL');
    if (url && this.isSafeUrl(url)) {
      this.execute('insertImage', url);
    }
  }

  clearFormatting(): void {
    this.execute('removeFormat');
  }

  insertTable(rows = 2, columns = 2): void {
    const body = Array.from(
      { length: Math.max(1, rows) },
      () => `<tr>${'<td><br></td>'.repeat(Math.max(1, columns))}</tr>`,
    ).join('');
    this.execute('insertHTML', `<table><tbody>${body}</tbody></table><p><br></p>`);
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
    this.commands.execute('insertHTML', safe);
    this.handleInput();
  }

  private canEdit(): boolean {
    return this.canInteract();
  }

  private focusEditable(): void {
    this.editable()?.nativeElement.focus();
  }

  private restoreSelection(): void {
    this.focusEditable();
    if (!this.savedRange) return;
    const selection = this.documentRef.getSelection?.();
    selection?.removeAllRanges();
    selection?.addRange(this.savedRange);
  }

  private syncView(): void {
    const editable = this.editable()?.nativeElement;
    if (!editable) return;
    this.updatingView = true;
    editable.innerHTML =
      this.outputFormat() === 'html' ? this.sanitize(this.value()) : this.escapeText(this.value());
    this.isEmpty.set(!editable.textContent?.trim());
    this.updatingView = false;
  }

  private prompt(message: string): string {
    return this.isBrowser ? (this.documentRef.defaultView?.prompt(message) ?? '') : '';
  }

  private sanitize(value: string): string {
    const adapted = this.sanitizerAdapter()?.sanitize(value, this.documentRef) ?? value;
    return jSanitizeEditorHtml(adapted, this.documentRef);
  }

  private isSafeUrl(value: string): boolean {
    return jIsSafeEditorUrl(value, this.documentRef);
  }

  private escapeText(value: string): string {
    const element = this.documentRef.createElement('div');
    element.textContent = value;
    return element.innerHTML.replaceAll('\n', '<br>');
  }

  private escapeAttribute(value: string): string {
    return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
  }
  private textValue(value: string): string {
    const element = this.documentRef.createElement('div');
    element.innerHTML = value;
    return element.textContent ?? '';
  }
  private updateEnterpriseState(value: string): void {
    this.onValidatorChange();
    const dirty = value !== this.initialValue;
    if (dirty !== this.dirty()) {
      this.dirty.set(dirty);
      this.dirtyChange.emit(dirty);
    }
    const errors = this.invalid()
      ? { maxlength: { requiredLength: this.maxLength(), actualLength: this.characterCount() } }
      : null;
    this.validationChange.emit({ valid: !errors, errors });
    if (this.autosaveTimer) clearTimeout(this.autosaveTimer);
    if (this.autosaveDelay() > 0)
      this.autosaveTimer = setTimeout(() => this.autosave.emit(value), this.autosaveDelay());
  }
}
