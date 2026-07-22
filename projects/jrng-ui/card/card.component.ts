import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { JDensity, JPassThrough, JSurfaceVariant, jMergePartClasses } from 'jrng-ui/core';

export type JCardVariant = JSurfaceVariant;

@Component({
  selector: 'j-card',
  imports: [],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JCardComponent {
  readonly header = input('');
  readonly subheader = input('');
  readonly footer = input('');
  readonly variant = input<JCardVariant>('elevated');
  readonly density = input<JDensity>('comfortable');
  readonly styleClass = input('');
  readonly pt = input<JPassThrough | null>(null);
  readonly interactive = input(false, { transform: booleanAttribute });
  readonly skeleton = input(false, { transform: booleanAttribute });

  readonly cardClasses = computed(() =>
    jMergePartClasses(
      [
        'j-card',
        `j-card--${this.variant()}`,
        `j-card--density-${this.density()}`,
        this.interactive() ? 'j-card--interactive' : '',
        this.skeleton() ? 'is-loading' : '',
      ],
      this.styleClass(),
      this.pt(),
    ),
  );
}
