import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { JEmptyComponent } from 'jrng-ui/empty';

@Component({
  selector: 'j-error-page',
  imports: [JEmptyComponent],
  template: `
    <j-empty
      variant="error"
      [icon]="code()"
      [title]="title()"
      [description]="description()"
      [styleClass]="styleClass()"
    >
      <ng-content />
    </j-empty>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JErrorPageComponent {
  readonly code = input('Error');
  readonly title = input('Something went wrong');
  readonly description = input('The page could not be loaded.');
  readonly styleClass = input('');
}
