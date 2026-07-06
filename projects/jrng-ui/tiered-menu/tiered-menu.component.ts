import { ChangeDetectionStrategy, Component, Input, output } from '@angular/core';
import { JMenuComponent, JMenuItem } from 'jrng-ui/menu';

@Component({
  selector: 'j-tiered-menu',
  imports: [JMenuComponent],
  template: `
    <j-menu
      [model]="model"
      [ariaLabel]="ariaLabel"
      [popup]="popup"
      [visible]="visible"
      (visibleChange)="setVisible($event)"
      [submenuOpenDelay]="submenuOpenDelay"
      [submenuCloseDelay]="submenuCloseDelay"
      [styleClass]="'j-tiered-menu ' + styleClass"
      data-jc-name="tiered-menu"
      data-jc-section="root"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JTieredMenuComponent {
  @Input() model: readonly JMenuItem[] = [];
  @Input() ariaLabel = 'Tiered menu';
  @Input() styleClass = '';
  @Input() popup = false;
  @Input() visible = false;
  @Input() submenuOpenDelay = 120;
  @Input() submenuCloseDelay = 180;
  readonly visibleChange = output<boolean>();

  setVisible(value: boolean): void {
    this.visible = value;
    this.visibleChange.emit(value);
  }
}
