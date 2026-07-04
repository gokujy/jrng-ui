import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  booleanAttribute,
  numberAttribute,
} from '@angular/core';

export interface JFileUploadError {
  readonly file: File;
  readonly message: string;
}

export interface JFileUploadEvent {
  readonly files: readonly File[];
}

@Component({
  selector: 'j-file-upload',
  imports: [],
  template: `
    <div
      class="j-file-upload"
      [class.j-file-upload--basic]="mode === 'basic'"
      [class.is-dragover]="dragover"
      (dragover)="handleDragOver($event)"
      (dragleave)="handleDragLeave($event)"
      (drop)="handleDrop($event)"
    >
      <input
        #fileInput
        class="j-file-upload__input"
        type="file"
        [attr.accept]="accept || null"
        [multiple]="multiple"
        (change)="handleFileInput($event)"
      />

      <div class="j-file-upload__actions">
        <button type="button" class="j-file-upload__button" (click)="fileInput.click()">
          {{ chooseLabel }}
        </button>
        @if (!auto) {
          <button
            type="button"
            class="j-file-upload__button j-file-upload__button--primary"
            [disabled]="!files.length"
            (click)="emitUpload()"
          >
            {{ uploadLabel }}
          </button>
        }
        @if (files.length) {
          <button type="button" class="j-file-upload__button" (click)="clear()">
            {{ cancelLabel }}
          </button>
        }
      </div>

      @if (mode !== 'basic') {
        <p class="j-file-upload__hint">Drop files here or choose from your device.</p>
      }

      @if (files.length) {
        <ul class="j-file-upload__list">
          @for (file of files; track file.name + ':' + file.lastModified; let index = $index) {
            <li>
              <span>{{ file.name }}</span>
              <small>{{ formatSize(file.size) }}</small>
              <button type="button" (click)="removeAt(index)">Remove</button>
            </li>
          }
        </ul>
      }

      @if (errors.length) {
        <ul class="j-file-upload__errors" aria-live="polite">
          @for (error of errors; track error.file.name + ':' + error.message) {
            <li>{{ error.file.name }}: {{ error.message }}</li>
          }
        </ul>
      }
    </div>
  `,
  styles: [
    `
      .j-file-upload {
        background: var(--j-color-surface, #ffffff);
        border: 1px dashed var(--j-color-border-strong, #cbd5e1);
        border-radius: var(--j-radius-md, 0.5rem);
        color: var(--j-color-text, #111827);
        display: grid;
        gap: var(--j-spacing-md, 0.75rem);
        padding: var(--j-spacing-lg, 1rem);
      }

      .j-file-upload--basic {
        border-style: solid;
        display: inline-grid;
      }

      .j-file-upload.is-dragover {
        border-color: var(--j-color-primary, #4f46e5);
        box-shadow: var(--j-focus-ring, 0 0 0 3px rgb(79 70 229 / 24%));
      }

      .j-file-upload__input {
        display: none;
      }

      .j-file-upload__actions {
        display: flex;
        flex-wrap: wrap;
        gap: var(--j-spacing-sm, 0.5rem);
      }

      .j-file-upload__button {
        background: var(--j-color-surface, #ffffff);
        border: 1px solid var(--j-color-border, #dbe2ea);
        border-radius: var(--j-radius-sm, 0.375rem);
        color: var(--j-color-text, #111827);
        cursor: pointer;
        font: inherit;
        min-height: 2.25rem;
        padding: 0 var(--j-spacing-lg, 1rem);
      }

      .j-file-upload__button--primary {
        background: var(--j-color-primary, #4f46e5);
        border-color: var(--j-color-primary, #4f46e5);
        color: var(--j-color-on-primary, #ffffff);
      }

      .j-file-upload__button:disabled {
        cursor: not-allowed;
        opacity: var(--j-disabled-opacity, 0.55);
      }

      .j-file-upload__button:focus-visible,
      .j-file-upload__list button:focus-visible {
        box-shadow: var(--j-focus-ring, 0 0 0 3px rgb(79 70 229 / 24%));
        outline: none;
      }

      .j-file-upload__hint {
        color: var(--j-color-text-muted, #64748b);
        margin: 0;
      }

      .j-file-upload__list,
      .j-file-upload__errors {
        display: grid;
        gap: var(--j-spacing-sm, 0.5rem);
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .j-file-upload__list li {
        align-items: center;
        background: var(--j-color-surface-muted, #f8fafc);
        border-radius: var(--j-radius-sm, 0.375rem);
        display: grid;
        gap: var(--j-spacing-sm, 0.5rem);
        grid-template-columns: 1fr auto auto;
        padding: var(--j-spacing-sm, 0.5rem);
      }

      .j-file-upload__list small {
        color: var(--j-color-text-muted, #64748b);
      }

      .j-file-upload__list button {
        background: transparent;
        border: 0;
        color: var(--j-color-danger, #dc2626);
        cursor: pointer;
        font: inherit;
      }

      .j-file-upload__errors {
        color: var(--j-color-danger, #dc2626);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JFileUploadComponent {
  @ViewChild('fileInput') private fileInput?: ElementRef<HTMLInputElement>;

  @Input() mode: 'basic' | 'advanced' = 'advanced';
  @Input({ transform: booleanAttribute }) multiple = false;
  @Input() accept = '';
  @Input({ transform: numberAttribute }) maxFileSize = 0;
  @Input() chooseLabel = 'Choose';
  @Input() uploadLabel = 'Upload';
  @Input() cancelLabel = 'Cancel';
  @Input({ transform: booleanAttribute }) auto = false;
  @Input({ transform: booleanAttribute }) customUpload = true;

  @Output() filesChange = new EventEmitter<readonly File[]>();
  @Output() upload = new EventEmitter<JFileUploadEvent>();
  @Output() remove = new EventEmitter<File>();

  files: readonly File[] = [];
  errors: readonly JFileUploadError[] = [];
  dragover = false;

  handleFileInput(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    this.addFiles(Array.from(input?.files ?? []));
    if (input) {
      input.value = '';
    }
  }

  handleDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragover = true;
  }

  handleDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragover = false;
  }

  handleDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragover = false;
    this.addFiles(Array.from(event.dataTransfer?.files ?? []));
  }

  removeAt(index: number): void {
    const file = this.files[index];

    if (!file) {
      return;
    }

    this.files = this.files.filter((_, itemIndex) => itemIndex !== index);
    this.remove.emit(file);
    this.filesChange.emit(this.files);
  }

  clear(): void {
    this.files = [];
    this.errors = [];
    this.filesChange.emit(this.files);
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  emitUpload(): void {
    this.upload.emit({ files: this.files });
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

  private addFiles(files: readonly File[]): void {
    const accepted: File[] = [];
    const errors: JFileUploadError[] = [];

    files.forEach((file) => {
      if (this.maxFileSize > 0 && file.size > this.maxFileSize) {
        errors.push({ file, message: `File exceeds ${this.formatSize(this.maxFileSize)}` });
        return;
      }

      accepted.push(file);
    });

    this.errors = errors;
    this.files = this.multiple ? [...this.files, ...accepted] : accepted.slice(0, 1);
    this.filesChange.emit(this.files);

    if (this.auto && accepted.length) {
      this.emitUpload();
    }
  }
}
