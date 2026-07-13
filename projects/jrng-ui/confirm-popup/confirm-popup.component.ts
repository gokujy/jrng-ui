import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  computed,
  inject,
} from '@angular/core';
import { JFocusTrapDirective } from 'jrng-ui/core';
import { JRNG_LOCALE } from 'jrng-ui/core';
import { JPopoverComponent } from 'jrng-ui/popover';
import { JConfirmationService } from 'jrng-ui/confirm-dialog';

@Component({
  selector: 'j-confirm-popup',
  imports: [JPopoverComponent, JFocusTrapDirective],
  template: `
    @if (popupConfirmation(); as confirmation) {
      <j-popover
        [visible]="true"
        [target]="confirmation.target ?? null"
        position="bottom"
        data-jc-name="confirm-popup"
        data-jc-section="popover"
        (opened)="focusPanel()"
        (closed)="reject()"
      >
        <section
          #panel
          class="j-confirm-popup"
          jFocusTrap
          role="alertdialog"
          data-jc-name="confirm-popup"
          data-jc-section="root"
          data-j-open="true"
          tabindex="-1"
          (keydown)="handleKeydown($event)"
        >
          <header class="j-confirm-popup__header" data-jc-section="header">
            @if (confirmation.icon) {
              <span class="j-confirm-popup__icon" aria-hidden="true">{{ confirmation.icon }}</span>
            }
            <strong>{{ confirmation.header || 'Confirm' }}</strong>
          </header>
          @if (confirmation.message) {
            <p class="j-confirm-popup__message" data-jc-section="message">
              {{ confirmation.message }}
            </p>
          }
          <footer class="j-confirm-popup__footer" data-jc-section="footer">
            <button class="j-confirm-popup__button" type="button" (click)="reject()">
              {{ confirmation.rejectLabel || locale.cancel }}
            </button>
            <button
              class="j-confirm-popup__button j-confirm-popup__button--accept"
              type="button"
              (click)="accept()"
            >
              {{ confirmation.acceptLabel || locale.accept }}
            </button>
          </footer>
        </section>
      </j-popover>
    }
  `,
  styles: [
    `
      .j-confirm-popup {
        display: grid;
        gap: var(--j-spacing-3);
        max-width: min(20rem, calc(100vw - 2rem));
        outline: none;
      }

      .j-confirm-popup__header {
        align-items: center;
        display: flex;
        gap: var(--j-spacing-2);
      }

      .j-confirm-popup__message {
        color: var(--j-color-muted-foreground);
        font-size: var(--j-font-size-sm);
        margin: 0;
      }

      .j-confirm-popup__footer {
        display: flex;
        gap: var(--j-spacing-2);
        justify-content: flex-end;
      }

      .j-confirm-popup__button {
        background: var(--j-color-card);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-md);
        color: var(--j-color-foreground);
        cursor: pointer;
        font: inherit;
        min-height: 2.25rem;
        padding: 0 var(--j-spacing-3);
      }

      .j-confirm-popup__button--accept {
        background: var(--j-color-primary);
        border-color: var(--j-color-primary);
        color: var(--j-color-primary-foreground);
      }

      .j-confirm-popup__button:focus-visible {
        box-shadow: var(--j-focus-ring);
        outline: none;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JConfirmPopupComponent {
  readonly confirmationService = inject(JConfirmationService);
  readonly popupConfirmation = computed(() => {
    const confirmation = this.confirmationService.confirmation();
    return confirmation?.target ? confirmation : null;
  });
  readonly locale = inject(JRNG_LOCALE);

  @ViewChild('panel') private panel?: ElementRef<HTMLElement>;

  accept(): void {
    const confirmation = this.confirmationService.confirmation();
    confirmation?.accept?.();
    this.confirmationService.close();
    this.restoreFocus(confirmation?.target);
  }

  reject(): void {
    const confirmation = this.confirmationService.confirmation();
    confirmation?.reject?.();
    this.confirmationService.close();
    this.restoreFocus(confirmation?.target);
  }

  /** Focus the alertdialog panel on open so the focus trap and Enter/Escape work. */
  focusPanel(): void {
    queueMicrotask(() => this.panel?.nativeElement.focus());
  }

  private restoreFocus(target: HTMLElement | null | undefined): void {
    if (target) {
      queueMicrotask(() => target.focus());
    }
  }

  handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.reject();
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      this.accept();
    }
  }
}
