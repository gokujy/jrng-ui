import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { JStatusPageComponent } from 'jrng-ui/status-page';

@Component({
  selector: 'j-empty-page',
  imports: [JStatusPageComponent],
  template: `
    <j-status-page
      variant="empty"
      compatibilityClass="j-empty-page"
      compatibilityMarkerClass="j-empty-page__icon"
      compatibilityActionClass="j-empty-page__actions"
      componentName="empty-page"
      [marker]="icon()"
      [title]="title()"
      [description]="description()"
      [styleClass]="styleClass()"
    >
      <ng-content />
    </j-status-page>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JEmptyPageComponent {
  readonly icon = input('');
  readonly title = input('Nothing here yet');
  readonly description = input('There is no content to display.');
  readonly styleClass = input('');
}
