import { ChangeDetectionStrategy, Component, computed, inject, input, numberAttribute } from '@angular/core';
import { JPassThrough, jMergePartClasses } from '../core/pass-through';
import { JIconRegistry } from './icon-registry.service';

@Component({
  selector: 'j-icon',
  imports: [],
  template: `
    <ng-content></ng-content>
    @if (path()) {
      <svg
        [class]="iconClasses()"
        data-jc-name="icon"
        data-jc-section="root"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        [attr.stroke-width]="strokeWidth()"
        [attr.aria-hidden]="ariaLabel() ? null : 'true'"
        [attr.aria-label]="ariaLabel() || null"
        [style.font-size]="size() || null"
      >
        <path [attr.d]="path()"></path>
      </svg>
    }
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        line-height: 0;
      }

      .j-icon {
        height: 1em;
        width: 1em;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JIconComponent {
  private readonly iconRegistry = inject(JIconRegistry);

  readonly name = input('');
  readonly ariaLabel = input('');
  readonly size = input('');
  readonly styleClass = input('');
  readonly pt = input<JPassThrough | null>(null);
  readonly strokeWidth = input(2, { transform: numberAttribute });

  readonly path = computed(() => (this.name() ? this.iconRegistry.get(this.name()) : ''));

  readonly iconClasses = computed(() => jMergePartClasses('j-icon', this.styleClass(), this.pt()));
}
