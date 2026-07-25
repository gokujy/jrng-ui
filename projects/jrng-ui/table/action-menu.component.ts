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
  viewChild,
} from '@angular/core';
import { JTableAction, JTableActionEvent, JTableRow } from './table.types';
import { JButtonComponent } from 'jrng-ui/button';

@Component({
  selector: 'j-action-menu',
  imports: [JButtonComponent],
  template: `
    <div
      class="j-action-menu"
      [class.is-popup]="popup()"
      [attr.aria-label]="ariaLabel()"
      (focusout)="handleFocusOut()"
    >
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
          #menu
          class="j-action-menu__items"
          [class.j-action-menu__items--popup]="popup()"
          [id]="popup() ? menuId : ''"
          [attr.role]="popup() ? 'menu' : 'group'"
          [attr.tabindex]="popup() ? 0 : null"
          [attr.aria-label]="ariaLabel()"
          (keydown)="handleMenuKeydown($event)"
          (focusout)="handleFocusOut()"
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

      .j-action-menu__items--popup {
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

      .j-action-menu__items--popup .j-action-menu__item {
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

      :host ::ng-deep .j-action-menu__items--popup .j-action-menu__item {
        justify-content: flex-start;
        width: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JActionMenuComponent {
  private static nextId = 0;
  private readonly documentRef = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly menuElement = viewChild<ElementRef<HTMLElement>>('menu');

  readonly actions = input<readonly JTableAction[]>([]);
  readonly row = input.required<JTableRow>();
  readonly rowIndex = input(0);
  readonly ariaLabel = input('Row actions');
  readonly triggerLabel = input('Open row actions');
  readonly triggerIcon = input('more-vertical');
  readonly popup = input(false, { transform: booleanAttribute });
  readonly action = output<JTableActionEvent>();
  readonly menuId = `j-action-menu-${JActionMenuComponent.nextId++}`;

  open = false;

  constructor() {
    if (!this.isBrowser) {
      return;
    }

    const listener = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (
        this.open &&
        !this.elementRef.nativeElement.contains(target) &&
        !this.menuElement()?.nativeElement.contains(target)
      ) {
        this.close();
      }
    };
    const closeOnViewportChange = () => this.close();
    this.documentRef.addEventListener('mousedown', listener);
    this.documentRef.addEventListener('scroll', closeOnViewportChange, true);
    this.documentRef.defaultView?.addEventListener('resize', closeOnViewportChange);
    this.destroyRef.onDestroy(() => {
      this.documentRef.removeEventListener('mousedown', listener);
      this.documentRef.removeEventListener('scroll', closeOnViewportChange, true);
      this.documentRef.defaultView?.removeEventListener('resize', closeOnViewportChange);
      this.menuElement()?.nativeElement.remove();
    });
  }

  readonly normalizedActions = computed<readonly JTableAction[]>(() => {
    const actions = this.actions();
    return actions.length ? actions : [{ key: 'action', label: 'Actions' }];
  });

  activate(action: JTableAction, originalEvent: MouseEvent): void {
    originalEvent.stopPropagation();
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
    this.close();
  }

  toggle(event: MouseEvent): void {
    event.stopPropagation();
    if (this.open) {
      this.close();
      return;
    }
    this.open = true;
    this.changeDetectorRef.markForCheck();
    queueMicrotask(() => {
      this.attachPopup();
      this.focusFirstAction();
    });
  }

  handleTriggerKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.open = true;
      this.changeDetectorRef.markForCheck();
      queueMicrotask(() => {
        this.attachPopup();
        this.focusFirstAction();
      });
    }
  }

  handleMenuKeydown(event: KeyboardEvent): void {
    if (!this.popup()) {
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
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

  handleFocusOut(): void {
    if (!this.popup() || !this.open) {
      return;
    }
    queueMicrotask(() => {
      const activeElement = this.documentRef.activeElement;
      const hostContainsFocus = this.elementRef.nativeElement.contains(activeElement);
      const menuContainsFocus = this.menuElement()?.nativeElement.contains(activeElement) ?? false;
      if (!hostContainsFocus && !menuContainsFocus) {
        this.close();
      }
    });
  }

  private focusFirstAction(): void {
    this.actionButtons()[0]?.focus();
  }

  private attachPopup(): void {
    if (!this.isBrowser || !this.popup() || !this.open) {
      return;
    }
    const menu = this.menuElement()?.nativeElement;
    const trigger =
      this.elementRef.nativeElement.querySelector<HTMLElement>('.j-action-menu__trigger');
    if (!menu || !trigger) {
      return;
    }

    this.documentRef.body.appendChild(menu);
    menu.style.position = 'fixed';
    const triggerRect = trigger.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    const view = this.documentRef.defaultView;
    const viewportWidth = view?.innerWidth ?? this.documentRef.documentElement.clientWidth;
    const viewportHeight = view?.innerHeight ?? this.documentRef.documentElement.clientHeight;
    const spacing = 4;
    const left = Math.max(
      spacing,
      Math.min(triggerRect.right - menuRect.width, viewportWidth - menuRect.width - spacing),
    );
    const below = triggerRect.bottom + spacing;
    const top =
      below + menuRect.height <= viewportHeight - spacing
        ? below
        : Math.max(spacing, triggerRect.top - menuRect.height - spacing);

    menu.style.left = `${left}px`;
    menu.style.right = 'auto';
    menu.style.top = `${top}px`;
  }

  private close(): void {
    if (!this.open) {
      return;
    }
    const menu = this.menuElement()?.nativeElement;
    const container = this.elementRef.nativeElement.querySelector<HTMLElement>('.j-action-menu');
    if (menu && container && menu.parentElement !== container) {
      menu.style.removeProperty('position');
      menu.style.removeProperty('left');
      menu.style.removeProperty('right');
      menu.style.removeProperty('top');
      container.appendChild(menu);
    }
    this.open = false;
    this.changeDetectorRef.markForCheck();
  }

  private moveFocus(direction: 1 | -1): void {
    const buttons = this.actionButtons();
    const currentIndex = buttons.findIndex((button) => button === this.documentRef.activeElement);
    const nextIndex =
      currentIndex < 0 ? 0 : (currentIndex + direction + buttons.length) % buttons.length;
    buttons[nextIndex]?.focus();
  }

  private actionButtons(): HTMLButtonElement[] {
    const root = this.menuElement()?.nativeElement ?? this.elementRef.nativeElement;
    return Array.from(
      root.querySelectorAll<HTMLButtonElement>('.j-action-menu__item:not(:disabled)'),
    );
  }
}
