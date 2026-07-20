import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  booleanAttribute,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { JTableAction, JTableActionEvent, JTableRow } from './table.types';
import { JButtonComponent } from 'jrng-ui/button';

@Component({
  selector: 'j-action-menu',
  imports: [JButtonComponent],
  template: `
    <div class="j-action-menu" [class.is-popup]="popup()" [attr.aria-label]="ariaLabel()">
      @if (popup()) {
        <j-button
          styleClass="j-action-menu__trigger"
          actionDisplay="icon"
          variant="text"
          size="sm"
          [icon]="triggerIcon()"
          [ariaLabel]="triggerLabel()"
          [title]="triggerLabel()"
          [ariaExpanded]="open"
          ariaHasPopup="menu"
          (onClick)="toggle($event)"
          (keydown)="handleTriggerKeydown($event)"
        />
      }

      @if (!popup() || open) {
        <div
          class="j-action-menu__items"
          [attr.role]="popup() ? 'menu' : 'group'"
          [attr.tabindex]="popup() ? 0 : null"
          [attr.aria-label]="ariaLabel()"
          (keydown)="handleMenuKeydown($event)"
        >
          @for (action of normalizedActions(); track action.key || action.label || $index) {
            <j-button
              [styleClass]="
                'j-action-menu__item j-action-menu__item--' + (action.severity || 'neutral')
              "
              [label]="action.label"
              [icon]="action.icon || ''"
              [severity]="action.severity || 'neutral'"
              variant="text"
              size="sm"
              [disabled]="action.disabled || false"
              [ariaRole]="popup() ? 'menuitem' : ''"
              (onClick)="activate(action, $event)"
            />
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .j-action-menu {
        display: inline-flex;
        position: relative;
      }

      .j-action-menu__items {
        align-items: center;
        display: inline-flex;
        gap: var(--j-spacing-xs, 0.25rem);
      }

      .j-action-menu.is-popup .j-action-menu__items {
        align-items: stretch;
        background: var(--j-action-menu-bg, var(--j-color-card, #ffffff));
        border: 1px solid var(--j-action-menu-border-color, var(--j-color-border, #dbe2ea));
        border-radius: var(--j-action-menu-radius, var(--j-radius-md, 0.5rem));
        box-shadow: var(--j-action-menu-shadow, var(--j-shadow-lg));
        display: grid;
        gap: var(--j-spacing-1, 0.25rem);
        min-width: 11rem;
        padding: var(--j-spacing-2, 0.5rem);
        position: absolute;
        right: 0;
        top: calc(100% + var(--j-spacing-1, 0.25rem));
        z-index: var(--j-z-index-overlay, 1000);
      }

      .j-action-menu__trigger,
      .j-action-menu__item {
        align-items: center;
        background: var(--j-action-menu-item-bg, var(--j-color-card, #ffffff));
        border: 1px solid var(--j-action-menu-item-border-color, var(--j-color-border, #dbe2ea));
        border-radius: var(--j-radius-sm, 0.375rem);
        color: var(--j-action-menu-item-color, var(--j-color-foreground, #111827));
        cursor: pointer;
        display: inline-flex;
        font: inherit;
        font-size: var(--j-font-size-sm, 0.875rem);
        gap: var(--j-spacing-xs, 0.25rem);
        min-height: 2rem;
        padding: 0 var(--j-spacing-sm, 0.5rem);
      }

      .j-action-menu__trigger {
        justify-content: center;
        min-width: 2rem;
        padding: 0 var(--j-spacing-sm, 0.5rem);
      }

      .j-action-menu.is-popup .j-action-menu__item {
        border-color: transparent;
        justify-content: flex-start;
        width: 100%;
      }

      .j-action-menu__item:hover:not(:disabled) {
        border-color: var(--j-color-primary, #4f46e5);
        color: var(--j-color-primary, #4f46e5);
      }

      .j-action-menu__trigger:focus-visible,
      .j-action-menu__item:focus-visible {
        box-shadow: var(--j-focus-ring, 0 0 0 3px rgb(79 70 229 / 24%));
        outline: none;
      }

      .j-action-menu__item:disabled {
        cursor: not-allowed;
        opacity: var(--j-disabled-opacity, 0.55);
      }

      .j-action-menu__item--danger {
        color: var(--j-color-danger, #dc2626);
      }

      :host ::ng-deep .j-action-menu__trigger {
        min-width: 2rem;
      }

      :host ::ng-deep .j-action-menu.is-popup .j-action-menu__item {
        justify-content: flex-start;
        width: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JActionMenuComponent {
  private readonly documentRef = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly actions = input<readonly JTableAction[]>([]);
  readonly row = input.required<JTableRow>();
  readonly rowIndex = input(0);
  readonly ariaLabel = input('Row actions');
  readonly triggerLabel = input('Open row actions');
  readonly triggerIcon = input('...');
  readonly popup = input(false, { transform: booleanAttribute });
  readonly action = output<JTableActionEvent>();

  open = false;

  constructor() {
    if (!this.isBrowser) {
      return;
    }

    const listener = (event: MouseEvent) => {
      if (this.open && !this.elementRef.nativeElement.contains(event.target as Node | null)) {
        this.open = false;
        // Native document listener runs outside zoneless change detection;
        // refresh so the menu visually closes.
        this.changeDetectorRef.markForCheck();
      }
    };
    this.documentRef.addEventListener('mousedown', listener);
    this.destroyRef.onDestroy(() => this.documentRef.removeEventListener('mousedown', listener));
  }

  readonly normalizedActions = computed<readonly JTableAction[]>(() => {
    const actions = this.actions();
    return actions.length ? actions : [{ key: 'action', label: 'Actions' }];
  });

  activate(action: JTableAction, originalEvent: MouseEvent): void {
    if (action.disabled) {
      return;
    }

    const event: JTableActionEvent = {
      action,
      row: this.row(),
      index: this.rowIndex(),
      originalEvent,
    };
    action.command?.(event);
    this.action.emit(event);
    this.open = false;
  }

  toggle(event: MouseEvent): void {
    event.stopPropagation();
    this.open = !this.open;
    if (this.open) {
      queueMicrotask(() => this.focusFirstAction());
    }
  }

  handleTriggerKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.open = true;
      queueMicrotask(() => this.focusFirstAction());
    }
  }

  handleMenuKeydown(event: KeyboardEvent): void {
    if (!this.popup()) {
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      this.open = false;
      this.elementRef.nativeElement
        .querySelector<HTMLButtonElement>('.j-action-menu__trigger')
        ?.focus();
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.moveFocus(event.key === 'ArrowDown' ? 1 : -1);
    }
  }

  private focusFirstAction(): void {
    this.actionButtons()[0]?.focus();
  }

  private moveFocus(direction: 1 | -1): void {
    const buttons = this.actionButtons();
    const currentIndex = buttons.findIndex((button) => button === this.documentRef.activeElement);
    const nextIndex =
      currentIndex < 0 ? 0 : (currentIndex + direction + buttons.length) % buttons.length;
    buttons[nextIndex]?.focus();
  }

  private actionButtons(): HTMLButtonElement[] {
    return Array.from(
      this.elementRef.nativeElement.querySelectorAll<HTMLButtonElement>(
        '.j-action-menu__item:not(:disabled)',
      ),
    );
  }
}
