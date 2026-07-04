import { ChangeDetectionStrategy, Component, computed, input, numberAttribute } from '@angular/core';
import { JPassThrough, jMergePartClasses } from '../core/pass-through';

@Component({
  selector: 'j-loader',
  imports: [],
  template: `<span
    [class]="loaderClasses()"
    data-jc-name="loader"
    data-jc-section="root"
    data-j-loading="true"
    role="status"
    [attr.aria-label]="label()"
    [style.width.px]="size()"
    [style.height.px]="size()"
    [style.border-width.px]="strokeWidth()"
  ></span>`,
  styles: [
    `
      .j-loader {
        animation: j-loader-spin var(--j-duration-slow) linear infinite;
        border-color: var(--j-color-border-strong);
        border-radius: var(--j-radius-full);
        border-right-color: var(--j-color-primary);
        border-style: solid;
        display: inline-flex;
      }

      @keyframes j-loader-spin {
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JLoaderComponent {
  readonly size = input(24, { transform: numberAttribute });
  readonly strokeWidth = input(3, { transform: numberAttribute });
  readonly label = input('Loading');
  readonly styleClass = input('');
  readonly pt = input<JPassThrough | null>(null);

  readonly loaderClasses = computed(() => jMergePartClasses('j-loader', this.styleClass(), this.pt()));
}
