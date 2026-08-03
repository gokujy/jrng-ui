import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  booleanAttribute,
  effect,
  inject,
  input,
  linkedSignal,
  output,
  signal,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { jCreateId } from 'jrng-ui/core';
import { JIconComponent } from 'jrng-ui/icon';
import { JMenuItem } from 'jrng-ui/menu';

export type JSidebarVariant = 'sidebar' | 'floating' | 'inset';
export type JSidebarCollapseMode = 'icon' | 'offcanvas' | 'none';
export type JSidebarSide = 'left' | 'right';

@Component({
  selector: 'j-sidebar-nav',
  imports: [NgTemplateOutlet, RouterLink, RouterLinkActive, JIconComponent],
  host: {
    style: 'display: contents',
    '(document:keydown.escape)': 'dismiss()',
  },
  template: `
    @if (showsBackdrop()) {
      <button
        class="j-sidebar-nav__backdrop"
        type="button"
        aria-label="Close sidebar"
        (click)="dismiss()"
      ></button>
    }

    <aside
      [id]="sidebarId"
      [class]="classes()"
      data-jc-name="sidebar-nav"
      data-jc-section="root"
      data-jc-extend="header body item submenu footer backdrop"
      [attr.aria-label]="ariaLabel()"
      [attr.data-j-open]="collapsedState() ? null : 'true'"
      [attr.data-j-side]="side()"
      [style.--j-sidebar-width]="width()"
      [style.--j-sidebar-collapsed-width]="collapsedWidth()"
      (mouseenter)="setHoverExpanded(true)"
      (mouseleave)="setHoverExpanded(false)"
    >
      <header class="j-sidebar-nav__header" data-jc-section="header">
        <div class="j-sidebar-nav__brand"><ng-content select="[jSidebarBrand]" /></div>
        @if (collapsible() && collapseMode() !== 'none') {
          <button
            class="j-sidebar-nav__toggle"
            type="button"
            [attr.aria-expanded]="!collapsedState()"
            [attr.aria-controls]="sidebarId"
            (click)="toggle()"
          >
            <j-icon [name]="collapsedState() ? 'panel-left-open' : 'panel-left'" />
            <span class="j-hidden-accessible">
              {{ collapsedState() ? expandLabel() : collapseLabel() }}
            </span>
          </button>
        }
      </header>

      <nav class="j-sidebar-nav__body" data-jc-section="body" [attr.aria-label]="menuLabel()">
        <ng-container
          [ngTemplateOutlet]="menuList"
          [ngTemplateOutletContext]="{ items: model(), level: 0, parentPath: 'root' }"
        />
      </nav>

      <footer class="j-sidebar-nav__footer" data-jc-section="footer">
        <ng-content select="[jSidebarFooter]" />
      </footer>
    </aside>

    <ng-template #menuList let-items="items" let-level="level" let-parentPath="parentPath">
      <ul class="j-sidebar-nav__list" [class.is-nested]="level > 0" role="list">
        @for (item of items; track item.id ?? $index; let index = $index) {
          @if (itemVisible(item)) {
            @let key = itemKey(item, parentPath, index);
            @let children = itemChildren(item);
            @if (item.separator) {
              <li class="j-sidebar-nav__separator" role="separator"></li>
            } @else {
              <li role="listitem">
                @if (children.length) {
                  <button
                    class="j-sidebar-nav__item"
                    type="button"
                    [class.is-active]="isActive(item)"
                    [class.is-disabled]="item.disabled"
                    [attr.aria-expanded]="groupExpanded(key)"
                    [disabled]="item.disabled"
                    (click)="toggleGroup(key)"
                  >
                    @if (item.icon) {
                      <j-icon class="j-sidebar-nav__icon" [name]="item.icon" />
                    }
                    <span class="j-sidebar-nav__label">{{ item.label }}</span>
                    @if (item.badge !== null && item.badge !== undefined) {
                      <span class="j-sidebar-nav__badge">{{ item.badge }}</span>
                    }
                    <j-icon
                      class="j-sidebar-nav__chevron"
                      [name]="groupExpanded(key) ? 'chevron-up' : 'chevron-down'"
                    />
                  </button>
                  @if (groupExpanded(key)) {
                    <ng-container
                      [ngTemplateOutlet]="menuList"
                      [ngTemplateOutletContext]="{
                        items: children,
                        level: level + 1,
                        parentPath: key,
                      }"
                    />
                  }
                } @else {
                  <a
                    class="j-sidebar-nav__item"
                    [href]="item.url || null"
                    [routerLink]="item.routerLink || null"
                    [attr.target]="item.target || null"
                    routerLinkActive="is-active"
                    [class.is-active]="isActive(item)"
                    [class.is-disabled]="item.disabled"
                    [attr.aria-disabled]="item.disabled || null"
                    [attr.aria-current]="isActive(item) ? 'page' : null"
                    [attr.tabindex]="item.disabled ? -1 : null"
                    (click)="handleClick(item, $event)"
                  >
                    @if (item.icon) {
                      <j-icon class="j-sidebar-nav__icon" [name]="item.icon" />
                    }
                    <span class="j-sidebar-nav__label">{{ item.label }}</span>
                    @if (item.badge !== null && item.badge !== undefined) {
                      <span class="j-sidebar-nav__badge">{{ item.badge }}</span>
                    }
                  </a>
                }
              </li>
            }
          }
        }
      </ul>
    </ng-template>
  `,
  styles: [
    `
      .j-sidebar-nav {
        background: var(--j-color-card);
        border-inline-end: 1px solid var(--j-color-border);
        color: var(--j-color-card-foreground);
        display: flex;
        flex-direction: column;
        height: 100%;
        inline-size: var(--j-sidebar-width, 17rem);
        min-inline-size: var(--j-sidebar-width, 17rem);
        overflow: hidden;
        position: relative;
        transition:
          inline-size var(--j-duration-normal) var(--j-ease-standard),
          min-inline-size var(--j-duration-normal) var(--j-ease-standard),
          transform var(--j-duration-normal) var(--j-ease-standard);
        z-index: 60;
      }

      .j-sidebar-nav--right {
        border-inline-end: 0;
        border-inline-start: 1px solid var(--j-color-border);
      }

      .j-sidebar-nav--floating {
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-xl);
        box-shadow: var(--j-shadow-lg);
        margin: var(--j-spacing-3);
      }

      .j-sidebar-nav--inset {
        background: color-mix(in srgb, var(--j-color-muted) 55%, var(--j-color-card));
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-lg);
        margin: var(--j-spacing-2);
      }

      .j-sidebar-nav--icon.is-collapsed:not(.is-hover-expanded) {
        inline-size: var(--j-sidebar-collapsed-width, 4.5rem);
        min-inline-size: var(--j-sidebar-collapsed-width, 4.5rem);
      }

      .j-sidebar-nav--offcanvas,
      .j-sidebar-nav--overlay {
        bottom: 0;
        inset-inline-start: 0;
        position: fixed;
        top: 0;
      }

      .j-sidebar-nav--offcanvas.j-sidebar-nav--right,
      .j-sidebar-nav--overlay.j-sidebar-nav--right {
        inset-inline-end: 0;
        inset-inline-start: auto;
      }

      .j-sidebar-nav--offcanvas.is-collapsed,
      .j-sidebar-nav--overlay.is-collapsed {
        transform: translateX(-102%);
      }

      .j-sidebar-nav--offcanvas.j-sidebar-nav--right.is-collapsed,
      .j-sidebar-nav--overlay.j-sidebar-nav--right.is-collapsed {
        transform: translateX(102%);
      }

      .j-sidebar-nav__backdrop {
        background: var(--j-overlay-backdrop-bg, rgb(15 23 42 / 45%));
        border: 0;
        inset: 0;
        position: fixed;
        z-index: 50;
      }

      .j-sidebar-nav__header,
      .j-sidebar-nav__footer {
        align-items: center;
        display: flex;
        gap: var(--j-spacing-3);
        justify-content: space-between;
        min-height: 3.5rem;
        padding: var(--j-spacing-3);
      }

      .j-sidebar-nav__brand {
        min-width: 0;
        overflow: hidden;
      }

      .j-sidebar-nav__body {
        flex: 1;
        overflow: auto;
        padding: var(--j-spacing-2);
      }

      .j-sidebar-nav__list {
        display: grid;
        gap: var(--j-spacing-1);
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .j-sidebar-nav__list.is-nested {
        border-inline-start: 1px solid var(--j-color-border);
        margin: var(--j-spacing-1) 0 var(--j-spacing-2) var(--j-spacing-5);
        padding-inline-start: var(--j-spacing-2);
      }

      .j-sidebar-nav__item {
        align-items: center;
        background: transparent;
        border: 0;
        border-radius: var(--j-radius-md);
        color: var(--j-color-muted-foreground);
        cursor: pointer;
        display: flex;
        font: inherit;
        gap: var(--j-spacing-3);
        min-height: 2.5rem;
        padding: 0 var(--j-spacing-3);
        text-align: start;
        text-decoration: none;
        width: 100%;
      }

      .j-sidebar-nav__item:hover,
      .j-sidebar-nav__item.is-active,
      .j-sidebar-nav__item[data-j-active='true'] {
        background: var(--j-color-muted);
        color: var(--j-color-foreground);
      }

      .j-sidebar-nav__item:focus-visible,
      .j-sidebar-nav__toggle:focus-visible,
      .j-sidebar-nav__backdrop:focus-visible {
        box-shadow: var(--j-focus-ring);
        outline: none;
      }

      .j-sidebar-nav__item.is-disabled {
        opacity: var(--j-disabled-opacity);
        pointer-events: none;
      }

      .j-sidebar-nav__icon,
      .j-sidebar-nav__chevron {
        flex: 0 0 auto;
      }

      .j-sidebar-nav__label {
        flex: 1;
        min-width: 0;
      }

      .j-sidebar-nav__badge {
        background: var(--j-color-muted);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-full);
        font-size: var(--j-font-size-xs);
        padding: 0 var(--j-spacing-2);
      }

      .j-sidebar-nav--icon.is-collapsed:not(.is-hover-expanded) .j-sidebar-nav__label,
      .j-sidebar-nav--icon.is-collapsed:not(.is-hover-expanded) .j-sidebar-nav__badge,
      .j-sidebar-nav--icon.is-collapsed:not(.is-hover-expanded) .j-sidebar-nav__chevron,
      .j-sidebar-nav--icon.is-collapsed:not(.is-hover-expanded) .j-sidebar-nav__brand,
      .j-sidebar-nav--icon.is-collapsed:not(.is-hover-expanded) .j-sidebar-nav__footer {
        display: none;
      }

      .j-sidebar-nav--icon.is-collapsed:not(.is-hover-expanded) .j-sidebar-nav__item,
      .j-sidebar-nav--icon.is-collapsed:not(.is-hover-expanded) .j-sidebar-nav__header {
        justify-content: center;
        padding-inline: var(--j-spacing-2);
      }

      .j-sidebar-nav__toggle {
        align-items: center;
        background: transparent;
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-md);
        color: inherit;
        cursor: pointer;
        display: inline-flex;
        flex: 0 0 auto;
        justify-content: center;
        min-height: 2rem;
        min-width: 2rem;
      }

      .j-sidebar-nav__separator {
        border-top: 1px solid var(--j-color-border);
        margin: var(--j-spacing-2);
      }

      @media (max-width: 1024px) {
        .j-sidebar-nav--responsive {
          bottom: 0;
          inset-inline-start: 0;
          position: fixed;
          top: 0;
        }

        .j-sidebar-nav--responsive.j-sidebar-nav--right {
          inset-inline-end: 0;
          inset-inline-start: auto;
        }

        .j-sidebar-nav--responsive.is-collapsed {
          transform: translateX(-102%);
        }

        .j-sidebar-nav--responsive.j-sidebar-nav--right.is-collapsed {
          transform: translateX(102%);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .j-sidebar-nav {
          transition: none;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JSidebarNavComponent {
  readonly sidebarId = jCreateId('j-sidebar');
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly destroyRef = inject(DestroyRef);
  readonly model = input<readonly JMenuItem[]>([]);
  readonly ariaLabel = input('Sidebar navigation');
  readonly menuLabel = input('Navigation');
  readonly activeKey = input('');
  readonly collapseLabel = input('Collapse sidebar');
  readonly expandLabel = input('Expand sidebar');
  readonly collapsible = input(true, { transform: booleanAttribute });
  readonly collapsed = input(false, { transform: booleanAttribute });
  readonly collapseMode = input<JSidebarCollapseMode>('icon');
  readonly variant = input<JSidebarVariant>('sidebar');
  readonly side = input<JSidebarSide>('left');
  readonly overlay = input(false, { transform: booleanAttribute });
  readonly openOnHover = input(false, { transform: booleanAttribute });
  readonly backdrop = input(false, { transform: booleanAttribute });
  readonly dismissable = input(true, { transform: booleanAttribute });
  readonly responsive = input(true, { transform: booleanAttribute });
  readonly width = input('17rem');
  readonly collapsedWidth = input('4.5rem');
  readonly styleClass = input('');

  readonly collapsedChange = output<boolean>();
  readonly itemClick = output<{ item: JMenuItem; originalEvent: MouseEvent }>();

  protected readonly collapsedState = linkedSignal(() => this.collapsed());
  protected readonly hoverExpanded = signal(false);
  private readonly mobileViewport = signal(false);
  private readonly expandedGroups = signal<ReadonlySet<string>>(new Set());

  constructor() {
    const mediaQuery = this.host.ownerDocument.defaultView?.matchMedia('(max-width: 1024px)');
    if (!mediaQuery) return;
    const updateViewport = (matches: boolean): void => this.mobileViewport.set(matches);
    updateViewport(mediaQuery.matches);
    const onChange = (event: MediaQueryListEvent): void => updateViewport(event.matches);
    mediaQuery.addEventListener('change', onChange);
    this.destroyRef.onDestroy(() => mediaQuery.removeEventListener('change', onChange));

    let wasResponsiveOverlay = false;
    effect(() => {
      const responsiveOverlay = this.responsive() && this.mobileViewport();
      if (responsiveOverlay && !wasResponsiveOverlay) this.setCollapsed(true);
      wasResponsiveOverlay = responsiveOverlay;
    });
  }

  protected classes(): string {
    return [
      'j-sidebar-nav',
      `j-sidebar-nav--${this.variant()}`,
      `j-sidebar-nav--${this.side()}`,
      `j-sidebar-nav--${this.collapseMode()}`,
      this.overlay() ? 'j-sidebar-nav--overlay' : '',
      this.responsive() ? 'j-sidebar-nav--responsive' : '',
      this.collapsedState() ? 'is-collapsed' : '',
      this.hoverExpanded() ? 'is-hover-expanded' : '',
      this.styleClass(),
    ]
      .filter(Boolean)
      .join(' ');
  }

  toggle(): void {
    if (!this.collapsible() || this.collapseMode() === 'none') return;
    this.setCollapsed(!this.collapsedState());
  }

  dismiss(): void {
    if (
      !this.dismissable() ||
      (!this.overlay() && this.collapseMode() !== 'offcanvas' && !this.isResponsiveOverlay())
    ) {
      return;
    }
    this.setCollapsed(true);
  }

  protected showsBackdrop(): boolean {
    return (
      this.backdrop() &&
      !this.collapsedState() &&
      (this.overlay() || this.collapseMode() === 'offcanvas' || this.isResponsiveOverlay())
    );
  }

  protected setHoverExpanded(hovered: boolean): void {
    this.hoverExpanded.set(
      hovered && this.openOnHover() && this.collapseMode() === 'icon' && this.collapsedState(),
    );
  }

  isActive(item: JMenuItem): boolean {
    return (
      !!this.activeKey() &&
      (item.id === this.activeKey() ||
        item.label === this.activeKey() ||
        item.url === this.activeKey() ||
        item.routerLink === this.activeKey())
    );
  }

  protected itemVisible(item: JMenuItem): boolean {
    const visible = typeof item.visible === 'function' ? item.visible() : item.visible !== false;
    return visible && (item.permission?.() ?? true);
  }

  protected itemChildren(item: JMenuItem): readonly JMenuItem[] {
    return item.items ?? item.children ?? [];
  }

  protected itemKey(item: JMenuItem, parentPath: string, index: number): string {
    return `${parentPath}/${item.id ?? item.label ?? index}`;
  }

  protected groupExpanded(key: string): boolean {
    return this.expandedGroups().has(key);
  }

  protected toggleGroup(key: string): void {
    const next = new Set(this.expandedGroups());
    if (next.has(key)) next.delete(key);
    else next.add(key);
    this.expandedGroups.set(next);
  }

  handleClick(item: JMenuItem, originalEvent: MouseEvent): void {
    if (item.disabled) {
      originalEvent.preventDefault();
      return;
    }
    item.command?.({ item, originalEvent });
    this.itemClick.emit({ item, originalEvent });
    if (!item.url && !item.routerLink) originalEvent.preventDefault();
    if ((this.overlay() || this.isResponsiveOverlay()) && this.dismissable()) {
      this.setCollapsed(true);
    }
  }

  private isResponsiveOverlay(): boolean {
    return this.responsive() && this.mobileViewport();
  }

  private setCollapsed(collapsed: boolean): void {
    this.collapsedState.set(collapsed);
    this.collapsedChange.emit(collapsed);
    if (!collapsed) this.hoverExpanded.set(false);
  }
}
