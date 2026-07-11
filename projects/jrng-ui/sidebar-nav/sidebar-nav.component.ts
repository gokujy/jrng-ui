import { ChangeDetectionStrategy, Component, Input, booleanAttribute, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { JMenuItem } from 'jrng-ui/menu';

@Component({
  selector: 'j-sidebar-nav',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside
      class="j-sidebar-nav"
      [class.is-collapsed]="collapsed"
      data-jc-name="sidebar-nav"
      data-jc-section="root"
      [attr.aria-label]="ariaLabel"
    >
      <header class="j-sidebar-nav__header" data-jc-section="header">
        <ng-content select="[jSidebarBrand]"></ng-content>
        @if (collapsible) {
          <button
            class="j-sidebar-nav__toggle"
            type="button"
            [attr.aria-expanded]="!collapsed"
            (click)="toggle()"
          >
            {{ collapsed ? expandLabel : collapseLabel }}
          </button>
        }
      </header>
      <nav class="j-sidebar-nav__body" data-jc-section="body">
        @for (item of model; track item.label || item.url || item.routerLink || $index) {
          @if (item.separator) {
            <span class="j-sidebar-nav__separator" role="separator"></span>
          } @else {
            <a
              class="j-sidebar-nav__item"
              [href]="item.url || null"
              [routerLink]="item.routerLink || null"
              routerLinkActive="is-active"
              [class.is-disabled]="item.disabled"
              [attr.data-j-active]="isActive(item) ? 'true' : null"
              [attr.data-j-disabled]="item.disabled ? 'true' : null"
              (click)="handleClick(item, $event)"
            >
              @if (item.icon) {
                <span class="j-sidebar-nav__icon" aria-hidden="true">{{ item.icon }}</span>
              }
              <span class="j-sidebar-nav__label">{{ item.label }}</span>
              @if (item.badge !== null && item.badge !== undefined) {
                <span class="j-sidebar-nav__badge">{{ item.badge }}</span>
              }
            </a>
          }
        }
      </nav>
      <footer class="j-sidebar-nav__footer" data-jc-section="footer">
        <ng-content select="[jSidebarFooter]"></ng-content>
      </footer>
    </aside>
  `,
  styles: [
    `
      .j-sidebar-nav {
        background: var(--j-color-card);
        border-right: 1px solid var(--j-color-border);
        color: var(--j-color-card-foreground);
        display: flex;
        flex-direction: column;
        height: 100%;
        min-width: 16rem;
        transition: min-width 160ms ease;
      }

      .j-sidebar-nav.is-collapsed {
        min-width: 4.5rem;
      }

      .j-sidebar-nav__header,
      .j-sidebar-nav__footer {
        padding: var(--j-spacing-4);
      }

      .j-sidebar-nav__body {
        display: grid;
        flex: 1;
        gap: var(--j-spacing-1);
        overflow: auto;
        padding: var(--j-spacing-2);
      }

      .j-sidebar-nav__item {
        align-items: center;
        border-radius: var(--j-radius-md);
        color: var(--j-color-muted-foreground);
        display: flex;
        gap: var(--j-spacing-3);
        min-height: 2.5rem;
        padding: 0 var(--j-spacing-3);
        text-decoration: none;
      }

      .j-sidebar-nav__item:hover,
      .j-sidebar-nav__item.is-active {
        background: var(--j-color-muted);
        color: var(--j-color-foreground);
      }

      .j-sidebar-nav__item:focus-visible,
      .j-sidebar-nav__toggle:focus-visible {
        box-shadow: var(--j-focus-ring);
        outline: none;
      }

      .j-sidebar-nav__item.is-disabled {
        opacity: var(--j-disabled-opacity);
        pointer-events: none;
      }

      .j-sidebar-nav__label {
        flex: 1;
      }

      .j-sidebar-nav.is-collapsed .j-sidebar-nav__label,
      .j-sidebar-nav.is-collapsed .j-sidebar-nav__badge {
        display: none;
      }

      .j-sidebar-nav__toggle {
        background: transparent;
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-md);
        color: inherit;
        cursor: pointer;
        font: inherit;
        min-height: 2rem;
      }

      .j-sidebar-nav__separator {
        border-top: 1px solid var(--j-color-border);
        margin: var(--j-spacing-2);
      }

      @media (max-width: 720px) {
        .j-sidebar-nav {
          min-width: 100%;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JSidebarNavComponent {
  @Input() model: readonly JMenuItem[] = [];
  @Input() ariaLabel = 'Sidebar navigation';
  @Input() activeKey = '';
  @Input() collapseLabel = 'Collapse';
  @Input() expandLabel = 'Expand';
  @Input({ transform: booleanAttribute }) collapsible = true;
  @Input({ transform: booleanAttribute }) collapsed = false;

  readonly collapsedChange = output<boolean>();
  readonly itemClick = output<{ item: JMenuItem; originalEvent: MouseEvent }>();

  toggle(): void {
    this.collapsed = !this.collapsed;
    this.collapsedChange.emit(this.collapsed);
  }

  isActive(item: JMenuItem): boolean {
    return (
      !!this.activeKey &&
      (item.label === this.activeKey ||
        item.url === this.activeKey ||
        item.routerLink === this.activeKey)
    );
  }

  handleClick(item: JMenuItem, originalEvent: MouseEvent): void {
    if (item.disabled) {
      originalEvent.preventDefault();
      return;
    }
    item.command?.({ item, originalEvent });
    this.itemClick.emit({ item, originalEvent });
    if (!item.url && !item.routerLink) {
      originalEvent.preventDefault();
    }
  }
}
