import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { JPassThrough, jMergePartClasses } from 'jrng-ui/core';

export type JInputIconPosition = 'left' | 'right';

@Component({
  selector: 'j-input-icon',
  imports: [],
  template: `
    <span
      [class]="iconClasses()"
      data-jc-name="input-icon"
      data-jc-section="root"
      aria-hidden="true"
    >
      @if (icon()) {
        {{ icon() }}
      } @else {
        <ng-content></ng-content>
      }
    </span>
  `,
  styles: [
    `
      .j-input-icon {
        align-items: center;
        color: var(--j-color-muted-foreground);
        display: inline-flex;
        flex: 0 0 auto;
        justify-content: center;
      }

      .j-input-icon--left {
        order: -1;
      }

      .j-input-icon--right {
        order: 1;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JInputIconComponent {
  readonly icon = input('');
  readonly position = input<JInputIconPosition>('left');
  readonly styleClass = input('');
  readonly pt = input<JPassThrough | null>(null);

  readonly iconClasses = computed(() =>
    jMergePartClasses(
      ['j-input-icon', `j-input-icon--${this.position()}`],
      this.styleClass(),
      this.pt(),
    ),
  );
}
