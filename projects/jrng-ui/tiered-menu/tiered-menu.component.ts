import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { JMenuComponent, JMenuItem } from 'jrng-ui/menu';

@Component({
  selector: 'j-tiered-menu',
  imports: [JMenuComponent],
  template: `
    <j-menu
      [model]="model()"
      [ariaLabel]="ariaLabel()"
      [popup]="popup()"
      [visible]="visible()"
      (visibleChange)="setVisible($event)"
      [submenuOpenDelay]="submenuOpenDelay()"
      [submenuCloseDelay]="submenuCloseDelay()"
      [styleClass]="'j-tiered-menu ' + styleClass()"
      data-jc-name="tiered-menu"
      data-jc-section="root"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JTieredMenuComponent {
  readonly model = input<readonly JMenuItem[]>([]);
  readonly ariaLabel = input('Tiered menu');
  readonly styleClass = input('');
  readonly popup = input(false);
  readonly visible = model(false);
  readonly submenuOpenDelay = input(120);
  readonly submenuCloseDelay = input(180);

  setVisible(value: boolean): void {
    this.visible.set(value);
  }
}
