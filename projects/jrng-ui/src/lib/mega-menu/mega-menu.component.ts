import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ContentChild, Input, TemplateRef } from '@angular/core';
import { JMenuItem, JMenuItemTemplateContext } from '../menu/menu.component';

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
    <nav class="j-mega-menu" data-jc-name="mega-menu" data-jc-section="root" [attr.aria-label]="ariaLabel">
      <ul class="j-mega-menu__triggers">
        @for (item of model; track item.label || item.icon || $index) {
          <li class="j-mega-menu__trigger" (mouseenter)="activeItem = item" (mouseleave)="activeItem = null">
            <button class="j-mega-menu__button" type="button">{{ item.label }}</button>
            @if (activeItem === item) {
              <div class="j-mega-menu__panel" [style.grid-template-columns]="'repeat(' + columns + ', minmax(0, 1fr))'">
                @for (group of item.groups || []; track group.label) {
                  <section class="j-mega-menu__group">
                    <h3>{{ group.label }}</h3>
                    @for (entry of group.items; track entry.label || entry.icon || $index) {
                      <button class="j-mega-menu__entry" type="button" [disabled]="entry.disabled" (click)="entry.command?.({ item: entry, originalEvent: $event })">
                        @if (itemTemplate) {
                          <ng-container [ngTemplateOutlet]="itemTemplate" [ngTemplateOutletContext]="templateContext(entry)" />
                        } @else {
                          @if (entry.icon) {
                            <span aria-hidden="true">{{ entry.icon }}</span>
                          }
                          <span>{{ entry.label }}</span>
                        }
                      </button>
                    }
                  </section>
                }
              </div>
            }
          </li>
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
  @Input() model: readonly JMegaMenuItem[] = [];
  @Input() ariaLabel = 'Mega menu';
  @Input() columns = 3;
  @ContentChild('jMegaMenuItem', { read: TemplateRef }) itemTemplate?: TemplateRef<JMenuItemTemplateContext>;

  activeItem: JMegaMenuItem | null = null;

  templateContext(item: JMenuItem): JMenuItemTemplateContext {
    return { $implicit: item, item, active: false, disabled: item.disabled === true, level: 1 };
  }
}
