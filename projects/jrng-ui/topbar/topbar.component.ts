import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { JMenuItem } from 'jrng-ui/menu';

@Component({
  selector: 'j-topbar',
  imports: [RouterLink],
  template: `
    <header class="j-topbar" data-jc-name="topbar" data-jc-section="root">
      <div class="j-topbar__brand" data-jc-section="brand">
        <ng-content select="[jTopbarBrand]"></ng-content>
      </div>
      @if (showNavigation()) {
        <nav class="j-topbar__nav" data-jc-section="nav" [attr.aria-label]="ariaLabel()">
          @for (item of visibleItems(); track item.id || $index) {
            <a
              class="j-topbar__link"
              [href]="item.url || null"
              [routerLink]="item.routerLink || null"
              [target]="item.target"
              [class.is-active]="isActive(item)"
              [class.is-disabled]="item.disabled"
              [attr.data-j-active]="isActive(item) ? 'true' : null"
              [attr.data-j-disabled]="item.disabled ? 'true' : null"
              [attr.aria-disabled]="item.disabled ? 'true' : null"
              [attr.aria-current]="isActive(item) ? 'page' : null"
              [attr.tabindex]="item.disabled ? -1 : null"
              (click)="activateItem($event, item)"
            >
              @if (item.icon) {
                <span aria-hidden="true">{{ item.icon }}</span>
              }
              <span>{{ item.label }}</span>
            </a>
          }
        </nav>
      }
      <div class="j-topbar__actions" data-jc-section="actions">
        <ng-content select="[jTopbarActions]"></ng-content>
      </div>
    </header>
  `,
  styles: [
    `
      .j-topbar {
        align-items: center;
        background: var(--j-color-card);
        border-bottom: 1px solid var(--j-color-border);
        color: var(--j-color-card-foreground);
        display: flex;
        gap: var(--j-spacing-4);
        min-height: 4rem;
        padding: 0 var(--j-spacing-4);
      }

      .j-topbar__brand {
        align-items: center;
        display: flex;
        font-weight: var(--j-font-weight-semibold);
        min-width: max-content;
      }

      .j-topbar__nav {
        align-items: center;
        display: flex;
        flex: 1;
        gap: var(--j-spacing-1);
        overflow-x: auto;
      }

      .j-topbar__link {
        align-items: center;
        border-radius: var(--j-radius-md);
        color: var(--j-color-muted-foreground);
        display: inline-flex;
        gap: var(--j-spacing-2);
        min-height: 2.5rem;
        padding: 0 var(--j-spacing-3);
        text-decoration: none;
        white-space: nowrap;
      }

      .j-topbar__link:hover,
      .j-topbar__link.is-active {
        background: var(--j-color-muted);
        color: var(--j-color-foreground);
      }

      .j-topbar__link:focus-visible {
        box-shadow: var(--j-focus-ring);
        outline: none;
      }

      .j-topbar__link.is-disabled {
        opacity: var(--j-disabled-opacity);
        pointer-events: none;
      }

      .j-topbar__actions {
        align-items: center;
        display: flex;
        gap: var(--j-spacing-2);
        margin-left: auto;
      }

      @media (max-width: 640px) {
        .j-topbar {
          flex-wrap: wrap;
          min-height: auto;
          padding-block: var(--j-spacing-3);
        }

        .j-topbar__nav {
          order: 3;
          width: 100%;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JTopbarComponent {
  readonly model = input<readonly JMenuItem[]>([]);
  readonly ariaLabel = input('Top navigation');
  readonly activeKey = input('');
  readonly showNavigation = input(true, { transform: booleanAttribute });

  protected visibleItems(): readonly JMenuItem[] {
    return this.model().filter((item) => {
      const visible = typeof item.visible === 'function' ? item.visible() : item.visible !== false;
      return visible && (item.permission?.() ?? true) && !item.separator;
    });
  }

  isActive(item: JMenuItem): boolean {
    return (
      !!this.activeKey() &&
      (item.label === this.activeKey() ||
        item.url === this.activeKey() ||
        item.routerLink === this.activeKey())
    );
  }

  protected activateItem(event: MouseEvent, item: JMenuItem): void {
    if (item.disabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    item.command?.({ item, originalEvent: event });
  }
}
