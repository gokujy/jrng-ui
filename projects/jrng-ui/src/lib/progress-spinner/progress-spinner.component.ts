import { ChangeDetectionStrategy, Component, Input, numberAttribute } from '@angular/core';

@Component({
  selector: 'j-progress-spinner',
  imports: [],
  template: `<span
    class="j-progress-spinner"
    role="status"
    [attr.aria-label]="label"
    [style.width.px]="size"
    [style.height.px]="size"
    [style.border-width.px]="strokeWidth"
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
  @Input({ transform: numberAttribute }) size = 32;
  @Input({ transform: numberAttribute }) strokeWidth = 4;
  @Input() label = 'Loading';
}
