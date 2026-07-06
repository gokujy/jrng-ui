import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  numberAttribute,
} from '@angular/core';
import { JPassThrough, jMergePartClasses } from 'jrng-ui/core';

@Component({
  selector: 'j-progress-spinner',
  imports: [],
  template: `<span
    [class]="spinnerClasses()"
    data-jc-name="progress-spinner"
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
      .j-progress-spinner {
        animation: j-progress-spinner-spin 800ms linear infinite;
        border-color: var(--j-color-border);
        border-radius: var(--j-radius-full);
        border-right-color: var(--j-color-primary);
        border-style: solid;
        display: inline-flex;
      }

      @keyframes j-progress-spinner-spin {
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JProgressSpinnerComponent {
  readonly size = input(32, { transform: numberAttribute });
  readonly strokeWidth = input(4, { transform: numberAttribute });
  readonly label = input('Loading');
  readonly styleClass = input('');
  readonly pt = input<JPassThrough | null>(null);

  readonly spinnerClasses = computed(() =>
    jMergePartClasses('j-progress-spinner', this.styleClass(), this.pt()),
  );
}
