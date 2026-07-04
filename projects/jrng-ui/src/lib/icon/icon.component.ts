import { ChangeDetectionStrategy, Component, inject, Input, numberAttribute } from '@angular/core';
import { JIconRegistry } from './icon-registry.service';

@Component({
  selector: 'j-icon',
  imports: [],
  template: `
    <ng-content></ng-content>
    @if (path) {
      <svg
        class="j-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        [attr.stroke-width]="strokeWidth"
        [attr.aria-hidden]="ariaLabel ? null : 'true'"
        [attr.aria-label]="ariaLabel || null"
      >
        <path [attr.d]="path"></path>
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

  @Input() name = '';
  @Input() ariaLabel = '';
  @Input({ transform: numberAttribute }) strokeWidth = 2;

  get path(): string {
    return this.name ? this.iconRegistry.get(this.name) : '';
  }
}
