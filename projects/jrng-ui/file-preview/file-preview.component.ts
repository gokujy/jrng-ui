import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
  output,
} from '@angular/core';
import { JIconComponent } from 'jrng-ui/icon';
import { JButtonComponent } from 'jrng-ui/button';
import { JActionDisplay, JSeverity } from 'jrng-ui/core';
import { formatFileSize, resolveFileType } from './file-type';

export interface JFilePreviewAction {
  readonly visible?: boolean;
  readonly icon?: string;
  readonly label?: string;
  readonly severity?: JSeverity;
  readonly disabled?: boolean;
  readonly loading?: boolean;
}

@Component({
  selector: 'j-file-preview',
  imports: [JIconComponent, JButtonComponent],
  template: `
    <article
      class="j-file-preview"
      [class]="styleClass()"
      data-jc-name="file-preview"
      data-jc-section="root"
    >
      <div class="j-file-preview__icon" aria-hidden="true">
        @if (showTypeLabel()) {
          <span>{{ typeLabel() || extension() }}</span>
        } @else {
          <j-icon [name]="resolvedIcon()" size="1.35rem" />
        }
      </div>
      <div class="j-file-preview__body">
        <strong [title]="name()">{{ name() }}</strong>
        <div class="j-file-preview__meta">
          <span>{{ presentation().label }}</span>
          @if (sizeLabel()) {
            <span>{{ sizeLabel() }}</span>
          }
        </div>
        @if (description()) {
          <p>{{ description() }}</p>
        }
      </div>
      <div class="j-file-preview__actions">
        @if (previewVisible()) {
          <j-button
            variant="text"
            [actionDisplay]="actionDisplay()"
            [icon]="previewAction().icon || 'eye'"
            [label]="previewAction().label || previewLabel()"
            [ariaLabel]="previewAction().label || previewLabel()"
            [title]="previewAction().label || previewLabel()"
            [severity]="previewAction().severity || 'neutral'"
            [disabled]="previewAction().disabled || false"
            [loading]="previewAction().loading || false"
            (onClick)="preview.emit()"
          />
        }
        @if (downloadAction().visible !== false) {
          <j-button
            variant="text"
            [actionDisplay]="actionDisplay()"
            [icon]="downloadAction().icon || 'download'"
            [label]="downloadAction().label || downloadLabel()"
            [ariaLabel]="downloadAction().label || downloadLabel()"
            [title]="downloadAction().label || downloadLabel()"
            [severity]="downloadAction().severity || 'neutral'"
            [disabled]="downloadAction().disabled || false"
            [loading]="downloadAction().loading || false"
            (onClick)="download.emit()"
          />
        }
        @if (removable() && removeAction().visible !== false) {
          <j-button
            variant="text"
            severity="danger"
            [actionDisplay]="actionDisplay()"
            [icon]="removeAction().icon || 'trash'"
            [label]="removeAction().label || removeLabel()"
            [ariaLabel]="removeAction().label || removeLabel()"
            [title]="removeAction().label || removeLabel()"
            [disabled]="removeAction().disabled || false"
            [loading]="removeAction().loading || false"
            (onClick)="remove.emit()"
          />
        }
      </div>
    </article>
  `,
  styles: [
    `
      .j-file-preview {
        align-items: center;
        background: var(--j-file-preview-bg, var(--j-color-card));
        border: 1px solid var(--j-file-preview-border-color, var(--j-color-border));
        border-radius: var(--j-radius-lg);
        color: var(--j-file-preview-color, var(--j-color-card-foreground));
        display: grid;
        gap: var(--j-spacing-4);
        grid-template-columns: 3.25rem minmax(10rem, 1fr) auto;
        min-width: 0;
        padding: var(--j-spacing-4);
      }

      .j-file-preview__icon {
        align-items: center;
        background: var(--j-color-muted);
        border-radius: var(--j-radius-md);
        display: flex;
        font-size: var(--j-font-size-xs);
        font-weight: var(--j-font-weight-semibold);
        height: 3.25rem;
        justify-content: center;
        line-height: 1.15;
        overflow: hidden;
        padding: var(--j-spacing-1);
        text-align: center;
        width: 3.25rem;
      }

      .j-file-preview__body {
        display: grid;
        gap: var(--j-spacing-1);
        min-width: 0;
      }

      .j-file-preview__body strong {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .j-file-preview__meta {
        align-items: center;
        color: var(--j-color-muted-foreground);
        display: flex;
        flex-wrap: wrap;
        font-size: var(--j-font-size-xs);
        gap: var(--j-spacing-2);
      }

      .j-file-preview__meta span + span::before {
        content: '•';
        margin-inline-end: var(--j-spacing-2);
      }

      .j-file-preview__body p {
        color: var(--j-color-muted-foreground);
        margin: 0;
      }

      .j-file-preview__actions {
        align-items: center;
        border-inline-start: 1px solid var(--j-color-border);
        display: flex;
        flex-wrap: wrap;
        gap: var(--j-spacing-1);
        justify-content: flex-end;
        padding-inline-start: var(--j-spacing-3);
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

      .j-file-preview__actions a:focus-visible,
      .j-file-preview__actions button:focus-visible {
        box-shadow: var(--j-focus-ring);
        outline: none;
      }

      @media (max-width: 720px) {
        .j-file-preview {
          gap: var(--j-spacing-3);
          grid-template-columns: 3.25rem minmax(0, 1fr);
          padding: var(--j-spacing-3);
        }

        .j-file-preview__actions {
          border-block-start: 1px solid var(--j-color-border);
          border-inline-start: 0;
          grid-column: 1 / -1;
          justify-content: flex-start;
          padding-block-start: var(--j-spacing-2);
          padding-inline-start: 0;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JFilePreviewComponent {
  readonly file = input<File | null>(null);
  readonly fileName = input('');
  readonly fileSize = input(0);
  readonly mimeType = input('');
  readonly description = input('');
  readonly url = input('');
  readonly previewLabel = input('Preview');
  readonly downloadLabel = input('Download');
  readonly removeLabel = input('Remove');
  readonly icon = input('');
  readonly typeLabel = input('');
  readonly showTypeLabel = input(false, { transform: booleanAttribute });
  readonly removable = input(true, { transform: booleanAttribute });
  readonly actionDisplay = input<JActionDisplay>('icon');
  readonly previewAction = input<JFilePreviewAction>({});
  readonly downloadAction = input<JFilePreviewAction>({});
  readonly removeAction = input<JFilePreviewAction>({ severity: 'danger' });
  readonly styleClass = input('');

  readonly remove = output<void>();
  readonly preview = output<void>();
  readonly download = output<void>();

  readonly previewVisible = computed(
    () => this.previewAction().visible ?? Boolean(this.url() || this.file()),
  );

  readonly name = computed(() => this.file()?.name || this.fileName());
  readonly extension = computed(() => this.presentation().extension.toUpperCase() || 'FILE');
  readonly presentation = computed(() =>
    resolveFileType({ fileName: this.name(), mimeType: this.file()?.type || this.mimeType() }),
  );
  readonly resolvedIcon = computed(() => {
    if (this.icon()) return this.icon();
    return this.presentation().icon;
  });
  readonly sizeLabel = computed(() => {
    const size = this.file()?.size || this.fileSize();
    return size ? formatFileSize(size) : '';
  });
}
