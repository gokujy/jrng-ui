import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  TemplateRef,
  input,
} from '@angular/core';
import { jCreateId } from 'jrng-ui/core';
import { JMenuItem, JMenuItemTemplateContext } from 'jrng-ui/menu';

export interface JMegaMenuGroup {
  readonly label: string;
  readonly items: readonly JMenuItem[];
}

export interface JMegaMenuItem extends JMenuItem {
  readonly groups?: readonly JMegaMenuGroup[];
}

@Component({
  selector: 'j-mega-menu',
  imports: [NgTemplateOutlet],
  template: `
    <nav
      class="j-mega-menu"
      data-jc-name="mega-menu"
      data-jc-section="root"
      [attr.aria-label]="ariaLabel()"
    >
      <ul class="j-mega-menu__triggers">
        @for (
          item of model();
          track item.id || item.label || item.icon || $index;
          let itemIndex = $index
        ) {
          @if (itemVisible(item)) {
            <li
              class="j-mega-menu__trigger"
              (mouseenter)="openItem(item)"
              (mouseleave)="closeOnMouseLeave($event)"
              (focusout)="closeOnFocusOut(item, $event)"
            >
              <button
                class="j-mega-menu__button"
                type="button"
                [disabled]="item.disabled"
                [attr.aria-haspopup]="item.groups?.length ? 'menu' : null"
                [attr.aria-expanded]="item.groups?.length ? activeItem === item : null"
                [attr.aria-controls]="item.groups?.length ? panelId(itemIndex) : null"
                (click)="activateTopLevel(item, $event)"
                (keydown)="onTriggerKeydown(item, itemIndex, $event)"
              >
                {{ item.label }}
              </button>
              @if (activeItem === item) {
                <div
                  class="j-mega-menu__panel"
                  role="menu"
                  [id]="panelId(itemIndex)"
                  [attr.aria-label]="item.label || ariaLabel()"
                  [style.grid-template-columns]="'repeat(' + columns() + ', minmax(0, 1fr))'"
                >
                  @for (group of item.groups || []; track group.label) {
                    <section
                      class="j-mega-menu__group"
                      role="group"
                      [attr.aria-label]="group.label"
                    >
                      <h3>{{ group.label }}</h3>
                      @for (entry of group.items; track entry.label || entry.icon || $index) {
                        @if (itemVisible(entry)) {
                          <button
                            class="j-mega-menu__entry"
                            type="button"
                            role="menuitem"
                            [disabled]="entry.disabled"
                            (click)="activateEntry(entry, $event)"
                            (keydown)="onEntryKeydown($event)"
                          >
                            @if (itemTemplate) {
                              <ng-container
                                [ngTemplateOutlet]="itemTemplate"
                                [ngTemplateOutletContext]="templateContext(entry)"
                              />
                            } @else {
                              @if (entry.icon) {
                                <span aria-hidden="true">{{ entry.icon }}</span>
                              }
                              <span>{{ entry.label }}</span>
                            }
                          </button>
                        }
                      }
                    </section>
                  }
                </div>
              }
            </li>
          }
        }
      </ul>
    </nav>
  `,
  styles: [
    `
      .j-mega-menu {
        position: relative;
      }

      .j-mega-menu__triggers {
        display: flex;
        gap: var(--j-spacing-1);
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .j-mega-menu__button,
      .j-mega-menu__entry {
        background: transparent;
        border: 0;
        border-radius: var(--j-radius-md);
        color: var(--j-color-foreground);
        cursor: pointer;
        font: inherit;
        min-height: 2.5rem;
        padding: 0 var(--j-spacing-3);
      }

      .j-mega-menu__button:hover,
      .j-mega-menu__entry:hover {
        background: var(--j-color-muted);
      }

      .j-mega-menu__panel {
        background: var(--j-color-popover);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-lg);
        box-shadow: var(--j-shadow-lg);
        display: grid;
        gap: var(--j-spacing-5);
        left: 0;
        min-width: min(42rem, calc(100vw - 2rem));
        padding: var(--j-spacing-5);
        position: absolute;
        top: 100%;
        z-index: var(--j-z-index-dropdown);
      }

      .j-mega-menu__group {
        display: grid;
        gap: var(--j-spacing-2);
      }

      .j-mega-menu__group h3 {
        color: var(--j-color-muted-foreground);
        font-size: var(--j-font-size-xs);
        margin: 0;
      }

      .j-mega-menu__entry {
        justify-content: flex-start;
        text-align: left;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JMegaMenuComponent {
  readonly model = input<readonly JMegaMenuItem[]>([]);
  readonly ariaLabel = input('Mega menu');
  readonly columns = input(3);
  @ContentChild('jMegaMenuItem', { read: TemplateRef })
  itemTemplate?: TemplateRef<JMenuItemTemplateContext>;

  activeItem: JMegaMenuItem | null = null;
  private readonly baseId = jCreateId('j-mega-menu');

  panelId(index: number): string {
    return `${this.baseId}-panel-${index}`;
  }

  itemVisible(item: JMenuItem): boolean {
    const visible = typeof item.visible === 'function' ? item.visible() : item.visible !== false;
    return visible && (item.permission?.() ?? true);
  }

  openItem(item: JMegaMenuItem): void {
    if (!item.disabled && item.groups?.length) {
      this.activeItem = item;
    }
  }

  activateTopLevel(item: JMegaMenuItem, event: MouseEvent): void {
    if (item.disabled || !this.itemVisible(item)) {
      return;
    }
    if (item.groups?.length) {
      this.activeItem = this.activeItem === item ? null : item;
      return;
    }
    item.command?.({ item, originalEvent: event });
  }

  activateEntry(item: JMenuItem, event: MouseEvent): void {
    if (item.disabled || !this.itemVisible(item)) {
      return;
    }
    item.command?.({ item, originalEvent: event });
    this.activeItem = null;
  }

  onTriggerKeydown(item: JMegaMenuItem, itemIndex: number, event: KeyboardEvent): void {
    if (item.disabled) {
      return;
    }
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      this.focusAdjacentTrigger(event.currentTarget, event.key === 'ArrowRight' ? 1 : -1);
      return;
    }
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      this.focusTriggerEdge(event.currentTarget, event.key === 'Home' ? 'first' : 'last');
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      this.activeItem = null;
      return;
    }
    if (
      item.groups?.length &&
      (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ')
    ) {
      event.preventDefault();
      this.activeItem = item;
      const trigger = event.currentTarget;
      queueMicrotask(() => this.focusFirstEntry(trigger, itemIndex));
    }
  }

  onEntryKeydown(event: KeyboardEvent): void {
    const entry = event.currentTarget as HTMLButtonElement | null;
    const panel = entry?.closest<HTMLElement>('.j-mega-menu__panel');
    if (!entry || !panel) {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      this.activeItem = null;
      panel.closest('li')?.querySelector<HTMLButtonElement>('.j-mega-menu__button')?.focus();
      return;
    }
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const trigger = panel.closest('li')?.querySelector<HTMLButtonElement>('.j-mega-menu__button');
      this.activeItem = null;
      this.focusAdjacentTrigger(trigger ?? null, event.key === 'ArrowRight' ? 1 : -1);
      return;
    }

    const entries = this.enabledEntries(panel);
    const index = entries.indexOf(entry);
    let nextIndex: number | null = null;
    if (event.key === 'ArrowDown') nextIndex = (index + 1) % entries.length;
    if (event.key === 'ArrowUp') nextIndex = (index - 1 + entries.length) % entries.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = entries.length - 1;
    if (nextIndex !== null && entries[nextIndex]) {
      event.preventDefault();
      entries[nextIndex].focus();
    }
  }

  closeOnMouseLeave(event: MouseEvent): void {
    const item = event.currentTarget as HTMLElement | null;
    if (!item?.contains(item.ownerDocument.activeElement)) {
      this.activeItem = null;
    }
  }

  closeOnFocusOut(item: JMegaMenuItem, event: FocusEvent): void {
    const host = event.currentTarget as HTMLElement | null;
    if (this.activeItem === item && !host?.contains(event.relatedTarget as Node | null)) {
      this.activeItem = null;
    }
  }

  templateContext(item: JMenuItem): JMenuItemTemplateContext {
    return { $implicit: item, item, active: false, disabled: item.disabled === true, level: 1 };
  }

  private focusFirstEntry(currentTarget: EventTarget | null, itemIndex: number): void {
    const trigger = currentTarget as HTMLElement | null;
    const panel =
      trigger?.parentElement?.querySelector<HTMLElement>(`#${this.panelId(itemIndex)}`) ?? null;
    this.enabledEntries(panel)[0]?.focus();
  }

  private focusAdjacentTrigger(currentTarget: EventTarget | null, direction: 1 | -1): void {
    const trigger = currentTarget as HTMLButtonElement | null;
    const triggers = this.enabledTriggers(trigger);
    const index = trigger ? triggers.indexOf(trigger) : -1;
    if (!triggers.length) return;
    triggers[(index + direction + triggers.length) % triggers.length]?.focus();
  }

  private focusTriggerEdge(currentTarget: EventTarget | null, edge: 'first' | 'last'): void {
    const triggers = this.enabledTriggers(currentTarget as HTMLButtonElement | null);
    triggers[edge === 'first' ? 0 : triggers.length - 1]?.focus();
  }

  private enabledTriggers(trigger: HTMLButtonElement | null): HTMLButtonElement[] {
    return Array.from(
      trigger
        ?.closest('ul')
        ?.querySelectorAll<HTMLButtonElement>('.j-mega-menu__button:not(:disabled)') ?? [],
    );
  }

  private enabledEntries(panel: HTMLElement | null): HTMLButtonElement[] {
    return Array.from(
      panel?.querySelectorAll<HTMLButtonElement>('.j-mega-menu__entry:not(:disabled)') ?? [],
    );
  }
}
