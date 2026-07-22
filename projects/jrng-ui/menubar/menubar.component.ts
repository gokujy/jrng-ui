import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  TemplateRef,
  booleanAttribute,
  input,
  output,
} from '@angular/core';
import { JMenuItem, JMenuItemTemplateContext } from 'jrng-ui/menu';
import { JIconComponent } from 'jrng-ui/icon';

@Component({
  selector: 'j-menubar',
  imports: [NgTemplateOutlet, JIconComponent],
  template: `
    <nav
      class="j-menubar"
      [class.is-collapsed]="collapsed"
      data-jc-name="menubar"
      data-jc-section="root"
      [attr.aria-label]="ariaLabel()"
    >
      @if (mobileCollapse()) {
        <button
          class="j-menubar__toggle"
          type="button"
          [attr.aria-expanded]="!collapsed"
          (click)="collapsed = !collapsed"
        >
          {{ menuLabel() }}
        </button>
      }
      <ul class="j-menubar__list" role="menubar">
        @for (item of model(); track item.label || item.icon || $index) {
          <li
            class="j-menubar__item"
            role="none"
            (mouseenter)="openItem = item"
            (mouseleave)="openItem = null"
          >
            <button
              class="j-menubar__button"
              type="button"
              role="menuitem"
              [disabled]="item.disabled"
              [attr.aria-haspopup]="item.items?.length ? 'menu' : null"
              [attr.aria-expanded]="item.items?.length ? openItem === item : null"
              (click)="activate(item, $event)"
            >
              @if (itemTemplate) {
                <ng-container
                  [ngTemplateOutlet]="itemTemplate"
                  [ngTemplateOutletContext]="templateContext(item)"
                />
              } @else {
                @if (item.icon) {
                  <j-icon [name]="item.icon" />
                }
                <span>{{ item.label }}</span>
                @if (item.items?.length) {
                  <j-icon name="chevron-down" styleClass="j-menubar__chevron" />
                }
              }
            </button>
            @if (item.items?.length && openItem === item) {
              <ul class="j-menubar__submenu" role="menu">
                @for (child of item.items; track child.label || child.icon || $index) {
                  <li role="none">
                    <button
                      class="j-menubar__button"
                      type="button"
                      role="menuitem"
                      [disabled]="child.disabled"
                      (click)="activate(child, $event)"
                    >
                      @if (child.icon) {
                        <j-icon [name]="child.icon" />
                      }
                      <span>{{ child.label }}</span>
                    </button>
                  </li>
                }
              </ul>
            }
          </li>
        }
      </ul>
    </nav>
  `,
  styles: [
    `
      .j-menubar {
        align-items: center;
        display: flex;
        gap: var(--j-spacing-2);
      }

      .j-menubar__list {
        align-items: center;
        display: flex;
        gap: var(--j-spacing-1);
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .j-menubar__item {
        position: relative;
      }

      .j-menubar__button,
      .j-menubar__toggle {
        background: transparent;
        border: 0;
        border-radius: var(--j-radius-md);
        color: var(--j-color-foreground);
        cursor: pointer;
        align-items: center;
        display: inline-flex;
        gap: var(--j-spacing-2);
        font: inherit;
        min-height: 2.5rem;
        padding: 0 var(--j-spacing-3);
      }

      .j-menubar__button:hover,
      .j-menubar__button:focus-visible,
      .j-menubar__toggle:focus-visible {
        background: var(--j-color-muted);
        box-shadow: var(--j-focus-ring);
        outline: none;
      }

      .j-menubar__submenu {
        background: var(--j-color-popover);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-lg);
        box-shadow: var(--j-shadow-lg);
        display: grid;
        left: 0;
        list-style: none;
        margin: 0;
        min-width: 13rem;
        padding: var(--j-spacing-1);
        position: absolute;
        top: 100%;
        z-index: var(--j-z-index-dropdown);
      }

      @media (max-width: 640px) {
        .j-menubar {
          align-items: stretch;
          flex-direction: column;
        }

        .j-menubar.is-collapsed .j-menubar__list {
          display: none;
        }

        .j-menubar__list {
          align-items: stretch;
          flex-direction: column;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JMenubarComponent {
  readonly model = input<readonly JMenuItem[]>([]);
  readonly ariaLabel = input('Menubar');
  readonly menuLabel = input('Menu');
  readonly mobileCollapse = input(true, { transform: booleanAttribute });
  readonly itemClick = output<{ item: JMenuItem; originalEvent: Event }>();
  @ContentChild('jMenubarItem', { read: TemplateRef })
  itemTemplate?: TemplateRef<JMenuItemTemplateContext>;

  collapsed = true;
  openItem: JMenuItem | null = null;

  activate(item: JMenuItem, originalEvent: Event): void {
    if (item.disabled || item.items?.length) {
      return;
    }
    const payload = { item, originalEvent };
    item.command?.(payload);
    this.itemClick.emit(payload);
    this.collapsed = true;
  }

  templateContext(item: JMenuItem): JMenuItemTemplateContext {
    return {
      $implicit: item,
      item,
      active: this.openItem === item,
      disabled: item.disabled === true,
      level: 0,
    };
  }
}
