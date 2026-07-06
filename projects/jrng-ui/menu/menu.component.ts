import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ElementRef,
  Input,
  QueryList,
  TemplateRef,
  ViewChildren,
  inject,
  numberAttribute,
  output,
} from '@angular/core';
import { JClickOutsideDirective } from 'jrng-ui/core';
import { jCreateTypeahead } from 'jrng-ui/core';

export interface JMenuItem {
  readonly label?: string;
  readonly icon?: string;
  readonly url?: string;
  readonly routerLink?: string | readonly unknown[];
  readonly command?: (event: { item: JMenuItem; originalEvent: Event }) => void;
  readonly disabled?: boolean;
  readonly separator?: boolean;
  readonly items?: readonly JMenuItem[];
  readonly badge?: string | number;
}

export interface JMenuItemTemplateContext {
  readonly $implicit: JMenuItem;
  readonly item: JMenuItem;
  readonly active: boolean;
  readonly disabled: boolean;
  readonly level: number;
}

@Component({
  selector: 'j-menu',
  imports: [JClickOutsideDirective, NgTemplateOutlet],
  template: `
    <nav
      [class]="menuClasses"
      data-jc-name="menu"
      data-jc-section="root"
      data-jc-extend="item separator submenu"
      [attr.data-j-open]="popup && visible ? 'true' : null"
      [attr.aria-label]="ariaLabel"
      [style.left.px]="left"
      [style.top.px]="top"
      jClickOutside
      (jClickOutside)="hide()"
    >
      @if (!popup || visible) {
        <ng-container
          [ngTemplateOutlet]="menuList"
          [ngTemplateOutletContext]="{ items: model, level: 0, parentPath: 'root' }"
        />
      }
    </nav>

    <ng-template #menuList let-items="items" let-level="level" let-parentPath="parentPath">
      <ul
        class="j-menu__list"
        [class.j-menu__list--submenu]="level > 0"
        data-jc-section="list"
        role="menu"
        (keydown)="handleKeydown($event)"
      >
        @for (item of items; track item.label || item.icon || $index; let i = $index) {
          @let path = itemKey(item, parentPath, i);
          @if (item.separator) {
            <li class="j-menu__separator" data-jc-section="separator" role="separator"></li>
          } @else {
            <li
              class="j-menu__item"
              data-jc-section="item"
              role="none"
              [attr.data-j-active]="isPathActive(path) ? 'true' : null"
              [attr.data-j-disabled]="item.disabled ? 'true' : null"
              (mouseenter)="scheduleSubmenu(path, item)"
              (mouseleave)="scheduleSubmenuClose(path)"
            >
              <button
                #menuButton
                class="j-menu__button"
                data-jc-section="item-control"
                type="button"
                role="menuitem"
                [disabled]="item.disabled"
                [attr.aria-haspopup]="item.items?.length ? 'menu' : null"
                [attr.aria-expanded]="item.items?.length ? submenuOpen(path) : null"
                [attr.tabindex]="path === activePath ? 0 : -1"
                [attr.data-j-focused]="path === activePath ? 'true' : null"
                [attr.data-j-active]="path === activePath ? 'true' : null"
                [attr.data-j-disabled]="item.disabled ? 'true' : null"
                (click)="activate(item, $event, path)"
                (focus)="setActive(path, item)"
              >
                @if (itemTemplate) {
                  <ng-container
                    [ngTemplateOutlet]="itemTemplate"
                    [ngTemplateOutletContext]="templateContext(item, path, level)"
                  />
                } @else {
                  @if (item.icon) {
                    <span class="j-menu__icon" data-jc-section="icon" aria-hidden="true">{{
                      item.icon
                    }}</span>
                  }
                  <span class="j-menu__label" data-jc-section="label">{{ item.label }}</span>
                  @if (item.badge != null) {
                    <span class="j-menu__badge" data-jc-section="badge">{{ item.badge }}</span>
                  }
                  @if (item.items?.length) {
                    <span class="j-menu__chevron" aria-hidden="true">›</span>
                  }
                }
              </button>
              @if (item.items?.length && submenuOpen(path)) {
                <ng-container
                  [ngTemplateOutlet]="menuList"
                  [ngTemplateOutletContext]="{
                    items: item.items,
                    level: level + 1,
                    parentPath: path,
                  }"
                />
              }
            </li>
          }
        }
      </ul>
    </ng-template>
  `,
  styles: [
    `
      .j-menu {
        display: inline-block;
        position: relative;
      }

      .j-menu--popup {
        position: fixed;
        z-index: var(--j-z-index-dropdown);
      }

      .j-menu--popup > .j-menu__list,
      .j-menu__list--submenu {
        background: var(--j-color-popover);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-lg);
        box-shadow: var(--j-shadow-lg);
        min-width: 13rem;
      }

      .j-menu__list {
        display: grid;
        gap: var(--j-spacing-1);
        list-style: none;
        margin: 0;
        padding: var(--j-spacing-1);
      }

      .j-menu__list--submenu {
        left: calc(100% + var(--j-spacing-1));
        position: absolute;
        top: 0;
      }

      .j-menu__item {
        position: relative;
      }

      .j-menu__button {
        align-items: center;
        background: transparent;
        border: 0;
        border-radius: var(--j-radius-md);
        color: var(--j-color-popover-foreground);
        cursor: pointer;
        display: flex;
        font: inherit;
        gap: var(--j-spacing-2);
        min-height: 2.25rem;
        padding: 0 var(--j-spacing-3);
        text-align: left;
        width: 100%;
      }

      .j-menu__button:hover,
      .j-menu__button:focus-visible,
      .j-menu__button[data-j-active='true'] {
        background: var(--j-color-muted);
        outline: none;
      }

      .j-menu__button:disabled {
        cursor: not-allowed;
        opacity: var(--j-disabled-opacity);
      }

      .j-menu__label {
        flex: 1;
      }

      .j-menu__badge {
        background: var(--j-color-muted);
        border-radius: var(--j-radius-full);
        color: var(--j-color-muted-foreground);
        font-size: var(--j-font-size-xs);
        padding: 0 var(--j-spacing-2);
      }

      .j-menu__chevron {
        color: var(--j-color-muted-foreground);
        margin-left: auto;
      }

      .j-menu__separator {
        border-top: 1px solid var(--j-color-border);
        margin: var(--j-spacing-1) 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JMenuComponent {
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly typeahead = jCreateTypeahead<JMenuItem>();
  private readonly openTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private readonly closeTimers = new Map<string, ReturnType<typeof setTimeout>>();

  @ViewChildren('menuButton') private buttons?: QueryList<ElementRef<HTMLButtonElement>>;
  @ContentChild('jMenuItem', { read: TemplateRef })
  itemTemplate?: TemplateRef<JMenuItemTemplateContext>;

  @Input() model: readonly JMenuItem[] = [];
  @Input() ariaLabel = 'Menu';
  @Input() styleClass = '';
  @Input() target: HTMLElement | null = null;
  @Input({ transform: booleanAttribute }) popup = false;
  @Input({ transform: booleanAttribute }) visible = false;
  @Input({ transform: numberAttribute }) submenuOpenDelay = 120;
  @Input({ transform: numberAttribute }) submenuCloseDelay = 180;

  readonly visibleChange = output<boolean>();
  readonly itemClick = output<{ item: JMenuItem; originalEvent: Event }>();

  activePath = 'root-0';
  openPaths = new Set<string>();
  left = 0;
  top = 0;

  get menuClasses(): string {
    return ['j-menu', this.popup ? 'j-menu--popup' : '', this.styleClass].filter(Boolean).join(' ');
  }

  show(eventOrTarget?: MouseEvent | HTMLElement): void {
    this.positionFrom(eventOrTarget);
    this.visible = true;
    this.visibleChange.emit(true);
    this.activePath = this.firstEnabledPath(this.model) ?? 'root-0';
    this.changeDetectorRef.markForCheck();
    queueMicrotask(() => this.focusActive());
  }

  hide(): void {
    if (!this.popup || !this.visible) {
      return;
    }
    this.visible = false;
    this.openPaths.clear();
    this.visibleChange.emit(false);
    this.changeDetectorRef.markForCheck();
  }

  toggle(eventOrTarget?: MouseEvent | HTMLElement): void {
    this.visible ? this.hide() : this.show(eventOrTarget);
  }

  activate(item: JMenuItem, event: Event, path: string): void {
    if (item.disabled) {
      return;
    }
    this.setActive(path, item);
    if (item.items?.length) {
      this.openPaths.add(path);
      this.changeDetectorRef.markForCheck();
      return;
    }
    const payload = { item, originalEvent: event };
    item.command?.(payload);
    this.itemClick.emit(payload);
    if (this.popup) {
      this.hide();
    }
  }

  handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.hide();
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.move(event.key === 'ArrowDown' ? 1 : -1);
      return;
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.openActiveSubmenu();
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.closeActiveSubmenu();
      return;
    }

    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      this.moveToEdge(event.key === 'Home' ? 'first' : 'last');
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.buttons?.get(this.activeButtonIndex())?.nativeElement.click();
      return;
    }

    this.handleTypeahead(event);
  }

  itemKey(item: JMenuItem, parentPath: string, index: number): string {
    return `${parentPath}-${item.label ?? item.icon ?? 'item'}-${index}`;
  }

  submenuOpen(path: string): boolean {
    return this.openPaths.has(path);
  }

  isPathActive(path: string): boolean {
    return this.activePath === path;
  }

  setActive(path: string, _item: JMenuItem): void {
    this.activePath = path;
  }

  scheduleSubmenu(path: string, item: JMenuItem): void {
    if (!item.items?.length || item.disabled) {
      return;
    }
    this.clearTimer(this.closeTimers, path);
    this.clearTimer(this.openTimers, path);
    this.openTimers.set(
      path,
      setTimeout(() => {
        this.openPaths.add(path);
        this.activePath = path;
        this.changeDetectorRef.markForCheck();
      }, this.submenuOpenDelay),
    );
  }

  scheduleSubmenuClose(path: string): void {
    this.clearTimer(this.openTimers, path);
    this.clearTimer(this.closeTimers, path);
    this.closeTimers.set(
      path,
      setTimeout(() => {
        this.openPaths.delete(path);
        this.changeDetectorRef.markForCheck();
      }, this.submenuCloseDelay),
    );
  }

  templateContext(item: JMenuItem, path: string, level: number): JMenuItemTemplateContext {
    return {
      $implicit: item,
      item,
      active: this.activePath === path,
      disabled: item.disabled === true,
      level,
    };
  }

  private move(direction: 1 | -1): void {
    const enabled = this.flatEnabledItems();
    if (!enabled.length) {
      return;
    }
    const current = Math.max(
      0,
      enabled.findIndex((entry) => entry.path === this.activePath),
    );
    const next = enabled[(current + direction + enabled.length) % enabled.length];
    this.activePath = next?.path ?? this.activePath;
    this.changeDetectorRef.markForCheck();
    queueMicrotask(() => this.focusActive());
  }

  private moveToEdge(edge: 'first' | 'last'): void {
    const enabled = this.flatEnabledItems();
    const next = edge === 'first' ? enabled[0] : enabled[enabled.length - 1];
    if (next) {
      this.activePath = next.path;
      this.changeDetectorRef.markForCheck();
      queueMicrotask(() => this.focusActive());
    }
  }

  private openActiveSubmenu(): void {
    const active = this.flatEnabledItems().find((entry) => entry.path === this.activePath);
    if (!active?.item.items?.length) {
      return;
    }
    this.openPaths.add(active.path);
    const firstChild = this.firstEnabledPath(active.item.items, active.path);
    this.activePath = firstChild ?? active.path;
    this.changeDetectorRef.markForCheck();
    queueMicrotask(() => this.focusActive());
  }

  private closeActiveSubmenu(): void {
    const parent = this.activePath.split('-').slice(0, -2).join('-');
    if (parent) {
      this.openPaths.delete(parent);
      this.activePath = parent;
      this.changeDetectorRef.markForCheck();
      queueMicrotask(() => this.focusActive());
    }
  }

  private handleTypeahead(event: KeyboardEvent): void {
    if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }
    const enabled = this.flatEnabledItems();
    const current = enabled.findIndex((entry) => entry.path === this.activePath);
    const next = this.typeahead.search(
      event.key,
      enabled.map((entry) => ({
        item: entry.item,
        text: entry.item.label ?? '',
        disabled: entry.item.disabled,
      })),
      current,
    );
    if (next >= 0) {
      event.preventDefault();
      this.activePath = enabled[next]?.path ?? this.activePath;
      this.changeDetectorRef.markForCheck();
      queueMicrotask(() => this.focusActive());
    }
  }

  private activeButtonIndex(): number {
    return Math.max(
      0,
      this.flatEnabledItems().findIndex((entry) => entry.path === this.activePath),
    );
  }

  private focusActive(): void {
    this.buttons?.get(this.activeButtonIndex())?.nativeElement.focus();
  }

  private flatEnabledItems(
    items = this.model,
    parentPath = 'root',
  ): { readonly item: JMenuItem; readonly path: string }[] {
    return items.flatMap((item, index) => {
      const path = this.itemKey(item, parentPath, index);
      if (item.separator) {
        return [];
      }
      const children =
        item.items?.length && this.openPaths.has(path)
          ? this.flatEnabledItems(item.items, path)
          : [];
      return item.disabled ? children : [{ item, path }, ...children];
    });
  }

  private firstEnabledPath(items: readonly JMenuItem[], parentPath = 'root'): string | null {
    const index = items.findIndex((item) => !item.separator && !item.disabled);
    return index >= 0 ? this.itemKey(items[index], parentPath, index) : null;
  }

  private positionFrom(eventOrTarget?: MouseEvent | HTMLElement): void {
    if (!this.popup) {
      return;
    }
    if (eventOrTarget instanceof MouseEvent) {
      this.left = eventOrTarget.clientX;
      this.top = eventOrTarget.clientY;
      return;
    }
    const target = eventOrTarget ?? this.target;
    if (target) {
      const rect = target.getBoundingClientRect();
      this.left = rect.left;
      this.top = rect.bottom + 4;
    }
  }

  private clearTimer(map: Map<string, ReturnType<typeof setTimeout>>, path: string): void {
    const timer = map.get(path);
    if (timer) {
      clearTimeout(timer);
      map.delete(path);
    }
  }
}
