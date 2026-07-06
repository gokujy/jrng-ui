import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type JContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

@Component({
  selector: 'j-container',
  imports: [],
  template: `<div [class]="classes()" data-jc-name="container" data-jc-section="root">
    <ng-content />
  </div>`,
  styles: [
    `
      .j-container {
        margin-inline: auto;
        max-width: var(--j-container-max-width);
        padding-inline: var(--j-spacing-4);
        width: 100%;
      }

      .j-container--sm {
        --j-container-max-width: 40rem;
      }
      .j-container--md {
        --j-container-max-width: 56rem;
      }
      .j-container--lg {
        --j-container-max-width: 72rem;
      }
      .j-container--xl {
        --j-container-max-width: 88rem;
      }
      .j-container--full {
        --j-container-max-width: none;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JContainerComponent {
  readonly size = input<JContainerSize>('lg');
  readonly styleClass = input('');

  classes(): string {
    return ['j-container', `j-container--${this.size()}`, this.styleClass()]
      .filter(Boolean)
      .join(' ');
  }
}
