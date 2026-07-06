import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  input,
  numberAttribute,
  output,
  signal,
  viewChild,
} from '@angular/core';

export type JFileUploadMode = 'basic' | 'advanced';
export type JFileUploadStatus = 'pending' | 'uploading' | 'complete' | 'error' | 'cancelled';

export interface JFileUploadError {
  readonly file: File;
  readonly message: string;
}

export interface JFileUploadItem {
  readonly id: string;
  readonly file: File;
  readonly progress: number;
  readonly status: JFileUploadStatus;
  readonly error?: string;
}

export interface JFileUploadEvent {
  readonly files: readonly File[];
  readonly items: readonly JFileUploadItem[];
}

export interface JFileUploadItemEvent {
  readonly item: JFileUploadItem;
}

@Component({
  selector: 'j-file-upload',
  imports: [],
  template: `
    <section
      class="j-file-upload"
      [class]="uploaderClasses()"
      [class.is-dragover]="dragover()"
      data-jc-name="file-upload"
      data-jc-section="root"
      data-jc-extend="dropzone queue progress preview"
      (dragover)="handleDragOver($event)"
      (dragleave)="handleDragLeave($event)"
      (drop)="handleDrop($event)"
    >
      <input
        #fileInput
        class="j-file-upload__input"
        type="file"
        [attr.accept]="accept() || null"
        [multiple]="multiple()"
        [disabled]="disabled()"
        (change)="handleFileInput($event)"
      />

      <div class="j-file-upload__header" data-jc-section="header">
        <div>
          <strong>{{ title() }}</strong>
          @if (description()) {
            <p>{{ description() }}</p>
          }
        </div>
        <div class="j-file-upload__actions">
          <button
            type="button"
            class="j-file-upload__button"
            [disabled]="disabled()"
            (click)="openFilePicker()"
          >
            {{ chooseLabel() }}
          </button>
          @if (!auto()) {
            <button
              type="button"
              class="j-file-upload__button j-file-upload__button--primary"
              [disabled]="!queue().length || disabled()"
              (click)="emitUpload()"
            >
              {{ uploadLabel() }}
            </button>
          }
          @if (queue().length) {
            <button
              type="button"
              class="j-file-upload__button"
              [disabled]="disabled()"
              (click)="clear()"
            >
              {{ cancelLabel() }}
            </button>
          }
        </div>
      </div>

      @if (mode() !== 'basic') {
        <div class="j-file-upload__drop" data-jc-section="dropzone">
          <span aria-hidden="true">Upload</span>
          <p>Drop files here or choose from your device.</p>
        </div>
      }

      @if (queue().length) {
        <ul class="j-file-upload__list" data-jc-section="queue">
          @for (item of queue(); track item.id) {
            <li [attr.data-j-active]="item.status === 'uploading' ? 'true' : null">
              <div class="j-file-upload__preview" aria-hidden="true">
                {{ filePreviewLabel(item.file) }}
              </div>
              <div class="j-file-upload__meta">
                <span>{{ item.file.name }}</span>
                <small>{{ formatSize(item.file.size) }} - {{ item.status }}</small>
                <span class="j-file-upload__progress"
                  ><span [style.width.%]="item.progress"></span
                ></span>
                @if (item.error) {
                  <small class="j-file-upload__error">{{ item.error }}</small>
                }
              </div>
              <div class="j-file-upload__row-actions">
                @if (item.status === 'error' || item.status === 'cancelled') {
                  <button type="button" (click)="retry(item)">Retry</button>
                }
                @if (item.status === 'uploading') {
                  <button type="button" (click)="cancel(item)">Cancel</button>
                }
                <button type="button" (click)="previewFile.emit(item)">Preview</button>
                <button type="button" (click)="downloadFile.emit(item)">Download</button>
                <button type="button" (click)="removeItem(item)">Remove</button>
              </div>
            </li>
          }
        </ul>
      }

      @if (errors().length) {
        <ul class="j-file-upload__errors" aria-live="polite">
          @for (error of errors(); track error.file.name + ':' + error.message) {
            <li>{{ error.file.name }}: {{ error.message }}</li>
          }
        </ul>
      }
    </section>
  `,
  styles: [
    `
      .j-file-upload {
        background: var(--j-file-upload-bg, var(--j-color-card, #ffffff));
        border: 1px dashed var(--j-file-upload-border-color, var(--j-color-border, #e2e8f0));
        border-radius: var(--j-radius-lg);
        color: var(--j-file-upload-color, var(--j-color-card-foreground, #111827));
        display: grid;
        gap: var(--j-spacing-4);
        padding: var(--j-spacing-4);
      }

      .j-file-upload--basic {
        border-style: solid;
      }

      .j-file-upload.is-dragover {
        border-color: var(--j-color-primary);
        box-shadow: var(--j-focus-ring);
      }

      .j-file-upload__input {
        display: none;
      }

      .j-file-upload__header {
        align-items: center;
        display: flex;
        gap: var(--j-spacing-3);
        justify-content: space-between;
      }

      .j-file-upload__header p,
      .j-file-upload__drop p {
        color: var(--j-color-muted-foreground);
        margin: var(--j-spacing-1) 0 0;
      }

      .j-file-upload__actions,
      .j-file-upload__row-actions {
        display: flex;
        flex-wrap: wrap;
        gap: var(--j-spacing-2);
      }

      .j-file-upload__button,
      .j-file-upload__row-actions button {
        background: var(--j-color-card);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-md);
        color: inherit;
        cursor: pointer;
        font: inherit;
        min-height: 2.25rem;
        padding: 0 var(--j-spacing-3);
      }

      .j-file-upload__button--primary {
        background: var(--j-color-primary);
        border-color: var(--j-color-primary);
        color: var(--j-color-primary-foreground);
      }

      .j-file-upload__button:disabled {
        cursor: not-allowed;
        opacity: var(--j-disabled-opacity);
      }

      .j-file-upload__drop {
        background: var(--j-file-upload-drop-bg, var(--j-color-muted, #f1f5f9));
        border-radius: var(--j-radius-lg);
        display: grid;
        min-height: 8rem;
        place-items: center;
        text-align: center;
      }

      .j-file-upload__list,
      .j-file-upload__errors {
        display: grid;
        gap: var(--j-spacing-2);
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .j-file-upload__list li {
        align-items: center;
        background: var(--j-color-muted);
        border-radius: var(--j-radius-md);
        display: grid;
        gap: var(--j-spacing-3);
        grid-template-columns: 3rem minmax(0, 1fr) auto;
        padding: var(--j-spacing-3);
      }

      .j-file-upload__preview {
        align-items: center;
        background: var(--j-color-card);
        border-radius: var(--j-radius-md);
        display: flex;
        font-size: var(--j-font-size-xs);
        height: 3rem;
        justify-content: center;
      }

      .j-file-upload__meta {
        display: grid;
        gap: var(--j-spacing-1);
      }

      .j-file-upload__meta small {
        color: var(--j-color-muted-foreground);
      }

      .j-file-upload__progress {
        background: var(--j-color-border);
        border-radius: var(--j-radius-full);
        display: block;
        height: 0.375rem;
        overflow: hidden;
      }

      .j-file-upload__progress span {
        background: var(--j-file-upload-progress-color, var(--j-color-primary, #2563eb));
        display: block;
        height: 100%;
      }

      .j-file-upload__error,
      .j-file-upload__errors {
        color: var(--j-file-upload-error-color, var(--j-color-danger, #dc2626));
      }

      @media (max-width: 640px) {
        .j-file-upload__header,
        .j-file-upload__list li {
          align-items: stretch;
          grid-template-columns: 1fr;
        }

        .j-file-upload__header {
          display: grid;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JFileUploadComponent {
  readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  readonly mode = input<JFileUploadMode>('advanced');
  readonly multiple = input(false, { transform: booleanAttribute });
  readonly accept = input('');
  readonly maxFileSize = input(0, { transform: numberAttribute });
  readonly chooseLabel = input('Choose');
  readonly uploadLabel = input('Upload');
  readonly cancelLabel = input('Clear');
  readonly title = input('Upload files');
  readonly description = input('Add files to the upload queue.');
  readonly auto = input(false, { transform: booleanAttribute });
  readonly customUpload = input(true, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly styleClass = input('');

  readonly filesChange = output<readonly File[]>();
  readonly upload = output<JFileUploadEvent>();
  readonly remove = output<File>();
  readonly cancelUpload = output<JFileUploadItemEvent>();
  readonly retryUpload = output<JFileUploadItemEvent>();
  readonly previewFile = output<JFileUploadItem>();
  readonly downloadFile = output<JFileUploadItem>();

  readonly queue = signal<readonly JFileUploadItem[]>([]);
  readonly errors = signal<readonly JFileUploadError[]>([]);
  readonly dragover = signal(false);

  readonly uploaderClasses = computed(() =>
    ['j-file-upload', this.mode() === 'basic' ? 'j-file-upload--basic' : '', this.styleClass()]
      .filter(Boolean)
      .join(' '),
  );

  handleFileInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement | null;
    this.addFiles(Array.from(inputElement?.files ?? []));
    if (inputElement) {
      inputElement.value = '';
    }
  }

  handleDragOver(event: DragEvent): void {
    event.preventDefault();
    if (!this.disabled()) {
      this.dragover.set(true);
    }
  }

  handleDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragover.set(false);
  }

  handleDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragover.set(false);
    if (!this.disabled()) {
      this.addFiles(Array.from(event.dataTransfer?.files ?? []));
    }
  }

  openFilePicker(): void {
    this.fileInput()?.nativeElement.click();
  }

  removeItem(item: JFileUploadItem): void {
    this.queue.set(this.queue().filter((entry) => entry.id !== item.id));
    this.remove.emit(item.file);
    this.emitFilesChange();
  }

  clear(): void {
    this.queue.set([]);
    this.errors.set([]);
    this.emitFilesChange();
    const inputElement = this.fileInput()?.nativeElement;
    if (inputElement) {
      inputElement.value = '';
    }
  }

  emitUpload(): void {
    const items = this.queue().map((item) => ({ ...item, status: 'uploading' as const }));
    this.queue.set(items);
    this.upload.emit({ files: items.map((item) => item.file), items });
  }

  cancel(item: JFileUploadItem): void {
    this.updateItem(item.id, { status: 'cancelled', progress: item.progress });
    this.cancelUpload.emit({ item });
  }

  retry(item: JFileUploadItem): void {
    this.updateItem(item.id, { status: 'pending', progress: 0, error: undefined });
    this.retryUpload.emit({ item });
  }

  setProgress(itemId: string, progress: number): void {
    this.updateItem(itemId, {
      progress: Math.min(100, Math.max(0, progress)),
      status: progress >= 100 ? 'complete' : 'uploading',
    });
  }

  setError(itemId: string, error: string): void {
    this.updateItem(itemId, { status: 'error', error });
  }

  formatSize(size: number): string {
    if (size < 1024) {
      return `${size} B`;
    }
    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }
    return `${(size / 1024 / 1024).toFixed(1)} MB`;
  }

  filePreviewLabel(file: File): string {
    return file.type.startsWith('image/')
      ? 'IMG'
      : file.name.split('.').pop()?.slice(0, 4).toUpperCase() || 'FILE';
  }

  private addFiles(files: readonly File[]): void {
    const accepted: JFileUploadItem[] = [];
    const errors: JFileUploadError[] = [];
    for (const file of files) {
      const error = this.validateFile(file);
      if (error) {
        errors.push({ file, message: error });
      } else {
        accepted.push({ id: createFileId(file), file, progress: 0, status: 'pending' });
      }
    }

    this.errors.set(errors);
    this.queue.set(this.multiple() ? [...this.queue(), ...accepted] : accepted.slice(0, 1));
    this.emitFilesChange();

    if (this.auto() && accepted.length) {
      this.emitUpload();
    }
  }

  private validateFile(file: File): string {
    if (this.maxFileSize() > 0 && file.size > this.maxFileSize()) {
      return `File exceeds ${this.formatSize(this.maxFileSize())}`;
    }
    if (this.accept() && !matchesAccept(file, this.accept())) {
      return 'File type is not allowed';
    }
    return '';
  }

  private updateItem(itemId: string, patch: Partial<JFileUploadItem>): void {
    this.queue.set(this.queue().map((item) => (item.id === itemId ? { ...item, ...patch } : item)));
  }

  private emitFilesChange(): void {
    this.filesChange.emit(this.queue().map((item) => item.file));
  }
}

function createFileId(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`;
}

function matchesAccept(file: File, accept: string): boolean {
  const rules = accept
    .split(',')
    .map((rule) => rule.trim().toLowerCase())
    .filter(Boolean);
  if (!rules.length) {
    return true;
  }
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return rules.some((rule) => {
    if (rule.startsWith('.')) {
      return name.endsWith(rule);
    }
    if (rule.endsWith('/*')) {
      return type.startsWith(rule.slice(0, -1));
    }
    return type === rule;
  });
}
