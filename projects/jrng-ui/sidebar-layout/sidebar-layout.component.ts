import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'j-sidebar-layout',
  imports: [],
  template: `
    <section
      class="j-sidebar-layout"
      [class]="styleClass()"
      data-jc-name="sidebar-layout"
      data-jc-section="root"
    >
      <aside class="j-sidebar-layout__sidebar" data-jc-section="sidebar">
        <ng-content select="[jSidebar]" />
      </aside>
      <main class="j-sidebar-layout__content" data-jc-section="content">
        <ng-content />
      </main>
    </section>
  `,
  styles: [
    `
      .j-sidebar-layout {
        display: grid;
        gap: var(--j-spacing-5);
        grid-template-columns: minmax(14rem, var(--j-sidebar-layout-width, 18rem)) minmax(0, 1fr);
      }

      .j-sidebar-layout__sidebar,
      .j-sidebar-layout__content {
        min-width: 0;
      }

      @media (max-width: 768px) {
        .j-sidebar-layout {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JSidebarLayoutComponent {
  readonly styleClass = input('');
}
