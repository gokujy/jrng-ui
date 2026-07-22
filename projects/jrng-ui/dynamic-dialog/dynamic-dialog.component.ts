import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { JDialogComponent } from 'jrng-ui/dialog';
import { JDialogService } from 'jrng-ui/dialog';

@Component({
  selector: 'j-dynamic-dialog',
  imports: [JDialogComponent],
  template: `
    @if (dialogService.dialog(); as dialog) {
      <j-dialog
        [visible]="true"
        [header]="dialog.title"
        [size]="dialog.size"
        data-jc-name="dynamic-dialog"
        data-jc-section="root"
        (closed)="dialogService.close()"
      >
        <p class="j-dynamic-dialog__message">{{ dialog.message }}</p>
      </j-dialog>
    }
  `,
  styles: [
    `
      .j-dynamic-dialog__message {
        color: var(--j-color-muted-foreground);
        margin: 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JDynamicDialogComponent {
  readonly dialogService = inject(JDialogService);
}
