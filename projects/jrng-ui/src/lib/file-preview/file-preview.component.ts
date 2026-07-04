import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'j-file-preview',
  imports: [],
  template: `
    <article class="j-file-preview" [class]="styleClass()" data-jc-name="file-preview" data-jc-section="root">
      <div class="j-file-preview__icon" aria-hidden="true">{{ extension() }}</div>
      <div class="j-file-preview__body">
        <strong>{{ name() }}</strong>
        @if (sizeLabel()) {
          <small>{{ sizeLabel() }}</small>
        }
        @if (description()) {
          <p>{{ description() }}</p>
        }
      </div>
      <div class="j-file-preview__actions">
        @if (url()) {
          <a [href]="url()" target="_blank" rel="noreferrer">Open</a>
        }
        <button type="button" (click)="remove.emit()">Remove</button>
      </div>
    </article>
  `,
  styles: [
    `
      .j-file-preview {
        align-items: center;
        background: var(--j-color-card);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-lg);
        color: var(--j-color-card-foreground);
        display: grid;
        gap: var(--j-spacing-3);
        grid-template-columns: 3rem minmax(0, 1fr) auto;
        padding: var(--j-spacing-3);
      }

      .j-file-preview__icon {
        align-items: center;
        background: var(--j-color-muted);
        border-radius: var(--j-radius-md);
        display: flex;
        font-size: var(--j-font-size-xs);
        height: 3rem;
        justify-content: center;
      }

      .j-file-preview__body {
        display: grid;
        gap: var(--j-spacing-1);
        min-width: 0;
      }

      .j-file-preview__body small,
      .j-file-preview__body p {
        color: var(--j-color-muted-foreground);
        margin: 0;
      }

      .j-file-preview__actions {
        display: flex;
        gap: var(--j-spacing-2);
      }

      .j-file-preview__actions a,
      .j-file-preview__actions button {
        background: transparent;
        border: 0;
        color: var(--j-color-primary);
        cursor: pointer;
        font: inherit;
        text-decoration: none;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JFilePreviewComponent {
  readonly file = input<File | null>(null);
  readonly fileName = input('');
  readonly fileSize = input(0);
  readonly description = input('');
  readonly url = input('');
  readonly styleClass = input('');

  readonly remove = output<void>();

  readonly name = computed(() => this.file()?.name || this.fileName());
  readonly extension = computed(() => this.name().split('.').pop()?.slice(0, 4).toUpperCase() || 'FILE');
  readonly sizeLabel = computed(() => {
    const size = this.file()?.size || this.fileSize();
    if (!size) {
      return '';
    }
    if (size < 1024) {
      return `${size} B`;
    }
    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }
    return `${(size / 1024 / 1024).toFixed(1)} MB`;
  });
}
