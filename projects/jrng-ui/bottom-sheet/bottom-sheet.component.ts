import {
  ChangeDetectionStrategy,
  Component,
  Input,
  booleanAttribute,
  model,
  output,
} from '@angular/core';
import { JDrawerComponent } from 'jrng-ui/drawer';

@Component({
  selector: 'j-bottom-sheet',
  imports: [JDrawerComponent],
  template: `
    <j-drawer
      [visible]="visible()"
      (visibleChange)="visible.set($event)"
      position="bottom"
      [header]="header"
      [height]="height"
      [snapPoints]="snapPoints"
      [modal]="modal"
      [closable]="closable"
      [dismissableMask]="dismissableMask"
      [closeOnEscape]="closeOnEscape"
      [showHandle]="showHandle"
      [mobileBottomSheet]="true"
      [styleClass]="'j-bottom-sheet ' + styleClass"
      data-jc-name="bottom-sheet"
      data-jc-section="root"
      (opened)="opened.emit()"
      (closed)="closed.emit()"
    >
      <ng-content></ng-content>
      <ng-container jDrawerFooter>
        <ng-content select="[jBottomSheetFooter]"></ng-content>
      </ng-container>
    </j-drawer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JBottomSheetComponent {
  readonly visible = model(false);
  @Input() header = '';
  @Input() height = '';
  @Input() styleClass = '';
  @Input() snapPoints: readonly string[] = ['40%', '80%'];
  @Input({ transform: booleanAttribute }) modal = true;
  @Input({ transform: booleanAttribute }) closable = true;
  @Input({ transform: booleanAttribute }) dismissableMask = true;
  @Input({ transform: booleanAttribute }) closeOnEscape = true;
  @Input({ transform: booleanAttribute }) showHandle = true;

  readonly opened = output<void>();
  readonly closed = output<void>();
}
