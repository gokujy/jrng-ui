import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { JConfirmDialogComponent } from 'jrng-ui/confirm-dialog';
import { JrToastContainerComponent } from 'jrng-ui/toast';

@Component({
  selector: 'admin-root',
  imports: [RouterOutlet, JConfirmDialogComponent, JrToastContainerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<router-outlet /><j-toast /><j-confirm-dialog />`,
})
export class AdminStarterApp {}
