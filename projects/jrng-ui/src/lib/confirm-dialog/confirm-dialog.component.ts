import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  ViewChild,
  effect,
  inject,
} from '@angular/core';
import { JConfirmationService } from './confirmation.service';

@Component({
  selector: 'j-confirm-dialog',
  imports: [],
  template: `
    @if (confirmationService.confirmation(); as confirmation) {
      <div
        class="j-confirm-dialog__backdrop"
        [class]="'j-confirm-dialog__backdrop j-confirm-dialog__backdrop--' + (confirmation.severity || 'info')"
        (mousedown)="handleOverlayMouseDown($event)"
      >
        <section
          #dialogPanel
          class="j-confirm-dialog"
          [class]="'j-confirm-dialog j-confirm-dialog--' + (confirmation.severity || 'info')"
          role="alertdialog"
          aria-modal="true"
          [attr.aria-labelledby]="titleId"
          [attr.aria-describedby]="messageId"
          tabindex="-1"
          (mousedown)="$event.stopPropagation()"
        >
          <header class="j-confirm-dialog__header">
            @if (confirmation.icon) {
              <span class="j-confirm-dialog__icon">{{ confirmation.icon }}</span>
            } @else {
              <span class="j-confirm-dialog__icon" aria-hidden="true">{{ severityIcon(confirmation.severity) }}</span>
            }
            <h2 [id]="titleId">{{ confirmation.title || confirmation.header || 'Confirm' }}</h2>
          </header>
          <p class="j-confirm-dialog__message" [id]="messageId">{{ confirmation.message }}</p>
          <footer class="j-confirm-dialog__footer">
            <button
              class="j-confirm-dialog__button j-confirm-dialog__button--reject"
              type="button"
              #cancelButton
              (click)="reject()"
            >
              {{ confirmation.cancelText || confirmation.rejectLabel || 'Cancel' }}
            </button>
            <button
              class="j-confirm-dialog__button j-confirm-dialog__button--accept"
              type="button"
              #acceptButton
              (click)="accept()"
            >
              {{ confirmation.confirmText || confirmation.acceptLabel || 'OK' }}
            </button>
          </footer>
        </section>
      </div>
    }
  `,
  styles: [
    `
      .j-confirm-dialog__backdrop {
        align-items: center;
        background: var(--j-confirm-dialog-backdrop-bg, var(--j-overlay-backdrop-bg, rgb(15 23 42 / 56%)));
        display: flex;
        inset: 0;
        justify-content: center;
        padding: var(--j-spacing-lg, 1.5rem);
        position: fixed;
        z-index: var(--j-z-index-modal);
      }
      .j-confirm-dialog {
        background: var(--j-confirm-dialog-bg, var(--j-color-card, #ffffff));
        border: 1px solid var(--j-confirm-dialog-border-color, var(--j-color-border, #e2e8f0));
        border-radius: var(--j-confirm-dialog-radius, var(--j-radius-lg, 0.75rem));
        box-shadow: var(--j-confirm-dialog-shadow, var(--j-shadow-lg));
        color: var(--j-confirm-dialog-color, var(--j-color-card-foreground, #111827));
        max-width: 28rem;
        outline: none;
        padding: var(--j-spacing-lg, 1.5rem);
        width: 100%;
      }
      .j-confirm-dialog__header {
        align-items: center;
        display: flex;
        gap: var(--j-spacing-sm, 0.5rem);
      }
      .j-confirm-dialog__icon {
        align-items: center;
        background: var(--j-confirm-dialog-icon-bg, color-mix(in srgb, var(--j-confirm-dialog-accent, var(--j-color-info, #0284c7)) 12%, transparent));
        border-radius: var(--j-radius-full, 999px);
        color: var(--j-confirm-dialog-accent, var(--j-color-info, #0284c7));
        display: inline-flex;
        flex: 0 0 auto;
        height: 2rem;
        justify-content: center;
        width: 2rem;
      }
      .j-confirm-dialog__header h2,
      .j-confirm-dialog__message {
        margin: 0;
      }
      .j-confirm-dialog__message {
        color: var(--j-confirm-dialog-message-color, var(--j-color-muted-foreground, #64748b));
        line-height: var(--j-line-height-normal, 1.5);
        margin-top: var(--j-spacing-md, 0.75rem);
      }
      .j-confirm-dialog__footer {
        display: flex;
        flex-wrap: wrap;
        gap: var(--j-spacing-sm, 0.5rem);
        justify-content: flex-end;
        margin-top: var(--j-spacing-lg, 1.5rem);
      }
      .j-confirm-dialog__button {
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-md);
        cursor: pointer;
        font: inherit;
        min-height: 2.25rem;
        padding: 0 var(--j-spacing-md, 0.75rem);
      }
      .j-confirm-dialog__button--accept {
        background: var(--j-confirm-dialog-accept-bg, var(--j-confirm-dialog-accent, var(--j-color-primary, #2563eb)));
        border-color: var(--j-confirm-dialog-accept-bg, var(--j-confirm-dialog-accent, var(--j-color-primary, #2563eb)));
        color: var(--j-confirm-dialog-accept-color, var(--j-color-primary-foreground, #ffffff));
      }
      .j-confirm-dialog__button--reject {
        background: var(--j-confirm-dialog-cancel-bg, var(--j-color-card, #ffffff));
        color: var(--j-confirm-dialog-cancel-color, var(--j-color-foreground, #111827));
      }
      .j-confirm-dialog__button:focus-visible {
        box-shadow: var(--j-focus-ring);
        outline: none;
      }
      .j-confirm-dialog--success {
        --j-confirm-dialog-accent: var(--j-color-success, #16a34a);
      }
      .j-confirm-dialog--warning {
        --j-confirm-dialog-accent: var(--j-color-warning, #d97706);
      }
      .j-confirm-dialog--danger {
        --j-confirm-dialog-accent: var(--j-color-danger, #dc2626);
      }
      .j-confirm-dialog--info {
        --j-confirm-dialog-accent: var(--j-color-info, #0284c7);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JConfirmDialogComponent {
  readonly confirmationService = inject(JConfirmationService);
  private readonly documentRef = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private previousFocus: HTMLElement | null = null;

  @ViewChild('dialogPanel') private dialogPanel?: ElementRef<HTMLElement>;
  @ViewChild('acceptButton') private acceptButton?: ElementRef<HTMLButtonElement>;

  readonly titleId = `j-confirm-title-${Math.random().toString(36).slice(2)}`;
  readonly messageId = `j-confirm-message-${Math.random().toString(36).slice(2)}`;

  constructor() {
    effect(() => {
      const confirmation = this.confirmationService.confirmation();
      if (confirmation) {
        this.handleOpened();
        return;
      }
      this.restoreFocus();
    });

    if (!this.isBrowser) {
      return;
    }

    const keydownListener = (event: KeyboardEvent) => this.handleDocumentKeydown(event);
    this.documentRef.addEventListener('keydown', keydownListener);
    this.destroyRef.onDestroy(() => this.documentRef.removeEventListener('keydown', keydownListener));
  }

  accept(): void {
    const confirmation = this.confirmationService.confirmation();
    confirmation?.accept?.();
    this.confirmationService.close();
  }

  reject(): void {
    const confirmation = this.confirmationService.confirmation();
    confirmation?.reject?.();
    this.confirmationService.close();
  }

  handleOverlayMouseDown(event: MouseEvent): void {
    const confirmation = this.confirmationService.confirmation();
    if (event.target === event.currentTarget && confirmation?.closeOnOverlayClick !== false) {
      this.reject();
    }
  }

  severityIcon(severity: string | undefined): string {
    switch (severity) {
      case 'success':
        return '✓';
      case 'warning':
        return '!';
      case 'danger':
        return '!';
      default:
        return 'i';
    }
  }

  private handleOpened(): void {
    if (!this.isBrowser) {
      return;
    }
    this.previousFocus = this.documentRef.activeElement instanceof HTMLElement ? this.documentRef.activeElement : null;
    queueMicrotask(() => {
      (this.acceptButton?.nativeElement ?? this.dialogPanel?.nativeElement)?.focus();
    });
  }

  private handleDocumentKeydown(event: KeyboardEvent): void {
    const confirmation = this.confirmationService.confirmation();
    if (!confirmation || event.key !== 'Escape' || confirmation.closeOnEscape === false) {
      return;
    }
    event.preventDefault();
    this.reject();
  }

  private restoreFocus(): void {
    if (!this.isBrowser) {
      return;
    }
    queueMicrotask(() => {
      this.previousFocus?.focus();
      this.previousFocus = null;
    });
  }
}
