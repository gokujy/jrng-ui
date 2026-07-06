import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  PLATFORM_ID,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { JPassThrough, jMergePartClasses } from 'jrng-ui/core';

@Component({
  selector: 'j-copy-button',
  imports: [],
  template: `
    <button
      type="button"
      [class]="buttonClasses()"
      data-jc-name="copy-button"
      data-jc-section="root"
      [attr.data-j-active]="copiedState() ? 'true' : null"
      [attr.data-j-error]="failedState() ? 'true' : null"
      [attr.data-j-disabled]="disabled() ? 'true' : null"
      [disabled]="disabled()"
      [attr.aria-label]="ariaLabel()"
      (click)="copy()"
    >
      @if (copiedState()) {
        <span data-jc-section="icon" aria-hidden="true">&#10003;</span>
      } @else if (failedState()) {
        <span data-jc-section="icon" aria-hidden="true">!</span>
      } @else {
        <span data-jc-section="icon" aria-hidden="true">&#10697;</span>
      }
      <span data-jc-section="label" aria-live="polite">{{ statusLabel() }}</span>
    </button>
  `,
  styles: [
    `
      .j-copy-button {
        align-items: center;
        background: var(--j-color-surface, #ffffff);
        border: 1px solid var(--j-color-border, #dbe2ea);
        border-radius: var(--j-radius-sm, 0.375rem);
        color: var(--j-color-text, #111827);
        cursor: pointer;
        display: inline-flex;
        font: inherit;
        gap: var(--j-spacing-sm, 0.5rem);
        min-height: 2.25rem;
        padding: 0 var(--j-spacing-md, 0.75rem);
      }

      .j-copy-button[data-j-active='true'] {
        border-color: var(--j-copy-success-color, var(--j-color-success, #16a34a));
        color: var(--j-copy-success-color, var(--j-color-success, #16a34a));
      }

      .j-copy-button[data-j-error='true'] {
        border-color: var(--j-copy-error-color, var(--j-color-danger, #dc2626));
        color: var(--j-copy-error-color, var(--j-color-danger, #dc2626));
      }

      .j-copy-button:focus-visible {
        box-shadow: var(--j-focus-ring, 0 0 0 3px rgb(79 70 229 / 24%));
        outline: none;
      }

      .j-copy-button:disabled {
        cursor: not-allowed;
        opacity: var(--j-disabled-opacity);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JCopyButtonComponent {
  private readonly documentRef = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private resetTimer: ReturnType<typeof setTimeout> | null = null;

  readonly text = input('');
  readonly label = input('Copy');
  readonly copiedLabel = input('Copied');
  readonly failedLabel = input('Copy failed');
  readonly ariaLabel = input('Copy to clipboard');
  readonly styleClass = input('');
  readonly pt = input<JPassThrough | null>(null);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly copied = output<string>();
  readonly copyFailed = output<unknown>();

  readonly copyState = signal<'idle' | 'copied' | 'failed'>('idle');
  readonly copiedState = computed(() => this.copyState() === 'copied');
  readonly failedState = computed(() => this.copyState() === 'failed');
  readonly statusLabel = computed(() => {
    if (this.copiedState()) {
      return this.copiedLabel();
    }
    if (this.failedState()) {
      return this.failedLabel();
    }
    return this.label();
  });
  readonly buttonClasses = computed(() =>
    jMergePartClasses('j-copy-button', this.styleClass(), this.pt()),
  );

  constructor() {
    this.destroyRef.onDestroy(() => this.clearResetTimer());
  }

  async copy(): Promise<void> {
    if (this.disabled()) {
      return;
    }

    const text = this.text();
    try {
      await this.writeClipboard(text);
      this.copyState.set('copied');
      this.copied.emit(text);
    } catch (error) {
      this.copyState.set('failed');
      this.copyFailed.emit(error);
    }
    this.clearResetTimer();

    if (!this.isBrowser) {
      return;
    }

    this.resetTimer = setTimeout(() => {
      this.copyState.set('idle');
      this.resetTimer = null;
    }, 1600);
  }

  private async writeClipboard(text: string): Promise<void> {
    const windowRef = this.isBrowser ? this.documentRef.defaultView : null;
    const clipboard = windowRef?.navigator.clipboard;
    if (clipboard) {
      await clipboard.writeText(text);
      return;
    }
    throw new Error('Clipboard API is not available.');
  }

  private clearResetTimer(): void {
    if (!this.resetTimer) {
      return;
    }

    clearTimeout(this.resetTimer);
    this.resetTimer = null;
  }
}
