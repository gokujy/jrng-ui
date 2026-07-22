import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  ViewChild,
  computed,
  effect,
  inject,
} from '@angular/core';
import { JConfirmationService } from './confirmation.service';
import {
  JBodyScrollLockService,
  JFocusTrapDirective,
  jCreateId,
  jRememberFocus,
} from 'jrng-ui/core';
import { JButtonComponent } from 'jrng-ui/button';
import { JInternalOverlayHeaderComponent } from 'jrng-ui/overlay-header';

@Component({
  selector: 'j-confirm-dialog',
  imports: [JFocusTrapDirective, JButtonComponent, JInternalOverlayHeaderComponent],
  template: `
    @if (dialogConfirmation(); as confirmation) {
      <div
        class="j-confirm-dialog__backdrop"
        [class]="
          'j-confirm-dialog__backdrop j-confirm-dialog__backdrop--' +
          (confirmation.severity || 'info')
        "
        (mousedown)="handleOverlayMouseDown($event)"
      >
        <section
          #dialogPanel
          jFocusTrap
          class="j-confirm-dialog"
          [class]="'j-confirm-dialog j-confirm-dialog--' + (confirmation.severity || 'info')"
          role="alertdialog"
          aria-modal="true"
          [attr.aria-labelledby]="titleId"
          [attr.aria-describedby]="messageId"
          tabindex="-1"
          (mousedown)="$event.stopPropagation()"
        >
          <j-overlay-header
            [title]="confirmation.title || confirmation.header || 'Confirm'"
            [titleId]="titleId"
            [closable]="false"
            [dense]="true"
          >
            @if (confirmation.icon) {
              <span jOverlayHeader class="j-confirm-dialog__icon">{{ confirmation.icon }}</span>
            } @else {
              <span jOverlayHeader class="j-confirm-dialog__icon" aria-hidden="true">{{
                severityIcon(confirmation.severity)
              }}</span>
            }
          </j-overlay-header>
          <p class="j-confirm-dialog__message" [id]="messageId">{{ confirmation.message }}</p>
          <footer class="j-confirm-dialog__footer">
            <j-button
              #cancelButton
              styleClass="j-confirm-dialog__button j-confirm-dialog__button--reject"
              variant="outlined"
              [severity]="confirmation.rejectButtonSeverity || 'secondary'"
              [label]="confirmation.cancelText || confirmation.rejectLabel || 'Cancel'"
              (onClick)="reject()"
            />
            <j-button
              #acceptButton
              styleClass="j-confirm-dialog__button j-confirm-dialog__button--accept"
              [severity]="confirmation.acceptButtonSeverity || confirmation.severity || 'primary'"
              [label]="confirmation.confirmText || confirmation.acceptLabel || 'OK'"
              (onClick)="accept()"
            />
          </footer>
        </section>
      </div>
    }
  `,
  styles: [
    `
      .j-confirm-dialog__backdrop {
        align-items: center;
        background: var(
          --j-confirm-dialog-backdrop-bg,
          var(--j-overlay-backdrop-bg, rgb(15 23 42 / 56%))
        );
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
        background: var(
          --j-confirm-dialog-icon-bg,
          color-mix(
            in srgb,
            var(--j-confirm-dialog-accent, var(--j-color-info, #0284c7)) 12%,
            transparent
          )
        );
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
        background: var(
          --j-confirm-dialog-accept-bg,
          var(--j-confirm-dialog-accent, var(--j-color-primary, #2563eb))
        );
        border-color: var(
          --j-confirm-dialog-accept-bg,
          var(--j-confirm-dialog-accent, var(--j-color-primary, #2563eb))
        );
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
  readonly dialogConfirmation = computed(() => {
    const confirmation = this.confirmationService.confirmation();
    return confirmation?.target ? null : confirmation;
  });
  private readonly documentRef = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly bodyScrollLock = inject(JBodyScrollLockService);
  private restorePreviousFocus: (() => void) | null = null;
  private scrollLocked = false;

  @ViewChild('dialogPanel') private dialogPanel?: ElementRef<HTMLElement>;
  @ViewChild('acceptButton') private acceptButton?: JButtonComponent;

  readonly titleId = jCreateId('j-confirm-title');
  readonly messageId = jCreateId('j-confirm-message');

  constructor() {
    effect(() => {
      const confirmation = this.dialogConfirmation();
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
    this.destroyRef.onDestroy(() => {
      this.documentRef.removeEventListener('keydown', keydownListener);
      if (this.scrollLocked) {
        this.bodyScrollLock.unlock();
      }
    });
  }

  accept(): void {
    const confirmation = this.dialogConfirmation();
    confirmation?.accept?.();
    this.confirmationService.close();
  }

  reject(): void {
    const confirmation = this.dialogConfirmation();
    confirmation?.reject?.();
    this.confirmationService.close();
  }

  handleOverlayMouseDown(event: MouseEvent): void {
    const confirmation = this.dialogConfirmation();
    if (event.target === event.currentTarget && confirmation?.closeOnOverlayClick !== false) {
      this.reject();
    }
  }

  severityIcon(severity: string | undefined): string {
    switch (severity) {
      case 'success':
        return 'OK';
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
    this.restorePreviousFocus = jRememberFocus(this.documentRef);
    if (!this.scrollLocked) {
      this.bodyScrollLock.lock();
      this.scrollLocked = true;
    }
    queueMicrotask(() => {
      const panel = this.dialogPanel?.nativeElement;
      if (this.acceptButton) this.acceptButton.focus();
      else panel?.focus();
    });
  }

  private handleDocumentKeydown(event: KeyboardEvent): void {
    const confirmation = this.dialogConfirmation();
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
    if (this.scrollLocked) {
      this.bodyScrollLock.unlock();
      this.scrollLocked = false;
    }
    const restore = this.restorePreviousFocus;
    this.restorePreviousFocus = null;
    queueMicrotask(() => restore?.());
  }
}
