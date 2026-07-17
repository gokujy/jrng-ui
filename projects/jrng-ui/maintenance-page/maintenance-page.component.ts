import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { JStatusPageComponent } from 'jrng-ui/status-page';

@Component({
  selector: 'j-maintenance-page',
  imports: [JStatusPageComponent],
  template: `
    <j-status-page
      variant="maintenance"
      compatibilityClass="j-maintenance-page"
      compatibilityMarkerClass="j-maintenance-page__badge"
      compatibilityActionClass="j-maintenance-page__actions"
      componentName="maintenance-page"
      [marker]="badge()"
      [title]="title()"
      [description]="description()"
      [detail]="detail()"
      [styleClass]="styleClass()"
    >
      <ng-content />
    </j-status-page>
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
