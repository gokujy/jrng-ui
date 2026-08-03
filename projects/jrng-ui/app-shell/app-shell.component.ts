import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { jCreateId } from 'jrng-ui/core';

@Component({
  selector: 'j-app-shell',
  imports: [],
  host: {
    '(document:keydown.escape)': 'closeSidebar(true)',
  },
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
        <button
          #sidebarToggle
          class="j-app-shell__toggle"
          type="button"
          [attr.aria-expanded]="sidebarExpanded()"
          [attr.aria-controls]="sidebarId"
          (click)="toggleSidebar()"
        >
          {{ sidebarToggleLabel() }}
        </button>
        <ng-content select="[jShellHeader]" />
      </header>

      <aside
        class="j-app-shell__sidebar"
        data-jc-section="sidebar"
        [id]="sidebarId"
        [attr.aria-label]="sidebarLabel()"
      >
        <ng-content select="[jShellSidebar]" />
      </aside>

      @if (sidebarOpen()) {
        <button
          class="j-app-shell__mask"
          type="button"
          aria-label="Close sidebar"
          (click)="closeSidebar(true)"
        ></button>
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
          inset-inline-start: 0;
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
          background: var(--j-overlay-backdrop-bg);
          border: 0;
          border-radius: 0;
          display: block;
          inset: 0;
          position: fixed;
          z-index: 30;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .j-app-shell__sidebar {
          transition: none;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JAppShellComponent {
  protected readonly sidebarId = jCreateId('j-app-shell-sidebar');
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly destroyRef = inject(DestroyRef);
  private readonly sidebarToggle = viewChild<ElementRef<HTMLButtonElement>>('sidebarToggle');
  private readonly overlayMode = signal(false);

  readonly sidebarCollapsed = model(false);
  readonly sidebarOpen = model(false);
  readonly sidebarLabel = input('Primary navigation');
  readonly footer = input(true, { transform: booleanAttribute });
  readonly styleClass = input('');
  readonly sidebarExpanded = computed(() =>
    this.overlayMode() ? this.sidebarOpen() : !this.sidebarCollapsed(),
  );
  readonly sidebarToggleLabel = computed(() => {
    if (this.overlayMode()) return this.sidebarOpen() ? 'Close menu' : 'Open menu';
    return this.sidebarCollapsed() ? 'Expand menu' : 'Collapse menu';
  });

  constructor() {
    const view = this.host.ownerDocument.defaultView;
    if (!view || typeof view.matchMedia !== 'function') return;
    const mediaQuery = view.matchMedia('(max-width: 768px)');
    const updateMode = (matches: boolean): void => {
      this.overlayMode.set(matches);
      if (!matches) this.sidebarOpen.set(false);
    };
    updateMode(mediaQuery.matches);
    const onChange = (event: MediaQueryListEvent): void => updateMode(event.matches);
    mediaQuery.addEventListener('change', onChange);
    this.destroyRef.onDestroy(() => mediaQuery.removeEventListener('change', onChange));
  }

  toggleSidebar(): void {
    if (this.overlayMode()) {
      this.sidebarOpen.update((open) => !open);
      return;
    }
    this.sidebarCollapsed.update((collapsed) => !collapsed);
  }

  protected closeSidebar(restoreFocus = false): void {
    if (!this.sidebarOpen()) return;
    this.sidebarOpen.set(false);
    if (restoreFocus) this.sidebarToggle()?.nativeElement.focus();
  }
}
