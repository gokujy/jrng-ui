import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { JEmptyComponent } from 'jrng-ui/empty';

@Component({
  selector: 'j-maintenance-page',
  imports: [JEmptyComponent],
  template: `
    <j-empty
      variant="offline"
      [icon]="badge()"
      [title]="title()"
      [description]="detail() ? description() + ' ' + detail() : description()"
      [styleClass]="styleClass()"
    >
      <ng-content />
    </j-empty>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JMaintenancePageComponent {
  readonly badge = input('Maintenance');
  readonly title = input('Maintenance in progress');
  readonly description = input('This page is temporarily unavailable.');
  readonly detail = input('');
  readonly styleClass = input('');
}
