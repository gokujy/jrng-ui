import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input, numberAttribute, output, signal } from '@angular/core';
import { JFileUploadError } from '../file-upload/file-upload.component';

export interface JDropzoneEvent {
  readonly files: readonly File[];
}

@Component({
  selector: 'j-dropzone',
  imports: [],
  template: `
    <section
      class="j-dropzone"
      [class]="dropzoneClasses()"
      [class.is-dragover]="dragover()"
      data-jc-name="dropzone"
      data-jc-section="root"
      data-jc-extend="drag-drop preview upload"
      tabindex="0"
      role="button"
      [attr.aria-label]="ariaLabel()"
      (click)="fileInput.click()"
      (keydown.enter)="fileInput.click()"
      (keydown.space)="fileInput.click()"
      (dragover)="handleDragOver($event)"
      (dragleave)="handleDragLeave($event)"
      (drop)="handleDrop($event)"
    >
      <input
        #fileInput
        class="j-dropzone__input"
        type="file"
        [attr.accept]="accept() || null"
        [multiple]="multiple()"
        (change)="handleInput($event)"
      />
      <strong>{{ title() }}</strong>
      <p>{{ description() }}</p>

      @if (files().length) {
        <ul class="j-dropzone__files">
          @for (file of files(); track file.name + ':' + file.lastModified) {
            <li>
              <span>{{ file.name }}</span>
              <button type="button" (click)="removeFile(file, $event)">Remove</button>
            </li>
          }
        </ul>
      }

      @if (errors().length) {
        <ul class="j-dropzone__errors" aria-live="polite">
          @for (error of errors(); track error.file.name + ':' + error.message) {
            <li>{{ error.file.name }}: {{ error.message }}</li>
          }
        </ul>
      }
    </section>
  `,
  styles: [
    `
      .j-dropzone {
        background: var(--j-color-card);
        border: 1px dashed var(--j-color-border);
        border-radius: var(--j-radius-lg);
        color: var(--j-color-card-foreground);
        cursor: pointer;
        display: grid;
        gap: var(--j-spacing-3);
        min-height: 10rem;
        padding: var(--j-spacing-5);
        place-items: center;
        text-align: center;
      }

      .j-dropzone.is-dragover {
        border-color: var(--j-color-primary);
        box-shadow: var(--j-focus-ring);
      }

      .j-dropzone:focus-visible {
        box-shadow: var(--j-focus-ring);
        outline: none;
      }

      .j-dropzone__input {
        display: none;
      }

      .j-dropzone p {
        color: var(--j-color-muted-foreground);
        margin: 0;
      }

      .j-dropzone__files,
      .j-dropzone__errors {
        display: grid;
        gap: var(--j-spacing-2);
        list-style: none;
        margin: 0;
        padding: 0;
        width: 100%;
      }

      .j-dropzone__files li {
        align-items: center;
        background: var(--j-color-muted);
        border-radius: var(--j-radius-md);
        display: flex;
        justify-content: space-between;
        padding: var(--j-spacing-2);
      }

      .j-dropzone__files button {
        background: transparent;
        border: 0;
        color: var(--j-color-danger);
        cursor: pointer;
      }

      .j-dropzone__errors {
        color: var(--j-color-danger);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JDropzoneComponent {
  readonly multiple = input(false, { transform: booleanAttribute });
  readonly accept = input('');
  readonly maxFileSize = input(0, { transform: numberAttribute });
  readonly title = input('Drop files here');
  readonly description = input('Choose files or drag them into this area.');
  readonly ariaLabel = input('File dropzone');
  readonly styleClass = input('');

  readonly filesChange = output<readonly File[]>();
  readonly upload = output<JDropzoneEvent>();
  readonly remove = output<File>();

  readonly files = signal<readonly File[]>([]);
  readonly errors = signal<readonly JFileUploadError[]>([]);
  readonly dragover = signal(false);
  readonly dropzoneClasses = computed(() => ['j-dropzone', this.styleClass()].filter(Boolean).join(' '));

  handleInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement | null;
    this.addFiles(Array.from(inputElement?.files ?? []));
    if (inputElement) {
      inputElement.value = '';
    }
  }

  handleDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragover.set(true);
  }

  handleDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragover.set(false);
  }

  handleDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragover.set(false);
    this.addFiles(Array.from(event.dataTransfer?.files ?? []));
  }

  removeFile(file: File, event: Event): void {
    event.stopPropagation();
    this.files.set(this.files().filter((item) => item !== file));
    this.remove.emit(file);
    this.filesChange.emit(this.files());
  }

  private addFiles(files: readonly File[]): void {
    const accepted: File[] = [];
    const errors: JFileUploadError[] = [];
    for (const file of files) {
      if (this.maxFileSize() > 0 && file.size > this.maxFileSize()) {
        errors.push({ file, message: 'File is too large' });
      } else if (this.accept() && !matchesAccept(file, this.accept())) {
        errors.push({ file, message: 'File type is not allowed' });
      } else {
        accepted.push(file);
      }
    }
    this.errors.set(errors);
    const next = this.multiple() ? [...this.files(), ...accepted] : accepted.slice(0, 1);
    this.files.set(next);
    this.filesChange.emit(next);
    if (accepted.length) {
      this.upload.emit({ files: accepted });
    }
  }
}

function matchesAccept(file: File, accept: string): boolean {
  const rules = accept
    .split(',')
    .map((rule) => rule.trim().toLowerCase())
    .filter(Boolean);
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return rules.some((rule) => (rule.startsWith('.') ? name.endsWith(rule) : rule.endsWith('/*') ? type.startsWith(rule.slice(0, -1)) : type === rule));
}
