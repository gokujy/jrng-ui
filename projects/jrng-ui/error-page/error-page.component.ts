import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { JStatusPageComponent } from 'jrng-ui/status-page';

@Component({
  selector: 'j-error-page',
  imports: [JStatusPageComponent],
  template: `
    <j-status-page
      variant="error"
      compatibilityClass="j-error-page"
      compatibilityMarkerClass="j-error-page__code"
      compatibilityActionClass="j-error-page__actions"
      componentName="error-page"
      [marker]="code()"
      [title]="title()"
      [description]="description()"
      [styleClass]="styleClass()"
    >
      <ng-content />
    </j-status-page>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JErrorPageComponent {
  readonly code = input('Error');
  readonly title = input('Something went wrong');
  readonly description = input('The page could not be loaded.');
  readonly styleClass = input('');
}
