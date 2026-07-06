import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { JPassThrough, jMergePartClasses } from 'jrng-ui/core';

export type JrCardVariant = 'default' | 'elevated' | 'bordered' | 'soft';

@Component({
  selector: 'j-card',
  imports: [],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JrCardComponent {
  readonly header = input('');
  readonly subheader = input('');
  readonly title = input('');
  readonly subtitle = input('');
  readonly footer = input('');
  readonly variant = input<JrCardVariant>('default');
  readonly styleClass = input('');
  readonly pt = input<JPassThrough | null>(null);
  readonly clickable = input(false, { transform: booleanAttribute });
  readonly elevated = input(false, { transform: booleanAttribute });
  readonly bordered = input(false, { transform: booleanAttribute });
  readonly interactive = input(false, { transform: booleanAttribute });
  readonly compact = input(false, { transform: booleanAttribute });
  readonly skeleton = input(false, { transform: booleanAttribute });

  readonly resolvedHeader = computed(() => this.header() || this.title());

  readonly resolvedSubheader = computed(() => this.subheader() || this.subtitle());

  readonly isInteractive = computed(() => this.interactive() || this.clickable());

  readonly resolvedVariant = computed<JrCardVariant>(() => {
    if (this.elevated()) {
      return 'elevated';
    }

    if (this.bordered()) {
      return 'bordered';
    }

    return this.variant();
  });

  readonly cardClasses = computed(() =>
    jMergePartClasses(
      [
        'j-card',
        `j-card--${this.resolvedVariant()}`,
        this.isInteractive() ? 'j-card--interactive' : '',
        this.compact() ? 'j-card--compact' : '',
        this.skeleton() ? 'is-loading' : '',
      ],
      this.styleClass(),
      this.pt(),
    ),
  );
}
