import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  input,
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
      [header]="header()"
      [height]="height()"
      [snapPoints]="snapPoints()"
      [modal]="modal()"
      [closable]="closable()"
      [dismissableMask]="dismissableMask()"
      [closeOnEscape]="closeOnEscape()"
      [showHandle]="showHandle()"
      [mobileBottomSheet]="true"
      [styleClass]="'j-bottom-sheet ' + styleClass()"
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
  readonly header = input('');
  readonly height = input('');
  readonly styleClass = input('');
  readonly snapPoints = input<readonly string[]>(['40%', '80%']);
  readonly modal = input(true, { transform: booleanAttribute });
  readonly closable = input(true, { transform: booleanAttribute });
  readonly dismissableMask = input(true, { transform: booleanAttribute });
  readonly closeOnEscape = input(true, { transform: booleanAttribute });
  readonly showHandle = input(true, { transform: booleanAttribute });

  readonly opened = output<void>();
  readonly closed = output<void>();
}
