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
import { JPassThrough, jMergePartClasses } from '../core/pass-through';

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
      [attr.data-j-disabled]="disabled() ? 'true' : null"
      [disabled]="disabled()"
      [attr.aria-label]="ariaLabel()"
      (click)="copy()"
    >
      @if (copiedState()) {
        <span data-jc-section="icon" aria-hidden="true">&#10003;</span>
      } @else {
        <span data-jc-section="icon" aria-hidden="true">&#10697;</span>
      }
      <span data-jc-section="label">{{ copiedState() ? copiedLabel() : label() }}</span>
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
  readonly ariaLabel = input('Copy to clipboard');
  readonly styleClass = input('');
  readonly pt = input<JPassThrough | null>(null);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly copied = output<string>();

  readonly copiedState = signal(false);
  readonly buttonClasses = computed(() => jMergePartClasses('j-copy-button', this.styleClass(), this.pt()));

  constructor() {
    this.destroyRef.onDestroy(() => this.clearResetTimer());
  }

  async copy(): Promise<void> {
    if (this.disabled()) {
      return;
    }

    const text = this.text();
    const clipboard = this.isBrowser ? this.documentRef.defaultView?.navigator.clipboard : null;

    if (clipboard) {
      await clipboard.writeText(text);
    }

    this.copiedState.set(true);
    this.copied.emit(text);
    this.clearResetTimer();

    if (!this.isBrowser) {
      return;
    }

    this.resetTimer = setTimeout(() => {
      this.copiedState.set(false);
      this.resetTimer = null;
    }, 1600);
  }

  private clearResetTimer(): void {
    if (!this.resetTimer) {
      return;
    }

    clearTimeout(this.resetTimer);
    this.resetTimer = null;
  }
}
