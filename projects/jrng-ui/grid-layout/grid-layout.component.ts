import { ChangeDetectionStrategy, Component, input, numberAttribute } from '@angular/core';

@Component({
  selector: 'j-grid-layout',
  imports: [],
  template: `
    <div
      class="j-grid-layout"
      [class]="styleClass()"
      data-jc-name="grid-layout"
      data-jc-section="root"
      [style.--j-grid-columns]="columns()"
      [style.--j-grid-min]="minItemWidth()"
      [style.--j-grid-gap]="gap()"
    >
      <ng-content />
    </div>
  `,
  styles: [
    `
      .j-grid-layout {
        display: grid;
        gap: var(--j-grid-gap);
        grid-template-columns: repeat(
          var(--j-grid-columns),
          minmax(min(var(--j-grid-min), 100%), 1fr)
        );
      }

      @media (max-width: 768px) {
        .j-grid-layout {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JGridLayoutComponent {
  readonly columns = input(3, { transform: numberAttribute });
  readonly minItemWidth = input('16rem');
  readonly gap = input('var(--j-spacing-4)');
  readonly styleClass = input('');
}
