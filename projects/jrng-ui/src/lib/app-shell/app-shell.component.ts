import { ChangeDetectionStrategy, Component, booleanAttribute, input, model } from '@angular/core';

@Component({
  selector: 'j-app-shell',
  imports: [],
  template: `
    <div
      class="j-app-shell"
      [class]="styleClass()"
      [class.j-app-shell--collapsed]="sidebarCollapsed()"
      [class.j-app-shell--overlay-open]="sidebarOpen()"
      data-jc-name="app-shell"
      data-jc-section="root"
      [attr.data-j-open]="sidebarOpen() ? 'true' : null"
    >
      <header class="j-app-shell__header" data-jc-section="header">
        <button class="j-app-shell__toggle" type="button" [attr.aria-expanded]="sidebarOpen()" (click)="toggleSidebar()">
          {{ sidebarOpen() ? 'Close' : 'Menu' }}
        </button>
        <ng-content select="[jShellHeader]" />
      </header>

      <aside class="j-app-shell__sidebar" data-jc-section="sidebar">
        <ng-content select="[jShellSidebar]" />
      </aside>

      @if (sidebarOpen()) {
        <button class="j-app-shell__mask" type="button" aria-label="Close sidebar" (click)="sidebarOpen.set(false)"></button>
      }

      <main class="j-app-shell__content" data-jc-section="content">
        <ng-content />
      </main>

      @if (footer()) {
        <footer class="j-app-shell__footer" data-jc-section="footer">
          <ng-content select="[jShellFooter]" />
        </footer>
      }
    </div>
  `,
  styles: [
    `
      .j-app-shell {
        background: var(--j-color-background);
        color: var(--j-color-foreground);
        display: grid;
        grid-template:
          'sidebar header' auto
          'sidebar content' minmax(0, 1fr)
          'sidebar footer' auto / var(--j-app-shell-sidebar-width, 17rem) minmax(0, 1fr);
        min-height: 100dvh;
      }

      .j-app-shell--collapsed {
        grid-template-columns: var(--j-app-shell-sidebar-collapsed-width, 4.5rem) minmax(0, 1fr);
      }

      .j-app-shell__header {
        align-items: center;
        background: var(--j-color-card);
        border-bottom: 1px solid var(--j-color-border);
        display: flex;
        gap: var(--j-spacing-3);
        grid-area: header;
        min-height: 4rem;
        padding: 0 var(--j-spacing-4);
        position: sticky;
        top: 0;
        z-index: 20;
      }

      .j-app-shell__sidebar {
        background: var(--j-color-card);
        border-right: 1px solid var(--j-color-border);
        grid-area: sidebar;
        min-width: 0;
        overflow: auto;
      }

      .j-app-shell__content {
        grid-area: content;
        min-width: 0;
        padding: var(--j-spacing-5);
      }

      .j-app-shell__footer {
        border-top: 1px solid var(--j-color-border);
        grid-area: footer;
        padding: var(--j-spacing-4);
      }

      .j-app-shell__toggle,
      .j-app-shell__mask {
        background: var(--j-color-card);
        border: 1px solid var(--j-color-border);
        border-radius: var(--j-radius-md);
        color: inherit;
        cursor: pointer;
        font: inherit;
      }

      .j-app-shell__toggle {
        min-height: 2.25rem;
        padding: 0 var(--j-spacing-3);
      }

      .j-app-shell__mask {
        display: none;
      }

      @media (max-width: 768px) {
        .j-app-shell {
          grid-template:
            'header' auto
            'content' minmax(0, 1fr)
            'footer' auto / minmax(0, 1fr);
        }

        .j-app-shell__sidebar {
          bottom: 0;
          left: 0;
          max-width: 20rem;
          position: fixed;
          top: 0;
          transform: translateX(-100%);
          transition: transform var(--j-duration-normal) var(--j-ease-standard);
          width: min(85vw, 20rem);
          z-index: 40;
        }

        .j-app-shell--overlay-open .j-app-shell__sidebar {
          transform: translateX(0);
        }

        .j-app-shell__mask {
          background: rgb(15 23 42 / 48%);
          border: 0;
          border-radius: 0;
          display: block;
          inset: 0;
          position: fixed;
          z-index: 30;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JAppShellComponent {
  readonly sidebarCollapsed = model(false);
  readonly sidebarOpen = model(false);
  readonly footer = input(true, { transform: booleanAttribute });
  readonly styleClass = input('');

  toggleSidebar(): void {
    this.sidebarOpen.set(!this.sidebarOpen());
  }
}
