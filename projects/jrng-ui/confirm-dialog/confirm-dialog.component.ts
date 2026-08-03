import { DOCUMENT, NgTemplateOutlet, isPlatformBrowser } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  Directive,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  TemplateRef,
  ViewChild,
  contentChild,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';
import { JConfirmationService } from './confirmation.service';
import type { JConfirmationRequest } from './confirmation.service';
import {
  JBodyScrollLockService,
  JFocusTrapDirective,
  JOverlayStackService,
  jCreateId,
  jRememberFocus,
} from 'jrng-ui/core';
import { JButtonComponent } from 'jrng-ui/button';

export interface JConfirmDialogTemplateContext {
  readonly $implicit: JConfirmationRequest;
  readonly confirmation: JConfirmationRequest;
  readonly accept: () => void;
  readonly reject: () => void;
}

@Directive({ selector: 'ng-template[jConfirmDialogHeader]' })
export class JConfirmDialogHeaderTemplateDirective {
  readonly template = inject(TemplateRef<JConfirmDialogTemplateContext>);
}

@Directive({ selector: 'ng-template[jConfirmDialogIcon]' })
export class JConfirmDialogIconTemplateDirective {
  readonly template = inject(TemplateRef<JConfirmDialogTemplateContext>);
}

@Directive({ selector: 'ng-template[jConfirmDialogMessage]' })
export class JConfirmDialogMessageTemplateDirective {
  readonly template = inject(TemplateRef<JConfirmDialogTemplateContext>);
}

@Directive({ selector: 'ng-template[jConfirmDialogFooter]' })
export class JConfirmDialogFooterTemplateDirective {
  readonly template = inject(TemplateRef<JConfirmDialogTemplateContext>);
}

@Component({
  selector: 'j-confirm-dialog',
  imports: [JFocusTrapDirective, JButtonComponent, NgTemplateOutlet],
  template: `
    @if (dialogConfirmation(); as confirmation) {
      <div [class]="backdropClasses(confirmation)" (mousedown)="handleOverlayMouseDown($event)">
        <section
          #dialogPanel
          jFocusTrap
          [class]="dialogClasses(confirmation)"
          [style.max-width]="maxWidth()"
          role="alertdialog"
          aria-modal="true"
          [attr.aria-labelledby]="titleId"
          [attr.aria-describedby]="messageId"
          tabindex="-1"
          (mousedown)="$event.stopPropagation()"
        >
          <header class="j-confirm-dialog__header">
            @if (showIcon()) {
              <span class="j-confirm-dialog__icon" aria-hidden="true">
                @if (iconTemplate(); as template) {
                  <ng-container
                    [ngTemplateOutlet]="template.template"
                    [ngTemplateOutletContext]="templateContext(confirmation)"
                  />
                } @else {
                  {{ confirmation.icon || severityIcon(confirmation.severity) }}
                }
              </span>
            }
            <h2 [id]="titleId">
              @if (headerTemplate(); as template) {
                <ng-container
                  [ngTemplateOutlet]="template.template"
                  [ngTemplateOutletContext]="templateContext(confirmation)"
                />
              } @else {
                {{ confirmation.title || confirmation.header || 'Confirm' }}
              }
            </h2>
          </header>
          <div class="j-confirm-dialog__message" [id]="messageId">
            @if (messageTemplate(); as template) {
              <ng-container
                [ngTemplateOutlet]="template.template"
                [ngTemplateOutletContext]="templateContext(confirmation)"
              />
            } @else {
              {{ confirmation.message }}
            }
          </div>
          @if (footerTemplate() || showRejectButton() || showAcceptButton()) {
            <footer class="j-confirm-dialog__footer">
              @if (footerTemplate(); as template) {
                <ng-container
                  [ngTemplateOutlet]="template.template"
                  [ngTemplateOutletContext]="templateContext(confirmation)"
                />
              } @else {
                @if (showRejectButton()) {
                  <j-button
                    #cancelButton
                    styleClass="j-confirm-dialog__button j-confirm-dialog__button--reject"
                    variant="outlined"
                    [severity]="confirmation.rejectButtonSeverity || 'secondary'"
                    [label]="confirmation.cancelText || confirmation.rejectLabel || 'Cancel'"
                    (onClick)="reject()"
                  />
                }
                @if (showAcceptButton()) {
                  <j-button
                    #acceptButton
                    styleClass="j-confirm-dialog__button j-confirm-dialog__button--accept"
                    [severity]="
                      confirmation.acceptButtonSeverity || confirmation.severity || 'primary'
                    "
                    [label]="confirmation.confirmText || confirmation.acceptLabel || 'OK'"
                    (onClick)="accept()"
                  />
                }
              }
            </footer>
          }
        </section>
      </div>
    }
  `,
  styles: [
    `
      .j-confirm-dialog__backdrop {
        align-items: center;
        background: var(--j-confirm-dialog-backdrop-bg, var(--j-overlay-backdrop-bg));
        display: flex;
        inset: 0;
        justify-content: center;
        padding: var(--j-spacing-lg, 1.5rem);
        position: fixed;
        z-index: var(--j-z-index-modal);
      }
      .j-confirm-dialog {
        background: var(--j-confirm-dialog-bg, var(--j-color-card));
        border: 1px solid var(--j-confirm-dialog-border-color, var(--j-color-border));
        border-radius: var(--j-confirm-dialog-radius, var(--j-radius-lg, 0.75rem));
        box-shadow: var(--j-confirm-dialog-shadow, var(--j-shadow-lg));
        color: var(--j-confirm-dialog-color, var(--j-color-card-foreground));
        max-width: 28rem;
        outline: none;
        overflow: hidden;
        width: 100%;
      }
      .j-confirm-dialog__header {
        align-items: center;
        display: flex;
        gap: var(--j-spacing-md, 0.75rem);
        padding: var(--j-spacing-lg, 1.5rem) var(--j-spacing-lg, 1.5rem)
          var(--j-spacing-md, 0.75rem);
      }
      .j-confirm-dialog__icon {
        align-items: center;
        background: var(
          --j-confirm-dialog-icon-bg,
          color-mix(in srgb, var(--j-confirm-dialog-accent, var(--j-color-info)) 12%, transparent)
        );
        border-radius: var(--j-radius-full, 999px);
        color: var(--j-confirm-dialog-accent, var(--j-color-info));
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
      .j-confirm-dialog__header h2 {
        font-size: var(--j-font-size-lg, 1.125rem);
        line-height: 1.35;
      }
      .j-confirm-dialog__message {
        color: var(--j-confirm-dialog-message-color, var(--j-color-muted-foreground));
        line-height: var(--j-line-height-normal, 1.5);
        padding: 0 var(--j-spacing-lg, 1.5rem) var(--j-spacing-lg, 1.5rem);
      }
      .j-confirm-dialog__footer {
        background: var(--j-color-muted);
        border-top: 1px solid var(--j-color-border);
        display: flex;
        flex-wrap: wrap;
        gap: var(--j-spacing-sm, 0.5rem);
        justify-content: flex-end;
        padding: var(--j-spacing-md, 0.75rem) var(--j-spacing-lg, 1.5rem);
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
          var(--j-confirm-dialog-accent, var(--j-color-primary))
        );
        border-color: var(
          --j-confirm-dialog-accept-bg,
          var(--j-confirm-dialog-accent, var(--j-color-primary))
        );
        color: var(--j-confirm-dialog-accept-color, var(--j-color-primary-foreground));
      }
      .j-confirm-dialog__button--reject {
        background: var(--j-confirm-dialog-cancel-bg, var(--j-color-card));
        color: var(--j-confirm-dialog-cancel-color, var(--j-color-foreground));
      }
      .j-confirm-dialog__button:focus-visible {
        box-shadow: var(--j-focus-ring);
        outline: none;
      }
      .j-confirm-dialog--success {
        --j-confirm-dialog-accent: var(--j-color-success);
      }
      .j-confirm-dialog--warning {
        --j-confirm-dialog-accent: var(--j-color-warning);
      }
      .j-confirm-dialog--danger {
        --j-confirm-dialog-accent: var(--j-color-danger);
      }
      .j-confirm-dialog--info {
        --j-confirm-dialog-accent: var(--j-color-info);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JConfirmDialogComponent {
  readonly styleClass = input('');
  readonly maskStyleClass = input('');
  readonly maxWidth = input('28rem');
  readonly showIcon = input(true, { transform: booleanAttribute });
  readonly showRejectButton = input(true, { transform: booleanAttribute });
  readonly showAcceptButton = input(true, { transform: booleanAttribute });
  readonly headerTemplate = contentChild(JConfirmDialogHeaderTemplateDirective);
  readonly iconTemplate = contentChild(JConfirmDialogIconTemplateDirective);
  readonly messageTemplate = contentChild(JConfirmDialogMessageTemplateDirective);
  readonly footerTemplate = contentChild(JConfirmDialogFooterTemplateDirective);
  readonly confirmationService = inject(JConfirmationService);
  readonly dialogConfirmation = computed(() => {
    const confirmation = this.confirmationService.confirmation();
    return confirmation?.target ? null : confirmation;
  });
  private readonly documentRef = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly bodyScrollLock = inject(JBodyScrollLockService);
  private readonly overlayStack = inject(JOverlayStackService);
  private restorePreviousFocus: (() => void) | null = null;
  private scrollLocked = false;

  @ViewChild('dialogPanel') private dialogPanel?: ElementRef<HTMLElement>;
  @ViewChild('acceptButton') private acceptButton?: JButtonComponent;
  @ViewChild('cancelButton') private cancelButton?: JButtonComponent;

  readonly titleId = jCreateId('j-confirm-title');
  readonly messageId = jCreateId('j-confirm-message');

  constructor() {
    effect(() => {
      const confirmation = this.dialogConfirmation();
      if (confirmation) {
        this.overlayStack.push(this);
        this.handleOpened();
        return;
      }
      this.overlayStack.remove(this);
      this.restoreFocus();
    });

    if (!this.isBrowser) {
      return;
    }

    const keydownListener = (event: KeyboardEvent) => this.handleDocumentKeydown(event);
    this.documentRef.addEventListener('keydown', keydownListener);
    this.destroyRef.onDestroy(() => {
      this.documentRef.removeEventListener('keydown', keydownListener);
      this.overlayStack.remove(this);
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

  backdropClasses(confirmation: JConfirmationRequest): string {
    return [
      'j-confirm-dialog__backdrop',
      `j-confirm-dialog__backdrop--${confirmation.severity || 'info'}`,
      this.maskStyleClass(),
    ]
      .filter(Boolean)
      .join(' ');
  }

  dialogClasses(confirmation: JConfirmationRequest): string {
    return [
      'j-confirm-dialog',
      `j-confirm-dialog--${confirmation.severity || 'info'}`,
      this.styleClass(),
    ]
      .filter(Boolean)
      .join(' ');
  }

  templateContext(confirmation: JConfirmationRequest): JConfirmDialogTemplateContext {
    return {
      $implicit: confirmation,
      confirmation,
      accept: () => this.accept(),
      reject: () => this.reject(),
    };
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
      else if (this.cancelButton) this.cancelButton.focus();
      else panel?.focus();
    });
  }

  private handleDocumentKeydown(event: KeyboardEvent): void {
    const confirmation = this.dialogConfirmation();
    if (
      !confirmation ||
      event.key !== 'Escape' ||
      confirmation.closeOnEscape === false ||
      !this.overlayStack.isTopmost(this)
    ) {
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
