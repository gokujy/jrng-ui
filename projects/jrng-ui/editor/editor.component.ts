import { DOCUMENT, NgTemplateOutlet, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
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
import { JIconComponent } from 'jrng-ui/icon';
import {
  JEditorImageAdapter,
  JEditorSanitizerAdapter,
  jIsSafeEditorUrl,
  jSanitizeEditorHtml,
} from './editor-sanitizer';
import { JEditorCommandService } from './editor-command.service';

export type JEditorFormat = 'html' | 'text';
export type JEditorBlock = 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'blockquote' | 'pre';
export type JEditorToolbarMode = 'basic' | 'full' | 'custom';
export type JEditorToolbarPosition = 'top' | 'bottom';
export type JEditorImageAlignment = 'left' | 'none' | 'right';
export type JEditorTableDirection = 'before' | 'after';

@Component({
  selector: 'j-editor',
  imports: [NgTemplateOutlet, JIconComponent],
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
      #editorRoot
      class="j-editor"
      [class]="styleClass()"
      [class.is-disabled]="isDisabled()"
      data-jc-name="editor"
      data-jc-section="root"
      data-jc-extend="toolbar editable rich-text"
      [attr.data-j-disabled]="isDisabled() ? 'true' : null"
      [attr.data-j-toolbar]="toolbar()"
      [attr.data-j-toolbar-position]="toolbarPosition()"
      [class.j-editor--air]="airMode()"
      [class.j-editor--sticky-toolbar]="stickyToolbar()"
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
          [attr.aria-disabled]="readonly() || isDisabled() || null"
          [attr.inert]="readonly() || isDisabled() ? '' : null"
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
              <j-icon name="bold" aria-hidden="true" />
            </button>
            <button
              type="button"
              class="j-editor__tool"
              [disabled]="isDisabled()"
              (click)="execute('italic')"
              aria-label="Italic"
            >
              <j-icon name="italic" aria-hidden="true" />
            </button>
            <button
              type="button"
              class="j-editor__tool"
              [disabled]="isDisabled()"
              (click)="execute('underline')"
              aria-label="Underline"
            >
              <j-icon name="underline" aria-hidden="true" />
            </button>
            <button
              type="button"
              class="j-editor__tool j-editor__advanced"
              [disabled]="isDisabled()"
              (click)="execute('strikeThrough')"
              aria-label="Strike"
            >
              <j-icon name="strikethrough" aria-hidden="true" />
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
              <option value="h4">Heading 4</option>
              <option value="h5">Heading 5</option>
              <option value="h6">Heading 6</option>
              <option value="blockquote">Quote</option>
              <option value="pre">Code block</option>
            </select>
            <select
              class="j-editor__select j-editor__advanced"
              [disabled]="isDisabled()"
              aria-label="Font family"
              (change)="setFontFamily($event)"
            >
              @for (font of fontFamilies(); track font) {
                <option [value]="font">{{ font }}</option>
              }
            </select>
            <select
              class="j-editor__select j-editor__advanced"
              [disabled]="isDisabled()"
              aria-label="Font size"
              (change)="setFontSize($event)"
            >
              @for (size of fontSizes(); track size) {
                <option [value]="size">{{ size }}px</option>
              }
            </select>
            <label class="j-editor__color-tool j-editor__advanced" title="Text color">
              <span class="j-hidden-accessible">Text color</span>
              <input
                type="color"
                value="#111827"
                [disabled]="isDisabled()"
                aria-label="Text color"
                (change)="setColor('foreColor', $event)"
              />
            </label>
            <label class="j-editor__color-tool j-editor__advanced" title="Highlight color">
              <span class="j-hidden-accessible">Highlight color</span>
              <input
                type="color"
                value="#fef08a"
                [disabled]="isDisabled()"
                aria-label="Highlight color"
                (change)="setColor('hiliteColor', $event)"
              />
            </label>
            <select
              class="j-editor__select j-editor__advanced"
              [disabled]="isDisabled()"
              aria-label="Line height"
              (change)="setLineHeight($event)"
            >
              @for (height of lineHeights(); track height) {
                <option [value]="height">{{ height }}</option>
              }
            </select>
            <button
              type="button"
              class="j-editor__tool"
              [disabled]="isDisabled()"
              (click)="execute('insertOrderedList')"
              aria-label="Ordered list"
            >
              <j-icon name="list-ordered" aria-hidden="true" />
            </button>
            <button
              type="button"
              class="j-editor__tool"
              [disabled]="isDisabled()"
              (click)="execute('insertUnorderedList')"
              aria-label="Unordered list"
            >
              <j-icon name="list" aria-hidden="true" />
            </button>
            <button
              type="button"
              class="j-editor__tool j-editor__advanced"
              [disabled]="isDisabled()"
              (click)="execute('outdent')"
              aria-label="Decrease indent"
            >
              <span aria-hidden="true">←</span>
            </button>
            <button
              type="button"
              class="j-editor__tool j-editor__advanced"
              [disabled]="isDisabled()"
              (click)="execute('indent')"
              aria-label="Increase indent"
            >
              <span aria-hidden="true">→</span>
            </button>
            <button
              type="button"
              class="j-editor__tool j-editor__advanced"
              [disabled]="isDisabled()"
              (click)="execute('subscript')"
              aria-label="Subscript"
            >
              <span aria-hidden="true">x₂</span>
            </button>
            <button
              type="button"
              class="j-editor__tool j-editor__advanced"
              [disabled]="isDisabled()"
              (click)="execute('superscript')"
              aria-label="Superscript"
            >
              <span aria-hidden="true">x²</span>
            </button>
            <button
              type="button"
              class="j-editor__tool"
              [disabled]="isDisabled()"
              (click)="createLink()"
              aria-label="Link"
            >
              <j-icon name="link" aria-hidden="true" />
            </button>
            <button
              type="button"
              class="j-editor__tool j-editor__advanced"
              [disabled]="isDisabled()"
              (click)="execute('unlink')"
              aria-label="Remove link"
            >
              <span aria-hidden="true">×</span>
            </button>
            <button
              type="button"
              class="j-editor__tool j-editor__advanced"
              [disabled]="isDisabled()"
              (click)="execute('insertHorizontalRule')"
              aria-label="Insert horizontal rule"
            >
              <span aria-hidden="true">―</span>
            </button>
            <button
              type="button"
              class="j-editor__tool j-editor__advanced"
              [disabled]="isDisabled()"
              (click)="insertImage()"
              aria-label="Upload image"
            >
              <j-icon name="image" aria-hidden="true" />
            </button>
            <input
              #imageInput
              class="j-hidden-accessible"
              type="file"
              multiple
              [accept]="imageAccept()"
              [disabled]="isDisabled()"
              aria-label="Choose an image to upload"
              (change)="handleImageSelection($event)"
            />
            <button
              type="button"
              class="j-editor__tool j-editor__advanced"
              [disabled]="isDisabled()"
              (click)="insertVideo()"
              aria-label="Insert video"
            >
              <j-icon name="video" aria-hidden="true" />
            </button>
            <button
              type="button"
              class="j-editor__tool j-editor__advanced"
              [disabled]="isDisabled()"
              (click)="insertTable()"
              aria-label="Insert table"
            >
              <j-icon name="table" aria-hidden="true" />
            </button>
            <button
              type="button"
              class="j-editor__tool"
              [disabled]="isDisabled()"
              (click)="clearFormatting()"
              aria-label="Clear formatting"
            >
              <j-icon name="eraser" aria-hidden="true" />
            </button>
            <button
              type="button"
              class="j-editor__tool"
              [disabled]="isDisabled()"
              (click)="execute('justifyLeft')"
              aria-label="Align left"
            >
              <j-icon name="align-left" aria-hidden="true" />
            </button>
            <button
              type="button"
              class="j-editor__tool"
              [disabled]="isDisabled()"
              (click)="execute('justifyCenter')"
              aria-label="Align center"
            >
              <j-icon name="align-center" aria-hidden="true" />
            </button>
            <button
              type="button"
              class="j-editor__tool"
              [disabled]="isDisabled()"
              (click)="execute('justifyRight')"
              aria-label="Align right"
            >
              <j-icon name="align-right" aria-hidden="true" />
            </button>
            <button
              type="button"
              class="j-editor__tool j-editor__advanced"
              [disabled]="isDisabled()"
              (click)="execute('justifyFull')"
              aria-label="Justify"
            >
              <span aria-hidden="true">☰</span>
            </button>
            <button
              type="button"
              class="j-editor__tool"
              [disabled]="isDisabled()"
              (click)="execute('undo')"
              aria-label="Undo"
            >
              <j-icon name="undo" aria-hidden="true" />
            </button>
            <button
              type="button"
              class="j-editor__tool"
              [disabled]="isDisabled()"
              (click)="execute('redo')"
              aria-label="Redo"
            >
              <j-icon name="redo" aria-hidden="true" />
            </button>
            @if (showSourceToggle()) {
              <button
                type="button"
                class="j-editor__tool"
                [disabled]="isDisabled()"
                [attr.aria-label]="sourceMode() ? 'Show visual editor' : 'Show HTML'"
                [attr.title]="sourceMode() ? 'Show visual editor' : 'Show HTML'"
                (click)="toggleSourceMode()"
              >
                <j-icon [name]="sourceMode() ? 'eye' : 'code-xml'" aria-hidden="true" />
              </button>
            }
            @if (showFullscreen()) {
              <button
                type="button"
                class="j-editor__tool"
                [disabled]="isDisabled()"
                [attr.aria-label]="fullscreen() ? 'Exit fullscreen' : 'Enter fullscreen'"
                [attr.title]="fullscreen() ? 'Exit fullscreen' : 'Enter fullscreen'"
                (click)="fullscreen.set(!fullscreen())"
              >
                <j-icon name="maximize" aria-hidden="true" />
              </button>
            }
            <button
              type="button"
              class="j-editor__tool j-editor__advanced"
              [attr.aria-expanded]="helpOpen()"
              [attr.aria-controls]="editorId + '-help'"
              (click)="helpOpen.set(!helpOpen())"
              aria-label="Editor help"
            >
              <span aria-hidden="true">?</span>
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
            [style.height]="height() || null"
            [style.min-height]="minHeight()"
            [style.resize]="resizable() ? 'vertical' : 'none'"
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
            [attr.spellcheck]="spellcheck()"
            [style.height]="height() || null"
            [style.min-height]="minHeight()"
            [style.resize]="resizable() ? 'vertical' : 'none'"
            [class.is-empty]="isEmpty()"
            (input)="handleInput()"
            (blur)="markTouched()"
            (mouseup)="rememberSelection()"
            (keyup)="rememberSelection()"
            (paste)="handlePaste($event)"
            (dragover)="handleImageDragOver($event)"
            (drop)="handleImageDrop($event)"
            (click)="handleEditableClick($event)"
            (scroll)="positionSelectedImageTools()"
            (keydown)="handleKeydown($event)"
          ></div>
        }
      </div>

      @if (selectedImage() && canInteract()) {
        <div
          #imageTools
          class="j-editor__context j-editor__context--image"
          [class.is-above]="imageToolsAbove()"
          [class.is-positioned]="imageToolsPositioned()"
          [style.left.px]="imageToolsLeft()"
          [style.top.px]="imageToolsTop()"
          role="toolbar"
          aria-label="Selected image tools"
        >
          <strong>Image</strong>
          <button type="button" (click)="resizeSelectedImage('100%')">100%</button>
          <button type="button" (click)="resizeSelectedImage('50%')">50%</button>
          <button type="button" (click)="resizeSelectedImage('25%')">25%</button>
          <button type="button" (click)="resizeSelectedImage(null)">Original</button>
          <button type="button" (click)="alignSelectedImage('left')">Align left</button>
          <button type="button" (click)="alignSelectedImage('none')">Inline</button>
          <button type="button" (click)="alignSelectedImage('right')">Align right</button>
          <label>
            <span>Alternative text</span>
            <input
              type="text"
              [value]="selectedImageAlt()"
              (input)="selectedImageAlt.set($any($event.target).value)"
            />
          </label>
          <button type="button" (click)="applySelectedImageAlt()">Apply text</button>
          <button type="button" class="is-danger" (click)="removeSelectedImage()">
            Remove image
          </button>
        </div>
      }

      @if (selectedTableCell() && canInteract()) {
        <div class="j-editor__context" role="toolbar" aria-label="Selected table tools">
          <strong>Table</strong>
          <button type="button" (click)="addTableRow('before')">Row above</button>
          <button type="button" (click)="addTableRow('after')">Row below</button>
          <button type="button" (click)="addTableColumn('before')">Column before</button>
          <button type="button" (click)="addTableColumn('after')">Column after</button>
          <button type="button" (click)="deleteTableRow()">Delete row</button>
          <button type="button" (click)="deleteTableColumn()">Delete column</button>
          <button type="button" class="is-danger" (click)="deleteSelectedTable()">
            Delete table
          </button>
        </div>
      }

      @if (selectedLink() && canInteract()) {
        <div class="j-editor__context" role="toolbar" aria-label="Selected link tools">
          <strong>Link</strong>
          <label>
            <span>Text</span>
            <input
              type="text"
              [value]="selectedLinkText()"
              (input)="selectedLinkText.set($any($event.target).value)"
            />
          </label>
          <label>
            <span>URL</span>
            <input
              type="url"
              [value]="selectedLinkUrl()"
              (input)="selectedLinkUrl.set($any($event.target).value)"
            />
          </label>
          <label>
            <input
              type="checkbox"
              [checked]="selectedLinkNewWindow()"
              (change)="selectedLinkNewWindow.set($any($event.target).checked)"
            />
            <span>Open in new window</span>
          </label>
          <button type="button" (click)="applySelectedLink()">Apply link</button>
          <button type="button" class="is-danger" (click)="removeSelectedLink()">
            Remove link
          </button>
        </div>
      }

      @if (helpOpen()) {
        <section
          [id]="editorId + '-help'"
          class="j-editor__help"
          aria-label="Editor keyboard shortcuts"
        >
          <strong>Keyboard shortcuts</strong>
          <dl>
            <div>
              <dt>Bold</dt>
              <dd>Ctrl/⌘ + B</dd>
            </div>
            <div>
              <dt>Italic</dt>
              <dd>Ctrl/⌘ + I</dd>
            </div>
            <div>
              <dt>Underline</dt>
              <dd>Ctrl/⌘ + U</dd>
            </div>
            <div>
              <dt>Link</dt>
              <dd>Ctrl/⌘ + K</dd>
            </div>
            <div>
              <dt>Undo / redo</dt>
              <dd>Ctrl/⌘ + Z / Y</dd>
            </div>
            <div>
              <dt>Source view</dt>
              <dd>Ctrl/⌘ + Shift + S</dd>
            </div>
          </dl>
        </section>
      }

      @if (showWordCount() || showCharacterCount()) {
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
        </footer>
      }

      @if (hint()) {
        <small class="j-editor__hint">{{ hint() }}</small>
      }
      @if (imageError()) {
        <small class="j-editor__image-error" role="alert">{{ imageError() }}</small>
      }
    </section>
  `,
  styles: [
    `
      .j-editor {
        color: var(--j-color-foreground);
        display: grid;
        gap: var(--j-spacing-2);
        position: relative;
      }

      .j-editor__label {
        font-size: var(--j-font-size-sm);
        font-weight: var(--j-font-weight-semibold);
      }

      .j-editor__surface {
        background: var(--j-color-card);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-lg);
        display: flex;
        flex-direction: column;
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

      .j-editor[data-j-toolbar-position='bottom'] .j-editor__toolbar {
        border-bottom: 0;
        border-top: 1px solid var(--j-color-border);
        order: 2;
      }

      .j-editor--sticky-toolbar .j-editor__toolbar {
        position: sticky;
        top: 0;
        z-index: var(--j-z-index-sticky, 10);
      }

      .j-editor--air:not(:focus-within) .j-editor__toolbar {
        display: none;
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

      .j-editor__color-tool {
        align-items: center;
        background: var(--j-color-card);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-md);
        display: inline-flex;
        height: 2rem;
        justify-content: center;
        width: 2rem;
      }

      .j-editor__color-tool input {
        border: 0;
        cursor: pointer;
        height: 1.25rem;
        padding: 0;
        width: 1.25rem;
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
        overflow: auto;
        padding: var(--j-spacing-4);
        resize: vertical;
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

      .j-editor__context {
        align-items: center;
        background: var(--j-color-muted);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-md);
        display: flex;
        flex-wrap: wrap;
        gap: var(--j-spacing-2);
        padding: var(--j-spacing-2);
      }

      .j-editor__context--image {
        box-shadow: var(--j-shadow-lg);
        box-sizing: border-box;
        left: 0;
        max-width: calc(100% - var(--j-spacing-4));
        opacity: 0;
        position: absolute;
        top: 0;
        transform: translateX(-50%);
        visibility: hidden;
        width: max-content;
        z-index: var(--j-z-index-popover, 30);
      }

      .j-editor__context--image.is-above {
        transform: translate(-50%, -100%);
      }

      .j-editor__context--image.is-positioned {
        opacity: 1;
        visibility: visible;
      }

      .j-editor__context button,
      .j-editor__context input {
        background: var(--j-color-card);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-sm);
        color: var(--j-color-foreground);
        font: inherit;
        min-height: 2rem;
        padding-inline: var(--j-spacing-2);
      }

      .j-editor__context label {
        align-items: center;
        display: inline-flex;
        gap: var(--j-spacing-2);
      }

      .j-editor__context .is-danger {
        color: var(--j-color-danger);
      }

      .j-editor__help {
        background: var(--j-color-card);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-md);
        display: grid;
        gap: var(--j-spacing-2);
        padding: var(--j-spacing-3);
      }

      .j-editor__help dl,
      .j-editor__help dl > div {
        display: grid;
        gap: var(--j-spacing-2);
        margin: 0;
      }

      .j-editor__help dl > div {
        grid-template-columns: minmax(0, 1fr) auto;
      }

      .j-editor__help dd {
        color: var(--j-color-muted-foreground);
        margin: 0;
      }

      :host ::ng-deep .j-editor__control img {
        height: auto;
        max-width: 100%;
      }

      :host ::ng-deep .j-editor__control img[data-j-align='left'] {
        float: left;
        margin: 0 var(--j-spacing-3) var(--j-spacing-2) 0;
      }

      :host ::ng-deep .j-editor__control img[data-j-align='right'] {
        float: right;
        margin: 0 0 var(--j-spacing-2) var(--j-spacing-3);
      }

      :host ::ng-deep .j-editor__control img.is-selected,
      :host ::ng-deep .j-editor__control td.is-selected,
      :host ::ng-deep .j-editor__control th.is-selected,
      :host ::ng-deep .j-editor__control a.is-selected {
        outline: 2px solid var(--j-color-primary);
        outline-offset: 2px;
      }

      .j-editor__image-error {
        color: var(--j-color-danger);
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
  readonly toolbarPosition = input<JEditorToolbarPosition>('top');
  readonly airMode = input(false, { transform: booleanAttribute });
  readonly stickyToolbar = input(false, { transform: booleanAttribute });
  readonly height = input('');
  readonly minHeight = input('12rem');
  readonly resizable = input(true, { transform: booleanAttribute });
  readonly spellcheck = input(true, { transform: booleanAttribute });
  readonly tabSize = input(4);
  readonly tabMovesFocus = input(false, { transform: booleanAttribute });
  readonly showCharacterCount = input(false, { transform: booleanAttribute });
  readonly showWordCount = input(false, { transform: booleanAttribute });
  readonly showSourceToggle = input(false, { transform: booleanAttribute });
  readonly showFullscreen = input(false, { transform: booleanAttribute });
  readonly maxLength = input(0);
  readonly autosaveDelay = input(0);
  readonly sanitizerAdapter = input<JEditorSanitizerAdapter | null>(null);
  readonly imageAdapter = input<JEditorImageAdapter | null>(null);
  readonly imageAccept = input('image/png,image/jpeg,image/webp,image/gif');
  readonly imageMaxFileSize = input(5 * 1024 * 1024);
  readonly fontFamilies = input<readonly string[]>([
    'Arial',
    'Helvetica',
    'Georgia',
    'Times New Roman',
    'Courier New',
    'Verdana',
  ]);
  readonly fontSizes = input<readonly number[]>([8, 9, 10, 11, 12, 14, 18, 24, 36]);
  readonly lineHeights = input<readonly number[]>([1, 1.2, 1.4, 1.5, 1.6, 1.8, 2, 3]);
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
  readonly imageErrorChange = output<string>();

  readonly editable = viewChild<ElementRef<HTMLElement>>('editable');
  readonly editorRoot = viewChild<ElementRef<HTMLElement>>('editorRoot');
  readonly imageTools = viewChild<ElementRef<HTMLElement>>('imageTools');
  readonly imageInput = viewChild<ElementRef<HTMLInputElement>>('imageInput');
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
  readonly imageError = signal('');
  readonly selectedImage = signal<HTMLImageElement | null>(null);
  readonly selectedImageAlt = signal('');
  readonly imageToolsTop = signal(0);
  readonly imageToolsLeft = signal(0);
  readonly imageToolsAbove = signal(false);
  readonly imageToolsPositioned = signal(false);
  readonly selectedTableCell = signal<HTMLTableCellElement | null>(null);
  readonly selectedLink = signal<HTMLAnchorElement | null>(null);
  readonly selectedLinkText = signal('');
  readonly selectedLinkUrl = signal('');
  readonly selectedLinkNewWindow = signal(false);
  readonly helpOpen = signal(false);
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
    if (event.key === 'Escape') {
      this.clearMediaSelection();
      this.helpOpen.set(false);
      if (this.fullscreen()) this.fullscreen.set(false);
      return;
    }
    if (event.key === 'Tab' && !this.tabMovesFocus() && this.canEdit()) {
      event.preventDefault();
      if (event.shiftKey) {
        this.execute('outdent');
      } else {
        this.execute('insertText', ' '.repeat(Math.max(1, this.tabSize())));
      }
      return;
    }
    if ((event.ctrlKey || event.metaKey) && !event.shiftKey) {
      const commands: Readonly<Record<string, string>> = {
        b: 'bold',
        i: 'italic',
        u: 'underline',
        z: 'undo',
        y: 'redo',
      };
      const key = event.key.toLocaleLowerCase();
      if (key === 'k') {
        event.preventDefault();
        this.createLink();
        return;
      }
      if (commands[key]) {
        event.preventDefault();
        this.execute(commands[key]);
        return;
      }
    }
    if (
      (event.ctrlKey || event.metaKey) &&
      event.shiftKey &&
      event.key.toLocaleLowerCase() === 's'
    ) {
      event.preventDefault();
      this.toggleSourceMode();
    }
  }

  markTouched(): void {
    this.onTouched();
  }

  toggleSourceMode(): void {
    const showVisualEditor = this.sourceMode();
    this.sourceMode.set(!showVisualEditor);
    if (showVisualEditor) {
      queueMicrotask(() => {
        this.syncView();
        this.focusEditable();
      });
    }
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

  setFontFamily(event: Event): void {
    const value = (event.target as HTMLSelectElement | null)?.value;
    if (value) this.execute('fontName', value);
  }

  setFontSize(event: Event): void {
    const value = Number((event.target as HTMLSelectElement | null)?.value);
    if (!Number.isFinite(value)) return;
    this.execute('fontSize', this.closestLegacyFontSize(value));
  }

  setColor(command: 'foreColor' | 'hiliteColor', event: Event): void {
    const value = (event.target as HTMLInputElement | null)?.value;
    if (value) this.execute(command, value);
  }

  setLineHeight(event: Event): void {
    const value = Number((event.target as HTMLSelectElement | null)?.value);
    const editable = this.editable()?.nativeElement;
    const selection = this.documentRef.getSelection?.();
    if (!editable || !selection?.rangeCount || !Number.isFinite(value)) return;
    const range = selection.getRangeAt(0);
    const start =
      range.startContainer.nodeType === 1
        ? (range.startContainer as Element)
        : range.startContainer.parentElement;
    const block = start?.closest('p,div,blockquote,pre,h1,h2,h3,h4,h5,h6,li');
    if (block && editable.contains(block)) {
      (block as HTMLElement).style.lineHeight = String(value);
      this.handleInput();
    }
  }

  createLink(): void {
    const url = this.prompt('Enter URL');
    if (url && this.isSafeUrl(url)) {
      this.execute('createLink', url);
    }
  }

  async insertImage(): Promise<void> {
    if (!this.isBrowser || this.isDisabled() || this.readonly()) return;
    this.imageError.set('');
    const adapter = this.imageAdapter();
    if (adapter) {
      try {
        const image = await adapter.selectAndUpload();
        if (image) this.insertImageMarkup(image.url, image.alt ?? '');
      } catch {
        this.setImageError('The image could not be uploaded. Please try again.');
      }
      return;
    }
    const input = this.imageInput()?.nativeElement;
    if (!input) return;
    input.value = '';
    input.click();
  }

  async handleImageSelection(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement | null;
    const files = [...(input?.files ?? [])];
    if (!files.length) return;
    await this.insertImageFiles(files);
    if (input) input.value = '';
  }

  handleImageDragOver(event: DragEvent): void {
    if (
      !this.canInteract() ||
      ![...(event.dataTransfer?.items ?? [])].some((item) => item.type.startsWith('image/'))
    )
      return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
  }

  async handleImageDrop(event: DragEvent): Promise<void> {
    const files = [...(event.dataTransfer?.files ?? [])].filter((file) =>
      file.type.startsWith('image/'),
    );
    if (!files.length || !this.canInteract()) return;
    event.preventDefault();
    await this.insertImageFiles(files);
  }

  handleEditableClick(event: MouseEvent): void {
    this.clearMediaSelection();
    const target = event.target as Element | null;
    const image = target?.closest('img');
    if (image instanceof HTMLImageElement) {
      image.classList.add('is-selected');
      this.selectedImage.set(image);
      this.selectedImageAlt.set(image.alt);
      this.imageToolsPositioned.set(false);
      queueMicrotask(() => this.positionSelectedImageTools());
      return;
    }
    const cell = target?.closest('td,th');
    if (cell instanceof HTMLTableCellElement) {
      cell.classList.add('is-selected');
      this.selectedTableCell.set(cell);
      return;
    }
    const link = target?.closest('a');
    if (link instanceof HTMLAnchorElement) {
      link.classList.add('is-selected');
      this.selectedLink.set(link);
      this.selectedLinkText.set(link.textContent ?? '');
      this.selectedLinkUrl.set(link.getAttribute('href') ?? '');
      this.selectedLinkNewWindow.set(link.getAttribute('target') === '_blank');
    }
  }

  positionSelectedImageTools(): void {
    if (!this.isBrowser) return;
    const image = this.selectedImage();
    const root = this.editorRoot()?.nativeElement;
    const tools = this.imageTools()?.nativeElement;
    if (!image || !root || !tools || !image.isConnected) return;
    const imageRect = image.getBoundingClientRect();
    const rootRect = root.getBoundingClientRect();
    const toolsRect = tools.getBoundingClientRect();
    const viewportHeight = this.documentRef.defaultView?.innerHeight ?? Number.POSITIVE_INFINITY;
    const gap = 8;
    const above =
      imageRect.bottom + toolsRect.height + gap > viewportHeight &&
      imageRect.top - toolsRect.height - gap >= 0;
    const halfWidth = Math.min(toolsRect.width, Math.max(0, rootRect.width - gap * 2)) / 2;
    const centered = imageRect.left - rootRect.left + imageRect.width / 2;
    const minimum = halfWidth + gap;
    const maximum = Math.max(minimum, rootRect.width - halfWidth - gap);
    this.imageToolsLeft.set(Math.min(maximum, Math.max(minimum, centered)));
    this.imageToolsTop.set(
      (above ? imageRect.top : imageRect.bottom) - rootRect.top + (above ? -gap : gap),
    );
    this.imageToolsAbove.set(above);
    this.imageToolsPositioned.set(true);
  }

  @HostListener('window:resize')
  handleWindowResize(): void {
    this.positionSelectedImageTools();
  }

  @HostListener('document:pointerdown', ['$event'])
  handleDocumentPointerDown(event: PointerEvent): void {
    const target = event.target as Node | null;
    const root = this.editorRoot()?.nativeElement;
    if (target && root && !root.contains(target)) this.clearMediaSelection();
  }

  resizeSelectedImage(width: string | null): void {
    this.updateSelectedImage((image) => {
      if (width) {
        image.style.width = width;
        image.removeAttribute('width');
        image.removeAttribute('height');
      } else {
        image.style.removeProperty('width');
        image.removeAttribute('width');
        image.removeAttribute('height');
      }
    }, true);
  }

  alignSelectedImage(alignment: JEditorImageAlignment): void {
    this.updateSelectedImage((image) => {
      if (alignment === 'none') image.removeAttribute('data-j-align');
      else image.setAttribute('data-j-align', alignment);
    });
  }

  applySelectedImageAlt(): void {
    this.updateSelectedImage((image) => image.setAttribute('alt', this.selectedImageAlt().trim()));
  }

  removeSelectedImage(): void {
    this.updateSelectedImage((image) => image.remove());
  }

  addTableRow(direction: JEditorTableDirection): void {
    const cell = this.selectedTableCell();
    const row = cell?.parentElement as HTMLTableRowElement | null;
    if (!row) return;
    const next = row.cloneNode(false) as HTMLTableRowElement;
    for (let index = 0; index < row.cells.length; index++) {
      const clone = row.cells[index].cloneNode(false) as HTMLTableCellElement;
      clone.innerHTML = '<br>';
      next.append(clone);
    }
    row[direction === 'before' ? 'before' : 'after'](next);
    this.commitTableChange();
  }

  addTableColumn(direction: JEditorTableDirection): void {
    const cell = this.selectedTableCell();
    const table = cell?.closest('table');
    if (!cell || !table) return;
    const index = cell.cellIndex + (direction === 'after' ? 1 : 0);
    for (const row of [...table.rows]) {
      const next = row.insertCell(Math.min(index, row.cells.length));
      next.innerHTML = '<br>';
    }
    this.commitTableChange();
  }

  deleteTableRow(): void {
    this.selectedTableCell()?.parentElement?.remove();
    this.commitTableChange();
  }

  deleteTableColumn(): void {
    const cell = this.selectedTableCell();
    const table = cell?.closest('table');
    if (!cell || !table) return;
    const index = cell.cellIndex;
    for (const row of [...table.rows]) row.cells.item(index)?.remove();
    this.commitTableChange();
  }

  deleteSelectedTable(): void {
    this.selectedTableCell()?.closest('table')?.remove();
    this.commitTableChange();
  }

  applySelectedLink(): void {
    const link = this.selectedLink();
    const url = this.selectedLinkUrl().trim();
    if (!link || !this.canInteract() || !this.isSafeUrl(url)) return;
    link.classList.remove('is-selected');
    link.textContent = this.selectedLinkText().trim() || url;
    link.setAttribute('href', url);
    if (this.selectedLinkNewWindow()) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    } else {
      link.removeAttribute('target');
      link.removeAttribute('rel');
    }
    this.selectedLink.set(null);
    this.handleInput();
  }

  removeSelectedLink(): void {
    const link = this.selectedLink();
    if (!link || !this.canInteract()) return;
    link.classList.remove('is-selected');
    link.replaceWith(...link.childNodes);
    this.selectedLink.set(null);
    this.handleInput();
  }

  insertVideo(): void {
    const url = this.prompt('Enter a direct video URL');
    if (!url || !this.isSafeUrl(url)) return;
    this.execute(
      'insertHTML',
      `<video src="${this.escapeAttribute(url)}" controls></video><p><br></p>`,
    );
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
    const imageFiles = [...(event.clipboardData?.files ?? [])].filter((file) =>
      file.type.startsWith('image/'),
    );
    if (imageFiles.length) {
      event.preventDefault();
      void this.insertImageFiles(imageFiles);
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

  private insertImageMarkup(url: string, alt: string): void {
    if (!this.isSafeUrl(url)) {
      this.setImageError('The selected image source is not supported.');
      return;
    }
    this.execute(
      'insertHTML',
      `<img src="${this.escapeAttribute(url)}" alt="${this.escapeAttribute(alt)}">`,
    );
  }

  private async insertImageFiles(files: readonly File[]): Promise<void> {
    this.imageError.set('');
    for (const file of files) {
      if (!this.acceptsImage(file)) {
        this.setImageError('Choose a PNG, JPEG, WebP, or GIF image.');
        continue;
      }
      if (file.size > Math.max(0, this.imageMaxFileSize())) {
        this.setImageError(
          `Choose an image smaller than ${this.formatFileSize(this.imageMaxFileSize())}.`,
        );
        continue;
      }
      try {
        const url = await this.readImage(file);
        this.insertImageMarkup(url, file.name.replace(/\.[^.]+$/, ''));
      } catch {
        this.setImageError(`The image “${file.name}” could not be read.`);
      }
    }
  }

  private updateSelectedImage(
    update: (image: HTMLImageElement) => void,
    keepSelected = false,
  ): void {
    const image = this.selectedImage();
    const editable = this.editable()?.nativeElement;
    if (!image || !editable || !this.canInteract()) return;
    const imageIndex = [...editable.querySelectorAll('img')].indexOf(image);
    image.classList.remove('is-selected');
    update(image);
    this.selectedImage.set(null);
    this.imageToolsPositioned.set(false);
    this.handleInput();
    if (!keepSelected || imageIndex < 0) return;
    const updatedImage = editable.querySelectorAll('img').item(imageIndex);
    if (!(updatedImage instanceof HTMLImageElement)) return;
    updatedImage.classList.add('is-selected');
    this.selectedImage.set(updatedImage);
    this.selectedImageAlt.set(updatedImage.alt);
    queueMicrotask(() => this.positionSelectedImageTools());
  }

  private clearMediaSelection(): void {
    this.selectedImage()?.classList.remove('is-selected');
    this.selectedTableCell()?.classList.remove('is-selected');
    this.selectedImage.set(null);
    this.imageToolsPositioned.set(false);
    this.selectedTableCell.set(null);
    this.selectedLink()?.classList.remove('is-selected');
    this.selectedLink.set(null);
  }

  private commitTableChange(): void {
    this.selectedTableCell()?.classList.remove('is-selected');
    this.selectedTableCell.set(null);
    this.handleInput();
  }

  private closestLegacyFontSize(size: number): string {
    const thresholds = [9, 11, 13, 16, 20, 28];
    return String(1 + thresholds.filter((threshold) => size > threshold).length);
  }

  private acceptsImage(file: File): boolean {
    const accepted = this.imageAccept()
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);
    const type = file.type.toLowerCase();
    const extension = `.${file.name.split('.').pop()?.toLowerCase() ?? ''}`;
    return accepted.some(
      (value) =>
        value === 'image/*' || value === type || (value.startsWith('.') && value === extension),
    );
  }

  private readImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const Reader = this.documentRef.defaultView?.FileReader;
      if (!Reader) {
        reject(new Error('FileReader is unavailable.'));
        return;
      }
      const reader = new Reader();
      reader.addEventListener('load', () =>
        typeof reader.result === 'string'
          ? resolve(reader.result)
          : reject(new Error('Invalid image.')),
      );
      reader.addEventListener('error', () => reject(reader.error ?? new Error('Read failed.')));
      reader.readAsDataURL(file);
    });
  }

  private setImageError(message: string): void {
    this.imageError.set(message);
    this.imageErrorChange.emit(message);
  }

  private formatFileSize(bytes: number): string {
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${Math.max(0.1, bytes / (1024 * 1024))
      .toFixed(1)
      .replace(/\.0$/, '')} MB`;
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
