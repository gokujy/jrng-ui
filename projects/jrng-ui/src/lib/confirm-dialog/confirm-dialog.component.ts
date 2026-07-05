import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { JConfirmationService } from './confirmation.service';

@Component({
  selector: 'j-confirm-dialog',
  imports: [],
  template: `
    @if (confirmationService.confirmation(); as confirmation) {
      <div class="j-confirm-dialog__backdrop" (mousedown)="reject()">
        <section
          class="j-confirm-dialog"
          role="alertdialog"
          aria-modal="true"
          (mousedown)="$event.stopPropagation()"
        >
          <header class="j-confirm-dialog__header">
            @if (confirmation.icon) {
              <span class="j-confirm-dialog__icon">{{ confirmation.icon }}</span>
            }
            <h2>{{ confirmation.header || 'Confirm' }}</h2>
          </header>
          <p class="j-confirm-dialog__message">{{ confirmation.message }}</p>
          <footer class="j-confirm-dialog__footer">
            <button
              class="j-confirm-dialog__button j-confirm-dialog__button--reject"
              type="button"
              (click)="reject()"
            >
              {{ confirmation.rejectLabel || 'Cancel' }}
            </button>
            <button
              class="j-confirm-dialog__button j-confirm-dialog__button--accept"
              type="button"
              (click)="accept()"
            >
              {{ confirmation.acceptLabel || 'OK' }}
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
        background: rgb(15 23 42 / 56%);
        display: flex;
        inset: 0;
        justify-content: center;
        padding: var(--j-spacing-lg);
        position: fixed;
        z-index: var(--j-z-index-modal);
      }
      .j-confirm-dialog {
        background: var(--j-color-surface);
        border-radius: var(--j-radius-lg);
        box-shadow: var(--j-shadow-lg);
        max-width: 28rem;
        padding: var(--j-spacing-lg);
        width: 100%;
      }
      .j-confirm-dialog__header {
        align-items: center;
        display: flex;
        gap: var(--j-spacing-sm);
      }
      .j-confirm-dialog__header h2,
      .j-confirm-dialog__message {
        margin: 0;
      }
      .j-confirm-dialog__message {
        color: var(--j-color-text-muted);
        margin-top: var(--j-spacing-md);
      }
      .j-confirm-dialog__footer {
        display: flex;
        gap: var(--j-spacing-sm);
        justify-content: flex-end;
        margin-top: var(--j-spacing-lg);
      }
      .j-confirm-dialog__button {
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-md);
        cursor: pointer;
        font: inherit;
        min-height: 2.25rem;
        padding: 0 var(--j-spacing-md);
      }
      .j-confirm-dialog__button--accept {
        background: var(--j-color-primary);
        border-color: var(--j-color-primary);
        color: var(--j-color-primary-foreground, var(--j-color-white, #ffffff));
      }
      .j-confirm-dialog__button--reject {
        background: var(--j-color-surface);
        color: var(--j-color-text);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JConfirmDialogComponent {
  readonly confirmationService = inject(JConfirmationService);

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
}
