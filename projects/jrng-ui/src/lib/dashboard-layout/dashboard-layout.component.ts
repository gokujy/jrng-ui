import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'j-dashboard-layout',
  imports: [],
  template: `
    <section class="j-dashboard-layout" [class]="styleClass()" data-jc-name="dashboard-layout" data-jc-section="root">
      <ng-content />
    </section>
  `,
  styles: [
    `
      .j-dashboard-layout {
        display: grid;
        gap: var(--j-spacing-5);
        grid-template-columns: repeat(var(--j-dashboard-columns, 12), minmax(0, 1fr));
      }

      .j-dashboard-layout ::ng-deep > * {
        min-width: 0;
      }

      @media (max-width: 768px) {
        .j-dashboard-layout {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JDashboardLayoutComponent {
  readonly styleClass = input('');
}
