import { ChangeDetectionStrategy, Component, Input, numberAttribute } from '@angular/core';

@Component({
  selector: 'j-loader',
  imports: [],
  template: `<span
    class="j-loader"
    role="status"
    [attr.aria-label]="label"
    [style.width.px]="size"
    [style.height.px]="size"
    [style.border-width.px]="strokeWidth"
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
  @Input({ transform: numberAttribute }) size = 24;
  @Input({ transform: numberAttribute }) strokeWidth = 3;
  @Input() label = 'Loading';
}
