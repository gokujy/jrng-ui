import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

@Component({
  selector: 'j-responsive-sidebar',
  imports: [],
  template: `
    <aside
      class="j-responsive-sidebar"
      [class]="styleClass()"
      [class.is-open]="open()"
      data-jc-name="responsive-sidebar"
      data-jc-section="root"
      [attr.data-j-open]="open() ? 'true' : null"
    >
      <header class="j-responsive-sidebar__header">
        <strong>{{ title() }}</strong>
        <button type="button" aria-label="Close sidebar" (click)="open.set(false)">Close</button>
      </header>
      <ng-content />
    </aside>
    @if (open()) {
      <button
        class="j-responsive-sidebar__mask"
        type="button"
        aria-label="Close sidebar"
        (click)="open.set(false)"
      ></button>
    }
  `,
  styles: [
    `
      .j-responsive-sidebar {
        background: var(--j-color-card);
        border-right: 1px solid var(--j-color-border);
        color: var(--j-color-card-foreground);
        height: 100%;
        overflow: auto;
      }

      .j-responsive-sidebar__header {
        align-items: center;
        border-bottom: 1px solid var(--j-color-border);
        display: flex;
        justify-content: space-between;
        padding: var(--j-spacing-3);
      }

      .j-responsive-sidebar__header button,
      .j-responsive-sidebar__mask {
        background: transparent;
        border: 0;
        color: inherit;
        cursor: pointer;
        font: inherit;
      }

      .j-responsive-sidebar__mask {
        display: none;
      }

      @media (max-width: 768px) {
        .j-responsive-sidebar {
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

        .j-responsive-sidebar.is-open {
          transform: translateX(0);
        }

        .j-responsive-sidebar__mask {
          background: rgb(15 23 42 / 48%);
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
export class JResponsiveSidebarComponent {
  readonly open = model(false);
  readonly title = input('Navigation');
  readonly styleClass = input('');
}
